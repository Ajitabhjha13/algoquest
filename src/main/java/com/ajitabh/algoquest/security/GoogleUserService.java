package com.ajitabh.algoquest.security;

import org.springframework.security.oauth2.client.oidc.userinfo.OidcUserRequest;
import org.springframework.security.oauth2.client.oidc.userinfo.OidcUserService;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.OAuth2Error;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.stereotype.Component;

import com.ajitabh.algoquest.service.OwnerAccountService;
import com.ajitabh.algoquest.service.OwnerAccountService.NotOwnerException;

// Google se login hone ke BAAD yeh chalta hai (Google "OpenID Connect" use karta hai, isliye Oidc)
@Component
public class GoogleUserService extends OidcUserService {

    private final OwnerAccountService ownerAccounts;

    public GoogleUserService(OwnerAccountService ownerAccounts) {
        this.ownerAccounts = ownerAccounts;
    }

    @Override
    public OidcUser loadUser(OidcUserRequest request) throws OAuth2AuthenticationException {
        // 1. Google se details lo (sub = Google ID, email, naam, photo)
        OidcUser google = super.loadUser(request);

        try {
            // 2. Chaukidar: email owner ka ho aur verified ho
            ownerAccounts.loginWithGoogle(
                    google.getSubject(),
                    google.getEmail(),
                    Boolean.TRUE.equals(google.getEmailVerified()),
                    google.getFullName(),
                    google.getPicture());
        } catch (NotOwnerException e) {
            // 3. Owner nahi hai: login yahin rok do
            throw new OAuth2AuthenticationException(new OAuth2Error("not_owner", e.getMessage(), null), e.getMessage());
        }
        return google;
    }
}
