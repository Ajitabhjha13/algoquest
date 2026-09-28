package com.ajitabh.algoquest.security;

import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.OAuth2Error;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Component;

import com.ajitabh.algoquest.service.OwnerAccountService;
import com.ajitabh.algoquest.service.OwnerAccountService.NotOwnerException;

// GitHub se login hone ke BAAD yeh chalta hai:
// GitHub se user ki details lo -> chaukidar se check karao -> database mein save
@Component
public class GithubUserService extends DefaultOAuth2UserService {

    private final OwnerAccountService ownerAccounts;

    public GithubUserService(OwnerAccountService ownerAccounts) {
        this.ownerAccounts = ownerAccounts;
    }

    @Override
    public OAuth2User loadUser(OAuth2UserRequest request) throws OAuth2AuthenticationException {
        // 1. GitHub se details mangwao (id, login, name, avatar_url...)
        OAuth2User github = super.loadUser(request);

        try {
            // 2. Chaukidar: owner hai toh save, nahi toh exception
            ownerAccounts.loginWithGithub(
                    String.valueOf(github.getAttributes().get("id")),
                    github.getAttribute("login"),
                    github.getAttribute("name"),
                    github.getAttribute("avatar_url"));
        } catch (NotOwnerException e) {
            // 3. Owner nahi hai: login yahin rok do
            throw new OAuth2AuthenticationException(new OAuth2Error("not_owner", e.getMessage(), null), e.getMessage());
        }
        return github;
    }
}