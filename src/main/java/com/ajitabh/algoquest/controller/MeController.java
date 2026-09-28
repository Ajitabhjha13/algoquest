package com.ajitabh.algoquest.controller;

import java.util.LinkedHashMap;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ajitabh.algoquest.model.User;
import com.ajitabh.algoquest.repository.UserRepository;

@RestController
@RequestMapping("/api")
public class MeController {

    private final UserRepository users;

    public MeController(UserRepository users) {
        this.users = users;
    }

    // GET /api/me (header: Authorization: Bearer <JWT>)
    @GetMapping("/me")
    public ResponseEntity<Map<String, Object>> me(@AuthenticationPrincipal Jwt jwt) {
        return users.findById(Long.valueOf(jwt.getSubject()))
                .map(u -> ResponseEntity.ok(toBody(u, jwt)))
                .orElseGet(() -> ResponseEntity.status(HttpStatus.UNAUTHORIZED).build());
    }

    // POST /api/auth/logout-all : saare devices se logout (saare purane pass
    // bekaar)
    @PostMapping("/auth/logout-all")
    public ResponseEntity<Map<String, Object>> logoutEverywhere(@AuthenticationPrincipal Jwt jwt) {
        return users.findById(Long.valueOf(jwt.getSubject()))
                .map(u -> {
                    u.bumpTokenVersion(); // version badha -> purane saare JWT fail
                    users.save(u);
                    return ResponseEntity.ok(Map.<String, Object>of("message", "Logged out from all devices"));
                })
                .orElseGet(() -> ResponseEntity.status(HttpStatus.UNAUTHORIZED).build());
    }

    // GET /api/auth/denied : koi aur login karne aaya toh yeh
    @GetMapping("/auth/denied")
    public ResponseEntity<Map<String, Object>> denied() {
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of(
                "error", "not_owner",
                "message", "This is a private planner. Only its owner can sign in."));
    }

    private Map<String, Object> toBody(User u, Jwt jwt) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("id", u.getId());
        body.put("name", u.getName());
        body.put("email", u.getEmail());
        body.put("avatarUrl", u.getAvatarUrl());
        body.put("githubLinked", u.getGithubId() != null);
        body.put("googleLinked", u.getGoogleId() != null);
        body.put("lastLoginAt", u.getLastLoginAt());
        body.put("tokenExpiresAt", jwt.getExpiresAt());
        return body;
    }
}