package com.ajitabh.algoquest.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

// application.properties ki "algoquest.*" wali lines yahan aa jaati hain:
//   algoquest.owner.github-login  ->  owner().githubLogin()
//   algoquest.owner.email         ->  owner().email()
//   algoquest.frontend-url        ->  frontendUrl()
// "record" = chhoti, sirf data rakhne wali class (getters apne aap bante hain)
@ConfigurationProperties(prefix = "algoquest")
public record AppProperties(Owner owner, String frontendUrl) {

    // Sirf yahi log login kar sakte hain (allowlist)
    public record Owner(String githubLogin, String email) {
    }
}
