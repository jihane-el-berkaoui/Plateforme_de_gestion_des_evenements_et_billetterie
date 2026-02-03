package com.eventplatform.event.repository;

import com.eventplatform.event.entity.Event;
import com.eventplatform.event.entity.Event.EventCategory;
import com.eventplatform.event.entity.Event.EventStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EventRepository extends JpaRepository<Event, Long> {
    
    List<Event> findByStatus(EventStatus status);
    
    List<Event> findByCategory(EventCategory category);
    
    @Query("SELECT e FROM Event e WHERE e.availableTickets > 0 AND e.status = 'ACTIVE'")
    List<Event> findAvailableEvents();
}