package com.ajitabh.algoquest.security;

import java.io.IOException;

import org.springframework.security.core.AuthenticationException;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.web.authentication.AuthenticationFailureHandler;
import org.springframework.stereotype.Component;

import com.ajitabh.algoquest.config.AppProperties;
import com.ajitabh.algoquest.service.LoginAuditService;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

// Login FAIL -> record -> wapas WEBSITE ki login screen pe, ek saaf error code ke saath
// (pehle backend ka kachcha JSON page dikhta tha; recruiter ke liye achha nahi tha)
@Component
public class LoginFailureHandler implements AuthenticationFailureHandler {

    private final LoginAuditService audit;
    private final AppProperties props;

    public LoginFailureHandler(LoginAuditService audit, AppProperties props) {
        this.audit = audit;
        this.props = props;
    }

    @Override
    public void onAuthenticationFailure(HttpServletRequest request, HttpServletResponse response,
                                        AuthenticationException exception) throws IOException {
        String provider = request.getRequestURI().endsWith("/google") ? "google" : "github";
        String who = (exception instanceof OAuth2AuthenticationException oauth)
                ? oauth.getError().getDescription()
                : exception.getMessage();

        audit.record(null, provider, who, false, request);

        // Website ko sirf ek chhota code bhejo (koi personal info URL mein nahi)
        String code = "failed";
        if (exception instanceof OAuth2AuthenticationException oauth) {
            String errorCode = oauth.getError().getErrorCode();
            if ("not_owner".equals(errorCode)) code = "not_owner";          // allowlist mein nahi
            else if ("access_denied".equals(errorCode)) code = "cancelled"; // GitHub/Google pe "Cancel" dabaya
        }
        response.sendRedirect(props.frontendUrl() + "/#/login?error=" + code);
    }
}
