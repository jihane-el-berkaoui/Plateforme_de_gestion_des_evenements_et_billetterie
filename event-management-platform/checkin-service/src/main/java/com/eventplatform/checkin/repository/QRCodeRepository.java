package com.eventplatform.checkin.repository;

import com.eventplatform.checkin.entity.QRCode;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface QRCodeRepository extends JpaRepository<QRCode, String> {
    
    List<QRCode> findByBookingId(Long bookingId);
    
    List<QRCode> findByConfirmationCode(String confirmationCode);

    
    List<QRCode> findByIsUsed(boolean isUsed);
    
    @Query("SELECT q FROM QRCode q WHERE q.expiresAt < CURRENT_TIMESTAMP AND q.isUsed = false")
    List<QRCode> findExpiredUnused();
    
    @Query("SELECT COUNT(q) FROM QRCode q WHERE q.bookingId = :bookingId")
    int countByBookingId(@Param("bookingId") Long bookingId);
    
    long countByConfirmationCode(String confirmationCode);
    Optional<QRCode> findByUniqueCode(String uniqueCode);
    long countByConfirmationCodeAndIsUsed(String confirmationCode, boolean isUsed);
}