package com.eventplatform.event.service;

import com.eventplatform.event.dto.TicketTypeDTO;
import com.eventplatform.event.entity.Event;
import com.eventplatform.event.entity.Event.EventCategory;
import com.eventplatform.event.entity.Event.EventStatus;
import com.eventplatform.event.entity.TicketType;
import com.eventplatform.event.exception.EventNotFoundException;
import com.eventplatform.event.exception.InsufficientTicketsException;
import com.eventplatform.event.repository.EventRepository;
import com.eventplatform.event.repository.TicketTypeRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@Slf4j
@RequiredArgsConstructor
public class EventService {
    
    private final EventRepository eventRepository;
    private final RabbitTemplate rabbitTemplate;
    private final TicketTypeRepository ticketTypeRepository;
    private static final String EVENT_EXCHANGE = "event.exchange";
    
    public List<Event> getAllEvents() {
        return eventRepository.findAll();
    }
    
    public Event getEventById(Long id) {
        return eventRepository.findById(id)
                .orElseThrow(() -> new EventNotFoundException("Event not found with id: " + id));
    }
    
    public List<Event> getAvailableEvents() {
        return eventRepository.findAvailableEvents();
    }
    
    public List<Event> getEventsByCategory(EventCategory category) {
        return eventRepository.findByCategory(category);
    }
    
    public List<Event> getEventsByStatus(EventStatus status) {
        return eventRepository.findByStatus(status);
    }
     public List<TicketType> getTicketTypesByEventId(Long eventId) {
        try {
            return ticketTypeRepository.findByEventId(eventId);
        } catch (Exception e) {
            log.error("Error getting ticket types for event {}: {}", eventId, e.getMessage());
            throw new RuntimeException("Failed to get ticket types for event: " + eventId);
        }
    }
    
    public List<TicketType> getActiveTicketTypesByEventId(Long eventId) {
        try {
            return ticketTypeRepository.findByEventIdAndIsActiveTrue(eventId);
        } catch (Exception e) {
            log.error("Error getting active ticket types for event {}: {}", eventId, e.getMessage());
            return Collections.emptyList();
        }
    }
    
@Transactional
public Event createEvent(Event event, List<TicketType> ticketTypes) {
    log.info("Creating event: {}", event);
    
    if (event.getTicketTypes() == null) {
        event.setTicketTypes(new ArrayList<>());
        log.info("Initialized null ticketTypes to empty list in Event entity");
    }
    
    Event savedEvent = eventRepository.save(event);
    log.info("Event saved with ID: {}", savedEvent.getId());
    
    if (ticketTypes != null) {
        log.info("Processing {} ticket types", ticketTypes.size());
        for (TicketType ticketType : ticketTypes) {
            ticketType.setEvent(savedEvent);
            ticketTypeRepository.save(ticketType);
            log.info("Saved ticket type: {}", ticketType.getName());
        }
    } else {
        log.info("No ticket types provided, skipping ticket type creation");
    }
    
    try {
        rabbitTemplate.convertAndSend(EVENT_EXCHANGE, "event.created", savedEvent);
        log.info("Event creation published");
    } catch (Exception e) {
        log.error("Failed to publish event creation: {}", e.getMessage());
    }
    
    return savedEvent;
}
    @Transactional
    public synchronized boolean reserveTicketType(Long ticketTypeId, Integer quantity) {
        TicketType ticketType = ticketTypeRepository.findById(ticketTypeId)
                .orElseThrow(() -> new RuntimeException("Type de ticket non trouvé"));
        
        if (!ticketType.getIsActive()) {
            throw new RuntimeException("Ce type de ticket n'est plus disponible");
        }
        
        if (quantity <= 0) {
            throw new RuntimeException("La quantité doit être positive");
        }
        
        if (ticketType.getAvailableTickets() < quantity) {
            throw new RuntimeException(
                String.format("Il ne reste que %d billet(s) disponible(s) pour '%s'. Vous en avez demandé %d.",
                    ticketType.getAvailableTickets(), ticketType.getName(), quantity)
            );
        }
        
        ticketType.setAvailableTickets(ticketType.getAvailableTickets() - quantity);
        ticketTypeRepository.save(ticketType);
        updateEventCounters(ticketType.getEvent().getId());
        updateEventFromTicketTypes(ticketType.getEvent().getId());
        
        log.info("Reserved {} tickets of type {} for event {}", 
                 quantity, ticketType.getName(), ticketType.getEvent().getId());
        return true;
    }

private void updateEventTotalCapacity(Long eventId) {
    Event event = getEventById(eventId);
    List<TicketType> activeTicketTypes = ticketTypeRepository.findByEventId(eventId);
    
    int totalCapacity = activeTicketTypes.stream()
            .mapToInt(TicketType::getCapacity)
            .sum();
    
    int totalAvailable = activeTicketTypes.stream()
            .mapToInt(TicketType::getAvailableTickets)
            .sum();
    
    event.setCapacity(totalCapacity);
    event.setAvailableTickets(totalAvailable);
    eventRepository.save(event);
    
    log.info("Updated event {} capacity: {}/{}", eventId, totalAvailable, totalCapacity);
}
    
