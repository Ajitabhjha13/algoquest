package com.ajitabh.algoquest.repository;

import java.time.Instant;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.ajitabh.algoquest.model.UserState;

public interface UserStateRepository extends JpaRepository<UserState, Long> {

    // OPTIMISTIC LOCKING: sirf tab update karo jab cloud abhi bhi "baseRevision" pe
    // ho.
    // Return: 1 = save ho gaya, 0 = kisi aur device ne pehle hi naya save kar diya
    // (conflict)
    @Modifying(clearAutomatically = true)
    @Query("""
            update UserState s
               set s.data = :data,
                   s.sizeBytes = :sizeBytes,
                   s.updatedDevice = :device,
                   s.updatedAt = :now,
                   s.revision = s.revision + 1
             where s.userId = :userId
               and s.revision = :baseRevision
            """)
    int updateIfRevisionMatches(@Param("userId") Long userId,
            @Param("baseRevision") long baseRevision,
            @Param("data") String data,
            @Param("sizeBytes") int sizeBytes,
            @Param("device") String device,
            @Param("now") Instant now);
}