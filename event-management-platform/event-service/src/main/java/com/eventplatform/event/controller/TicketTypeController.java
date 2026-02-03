package com.eventplatform.event.controller;

import com.eventplatform.event.dto.TicketTypeDTO;
import com.eventplatform.event.entity.TicketType;
import com.eventplatform.event.service.EventService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/events")
@RequiredArgsConstructor
@Slf4j
public class TicketTypeController {
    
    private final EventService eventService;
    
    @GetMapping("/{eventId}/ticket-types")
    public ResponseEntity<List<TicketType>> getTicketTypesByEvent(@PathVariable Long eventId) {
        try {
            List<TicketType> ticketTypes = eventService.getTicketTypesByEventId(eventId);
            return ResponseEntity.ok(ticketTypes);
        } catch (Exception e) {
            log.error("Error getting ticket types for event {}: {}", eventId, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(null);
        }
    }
    
    @PostMapping("/{eventId}/ticket-types")
    public ResponseEntity<TicketType> createTicketType(
            @PathVariable Long eventId,
            @Valid @RequestBody TicketTypeDTO ticketTypeDTO) {
        try {
            TicketType createdTicketType = eventService.createTicketType(eventId, ticketTypeDTO);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdTicketType);
        } catch (Exception e) {
            log.error("Error creating ticket type for event {}: {}", eventId, e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(null);
        }
    }
    
    @PutMapping("/ticket-types/{ticketTypeId}")
    public ResponseEntity<TicketType> updateTicketType(
            @PathVariable Long ticketTypeId,
            @Valid @RequestBody TicketTypeDTO ticketTypeDTO) {
        try {
            TicketType updatedTicketType = eventService.updateTicketType(ticketTypeId, ticketTypeDTO);
            return ResponseEntity.ok(updatedTicketType);
        } catch (Exception e) {
            log.error("Error updating ticket type {}: {}", ticketTypeId, e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(null);
        }
    }
    
    @DeleteMapping("/ticket-types/{ticketTypeId}")
    public ResponseEntity<Void> deleteTicketType(@PathVariable Long ticketTypeId) {
        try {
            eventService.deleteTicketType(ticketTypeId);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            log.error("Error deleting ticket type {}: {}", ticketTypeId, e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }
    
    @PostMapping("/ticket-types/{ticketTypeId}/reserve")
    public ResponseEntity<Map<String, Object>> reserveTicketType(
            @PathVariable Long ticketTypeId,
            @RequestParam Integer quantity) {
        try {
            boolean success = eventService.reserveTicketType(ticketTypeId, quantity);
            return ResponseEntity.ok(Map.of("success", success));
        } catch (Exception e) {
            log.error("Error reserving ticket type {}: {}", ticketTypeId, e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("success", false, "error", e.getMessage()));
        }
    }
    
    @PostMapping("/ticket-types/{ticketTypeId}/release")
    public ResponseEntity<Void> releaseTicketType(
            @PathVariable Long ticketTypeId,
            @RequestParam Integer quantity) {
        try {
            eventService.releaseTicketType(ticketTypeId, quantity);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            log.error("Error releasing ticket type {}: {}", ticketTypeId, e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }
    
    @GetMapping("/ticket-types/{ticketTypeId}/availability")
    public ResponseEntity<Map<String, Boolean>> checkTicketTypeAvailability(
            @PathVariable Long ticketTypeId,
            @RequestParam Integer quantity) {
        try {
            boolean available = eventService.checkTicketTypeAvailability(ticketTypeId, quantity);
            return ResponseEntity.ok(Map.of("available", available));
        } catch (Exception e) {
            log.error("Error checking availability for ticket type {}: {}", ticketTypeId, e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("available", false));
        }
    }
    
    @GetMapping("/ticket-types/{ticketTypeId}")
    public ResponseEntity<Map<String, Object>> getTicketTypeById(@PathVariable Long ticketTypeId) {
        try {
            Map<String, Object> ticketTypeInfo = eventService.getTicketTypeInfo(ticketTypeId);
            return ResponseEntity.ok(ticketTypeInfo);
        } catch (Exception e) {
            log.error("Error getting ticket type {}: {}", ticketTypeId, e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }
}