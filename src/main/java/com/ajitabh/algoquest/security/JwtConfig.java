package com.ajitabh.algoquest.security;

import java.util.Base64;

import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.oauth2.core.DelegatingOAuth2TokenValidator;
import org.springframework.security.oauth2.core.OAuth2Error;
import org.springframework.security.oauth2.core.OAuth2TokenValidator;
import org.springframework.security.oauth2.core.OAuth2TokenValidatorResult;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtValidators;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtEncoder;

import com.ajitabh.algoquest.config.AppProperties;
import com.ajitabh.algoquest.repository.UserRepository;
import com.nimbusds.jose.jwk.source.ImmutableSecret;

// Token ki "mohar" (secret key), token banane wala (encoder) aur check karne wala (decoder)
@Configuration
public class JwtConfig {

    // JWT_SECRET se asli key banao (HMAC-SHA256)
    @Bean
    SecretKey jwtSecretKey(AppProperties props) {
        byte[] bytes = Base64.getDecoder().decode(props.jwt().secret());
        return new SecretKeySpec(bytes, "HmacSHA256");
    }

    // Token BANANE wala: key se sign karta hai
    @Bean
    JwtEncoder jwtEncoder(SecretKey key) {
        return new NimbusJwtEncoder(new ImmutableSecret<>(key));
    }

    // Token CHECK karne wala: 3 cheezein dekhta hai
    // 1. signature sahi hai (kisi ne chhed-chhaad nahi ki)
    // 2. expire nahi hua
    // 3. version database se match karta hai ("Log out everywhere" ke liye)
    @Bean
    JwtDecoder jwtDecoder(SecretKey key, UserRepository users) {
        NimbusJwtDecoder decoder = NimbusJwtDecoder.withSecretKey(key)
                .macAlgorithm(MacAlgorithm.HS256)
                .build();

        OAuth2TokenValidator<Jwt> versionCheck = jwt -> {
            Object ver = jwt.getClaim("ver");
            boolean valid = ver instanceof Number v
                    && users.findById(Long.valueOf(jwt.getSubject()))
                            .map(u -> u.getTokenVersion() == v.intValue())
                            .orElse(false);
            return valid
                    ? OAuth2TokenValidatorResult.success()
                    : OAuth2TokenValidatorResult
                            .failure(new OAuth2Error("invalid_token", "Token has been revoked", null));
        };

        decoder.setJwtValidator(new DelegatingOAuth2TokenValidator<>(JwtValidators.createDefault(), versionCheck));
        return decoder;
    }
}