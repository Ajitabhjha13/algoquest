package com.ajitabh.algoquest.controller;

import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ajitabh.algoquest.model.UserState;
import com.ajitabh.algoquest.service.SyncService;
import com.ajitabh.algoquest.service.SyncService.ConflictException;
import com.ajitabh.algoquest.service.SyncService.InvalidDataException;
import com.ajitabh.algoquest.service.SyncService.SnapshotNotFoundException;
import com.ajitabh.algoquest.service.SyncService.TooLargeException;

import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

// GET  /api/sync                               : cloud wala data lo
// GET  /api/sync/meta                          : sirf revision (halka check)
// PUT  /api/sync                               : naya data save karo  { "baseRevision": 5, "data": {...} }
// GET  /api/sync/snapshots                     : last 10 purane versions
// POST /api/sync/snapshots/{revision}/restore  : purana version wapas lao  { "baseRevision": 5 }
@RestController
@RequestMapping("/api/sync")
public class SyncController {

    public record SaveRequest(Long baseRevision, JsonNode data) {
    }

    public record RestoreRequest(Long baseRevision) {
    }

    public record SyncResponse(long revision, Instant updatedAt, String updatedDevice,
            int sizeBytes, JsonNode data) {
    }

    public record SyncMeta(long revision, Instant updatedAt, String updatedDevice, int sizeBytes) {
    }

    public record SnapshotItem(long revision, int sizeBytes, String device, Instant savedAt) {
    }

    private final SyncService sync;
    private final ObjectMapper json;

    public SyncController(SyncService sync, ObjectMapper json) {
        this.sync = sync;
        this.json = json;
    }

    @GetMapping
    public SyncResponse load(@AuthenticationPrincipal Jwt jwt) {
        return sync.load(userId(jwt))
                .map(s -> new SyncResponse(s.getRevision(), s.getUpdatedAt(), s.getUpdatedDevice(),
                        s.getSizeBytes(), json.readTree(s.getData())))
                .orElse(new SyncResponse(0, null, null, 0, null)); // cloud abhi khali hai
    }

    @GetMapping("/meta")
    public SyncMeta meta(@AuthenticationPrincipal Jwt jwt) {
        return sync.meta(userId(jwt))
                .map(m -> new SyncMeta(m.getRevision(), m.getUpdatedAt(), m.getUpdatedDevice(), m.getSizeBytes()))
                .orElse(new SyncMeta(0, null, null, 0)); // cloud abhi khali hai
    }

    @PutMapping
    public SyncResponse save(@AuthenticationPrincipal Jwt jwt,
            @RequestBody SaveRequest request,
            @RequestHeader(value = "User-Agent", required = false) String userAgent) {
        UserState saved = sync.save(userId(jwt), base(request.baseRevision()), request.data(), userAgent);
        return summary(saved);
    }

    @GetMapping("/snapshots")
    public List<SnapshotItem> snapshots(@AuthenticationPrincipal Jwt jwt) {
        return sync.listSnapshots(userId(jwt)).stream()
                .map(s -> new SnapshotItem(s.getRevision(), s.getSizeBytes(), s.getDevice(), s.getSavedAt()))
                .toList();
    }

    @PostMapping("/snapshots/{revision}/restore")
    public SyncResponse restore(@AuthenticationPrincipal Jwt jwt,
            @PathVariable("revision") long revision,
            @RequestBody RestoreRequest request,
            @RequestHeader(value = "User-Agent", required = false) String userAgent) {
        UserState saved = sync.restore(userId(jwt), revision, base(request.baseRevision()), userAgent);
        return summary(saved);
    }

    // Save/restore ke baad data wapas nahi bhejte (website ke paas hai), sirf naya
    // revision
    private static SyncResponse summary(UserState s) {
        return new SyncResponse(s.getRevision(), s.getUpdatedAt(), s.getUpdatedDevice(), s.getSizeBytes(), null);
    }

    private static long base(Long baseRevision) {
        return baseRevision == null ? 0 : baseRevision;
    }

    private static Long userId(Jwt jwt) {
        return Long.valueOf(jwt.getSubject());
    }

    // ---------- Errors ko saaf JSON mein badlo ----------

    @ExceptionHandler(ConflictException.class)
    public ResponseEntity<Map<String, Object>> conflict(ConflictException e) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("error", "conflict");
        body.put("message", "The cloud has a newer version of your data.");
        UserState cur = e.current();
        body.put("serverRevision", cur == null ? 0 : cur.getRevision());
        body.put("serverUpdatedAt", cur == null ? null : cur.getUpdatedAt());
        body.put("serverUpdatedDevice", cur == null ? null : cur.getUpdatedDevice());
        return ResponseEntity.status(HttpStatus.CONFLICT).body(body);
    }

    @ExceptionHandler(SnapshotNotFoundException.class)
    public ResponseEntity<Map<String, Object>> notFound(SnapshotNotFoundException e) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("error", "not_found", "message", e.getMessage()));
    }

    @ExceptionHandler(TooLargeException.class)
    public ResponseEntity<Map<String, Object>> tooLarge(TooLargeException e) {
        return ResponseEntity.status(HttpStatus.CONTENT_TOO_LARGE)
                .body(Map.of("error", "too_large", "message", e.getMessage()));
    }

    @ExceptionHandler(InvalidDataException.class)
    public ResponseEntity<Map<String, Object>> invalid(InvalidDataException e) {
        return ResponseEntity.badRequest()
                .body(Map.of("error", "invalid_data", "message", e.getMessage()));
    }
}