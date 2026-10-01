package com.ajitabh.algoquest.controller;

import java.time.Instant;
import java.util.Map;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

// @RestController: is class ke methods HTTP requests ka jawab dete hain (JSON mein)
@RestController
@RequestMapping("/api")
public class HelloController {

    // GET http://localhost:8080/api/hello
    @GetMapping("/hello")
    public Map<String, Object> hello() {
        return Map.of(
                "message", "Hello Ajitabh, API is live",
                "status", "running",
                "time", Instant.now().toString());
    }
}