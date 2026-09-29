package com.ajitabh.algoquest.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;

// Do alag rulebooks (filter chains):
// 1) API chain  (/api/**): sirf JWT token, koi session nahi (STATELESS)
// 2) Web chain  (baaki sab): GitHub/Google login, jise login ke beech session chahiye
@Configuration
@EnableWebSecurity
public class SecurityConfig {

        // ---------- 1) API: website yahan JWT ke saath aati hai ----------
        @Bean
        @Order(1)
        SecurityFilterChain apiChain(HttpSecurity http) throws Exception {
                http
                                .securityMatcher("/api/**")
                                .authorizeHttpRequests(auth -> auth
                                                .requestMatchers("/api/hello", "/api/auth/denied").permitAll()
                                                .anyRequest().authenticated())
                                // Token galat/missing -> 401 (WWW-Authenticate: Bearer header ke saath)
                                .oauth2ResourceServer(rs -> rs.jwt(Customizer.withDefaults()))
                                // API kabhi session nahi banayegi: har request apna token khud laati hai
                                .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                                .requestCache(cache -> cache.disable())
                                // CSRF cookies ke bharose hota hai; hum header wala token use karte hain, toh
                                // zaroorat nahi
                                .csrf(csrf -> csrf.disable());

                return http.build();
        }

        // ---------- 2) Web: GitHub/Google login pages aur health check ----------
        @Bean
        @Order(2)
        SecurityFilterChain webChain(HttpSecurity http,
                        GithubUserService githubUsers,
                        GoogleUserService googleUsers,
                        LoginSuccessHandler loginSuccessHandler,
                        LoginFailureHandler loginFailureHandler) throws Exception {
                http
                                .authorizeHttpRequests(auth -> auth
                                                .requestMatchers("/actuator/health", "/error").permitAll()
                                                .anyRequest().authenticated())
                                .oauth2Login(oauth -> oauth
                                                .userInfoEndpoint(info -> info
                                                                .userService(githubUsers)
                                                                .oidcUserService(googleUsers))
                                                .successHandler(loginSuccessHandler)
                                                .failureHandler(loginFailureHandler))
                                // Login ke baad hum khud website pe bhejte hain, "purani request yaad rakho"
                                // nahi chahiye
                                .requestCache(cache -> cache.disable());

                return http.build();
        }
}