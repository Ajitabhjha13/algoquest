package com.ajitabh.algoquest.service;

import java.time.Duration;
import java.util.List;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.MediaType;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import com.ajitabh.algoquest.config.AppProperties;

// Owner ko security alert email bhejta hai (Resend HTTPS API se, SMTP se nahi)
@Service
public class AlertMailService {

    private static final Logger log = LoggerFactory.getLogger(AlertMailService.class);

    private final AppProperties props;
    private final RestClient resend;

    public AlertMailService(AppProperties props) {
        this.props = props;

        // Resend 5-10 second mein jawab na de toh chhod do (thread atka na rahe)
        SimpleClientHttpRequestFactory timeouts = new SimpleClientHttpRequestFactory();
        timeouts.setConnectTimeout(Duration.ofSeconds(5));
        timeouts.setReadTimeout(Duration.ofSeconds(10));

        this.resend = RestClient.builder()
                .baseUrl("https://api.resend.com")
                .requestFactory(timeouts)
                .defaultHeader("User-Agent", "algoquest-api")
                .build();
    }

    // Background mein email bhejo: login kabhi is wajah se slow ya fail nahi hoga
    public void sendToOwner(String subject, String html) {
        String apiKey = props.mail().resendApiKey();
        if (apiKey == null || apiKey.isBlank()) {
            log.warn("RESEND_API_KEY is missing, alert email skipped: {}", subject);
            return;
        }

        Thread.startVirtualThread(() -> {
            try {
                resend.post()
                        .uri("/emails")
                        .header("Authorization", "Bearer " + apiKey)
                        .contentType(MediaType.APPLICATION_JSON)
                        .body(Map.of(
                                "from", props.mail().from(),
                                "to", List.of(props.owner().email()),
                                "subject", subject,
                                "html", html))
                        .retrieve()
                        .toBodilessEntity();
                log.info("Alert email sent: {}", subject);
            } catch (Exception e) {
                log.warn("Alert email failed ({}): {}", subject, e.getMessage());
            }
        });
    }
}
