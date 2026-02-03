package com.eventplatform.checkin.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import lombok.Builder;
import java.time.LocalDateTime;
import lombok.*;

@Entity
@Table(name = "checkins")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString
public class CheckIn {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "booking_id")
    private Long bookingId;
    
    @Column(name = "confirmation_code")
    private String confirmationCode;
    
    @Column(name = "event_id")
    private Long eventId;
    
    @Column(name = "user_id")
    private Long userId;
    
    @Column(name = "scanner_id")
    private String scannerId;
    
    @Column(name = "scanner_type")
    private String scannerType;
    
    @Column(name = "location")
    private String location;
    
    @Column(name = "quantity")
    private Integer quantity;
    
    @Column(name = "status")
    private String status;
    
    @Column(name = "device_info")
    private String deviceInfo;
    
    @Column(name = "check_in_time", nullable = false)
    private LocalDateTime checkInTime;
    
    @Column(name = "checked_in_at")
    private LocalDateTime checkedInAt;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @PrePersist
    protected void onCreate() {
        if (checkInTime == null) {
            checkInTime = LocalDateTime.now(); 
        }
        if (checkedInAt == null) {
            checkedInAt = LocalDateTime.now();
        }
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
        if (status == null) {
            status = "CHECKED_IN";
        }
        if (quantity == null) {
            quantity = 1;
        }
        if (confirmationCode == null && bookingId != null) {
            confirmationCode = "BK" + bookingId;
        }
    }
}