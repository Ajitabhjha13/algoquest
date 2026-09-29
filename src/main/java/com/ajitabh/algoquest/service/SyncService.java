package com.ajitabh.algoquest.service;

import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.List;
import java.util.Optional;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ajitabh.algoquest.model.StateSnapshot;
import com.ajitabh.algoquest.model.UserState;
import com.ajitabh.algoquest.repository.StateSnapshotRepository;
import com.ajitabh.algoquest.repository.StateSnapshotRepository.SnapshotSummary;
import com.ajitabh.algoquest.repository.UserStateRepository;
import com.ajitabh.algoquest.repository.UserStateRepository.StateMeta;

import tools.jackson.databind.JsonNode;

// Cloud sync ka dimaag: save/load, optimistic locking, snapshots, restore
@Service
public class SyncService {

    public static final int MAX_BYTES = 2 * 1024 * 1024; // 2 MB
    public static final int KEEP_SNAPSHOTS = 10;

    // Cloud pe kisi aur device ne pehle hi naya version save kar diya
    public static class ConflictException extends RuntimeException {
        private final transient UserState current; // null = cloud khali hai

        public ConflictException(UserState current) {
            super("The cloud has a different version");
            this.current = current;
        }

        public UserState current() {
            return current;
        }
    }

    public static class InvalidDataException extends RuntimeException {
        public InvalidDataException(String message) {
            super(message);
        }
    }

    public static class TooLargeException extends RuntimeException {
        public TooLargeException(int size) {
            super("Data is " + size + " bytes; the limit is " + MAX_BYTES);
        }
    }

    public static class SnapshotNotFoundException extends RuntimeException {
        public SnapshotNotFoundException(long revision) {
            super("No saved version with revision " + revision);
        }
    }

    private final UserStateRepository states;
    private final StateSnapshotRepository snapshots;

    public SyncService(UserStateRepository states, StateSnapshotRepository snapshots) {
        this.states = states;
        this.snapshots = snapshots;
    }

    @Transactional(readOnly = true)
    public Optional<UserState> load(Long userId) {
        return states.findById(userId);
    }

    // Halka check: sirf revision wagairah (website "kuch naya hai kya?" poochti
    // hai)
    @Transactional(readOnly = true)
    public Optional<StateMeta> meta(Long userId) {
        return states.findMetaByUserId(userId);
    }

    // Website se aaya naya data: pehle check, phir save
    @Transactional
    public UserState save(Long userId, long baseRevision, JsonNode data, String userAgent) {
        if (data == null || !data.isObject() || !data.has("settings")) {
            throw new InvalidDataException("This does not look like AlgoQuest data");
        }
        return saveJson(userId, baseRevision, data.toString(), userAgent);
    }

    // Last 10 purane versions (bina bhaari data ke)
    @Transactional(readOnly = true)
    public List<SnapshotSummary> listSnapshots(Long userId) {
        return snapshots.findTop10ByUserIdOrderByRevisionDesc(userId);
    }

    // Purana version wapas lao: yeh ek NAYA save hai, isliye restore bhi undo ho
    // sakta hai
    @Transactional
    public UserState restore(Long userId, long snapshotRevision, long baseRevision, String userAgent) {
        StateSnapshot snap = snapshots.findByUserIdAndRevision(userId, snapshotRevision)
                .orElseThrow(() -> new SnapshotNotFoundException(snapshotRevision));
        return saveJson(userId, baseRevision, snap.getData(), userAgent);
    }

    // Asli save logic (save aur restore dono yahi use karte hain)
    private UserState saveJson(Long userId, long baseRevision, String json, String userAgent) {
        int size = json.getBytes(StandardCharsets.UTF_8).length;
        if (size > MAX_BYTES) {
            throw new TooLargeException(size);
        }
        String device = LoginAuditService.describeDevice(userAgent);

        Optional<UserState> existing = states.findById(userId);

        // Pehli baar save: cloud khali hai, toh baseRevision 0 hona chahiye
        if (existing.isEmpty()) {
            if (baseRevision != 0)
                throw new ConflictException(null);
            try {
                return states.saveAndFlush(new UserState(userId, json, size, device));
            } catch (DataIntegrityViolationException e) {
                // Do devices ne ek hi pal mein "pehli baar" save kiya
                throw new ConflictException(null);
            }
        }

        UserState current = existing.get();

        // Kuch badla hi nahi (ya network retry): naya revision mat banao
        if (current.getData().equals(json)) {
            return current;
        }

        // Purani copy ke upar save karne ki koshish?
        if (current.getRevision() != baseRevision) {
            throw new ConflictException(current);
        }

        // Pehle purane data ki copy, phir optimistic-locking wala update
        snapshots.save(StateSnapshot.of(current));
        int updated = states.updateIfRevisionMatches(userId, baseRevision, json, size, device, Instant.now());
        if (updated == 0) {
            // Isi pal kisi aur ne save kar diya; exception se snapshot bhi rollback ho
            // jayegi
            throw new ConflictException(states.findById(userId).orElse(null));
        }

        // Sirf last 10 snapshots rakho
        snapshots.deleteOlderThan(userId, baseRevision - KEEP_SNAPSHOTS + 1);

        return states.findById(userId).orElseThrow();
    }
}