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

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;

// GitHub/Google login SUCCESS hone ke baad yeh chalta hai:
// user dhoondho -> JWT pass banao -> browser ka session mitao -> website pe pass ke saath bhejo
@Component
public class LoginSuccessHandler implements AuthenticationSuccessHandler {

    private final UserRepository users;
    private final JwtService jwtService;
    private final AppProperties props;

    public LoginSuccessHandler(UserRepository users, JwtService jwtService, AppProperties props) {
        this.users = users;
        this.jwtService = jwtService;
        this.props = props;
    }

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
            Authentication authentication) throws IOException {
        OAuth2User principal = (OAuth2User) authentication.getPrincipal();

        Optional<User> user = (principal instanceof OidcUser google)
                ? users.findByGoogleId(google.getSubject())
                : users.findByGithubId(String.valueOf(principal.getAttributes().get("id")));

        if (user.isEmpty()) {
            response.sendRedirect("/api/auth/denied");
            return;
        }

        String token = jwtService.issueToken(user.get());

        // Server pe login yaad NAHI rakhna: aage se sirf JWT pass chalega
        HttpSession session = request.getSession(false);
        if (session != null)
            session.invalidate();
        SecurityContextHolder.clearContext();

        // Website pe wapas, pass ke saath (# ke baad wala hissa server tak jaata hi
        // nahi = safe)
        response.sendRedirect(props.frontendUrl() + "/#/auth?token=" + token);
    }
}