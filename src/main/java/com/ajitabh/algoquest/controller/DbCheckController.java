package com.ajitabh.algoquest.controller;

import java.util.Map;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ajitabh.algoquest.repository.UserRepository;

// Sirf yeh check karne ke liye ki database se connection sahi hai.
// (Baad mein ise hata denge ya band kar denge.)
@RestController
@RequestMapping("/api")
public class DbCheckController {

    private final UserRepository users;

    // Constructor injection: Spring khud UserRepository bana ke yahan de deta hai
    public DbCheckController(UserRepository users) {
        this.users = users;
    }

    // GET http://localhost:8080/api/db-check
    @GetMapping("/db-check")
    public Map<String, Object> check() {
        return Map.of(
                "database", "connected",
                "users", users.count() // SELECT COUNT(*) FROM users
        );
    }
}