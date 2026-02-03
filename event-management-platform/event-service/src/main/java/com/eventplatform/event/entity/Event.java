
package com.eventplatform.event.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonManagedReference;

@Entity
@Table(name = "events")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Event {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @NotBlank(message = "Event name is required")
    @Column(nullable = false)
    private String name;
    
    @Column(length = 1000)
    private String description;
    
    @NotNull(message = "Event date is required")
    @Future(message = "Event date must be in the future")
    @Column(nullable = false)
    private LocalDateTime date;
    
    @NotBlank(message = "Location is required")
    @Column(nullable = false)
    private String location;
    
    @NotNull(message = "Capacity is required")
    @Min(value = 1, message = "Capacity must be at least 1")
    @Column(nullable = false)
    private Integer capacity;
    
    @Column(nullable = false)
    private Integer availableTickets;
    
    @NotNull(message = "Price is required")
    @DecimalMin(value = "0.0", message = "Price must be positive")
    @Column(nullable = false)
    private Double price;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EventCategory category = EventCategory.OTHER;
 @OneToMany(mappedBy = "event", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @JsonManagedReference 
    private List<TicketType> ticketTypes = new ArrayList<>();
    
    
    
    public List<TicketType> getTicketTypes() {
        if (ticketTypes == null) {
            ticketTypes = new ArrayList<>();
        }
        return ticketTypes;
    }
    
    public void setTicketTypes(List<TicketType> ticketTypes) {
        this.ticketTypes = ticketTypes != null ? ticketTypes : new ArrayList<>();
    }

@Transient
private Integer totalAvailableTickets; 
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EventStatus status = EventStatus.ACTIVE;
    
    @Column(updatable = false)
    private LocalDateTime createdAt;
    
    @Column
    private LocalDateTime updatedAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (availableTickets == null) {
            availableTickets = capacity;
        }
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
    
    public enum EventCategory {
        CONCERT,
        SPORTS,
        CONFERENCE,
        FESTIVAL,
        THEATER,
        OTHER
    }
    
    public enum EventStatus {
        ACTIVE,
        CANCELLED,
        COMPLETED,
        POSTPONED
    }
}