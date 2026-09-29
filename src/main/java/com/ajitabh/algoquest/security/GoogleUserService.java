package com.ajitabh.algoquest.security;

import org.springframework.security.oauth2.client.oidc.userinfo.OidcUserRequest;
import org.springframework.security.oauth2.client.oidc.userinfo.OidcUserService;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.OAuth2Error;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.stereotype.Component;

import com.ajitabh.algoquest.service.OwnerAccountService;
import com.ajitabh.algoquest.service.OwnerAccountService.NotOwnerException;

// Google se login hone ke BAAD (Google "OpenID Connect" use karta hai, isliye Oidc)
@Component
public class GoogleUserService extends OidcUserService {

    private final OwnerAccountService ownerAccounts;

    public GoogleUserService(OwnerAccountService ownerAccounts) {
        this.ownerAccounts = ownerAccounts;
    }

    @Override
    public OidcUser loadUser(OidcUserRequest request) throws OAuth2AuthenticationException {
        OidcUser google = super.loadUser(request);
        try {
            ownerAccounts.loginWithGoogle(
                    google.getSubject(),
                    google.getEmail(),
                    Boolean.TRUE.equals(google.getEmailVerified()),
                    google.getFullName(),
                    google.getPicture());
        } catch (NotOwnerException e) {
            // description = sirf email (login history + alert mein yahi dikhega)
            OAuth2Error error = new OAuth2Error("not_owner", google.getEmail(), null);
            throw new OAuth2AuthenticationException(error, e.getMessage());
        }
        return google;
    }
}