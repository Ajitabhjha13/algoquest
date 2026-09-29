package com.ajitabh.algoquest.security;

import jakarta.servlet.http.HttpServletRequest;

// Request bhejne wale ka IP address. Poore project mein SIRF yahi ek jagah yeh logic hai
// (login history aur rate limiting dono yahi use karte hain).
public final class ClientIp {

    private ClientIp() {
    } // sirf static method hai, object banane ki zaroorat nahi

    // Render jaise server ke peeche asli IP "X-Forwarded-For" header mein aati hai.
    // TODO (Step 8): deploy ke baad pakka karna ki yeh header bharose layak hai.
    public static String of(HttpServletRequest request) {
        String forwarded = request.getHeader("X-Forwarded-For");
        if (forwarded != null && !forwarded.isBlank()) {
            return forwarded.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}