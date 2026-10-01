package com.ajitabh.algoquest.security;

import java.time.Duration;
import java.util.List;

import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

// Browser ko batata hai ki hamari website (aur sirf wahi) is API ko call kar sakti hai.
// SABSE PEHLE chalta hai: rate limiter aur Spring Security se bhi pehle,
// taaki 401/429 jaise errors mein bhi CORS headers rahein aur preflight kabhi block na ho.
@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
public class ApiCorsFilter extends CorsFilter {

    // Sirf yahi websites API call kar sakti hain
    private static final List<String> ALLOWED_ORIGINS = List.of(
            "http://localhost:5500",
            "http://127.0.0.1:5500",
            "https://ajitabhjha13.github.io");

    public ApiCorsFilter() {
        super(source());
    }

    private static UrlBasedCorsConfigurationSource source() {
        CorsConfiguration cors = new CorsConfiguration();
        cors.setAllowedOrigins(ALLOWED_ORIGINS);
        cors.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        cors.setAllowedHeaders(List.of("Authorization", "Content-Type"));
        cors.setExposedHeaders(List.of("Retry-After")); // website 429 pe "kitna rukna hai" padh sake
        cors.setAllowCredentials(false); // hum cookie nahi, Bearer token use karte hain
        cors.setMaxAge(Duration.ofHours(1)); // browser 1 ghante tak preflight ka jawab yaad rakhe

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/api/**", cors);
        return source;
    }
}