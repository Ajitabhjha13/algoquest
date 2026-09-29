package com.ajitabh.algoquest.security;

import java.io.IOException;
import java.util.Optional;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import com.ajitabh.algoquest.config.AppProperties;
import com.ajitabh.algoquest.model.User;
import com.ajitabh.algoquest.repository.UserRepository;
import com.ajitabh.algoquest.service.LoginAuditService;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;

// GitHub/Google login SUCCESS hone ke baad yeh chalta hai:
// user dhoondho -> history mein likho -> JWT pass banao -> session mitao -> website pe bhejo
@Component
public class LoginSuccessHandler implements AuthenticationSuccessHandler {

    private final UserRepository users;
    private final JwtService jwtService;
    private final LoginAuditService audit;
    private final AppProperties props;

    public LoginSuccessHandler(UserRepository users, JwtService jwtService,
            LoginAuditService audit, AppProperties props) {
        this.users = users;
        this.jwtService = jwtService;
        this.audit = audit;
        this.props = props;
    }

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
            Authentication authentication) throws IOException {
        OAuth2User principal = (OAuth2User) authentication.getPrincipal();
        boolean isGoogle = principal instanceof OidcUser;

        Optional<User> user = isGoogle
                ? users.findByGoogleId(((OidcUser) principal).getSubject())
                : users.findByGithubId(String.valueOf(principal.getAttributes().get("id")));

        if (user.isEmpty()) {
            response.sendRedirect("/api/auth/denied");
            return;
        }

        // History mein likho
        String identity = isGoogle ? ((OidcUser) principal).getEmail() : principal.getAttribute("login");
        audit.record(user.get().getId(), isGoogle ? "google" : "github", identity, true, request);

        String token = jwtService.issueToken(user.get());

        // Server pe login yaad NAHI rakhna: aage se sirf JWT pass chalega
        HttpSession session = request.getSession(false);
        if (session != null)
            session.invalidate();
        SecurityContextHolder.clearContext();

        response.sendRedirect(props.frontendUrl() + "/#/auth?token=" + token);
    }
}