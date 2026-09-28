package com.ajitabh.algoquest.service;

import java.time.Instant;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ajitabh.algoquest.config.AppProperties;
import com.ajitabh.algoquest.model.User;
import com.ajitabh.algoquest.repository.UserRepository;

// Login ka faisla yahin hota hai: sirf owner (Ajitabh) andar aa sakta hai.
// GitHub ho ya Google, dono ek hi User row se jud jaate hain.
@Service
public class OwnerAccountService {

    // Owner ke alawa koi aur aaye toh yeh exception
    public static class NotOwnerException extends RuntimeException {
        public NotOwnerException(String message) {
            super(message);
        }
    }

    private final UserRepository users;
    private final AppProperties props;

    public OwnerAccountService(UserRepository users, AppProperties props) {
        this.users = users;
        this.props = props;
    }

    // ---------- GitHub se login ----------
    @Transactional
    public User loginWithGithub(String githubId, String githubLogin, String name, String avatarUrl) {
        // 1. Allowlist: GitHub username owner wala hi hona chahiye
        if (githubLogin == null || !githubLogin.equalsIgnoreCase(props.owner().githubLogin())) {
            throw new NotOwnerException("GitHub account '" + githubLogin + "' is not allowed");
        }
        // 2. Pehle GitHub ID se dhoondho, phir owner email se (agar Google se pehle ban
        // chuka ho), warna naya
        User user = users.findByGithubId(githubId)
                .or(() -> users.findByEmail(props.owner().email()))
                .orElseGet(User::new);

        // 3. Details bharo / jodo
        if (user.getEmail() == null)
            user.setEmail(props.owner().email());
        if (user.getName() == null)
            user.setName(name != null ? name : githubLogin);
        if (user.getAvatarUrl() == null)
            user.setAvatarUrl(avatarUrl);
        user.setGithubId(githubId);
        user.setLastLoginAt(Instant.now());
        return users.save(user);
    }

    // ---------- Google se login ----------
    @Transactional
    public User loginWithGoogle(String googleId, String email, boolean emailVerified, String name, String pictureUrl) {
        // 1. Allowlist: email owner wala ho AUR Google ne verify kiya ho
        if (!emailVerified || email == null || !email.equalsIgnoreCase(props.owner().email())) {
            throw new NotOwnerException("Google account '" + email + "' is not allowed");
        }
        // 2. Pehle Google ID se dhoondho, phir email se (agar GitHub se pehle ban chuka
        // ho), warna naya
        User user = users.findByGoogleId(googleId)
                .or(() -> users.findByEmail(email))
                .orElseGet(User::new);

        // 3. Details bharo / jodo
        if (user.getEmail() == null)
            user.setEmail(email);
        if (user.getName() == null)
            user.setName(name != null ? name : email);
        if (user.getAvatarUrl() == null)
            user.setAvatarUrl(pictureUrl);
        user.setGoogleId(googleId);
        user.setLastLoginAt(Instant.now());
        return users.save(user);
    }
}