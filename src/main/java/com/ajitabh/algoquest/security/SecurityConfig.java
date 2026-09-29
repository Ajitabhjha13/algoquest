package com.ajitabh.algoquest.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpStatus;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.HttpStatusEntryPoint;
import org.springframework.security.web.servlet.util.matcher.PathPatternRequestMatcher;

// Poore backend ke security rules yahan hain
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    SecurityFilterChain filterChain(HttpSecurity http,
            GithubUserService githubUsers,
            GoogleUserService googleUsers,
            LoginSuccessHandler loginSuccessHandler,
            LoginFailureHandler loginFailureHandler) throws Exception {
        http
                // 1. Kaunse URLs bina login khule hain
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(
                                "/api/hello", // test API
                                "/actuator/health", // Render health check
                                "/api/auth/denied", // "tum owner nahi ho" wala message
                                "/error")
                        .permitAll()
                        .anyRequest().authenticated())
                // 2. GitHub / Google login (sirf pass lene ke liye)
                .oauth2Login(oauth -> oauth
                        .userInfoEndpoint(info -> info
                                .userService(githubUsers)
                                .oidcUserService(googleUsers))
                        .successHandler(loginSuccessHandler) // login ho gaya -> history -> JWT pass -> website
                        .failureHandler(loginFailureHandler) // fail -> history mein likho -> "private planner"
                )
                // 3. API requests "Authorization: Bearer <JWT>" se pehchani jaati hain
                .oauth2ResourceServer(rs -> rs.jwt(Customizer.withDefaults()))
                // 4. /api/** pe bina pass aaye toh login page nahi, seedha 401
                .exceptionHandling(ex -> ex.defaultAuthenticationEntryPointFor(
                        new HttpStatusEntryPoint(HttpStatus.UNAUTHORIZED),
                        PathPatternRequestMatcher.withDefaults().matcher("/api/**")))
                // 5. Bearer token wali APIs pe CSRF ki zaroorat nahi
                .csrf(csrf -> csrf.ignoringRequestMatchers("/api/**"));

        return http.build();
    }
}