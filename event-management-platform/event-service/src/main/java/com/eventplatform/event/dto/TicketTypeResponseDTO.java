package com.eventplatform.event.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TicketTypeResponseDTO {
    private Long id;
    private Long eventId;
    private String name;
    private String description;
    private Double price;
    private Integer capacity;
    private Integer availableTickets;
    private Boolean isActive;
}