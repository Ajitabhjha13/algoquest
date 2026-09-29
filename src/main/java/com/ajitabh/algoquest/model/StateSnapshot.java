package com.ajitabh.algoquest.model;

import java.time.Instant;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.Table;

// Purane versions ki copy (safety net). Har user ke last 10 hi rakhe jayenge.
@Entity
@Table(name = "state_snapshots", indexes = @Index(name = "idx_snapshot_user_rev", columnList = "user_id, revision"))
public class StateSnapshot {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    // Yeh copy kis revision ki hai
    @Column(nullable = false)
    private long revision;

    @Column(nullable = false, columnDefinition = "LONGTEXT")
    private String data;

    @Column(name = "size_bytes", nullable = false)
    private int sizeBytes;

    // Yeh version kis device ne save kiya tha
    @Column(length = 80)
    private String device;

    // Yeh version kab save hua tha (original time, snapshot banne ka time nahi)
    @Column(name = "saved_at", nullable = false)
    private Instant savedAt;

    protected StateSnapshot() {
    } // JPA ke liye zaroori

    // Current state ki hubahu copy banao
    public static StateSnapshot of(UserState s) {
        StateSnapshot snap = new StateSnapshot();
        snap.userId = s.getUserId();
        snap.revision = s.getRevision();
        snap.data = s.getData();
        snap.sizeBytes = s.getSizeBytes();
        snap.device = s.getUpdatedDevice();
        snap.savedAt = s.getUpdatedAt();
        return snap;
    }

    public Long getId() {
        return id;
    }

    public Long getUserId() {
        return userId;
    }

    public long getRevision() {
        return revision;
    }

    public String getData() {
        return data;
    }

    public int getSizeBytes() {
        return sizeBytes;
    }

    public String getDevice() {
        return device;
    }

    public Instant getSavedAt() {
        return savedAt;
    }
}