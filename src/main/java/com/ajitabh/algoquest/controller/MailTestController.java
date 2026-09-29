package com.ajitabh.algoquest.controller;

import java.util.Map;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ajitabh.algoquest.service.AlertMailService;

// TEMPORARY: sirf check karne ke liye ki email jaata hai. Test ke baad delete karenge.
@RestController
public class MailTestController {

    private final AlertMailService mail;

    public MailTestController(AlertMailService mail) {
        this.mail = mail;
    }

    @GetMapping("/api/mail-test")
    public Map<String, String> test() {
        mail.sendToOwner("AlgoQuest test email",
                "<p>Hello Ajitabh,</p><p>If you can read this, AlgoQuest alert emails are working.</p>");
        return Map.of("message", "Test email queued. Check your inbox.");
    }
}
