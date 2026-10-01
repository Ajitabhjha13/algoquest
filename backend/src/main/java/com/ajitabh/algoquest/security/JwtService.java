package com.ajitabh.algoquest.security;

import java.time.Duration;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwsHeader;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.stereotype.Service;

import com.ajitabh.algoquest.config.AppProperties;
import com.ajitabh.algoquest.model.User;

// Login ke baad user ke liye "digital pass" (JWT) banata hai, aur use renew bhi karta hai.
// "auth_time" = asli login (GitHub/Google) ka waqt. Renew pe yeh NAHI badalta,
// isliye session kitna bhi renew ho, max-session-days (default 60) se aage nahi ja sakta.
@Service
public class JwtService {

    private final JwtEncoder encoder;
    private final AppProperties props;
    private final Duration maxSession;

    public JwtService(JwtEncoder encoder, AppProperties props,
            @Value("${algoquest.jwt.max-session-days:60}") int maxSessionDays) {
        this.encoder = encoder;
        this.props = props;
        this.maxSession = Duration.ofDays(maxSessionDays);
    }

    // Naya login: session abhi shuru hua
    public String issueToken(User user) {
        Instant now = Instant.now();
        return build(user, now, now, now.plus(props.jwt().ttlDays(), ChronoUnit.DAYS));
    }

    // Auto-renew: naya token, par purana auth_time. 60 din poore? -> empty (dobara
    // login chahiye)
    public Optional<String> renewToken(User user, Jwt current) {
        Instant now = Instant.now();
        Instant authTime = authTime(current);
        Instant sessionEnd = authTime.plus(maxSession);
        if (!now.isBefore(sessionEnd)) {
            return Optional.empty();
        }
        Instant normalExpiry = now.plus(props.jwt().ttlDays(), ChronoUnit.DAYS);
        Instant expiry = normalExpiry.isBefore(sessionEnd) ? normalExpiry : sessionEnd; // deewar se aage nahi
        return Optional.of(build(user, now, authTime, expiry));
    }

    // Is session mein dobara asli login kab karna padega
    public Instant sessionEndsAt(Jwt jwt) {
        return authTime(jwt).plus(maxSession);
    }

    private static Instant authTime(Jwt jwt) {
        Object t = jwt.getClaim("auth_time");
        if (t instanceof Number n)
            return Instant.ofEpochSecond(n.longValue());
        if (t instanceof Instant i)
            return i;
        // Is update se pehle bane tokens mein auth_time nahi hai: unka issue time hi
        // maan lo
        return jwt.getIssuedAt() != null ? jwt.getIssuedAt() : Instant.now();
    }

    private String build(User user, Instant now, Instant authTime, Instant expiry) {
        JwtClaimsSet claims = JwtClaimsSet.builder()
                .issuer("algoquest-api")
                .subject(String.valueOf(user.getId()))
                .issuedAt(now)
                .expiresAt(expiry)
                .claim("ver", user.getTokenVersion())
                .claim("name", user.getName())
                .claim("auth_time", authTime.getEpochSecond())
                .build();

        JwsHeader header = JwsHeader.with(MacAlgorithm.HS256).build();
        return encoder.encode(JwtEncoderParameters.from(header, claims)).getTokenValue();
    }
}