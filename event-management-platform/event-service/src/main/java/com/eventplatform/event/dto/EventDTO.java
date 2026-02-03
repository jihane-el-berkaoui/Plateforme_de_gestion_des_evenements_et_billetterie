package com.eventplatform.event.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
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
    
    private List<TicketTypeDTO> ticketTypes = new ArrayList<>();
    
    public List<TicketTypeDTO> getTicketTypes() {
        if (ticketTypes == null) {
            ticketTypes = new ArrayList<>();
        }
        return ticketTypes;
    }
    
    public void setTicketTypes(List<TicketTypeDTO> ticketTypes) {
        this.ticketTypes = ticketTypes != null ? ticketTypes : new ArrayList<>();
    }
}