 @Transactional
    public TicketType createTicketType(Long eventId, TicketTypeDTO ticketTypeDTO) {
        Event event = getEventById(eventId);
        
        if (ticketTypeDTO.getPrice() <= 0) {
            throw new RuntimeException("Le prix doit être positif");
        }
        
        if (ticketTypeDTO.getCapacity() <= 0) {
            throw new RuntimeException("La capacité doit être positive");
        }
        
        if (ticketTypeDTO.getName() == null || ticketTypeDTO.getName().trim().isEmpty()) {
            throw new RuntimeException("Le nom est obligatoire");
        }
        
        List<TicketType> existingTypes = ticketTypeRepository.findByEventId(eventId);
        boolean nameExists = existingTypes.stream()
                .anyMatch(tt -> tt.getName().equalsIgnoreCase(ticketTypeDTO.getName().trim()));
        
        if (nameExists) {
            throw new RuntimeException("Un type de ticket avec ce nom existe déjà");
        }
        
        TicketType ticketType = new TicketType();
        ticketType.setEvent(event);
        ticketType.setName(ticketTypeDTO.getName().trim());
        ticketType.setDescription(ticketTypeDTO.getDescription() != null ? 
                                 ticketTypeDTO.getDescription().trim() : "");
        ticketType.setPrice(ticketTypeDTO.getPrice());
        ticketType.setCapacity(ticketTypeDTO.getCapacity());
        ticketType.setAvailableTickets(ticketTypeDTO.getCapacity()); 
        ticketType.setIsActive(true);
        
        TicketType savedTicketType = ticketTypeRepository.save(ticketType);
        
        updateEventPriceFromTicketTypes(eventId);
        
        log.info("Ticket type created: {} (€{}) x{} for event: {}", 
                ticketTypeDTO.getName(), ticketTypeDTO.getPrice(), 
                ticketTypeDTO.getCapacity(), eventId);
        
        return savedTicketType;
    }
private void updateEventPriceFromTicketTypes(Long eventId) {
    Event event = getEventById(eventId);
    List<TicketType> activeTicketTypes = ticketTypeRepository.findByEventId(eventId);
    
    if (!activeTicketTypes.isEmpty()) {
        double minPrice = activeTicketTypes.stream()
                .mapToDouble(TicketType::getPrice)
                .min()
                .orElse(event.getPrice());
        
        double basePrice = activeTicketTypes.stream()
                .filter(tt -> "STANDARD".equalsIgnoreCase(tt.getName()))
                .findFirst()
                .map(TicketType::getPrice)
                .orElse(minPrice);
        
        event.setPrice(basePrice);
        eventRepository.save(event);
        log.info("Updated event {} price to: {} (based on ticket types)", eventId, basePrice);
    }
}
    
