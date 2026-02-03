package com.eventplatform.checkin.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class QRCodeDTO {
    private String id;
    private Long bookingId;
    private String data;
    private LocalDateTime createdAt;
    private LocalDateTime expiresAt;
    private Boolean isUsed;
    private LocalDateTime usedAt;
    private Integer scanCount;
    
    public static QRCodeDTO fromEntity(com.eventplatform.checkin.entity.QRCode entity) {
        return new QRCodeDTO(
            entity.getId(),
            entity.getBookingId(),
            entity.getData(),
            entity.getCreatedAt(),
            entity.getExpiresAt(),
            entity.getIsUsed(),
            entity.getUsedAt(),
            entity.getScanCount()
        );
    }
}