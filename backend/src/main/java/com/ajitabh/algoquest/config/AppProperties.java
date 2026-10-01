package com.ajitabh.algoquest.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

// application.properties ki "algoquest.*" wali lines yahan aa jaati hain
@ConfigurationProperties(prefix = "algoquest")
public record AppProperties(Owner owner, String frontendUrl, Jwt jwt, Mail mail) {

    // Sirf yahi log login kar sakte hain (allowlist)
    public record Owner(String githubLogin, String email) {
    }

    // Token ki settings
    public record Jwt(String secret, int ttlDays) {
    }

    // Alert email ki settings (Resend)
    public record Mail(String resendApiKey, String from) {
    }
}