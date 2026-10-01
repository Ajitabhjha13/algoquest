package com.ajitabh.algoquest.controller;

import java.time.Instant;
import java.util.List;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ajitabh.algoquest.model.LoginEvent;
import com.ajitabh.algoquest.repository.LoginEventRepository;

// Website ke Settings page ke liye: "kab, kahan se, kis device se login hua"
@RestController
@RequestMapping("/api/auth")
public class LoginHistoryController {

    private final LoginEventRepository events;

    public LoginHistoryController(LoginEventRepository events) {
        this.events = events;
    }

    // GET /api/auth/history (header: Authorization: Bearer <JWT>)
    @GetMapping("/history")
    public List<LoginHistoryItem> history(@AuthenticationPrincipal Jwt jwt) {
        Long userId = Long.valueOf(jwt.getSubject());
        return events.findTop20ByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(LoginHistoryItem::from)
                .toList();
    }

    // DTO: sirf wahi fields jo website ko chahiye (poori entity bahar nahi bhejte)
    public record LoginHistoryItem(
            Long id,
            String provider,
            String identity,
            boolean success,
            String device,
            String ipAddress,
            Instant createdAt) {

        static LoginHistoryItem from(LoginEvent e) {
            return new LoginHistoryItem(
                    e.getId(),
                    e.getProvider(),
                    e.getIdentity(),
                    e.isSuccess(),
                    e.getDevice(),
                    e.getIpAddress(),
                    e.getCreatedAt());
        }
    }
}