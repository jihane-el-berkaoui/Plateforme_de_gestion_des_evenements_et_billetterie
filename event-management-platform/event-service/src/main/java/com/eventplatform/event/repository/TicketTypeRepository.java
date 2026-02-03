package com.eventplatform.event.repository;

import com.eventplatform.event.entity.TicketType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TicketTypeRepository extends JpaRepository<TicketType, Long> {
    
    List<TicketType> findByEventId(Long eventId); 

    @Query("SELECT t FROM TicketType t WHERE t.event.id = :eventId AND t.isActive = true")
    List<TicketType> findByEventIdAndIsActiveTrue(@Param("eventId") Long eventId);
    
}