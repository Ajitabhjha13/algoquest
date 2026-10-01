package com.ajitabh.algoquest.security;

import jakarta.servlet.http.HttpServletRequest;

// Request bhejne wale ka IP address. Poore project mein SIRF yahi ek jagah yeh logic hai
// (login history aur rate limiting dono yahi use karte hain).
//
// Render ke aage Cloudflare hota hai. "X-Forwarded-For" pe aankh band karke bharosa nahi:
// koi bhi apni request mein yeh header khud bhej ke nakli IP bata sakta hai (rate limit bypass).
// Isliye order:
//   1) CF-Connecting-IP / True-Client-IP : Cloudflare khud likhta hai, client ka bheja hua mita deta hai
//   2) X-Forwarded-For ki AAKHRI entry  : jo hamare sabse paas wale proxy ne joda (client ki daali entries pehle aati hain)
//   3) remoteAddr                        : seedha connection (local pe)
public final class ClientIp {

    private ClientIp() {} // sirf static method hai, object banane ki zaroorat nahi

    public static String of(HttpServletRequest request) {
        String ip = firstNonBlank(
                request.getHeader("CF-Connecting-IP"),
                request.getHeader("True-Client-IP"));
        if (ip != null) return ip.trim();

        String forwarded = request.getHeader("X-Forwarded-For");
        if (forwarded != null && !forwarded.isBlank()) {
            String[] parts = forwarded.split(",");
            return parts[parts.length - 1].trim();
        }
        return request.getRemoteAddr();
    }

    private static String firstNonBlank(String... values) {
        for (String v : values) {
            if (v != null && !v.isBlank()) return v;
        }
        return null;
    }
}
