package com.ajitabh.algoquest.security;

import java.time.Instant;
import java.time.temporal.ChronoUnit;

import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwsHeader;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.stereotype.Service;

import com.ajitabh.algoquest.config.AppProperties;
import com.ajitabh.algoquest.model.User;

// Login ke baad user ke liye "digital pass" (JWT) banata hai
@Service
public class JwtService {

    private final JwtEncoder encoder;
    private final AppProperties props;

    public JwtService(JwtEncoder encoder, AppProperties props) {
        this.encoder = encoder;
        this.props = props;
    }

    public String issueToken(User user) {
        Instant now = Instant.now();
        JwtClaimsSet claims = JwtClaimsSet.builder()
                .issuer("algoquest-api")
                .subject(String.valueOf(user.getId())) // kiska pass hai: user id
                .issuedAt(now)
                .expiresAt(now.plus(props.jwt().ttlDays(), ChronoUnit.DAYS)) // kab tak valid
                .claim("ver", user.getTokenVersion()) // "log out everywhere" ke liye
                .claim("name", user.getName())
                .build();

        JwsHeader header = JwsHeader.with(MacAlgorithm.HS256).build();
        return encoder.encode(JwtEncoderParameters.from(header, claims)).getTokenValue();
    }
}