package com.eventplatform.checkin.dto;

import com.eventplatform.checkin.entity.CheckIn;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CheckInDTO {
    private Long id;
    private Long bookingId;
    private String confirmationCode; 
    private Long eventId;
    private Long userId;
    private LocalDateTime checkedInAt; 
    private String scannerId;
    private String scannerType; 
    private String location;
    private String status;
    private Integer quantity; 
    private LocalDateTime createdAt; 
    
    public static CheckInDTO fromEntity(CheckIn entity) {
        return new CheckInDTO(
            entity.getId(),
            entity.getBookingId(),
            entity.getConfirmationCode(),
            entity.getEventId(),
            entity.getUserId(),
            entity.getCheckedInAt(),
            entity.getScannerId(),
            entity.getScannerType(),
            entity.getLocation(),
            entity.getStatus(),
            entity.getQuantity(),
            entity.getCreatedAt()
        );
    }
}