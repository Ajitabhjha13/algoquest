package com.ajitabh.algoquest.security;

import java.io.IOException;
import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

// Har IP ke liye ek "token bucket": limit se zyada requests -> 429 Too Many Requests.
// Yeh Spring Security se bhi PEHLE chalta hai, taaki spam jaldi ruk jaye.
@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
public class RateLimitFilter extends OncePerRequestFilter {

    private record Rule(String name, int capacity, Duration period) {
    }

    private static final Rule LOGIN = new Rule("login", 10, Duration.ofMinutes(1));
    private static final Rule API = new Rule("api", 60, Duration.ofMinutes(1));

    // Memory bharne na paye: bahut saare IP ho jayein toh purani (idle) baaltiyan
    // hata do
    private static final int MAX_TRACKED = 10_000;
    private static final long IDLE_NANOS = Duration.ofMinutes(10).toNanos();

    private final Map<String, TokenBucket> buckets = new ConcurrentHashMap<>();

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
            FilterChain chain) throws ServletException, IOException {
        Rule rule = ruleFor(request.getRequestURI());
        if (rule == null) {
            chain.doFilter(request, response);
            return;
        }

        cleanupIfTooBig();
        String key = rule.name() + ":" + clientIp(request);
        TokenBucket bucket = buckets.computeIfAbsent(key, k -> new TokenBucket(rule.capacity(), rule.period()));

        long waitNanos = bucket.tryConsume();
        if (waitNanos == 0) {
            chain.doFilter(request, response);
            return;
        }

        long retryAfterSeconds = Math.max(1, (waitNanos + 999_999_999L) / 1_000_000_000L);
        response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
        response.setHeader("Retry-After", String.valueOf(retryAfterSeconds));
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        response.getWriter().write("{\"error\":\"too_many_requests\",\"message\":\"Too many requests. Please wait "
                + retryAfterSeconds + " seconds and try again.\"}");
    }

    // Kis path pe kaunsa niyam? null = koi limit nahi
    private static Rule ruleFor(String uri) {
        if (uri.equals("/actuator/health"))
            return null;
        if (uri.startsWith("/oauth2/") || uri.startsWith("/login"))
            return LOGIN;
        if (uri.startsWith("/api/"))
            return API;
        return null;
    }

    // Render jaise server ke peeche asli IP "X-Forwarded-For" header mein aati hai
    private static String clientIp(HttpServletRequest request) {
        String forwarded = request.getHeader("X-Forwarded-For");
        if (forwarded != null && !forwarded.isBlank()) {
            return forwarded.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }

    private void cleanupIfTooBig() {
        if (buckets.size() < MAX_TRACKED)
            return;
        long now = System.nanoTime();
        buckets.values().removeIf(b -> now - b.lastUsed > IDLE_NANOS);
    }

    // Baalti: shuru mein poori bhari, har pal thodi-thodi bharti rehti hai
    private static final class TokenBucket {
        private final int capacity;
        private final double tokensPerNano;
        private double tokens;
        private long lastRefill;
        private volatile long lastUsed;

        TokenBucket(int capacity, Duration period) {
            this.capacity = capacity;
            this.tokensPerNano = (double) capacity / period.toNanos();
            this.tokens = capacity;
            this.lastRefill = System.nanoTime();
            this.lastUsed = lastRefill;
        }

        // 0 = request allowed; warna kitne nanoseconds baad agla token milega
        synchronized long tryConsume() {
            long now = System.nanoTime();
            tokens = Math.min(capacity, tokens + (now - lastRefill) * tokensPerNano);
            lastRefill = now;
            lastUsed = now;
            if (tokens >= 1) {
                tokens -= 1;
                return 0;
            }
            return (long) Math.ceil((1 - tokens) / tokensPerNano);
        }
    }
}