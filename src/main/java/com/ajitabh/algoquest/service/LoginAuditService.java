package com.ajitabh.algoquest.service;

import org.springframework.stereotype.Service;

import com.ajitabh.algoquest.model.LoginEvent;
import com.ajitabh.algoquest.repository.LoginEventRepository;

import jakarta.servlet.http.HttpServletRequest;

// Har login attempt ko login_events table mein likhta hai
@Service
public class LoginAuditService {

    private final LoginEventRepository events;

    public LoginAuditService(LoginEventRepository events) {
        this.events = events;
    }

    public LoginEvent record(Long userId, String provider, String identity, boolean success,
            HttpServletRequest request) {
        String userAgent = request.getHeader("User-Agent");

        LoginEvent e = new LoginEvent();
        e.setUserId(userId);
        e.setProvider(provider);
        e.setIdentity(cut(identity, 120));
        e.setSuccess(success);
        e.setIpAddress(cut(clientIp(request), 64));
        e.setUserAgent(cut(userAgent, 300));
        e.setDevice(describeDevice(userAgent));
        return events.save(e);
    }

    // Render jaise server ke peeche asli IP "X-Forwarded-For" header mein aati hai
    private String clientIp(HttpServletRequest request) {
        String forwarded = request.getHeader("X-Forwarded-For");
        if (forwarded != null && !forwarded.isBlank()) {
            return forwarded.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }

    // Lamba User-Agent -> "Chrome on Windows" jaisa chhota naam
    static String describeDevice(String ua) {
        if (ua == null)
            return "Unknown device";
        String browser = ua.contains("Edg/") ? "Edge"
                : ua.contains("OPR/") ? "Opera"
                        : ua.contains("Chrome/") ? "Chrome"
                                : ua.contains("Firefox/") ? "Firefox"
                                        : ua.contains("Safari/") ? "Safari"
                                                : "Unknown browser";
        String os = ua.contains("Windows") ? "Windows"
                : ua.contains("Android") ? "Android" // Android pehle, kyunki usme "Linux" bhi likha hota hai
                        : (ua.contains("iPhone") || ua.contains("iPad")) ? "iOS"
                                : ua.contains("Mac OS X") ? "macOS"
                                        : ua.contains("Linux") ? "Linux"
                                                : "Unknown OS";
        return browser + " on " + os;
    }

    private static String cut(String s, int max) {
        return (s == null || s.length() <= max) ? s : s.substring(0, max);
    }
}