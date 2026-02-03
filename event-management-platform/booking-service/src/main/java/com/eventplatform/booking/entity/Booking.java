package com.eventplatform.booking.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "bookings")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Booking {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private Long eventId;
    
    @Column(nullable = false)
    private Long userId;
    
    @Column(nullable = false)
    private Integer quantity;
    
    @Column(nullable = false)
    private Double totalPrice;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private BookingStatus status = BookingStatus.PENDING;
    
    @Column(unique = true)
    private String confirmationCode;
     @Column
    private Long ticketTypeId;
    @Column(nullable = false, updatable = false)
    private LocalDateTime bookingDate;
    @Column
private LocalDateTime refundRequestDate;

@Column
private LocalDateTime refundProcessedDate;

@Column
private Double refundAmount;

@Column(length = 500)
private String refundReason;

@Column(length = 500)
private String refundRejectionReason;
    @Column
    private LocalDateTime cancelledDate;
    
    @Column(length = 500)
    private String notes;
    
    @PrePersist
    protected void onCreate() {
        bookingDate = LocalDateTime.now();
        if (confirmationCode == null) {
            confirmationCode = generateConfirmationCode();
        }
    }
    
    private String generateConfirmationCode() {
        return "BK" + System.currentTimeMillis() + 
               (int)(Math.random() * 1000);
    }
    
    public enum BookingStatus {
         PENDING,
    CONFIRMED,
    CANCELLED,
    REFUND_REQUESTED,
    REFUNDED,        
    REFUND_REJECTED,
    COMPLETED
    }
}