  @Transactional
    public TicketType updateTicketType(Long ticketTypeId, TicketTypeDTO ticketTypeDTO) {
        TicketType ticketType = ticketTypeRepository.findById(ticketTypeId)
                .orElseThrow(() -> new RuntimeException("Type de ticket non trouvé avec l'ID: " + ticketTypeId));
        
        if (ticketTypeDTO.getPrice() <= 0) {
            throw new RuntimeException("Le prix doit être positif");
        }
        
        if (ticketTypeDTO.getCapacity() <= 0) {
            throw new RuntimeException("La capacité doit être positive");
        }
        
        int oldCapacity = ticketType.getCapacity();
        int oldAvailable = ticketType.getAvailableTickets();
        
        ticketType.setName(ticketTypeDTO.getName().trim());
        ticketType.setDescription(ticketTypeDTO.getDescription() != null ? 
                                 ticketTypeDTO.getDescription().trim() : "");
        ticketType.setPrice(ticketTypeDTO.getPrice());
        ticketType.setCapacity(ticketTypeDTO.getCapacity());
        
        if (ticketTypeDTO.getCapacity() > oldCapacity) {
            int difference = ticketTypeDTO.getCapacity() - oldCapacity;
            ticketType.setAvailableTickets(oldAvailable + difference);
        } else if (ticketTypeDTO.getCapacity() < oldCapacity) {
            int newAvailable = (int) Math.round((double) oldAvailable * ticketTypeDTO.getCapacity() / oldCapacity);
            ticketType.setAvailableTickets(Math.max(0, newAvailable));
        }
        
        TicketType updatedTicketType = ticketTypeRepository.save(ticketType);
        
        updateEventPriceFromTicketTypes(ticketType.getEvent().getId());
        
        log.info("Ticket type updated: {} (ID: {})", ticketTypeDTO.getName(), ticketTypeId);
        return updatedTicketType;
    }
    
    
    @Transactional
    public void deleteTicketType(Long ticketTypeId) {
        TicketType ticketType = ticketTypeRepository.findById(ticketTypeId)
                .orElseThrow(() -> new RuntimeException("Type de ticket non trouvé avec l'ID: " + ticketTypeId));
        
        Long eventId = ticketType.getEvent().getId();
        
        ticketType.setIsActive(false);
        ticketTypeRepository.save(ticketType);
        
        updateEventPriceFromTicketTypes(eventId);
        
        log.info("Ticket type deactivated: {}", ticketTypeId);
    }
    
   
    public boolean checkTicketTypeAvailability(Long ticketTypeId, Integer quantity) {
        try {
            TicketType ticketType = ticketTypeRepository.findById(ticketTypeId)
                    .orElseThrow(() -> new RuntimeException("Type de ticket non trouvé"));
            
            return ticketType.getIsActive() && ticketType.getAvailableTickets() >= quantity;
        } catch (Exception e) {
            log.error("Error checking availability for ticket type {}: {}", ticketTypeId, e.getMessage());
            return false;
        }
    }
@Transactional
public void updateEventCounters(Long eventId) {
    Event event = getEventById(eventId);
    List<TicketType> activeTicketTypes = ticketTypeRepository.findByEventIdAndIsActiveTrue(eventId);
    
    if (activeTicketTypes.isEmpty()) {
        return;
    }
    
    int totalCapacity = activeTicketTypes.stream()
            .mapToInt(TicketType::getCapacity)
            .sum();
    
    int totalAvailable = activeTicketTypes.stream()
            .mapToInt(TicketType::getAvailableTickets)
            .sum();
    
    double minPrice = activeTicketTypes.stream()
            .mapToDouble(TicketType::getPrice)
            .min()
            .orElse(event.getPrice());
    
    event.setCapacity(totalCapacity);
    event.setAvailableTickets(totalAvailable);
    event.setPrice(minPrice);
    
    eventRepository.save(event);
    
    log.info("Updated event {}: capacity={}/{}, price=€{}", 
            eventId, totalAvailable, totalCapacity, minPrice);
}
     private void updateEventFromTicketTypes(Long eventId) {
        try {
            Event event = getEventById(eventId);
            List<TicketType> activeTicketTypes = getActiveTicketTypesByEventId(eventId);
            
            if (activeTicketTypes.isEmpty()) {
                log.warn("No active ticket types for event {}", eventId);
                return;
            }
            
            int totalCapacity = activeTicketTypes.stream()
                    .mapToInt(TicketType::getCapacity)
                    .sum();
            
            int totalAvailable = activeTicketTypes.stream()
                    .mapToInt(TicketType::getAvailableTickets)
                    .sum();
            
            double basePrice = activeTicketTypes.stream()
                    .filter(tt -> "STANDARD".equalsIgnoreCase(tt.getName()))
                    .findFirst()
                    .map(TicketType::getPrice)
                    .orElseGet(() -> activeTicketTypes.stream()
                            .mapToDouble(TicketType::getPrice)
                            .min()
                            .orElse(event.getPrice()));
            
            event.setCapacity(totalCapacity);
            event.setAvailableTickets(totalAvailable);
            event.setPrice(basePrice);
            
            eventRepository.save(event);
            
            log.info("Updated event {}: capacity={}/{}, price=€{}", 
                    eventId, totalAvailable, totalCapacity, basePrice);
            
        } catch (Exception e) {
            log.error("Error updating event from ticket types for event {}: {}", eventId, e.getMessage());
        }
    }
    
