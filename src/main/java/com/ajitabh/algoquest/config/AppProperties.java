package com.ajitabh.algoquest.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

// application.properties ki "algoquest.*" wali lines yahan aa jaati hain:
//   algoquest.owner.github-login  ->  owner().githubLogin()
//   algoquest.owner.email         ->  owner().email()
//   algoquest.frontend-url        ->  frontendUrl()
//   algoquest.jwt.secret          ->  jwt().secret()
//   algoquest.jwt.ttl-days        ->  jwt().ttlDays()
@ConfigurationProperties(prefix = "algoquest")
public record AppProperties(Owner owner, String frontendUrl, Jwt jwt) {

    // Sirf yahi log login kar sakte hain (allowlist)
    public record Owner(String githubLogin, String email) {
    }

    // Token ki settings
    public record Jwt(String secret, int ttlDays) {
    }
}