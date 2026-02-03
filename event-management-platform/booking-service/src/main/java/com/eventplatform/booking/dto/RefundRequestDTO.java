package com.eventplatform.booking.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RefundRequestDTO {
    private Long bookingId;
    private String reason;
    private Double requestedAmount; 
}