    public Map<String, Object> getTicketTypeInfo(Long ticketTypeId) {
        TicketType ticketType = ticketTypeRepository.findById(ticketTypeId)
                .orElseThrow(() -> new RuntimeException("Type de ticket non trouvé"));
        
        Map<String, Object> info = new HashMap<>();
        info.put("id", ticketType.getId());
        info.put("name", ticketType.getName());
        info.put("description", ticketType.getDescription());
        info.put("price", ticketType.getPrice());
        info.put("capacity", ticketType.getCapacity());
        info.put("availableTickets", ticketType.getAvailableTickets());
        info.put("isActive", ticketType.getIsActive());
        info.put("eventId", ticketType.getEvent().getId());
        info.put("eventName", ticketType.getEvent().getName());
        
        return info;
    }

    
    public Integer getTotalAvailableTickets(Long eventId) {
        List<TicketType> ticketTypes = ticketTypeRepository.findByEventIdAndIsActiveTrue(eventId);
        return ticketTypes.stream()
                .mapToInt(TicketType::getAvailableTickets)
                .sum();
    }
    
    public Integer getTotalCapacity(Long eventId) {
        List<TicketType> ticketTypes = ticketTypeRepository.findByEventIdAndIsActiveTrue(eventId);
        return ticketTypes.stream()
                .mapToInt(TicketType::getCapacity)
                .sum();
    }
  @Transactional
    public void releaseTicketType(Long ticketTypeId, Integer quantity) {
        TicketType ticketType = ticketTypeRepository.findById(ticketTypeId)
                .orElseThrow(() -> new RuntimeException("Type de ticket non trouvé"));
        
        if (quantity <= 0) {
            throw new RuntimeException("La quantité doit être positive");
        }
        
        int newAvailable = Math.min(
            ticketType.getCapacity(),
            ticketType.getAvailableTickets() + quantity
        );
        
        ticketType.setAvailableTickets(newAvailable);
        ticketTypeRepository.save(ticketType);
        updateEventCounters(ticketType.getEvent().getId());
        updateEventFromTicketTypes(ticketType.getEvent().getId());
        
        log.info("Released {} tickets of type {} for event {}", 
                 quantity, ticketType.getName(), ticketType.getEvent().getId());
    }
  @Transactional
public Event updateEvent(Long id, Event eventDetails) {
    Event event = getEventById(id);
    
    event.setName(eventDetails.getName());
    event.setDescription(eventDetails.getDescription());
    event.setDate(eventDetails.getDate());
    event.setLocation(eventDetails.getLocation());
    event.setCapacity(eventDetails.getCapacity());
    event.setPrice(eventDetails.getPrice());
    event.setCategory(eventDetails.getCategory());
    event.setStatus(eventDetails.getStatus());
    
    if (event.getTicketTypes() == null) {
        event.setTicketTypes(new ArrayList<>());
    }
    
    Event updatedEvent = eventRepository.save(event);
    
    publishEvent("event.updated", updatedEvent, id);
    
    return updatedEvent;
}
    
    @Transactional
    public void deleteEvent(Long id) {
        Event event = getEventById(id);
        eventRepository.delete(event);
        
        publishEvent("event.deleted", id, id);
    }
    
    @Transactional
    public synchronized boolean reserveTickets(Long eventId, Integer quantity) {
        Event event = getEventById(eventId);
        
        if (event.getAvailableTickets() < quantity) {
            throw new InsufficientTicketsException(
                "Not enough tickets available. Available: " + event.getAvailableTickets());
        }
        
        event.setAvailableTickets(event.getAvailableTickets() - quantity);
        eventRepository.save(event);
        
        log.info("Reserved {} tickets for event {}", quantity, eventId);
        return true;
    }
    
    @Transactional
    public void releaseTickets(Long eventId, Integer quantity) {
        Event event = getEventById(eventId);
        event.setAvailableTickets(event.getAvailableTickets() + quantity);
        eventRepository.save(event);
        
        log.info("Released {} tickets for event {}", quantity, eventId);
    }
    
    public boolean checkAvailability(Long eventId, Integer quantity) {
        Event event = getEventById(eventId);
        return event.getAvailableTickets() >= quantity;
    }
    
  private void publishEvent(String routingKey, Object message, Long eventId) {
        try {
            rabbitTemplate.convertAndSend(EVENT_EXCHANGE, routingKey, message);
            log.info("Event {} published for event id: {}", routingKey, eventId);
        } catch (Exception e) {
            log.error("Failed to publish event {} for id {}: {}", routingKey, eventId, e.getMessage());
        }
    }
}