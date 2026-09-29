package com.ajitabh.algoquest.model;

import java.time.Instant;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

// Har login attempt ki ek row: safal ho ya roka gaya ho
@Entity
@Table(name = "login_events", indexes = @Index(name = "idx_login_user_time", columnList = "user_id, created_at"))
public class LoginEvent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Kis user ka login (roke gaye attempt mein khaali rehta hai)
    @Column(name = "user_id")
    private Long userId;

    // "github" ya "google"
    @Column(nullable = false, length = 10)
    private String provider;

    // Kaun aaya tha: GitHub username ya Google email
    @Column(length = 120)
    private String identity;

    // true = andar aaya, false = allowlist ne roka
    @Column(nullable = false)
    private boolean success;

    @Column(name = "ip_address", length = 64)
    private String ipAddress;

    // Browser ki poori pehchaan (User-Agent)
    @Column(name = "user_agent", length = 300)
    private String userAgent;

    // Chhota saaf naam, jaise "Chrome on Windows"
    @Column(length = 80)
    private String device;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @PrePersist
    void onCreate() {
        createdAt = Instant.now();
    }

    // ----- Getters / Setters -----
    public Long getId() {
        return id;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getProvider() {
        return provider;
    }

    public void setProvider(String provider) {
        this.provider = provider;
    }

    public String getIdentity() {
        return identity;
    }

    public void setIdentity(String identity) {
        this.identity = identity;
    }

    public boolean isSuccess() {
        return success;
    }

    public void setSuccess(boolean success) {
        this.success = success;
    }

    public String getIpAddress() {
        return ipAddress;
    }

    public void setIpAddress(String ipAddress) {
        this.ipAddress = ipAddress;
    }

    public String getUserAgent() {
        return userAgent;
    }

    public void setUserAgent(String userAgent) {
        this.userAgent = userAgent;
    }

    public String getDevice() {
        return device;
    }

    public void setDevice(String device) {
        this.device = device;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }
}