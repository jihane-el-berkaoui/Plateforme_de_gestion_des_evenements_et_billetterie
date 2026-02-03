package com.eventplatform.booking.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EventDTO {
    private Long id;
    private String name;
    private String description;
    private LocalDateTime date;
    private String location;
    private Integer capacity;
    private Integer availableTickets;
    private Double price;
    private String category;
    private String status;
}