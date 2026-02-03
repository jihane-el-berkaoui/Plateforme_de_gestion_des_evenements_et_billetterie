package com.eventplatform.booking.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BookingMessageDTO {
    private Long id;
    private Long eventId;
    private Long userId;
    private Integer quantity;
    private Double totalPrice;
    private String status;
    private String confirmationCode;
    private LocalDateTime bookingDate;
    private LocalDateTime cancelledDate;
    private String notes;
    
    public static BookingMessageDTO fromEntity(com.eventplatform.booking.entity.Booking booking) {
        return new BookingMessageDTO(
            booking.getId(),
            booking.getEventId(),
            booking.getUserId(),
            booking.getQuantity(),
            booking.getTotalPrice(),
            booking.getStatus().name(),
            booking.getConfirmationCode(),
            booking.getBookingDate(),
            booking.getCancelledDate(),
            booking.getNotes()
        );
    }
}