package com.eventplatform.checkin.repository;

import com.eventplatform.checkin.entity.CheckIn;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface CheckInRepository extends JpaRepository<CheckIn, Long> {
    
    List<CheckIn> findByBookingId(Long bookingId);
    
    List<CheckIn> findByConfirmationCode(String confirmationCode);
    
    List<CheckIn> findByScannerId(String scannerId);
    
    List<CheckIn> findByScannerIdOrderByCheckedInAtDesc(String scannerId);
    
    long countByCheckedInAtBetween(LocalDateTime start, LocalDateTime end);
    
    @Query("SELECT c FROM CheckIn c ORDER BY c.checkedInAt DESC")
    List<CheckIn> findTopNByOrderByCheckedInAtDesc(int limit);
    
    @Query("SELECT c.scannerId, COUNT(c) FROM CheckIn c " +
           "WHERE c.checkedInAt >= :startOfDay " +
           "GROUP BY c.scannerId " +
           "ORDER BY COUNT(c) DESC")
    List<Object[]> countByScannerIdToday(@Param("startOfDay") LocalDateTime startOfDay);
    
    @Query("SELECT DISTINCT c.scannerId FROM CheckIn c ORDER BY c.scannerId")
    List<String> findDistinctScannerIds();
    
    @Query("SELECT c FROM CheckIn c WHERE c.checkedInAt >= :start AND c.checkedInAt <= :end ORDER BY c.checkedInAt DESC")
    List<CheckIn> findByDateRange(
        @Param("start") LocalDateTime start,
        @Param("end") LocalDateTime end
    );
}