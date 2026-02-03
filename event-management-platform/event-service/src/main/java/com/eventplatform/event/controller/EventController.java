package com.eventplatform.event.controller;

import com.eventplatform.event.dto.EventDTO;
import com.eventplatform.event.entity.Event;
import com.eventplatform.event.entity.Event.EventCategory;
import com.eventplatform.event.entity.Event.EventStatus;
import com.eventplatform.event.service.EventService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;



@RestController
@RequestMapping("/api/events")
@RequiredArgsConstructor
@Slf4j
public class EventController {
    
    private final EventService eventService;

    
    @GetMapping
    public ResponseEntity<List<Event>> getAllEvents() {
        return ResponseEntity.ok(eventService.getAllEvents());
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<Event> getEventById(@PathVariable Long id) {
        return ResponseEntity.ok(eventService.getEventById(id));
    }
    
    @GetMapping("/available")
    public ResponseEntity<List<Event>> getAvailableEvents() {
        return ResponseEntity.ok(eventService.getAvailableEvents());
    }
    
    @GetMapping("/category/{category}")
    public ResponseEntity<List<Event>> getEventsByCategory(@PathVariable EventCategory category) {
        return ResponseEntity.ok(eventService.getEventsByCategory(category));
    }
    
    @GetMapping("/status/{status}")
    public ResponseEntity<List<Event>> getEventsByStatus(@PathVariable EventStatus status) {
        return ResponseEntity.ok(eventService.getEventsByStatus(status));
    }
    
    @PostMapping
    public ResponseEntity<Event> createEvent(@Valid @RequestBody EventDTO eventDTO) {
        try {
            log.info("Creating event from DTO: {}", eventDTO);
            
            Event event = new Event();
            event.setName(eventDTO.getName());
            event.setDescription(eventDTO.getDescription());
            event.setDate(eventDTO.getDate());
            event.setLocation(eventDTO.getLocation());
            event.setCapacity(eventDTO.getCapacity());
            event.setAvailableTickets(eventDTO.getAvailableTickets() != null ? 
                                     eventDTO.getAvailableTickets() : 
                                     eventDTO.getCapacity());
            event.setPrice(eventDTO.getPrice());
            event.setCategory(Event.EventCategory.valueOf(eventDTO.getCategory()));
            event.setStatus(Event.EventStatus.valueOf(eventDTO.getStatus()));
            
            event.setTicketTypes(new ArrayList<>());
            log.info("Event entity created with initialized ticketTypes");
            
            Event createdEvent = eventService.createEvent(event, null); 
            
            log.info("Event created successfully with ID: {}", createdEvent.getId());
            return ResponseEntity.status(HttpStatus.CREATED).body(createdEvent);
            
        } catch (Exception e) {
            log.error("Error creating event: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to create event: " + e.getMessage());
        }
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<Event> updateEvent(
            @PathVariable Long id,
            @Valid @RequestBody Event event) {
        return ResponseEntity.ok(eventService.updateEvent(id, event));
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteEvent(@PathVariable Long id) {
        eventService.deleteEvent(id);
        return ResponseEntity.noContent().build();
    }
    
    @PostMapping("/{id}/reserve")
    public ResponseEntity<Map<String, Object>> reserveTickets(
            @PathVariable Long id,
            @RequestParam Integer quantity) {
        boolean success = eventService.reserveTickets(id, quantity);
        return ResponseEntity.ok(Map.of("success", success));
    }
    
    @PostMapping("/{id}/release")
    public ResponseEntity<Void> releaseTickets(
            @PathVariable Long id,
            @RequestParam Integer quantity) {
        eventService.releaseTickets(id, quantity);
        return ResponseEntity.ok().build();
    }
    
    @GetMapping("/{id}/availability")
    public ResponseEntity<Map<String, Boolean>> checkAvailability(
            @PathVariable Long id,
            @RequestParam Integer quantity) {
        boolean available = eventService.checkAvailability(id, quantity);
        return ResponseEntity.ok(Map.of("available", available));
    }
    

}