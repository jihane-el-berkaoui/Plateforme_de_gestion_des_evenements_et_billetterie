package com.eventplatform.booking.repository;

import com.eventplatform.booking.entity.Booking;
import com.eventplatform.booking.entity.Booking.BookingStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {
    
    List<Booking> findByUserId(Long userId);
    
    List<Booking> findByEventId(Long eventId);
    
    List<Booking> findByStatus(BookingStatus status);
    
    Optional<Booking> findByConfirmationCode(String confirmationCode);
    
    List<Booking> findByEventIdAndStatus(Long eventId, BookingStatus status);
}