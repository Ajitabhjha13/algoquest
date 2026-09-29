package com.ajitabh.algoquest.service;

import java.time.Duration;
import java.time.Instant;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.Locale;
import java.util.concurrent.atomic.AtomicReference;

import org.springframework.stereotype.Service;
import org.springframework.web.util.HtmlUtils;

import com.ajitabh.algoquest.model.LoginEvent;

// Kaunsa alert kab bhejna hai, aur email mein kya likhna hai
@Service
public class SecurityAlertService {

    private static final ZoneId IST = ZoneId.of("Asia/Kolkata");
    private static final DateTimeFormatter WHEN = DateTimeFormatter.ofPattern("d MMM yyyy, h:mm a 'IST'",
            Locale.ENGLISH);

    // Denied alerts ke beech kam se kam itna gap (inbox spam na ho)
    private static final Duration DENIED_ALERT_GAP = Duration.ofMinutes(10);

    private final AlertMailService mail;
    private final AtomicReference<Instant> lastDeniedAlert = new AtomicReference<>(Instant.EPOCH);

    public SecurityAlertService(AlertMailService mail) {
        this.mail = mail;
    }

    // Owner ne aise device se login kiya jo pehle kabhi nahi dikha
    public void newDeviceLogin(LoginEvent e) {
        String subject = "New sign-in to AlgoQuest: " + e.getDevice();
        String html = """
                <p>Hello Ajitabh,</p>
                <p>Your AlgoQuest account was just signed in from a device it has not seen before.</p>
                %s
                <p>If this was you, no action is needed.</p>
                <p>If it was not you, use <b>Log out everywhere</b> in AlgoQuest right away,
                then check the security of your GitHub and Google accounts.</p>
                <p style="color:#888;font-size:12px">This is an automatic security alert from AlgoQuest.</p>
                """.formatted(detailsTable(e, "Signed in with"));
        mail.sendToOwner(subject, html);
    }

    // Kisi aur ne login try kiya aur roka gaya (10 minute mein max ek email)
    public void deniedAttempt(LoginEvent e) {
        Instant now = Instant.now();
        Instant last = lastDeniedAlert.get();
        boolean tooSoon = Duration.between(last, now).compareTo(DENIED_ALERT_GAP) < 0;
        if (tooSoon || !lastDeniedAlert.compareAndSet(last, now)) {
            return; // abhi-abhi alert gaya tha; attempt history mein phir bhi save hai
        }

        String subject = "Blocked sign-in attempt on AlgoQuest";
        String html = """
                <p>Hello Ajitabh,</p>
                <p>Someone tried to sign in to your private AlgoQuest planner with an account
                that is not on the allowlist. The attempt was <b>blocked</b>.</p>
                %s
                <p>No action is needed. Your account is safe.</p>
                <p style="color:#888;font-size:12px">To keep your inbox clean, at most one alert like this
                is sent every 10 minutes. Every attempt is still saved in your login history.</p>
                """.formatted(detailsTable(e, "Tried with"));
        mail.sendToOwner(subject, html);
    }

    // Device, account, IP, time ki chhoti table
    private String detailsTable(LoginEvent e, String providerLabel) {
        Instant at = e.getCreatedAt() != null ? e.getCreatedAt() : Instant.now();
        String identity = (e.getIdentity() == null || e.getIdentity().isBlank()) ? "unknown" : e.getIdentity();
        return """
                <table style="border-collapse:collapse;font-size:14px">
                  %s%s%s%s
                </table>
                """.formatted(
                row("Device", e.getDevice()),
                row(providerLabel, providerName(e.getProvider()) + " (" + identity + ")"),
                row("IP address", e.getIpAddress()),
                row("Time", WHEN.format(at.atZone(IST))));
    }

    // Har value yahin, sirf EK baar escape hoti hai
    private static String row(String label, String value) {
        return "<tr><td style=\"padding:4px 12px 4px 0;color:#666\">" + label + "</td>"
                + "<td style=\"padding:4px 0\"><b>" + safe(value) + "</b></td></tr>";
    }

    private static String providerName(String provider) {
        return "google".equals(provider) ? "Google" : "GitHub";
    }

    // HTML injection se bachav: "<script>" jaisa text sirf text hi rahega
    private static String safe(String value) {
        if (value == null || value.isBlank())
            return "Unknown";
        return HtmlUtils.htmlEscape(value);
    }
}