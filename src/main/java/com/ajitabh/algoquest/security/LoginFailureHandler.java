package com.ajitabh.algoquest.security;

import java.io.IOException;

import org.springframework.security.core.AuthenticationException;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.web.authentication.AuthenticationFailureHandler;
import org.springframework.stereotype.Component;

import com.ajitabh.algoquest.service.LoginAuditService;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

// Login FAIL hua (jaise owner nahi tha) -> record karo -> "private planner" message
@Component
public class LoginFailureHandler implements AuthenticationFailureHandler {

    private final LoginAuditService audit;

    public LoginFailureHandler(LoginAuditService audit) {
        this.audit = audit;
    }

    @Override
    public void onAuthenticationFailure(HttpServletRequest request, HttpServletResponse response,
            AuthenticationException exception) throws IOException {
        // URL se pata chalta hai kaunsa provider tha: /login/oauth2/code/github ya
        // /google
        String provider = request.getRequestURI().endsWith("/google") ? "google" : "github";

        // Chaukidar ka message: "GitHub account 'xyz' is not allowed"
        String who = (exception instanceof OAuth2AuthenticationException oauth)
                ? oauth.getError().getDescription()
                : exception.getMessage();

        audit.record(null, provider, who, false, request);
        response.sendRedirect("/api/auth/denied");
    }
}