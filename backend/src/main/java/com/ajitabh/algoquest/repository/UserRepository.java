package com.ajitabh.algoquest.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.ajitabh.algoquest.model.User;

// Sirf interface hai, code nahi! Spring Data JPA iska poora code khud bana deta hai.
// JpaRepository se free mein milte hain: save(), findById(), findAll(), count(), delete()...
public interface UserRepository extends JpaRepository<User, Long> {

    // Method ke NAAM se hi Spring SQL query bana deta hai:
    // SELECT * FROM users WHERE email = ?
    Optional<User> findByEmail(String email);

    // SELECT * FROM users WHERE github_id = ?
    Optional<User> findByGithubId(String githubId);

    // SELECT * FROM users WHERE google_id = ?
    Optional<User> findByGoogleId(String googleId);
}