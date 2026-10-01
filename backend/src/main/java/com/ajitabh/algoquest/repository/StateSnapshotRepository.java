package com.ajitabh.algoquest.repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.ajitabh.algoquest.model.StateSnapshot;

public interface StateSnapshotRepository extends JpaRepository<StateSnapshot, Long> {

    // List dikhane ke liye sirf chhoti info (bhaari "data" column load nahi hota)
    interface SnapshotSummary {
        long getRevision();

        int getSizeBytes();

        String getDevice();

        Instant getSavedAt();
    }

    List<SnapshotSummary> findTop10ByUserIdOrderByRevisionDesc(Long userId);

    // Restore ke liye ek poora version
    Optional<StateSnapshot> findByUserIdAndRevision(Long userId, long revision);

    // Sirf last 10 rakho: isse purane hata do
    @Modifying
    @Query("delete from StateSnapshot s where s.userId = :userId and s.revision < :minRevision")
    int deleteOlderThan(@Param("userId") Long userId, @Param("minRevision") long minRevision);
}