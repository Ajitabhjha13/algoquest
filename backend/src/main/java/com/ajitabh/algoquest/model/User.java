package com.ajitabh.algoquest.model;

import java.time.Instant;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

// @Entity: yeh class database ki ek table hai. Har User object = table ki ek row.
// Login sirf GitHub / Google se hota hai, isliye yahan koi password save NAHI hota.
@Entity
@Table(name = "users")
public class User {

    // Har user ka unique number: 1, 2, 3... (MySQL khud badhata hai)
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Main email (login alerts isi pe jayenge)
    @Column(nullable = false, unique = true, length = 120)
    private String email;

    @Column(nullable = false, length = 80)
    private String name;

    // GitHub account ka ID (GitHub se login karne pe bharta hai)
    @Column(name = "github_id", unique = true, length = 40)
    private String githubId;

    // Google account ka ID (Google se login karne pe bharta hai)
    @Column(name = "google_id", unique = true, length = 40)
    private String googleId;

    // Profile photo ka link (GitHub/Google se)
    @Column(name = "avatar_url", length = 300)
    private String avatarUrl;

    // "Log out everywhere" ke liye: yeh number badhate hi saare purane tokens
    // bekaar
    @Column(name = "token_version", nullable = false)
    private int tokenVersion = 0;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "last_login_at")
    private Instant lastLoginAt;

    // Row save hone se theek pehle apne aap time bhar do
    @PrePersist
    void onCreate() {
        createdAt = Instant.now();
    }

    // ----- Getters / Setters -----
    public Long getId() {
        return id;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getGithubId() {
        return githubId;
    }

    public void setGithubId(String githubId) {
        this.githubId = githubId;
    }

    public String getGoogleId() {
        return googleId;
    }

    public void setGoogleId(String googleId) {
        this.googleId = googleId;
    }

    public String getAvatarUrl() {
        return avatarUrl;
    }

    public void setAvatarUrl(String avatarUrl) {
        this.avatarUrl = avatarUrl;
    }

    public int getTokenVersion() {
        return tokenVersion;
    }

    public void bumpTokenVersion() {
        this.tokenVersion++;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public Instant getLastLoginAt() {
        return lastLoginAt;
    }

    public void setLastLoginAt(Instant lastLoginAt) {
        this.lastLoginAt = lastLoginAt;
    }
}