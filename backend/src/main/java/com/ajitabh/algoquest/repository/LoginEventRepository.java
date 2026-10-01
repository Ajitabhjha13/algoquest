package com.ajitabh.algoquest.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.ajitabh.algoquest.model.LoginEvent;

public interface LoginEventRepository extends JpaRepository<LoginEvent, Long> {

    // Is user ke aakhri 20 logins, naye se purane
    // SELECT * FROM login_events WHERE user_id = ? ORDER BY created_at DESC LIMIT
    // 20
    List<LoginEvent> findTop20ByUserIdOrderByCreatedAtDesc(Long userId);

    // Kya is device se pehle kabhi safal login hua hai? (naye device ka email alert
    // isi se)
    boolean existsByUserIdAndDeviceAndSuccessTrue(Long userId, String device);
}
