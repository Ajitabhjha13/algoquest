package com.ajitabh.algoquest.model;

import java.time.Instant;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

// Website ka POORA data (JSON) ek row mein. Har user ki sirf ek row.
@Entity
@Table(name = "user_state")
public class UserState {

    // user_id hi primary key hai (ek user = ek row), isliye auto-generate nahi
    @Id
    @Column(name = "user_id")
    private Long userId;

    // Poora frontend state JSON text ke roop mein
    @Column(nullable = false, columnDefinition = "LONGTEXT")
    private String data;

    // Har successful save pe +1. Isi se pata chalta hai kaunsi copy nayi hai.
    @Column(nullable = false)
    private long revision;

    @Column(name = "size_bytes", nullable = false)
    private int sizeBytes;

    @Column(name = "updated_device", length = 80)
    private String updatedDevice;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    protected UserState() {
    } // JPA ke liye zaroori

    public UserState(Long userId, String data, int sizeBytes, String updatedDevice) {
        this.userId = userId;
        this.data = data;
        this.sizeBytes = sizeBytes;
        this.updatedDevice = updatedDevice;
        this.revision = 1;
        this.updatedAt = Instant.now();
    }

    public Long getUserId() {
        return userId;
    }

    public String getData() {
        return data;
    }

    public long getRevision() {
        return revision;
    }

    public int getSizeBytes() {
        return sizeBytes;
    }

    public String getUpdatedDevice() {
        return updatedDevice;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }
}