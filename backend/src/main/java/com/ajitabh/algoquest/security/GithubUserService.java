package com.ajitabh.algoquest.security;

import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.OAuth2Error;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Component;

import com.ajitabh.algoquest.service.OwnerAccountService;
import com.ajitabh.algoquest.service.OwnerAccountService.NotOwnerException;

// GitHub se login hone ke BAAD: details lo -> chaukidar se check -> database mein save
@Component
public class GithubUserService extends DefaultOAuth2UserService {

    private final OwnerAccountService ownerAccounts;

    public GithubUserService(OwnerAccountService ownerAccounts) {
        this.ownerAccounts = ownerAccounts;
    }

    @Override
    public OAuth2User loadUser(OAuth2UserRequest request) throws OAuth2AuthenticationException {
        OAuth2User github = super.loadUser(request);
        String login = github.getAttribute("login");
        try {
            ownerAccounts.loginWithGithub(
                    String.valueOf(github.getAttributes().get("id")),
                    login,
                    github.getAttribute("name"),
                    github.getAttribute("avatar_url"));
        } catch (NotOwnerException e) {
            // description = sirf GitHub username (login history + alert mein yahi dikhega)
            OAuth2Error error = new OAuth2Error("not_owner", login, null);
            throw new OAuth2AuthenticationException(error, e.getMessage());
        }
        return github;
    }
}