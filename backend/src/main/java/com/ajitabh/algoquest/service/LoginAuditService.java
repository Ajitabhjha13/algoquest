package com.ajitabh.algoquest.service;

import org.springframework.stereotype.Service;

import com.ajitabh.algoquest.model.LoginEvent;
import com.ajitabh.algoquest.repository.LoginEventRepository;
import com.ajitabh.algoquest.security.ClientIp;

import jakarta.servlet.http.HttpServletRequest;

// Har login attempt ko login_events table mein likhta hai, aur zaroorat ho toh alert bhejta hai
@Service
public class LoginAuditService {

    private final LoginEventRepository events;
    private final SecurityAlertService alerts;

    public LoginAuditService(LoginEventRepository events, SecurityAlertService alerts) {
        this.events = events;
        this.alerts = alerts;
    }

    public LoginEvent record(Long userId, String provider, String identity, boolean success,
            HttpServletRequest request) {
        String userAgent = request.getHeader("User-Agent");
        String device = describeDevice(userAgent);

        // Naya device? Yeh check SAVE se PEHLE hona chahiye,
        // warna abhi wala login khud hi "purana device" gin liya jayega.
        boolean newDevice = success && userId != null
                && !events.existsByUserIdAndDeviceAndSuccessTrue(userId, device);

        LoginEvent e = new LoginEvent();
        e.setUserId(userId);
        e.setProvider(provider);
        e.setIdentity(cut(identity, 120));
        e.setSuccess(success);
        e.setIpAddress(cut(ClientIp.of(request), 64));
        e.setUserAgent(cut(userAgent, 300));
        e.setDevice(device);
        LoginEvent saved = events.save(e);

        if (newDevice) {
            alerts.newDeviceLogin(saved);
        } else if (!success) {
            alerts.deniedAttempt(saved);
        }
        return saved;
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
                : ua.contains("Android") ? "Android"
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