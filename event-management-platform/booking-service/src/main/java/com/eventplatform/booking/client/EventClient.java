package com.eventplatform.booking.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.*;

import com.eventplatform.booking.dto.EventDTO;

import java.util.Map;

@FeignClient(name = "event-service")
public interface EventClient {
    
    @GetMapping("/api/events/{id}")
    EventDTO getEventById(@PathVariable("id") Long id);
    
    @GetMapping("/api/events/{id}/availability")
    Map<String, Boolean> checkAvailability(
        @PathVariable("id") Long id, 
        @RequestParam("quantity") Integer quantity
    );
    
    @PostMapping("/api/events/{id}/reserve")
    Map<String, Object> reserveTickets(
        @PathVariable("id") Long id, 
        @RequestParam("quantity") Integer quantity
    );
    
    @PostMapping("/api/events/{id}/release")
    void releaseTickets(
        @PathVariable("id") Long id, 
        @RequestParam("quantity") Integer quantity
    );
       @PostMapping("/api/events/ticket-types/{ticketTypeId}/reserve")
    Map<String, Object> reserveTicketType(
        @PathVariable("ticketTypeId") Long ticketTypeId, 
        @RequestParam("quantity") Integer quantity
    );
    
    @PostMapping("/api/events/ticket-types/{ticketTypeId}/release")
    void releaseTicketType(
        @PathVariable("ticketTypeId") Long ticketTypeId, 
        @RequestParam("quantity") Integer quantity
    );
    
    @GetMapping("/api/events/ticket-types/{ticketTypeId}/availability")
    Map<String, Boolean> checkTicketTypeAvailability(
        @PathVariable("ticketTypeId") Long ticketTypeId, 
        @RequestParam("quantity") Integer quantity
    );
       @GetMapping("/api/events/ticket-types/{ticketTypeId}")
    Map<String, Object> getTicketTypeById(@PathVariable("ticketTypeId") Long ticketTypeId);
}