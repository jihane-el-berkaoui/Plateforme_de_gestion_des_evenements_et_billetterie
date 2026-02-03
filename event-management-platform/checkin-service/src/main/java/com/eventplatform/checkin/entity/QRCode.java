package com.eventplatform.checkin.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "qr_codes")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class QRCode {
    
    @Id
    private String id;
    
    @Column(name = "confirmation_code")
    private String confirmationCode;
    
    @Column(name = "unique_code")
    private String uniqueCode; 
    private Integer ticketNumber;    
    private Integer totalTickets; 
    @Column(nullable = false)
    private Long bookingId;
    
    @Column(nullable = false, length = 2000)
    private String data;
    
    @Column(name = "qr_data", length = 4000)
    private String qrData;
    
    @Column(name = "user_email")
    private String userEmail;
    
    @Column(name = "user_name")
    private String userName;
    
    @Column(name = "event_name")
    private String eventName;
    
    @Column(name = "quantity")
    private Integer quantity=1;
    
    @Column(name = "total_price")
    private Double totalPrice;
    
    @Column(nullable = false)
    private LocalDateTime createdAt;
    
    @Column(nullable = false)
    private LocalDateTime expiresAt;
    
    @Column(nullable = false)
    private Boolean isUsed = false;
    
    @Column
    private LocalDateTime usedAt;
    
    @Column
    private Integer scanCount = 0;
    
    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
        if (expiresAt == null) {
            expiresAt = LocalDateTime.now().plusDays(7);
        }
    }
}