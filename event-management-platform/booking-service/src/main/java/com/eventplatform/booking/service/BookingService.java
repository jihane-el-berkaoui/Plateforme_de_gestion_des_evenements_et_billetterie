package com.eventplatform.booking.service;

import com.eventplatform.booking.client.EventClient;
import com.eventplatform.booking.dto.BookingMessageDTO;
import com.eventplatform.booking.dto.EventDTO;
import com.eventplatform.booking.entity.Booking;
import com.eventplatform.booking.entity.Booking.BookingStatus;
import com.eventplatform.booking.exception.BookingNotFoundException;
import com.eventplatform.booking.repository.BookingRepository;
import feign.FeignException;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@Slf4j
public class BookingService {
    
    private final BookingRepository bookingRepository;
    private final EventClient eventClient;
    private final RabbitTemplate rabbitTemplate;
    private final RestTemplate restTemplate;
   
    public BookingService(BookingRepository bookingRepository, 
                         EventClient eventClient,
                         RabbitTemplate rabbitTemplate,
                         RestTemplate restTemplate) {
        this.bookingRepository = bookingRepository;
        this.eventClient = eventClient;
        this.rabbitTemplate = rabbitTemplate;
        this.restTemplate = restTemplate;
    }
    
    private static final String BOOKING_EXCHANGE = "booking.exchange";
    
    public List<Booking> getAllBookings() {
        return bookingRepository.findAll();
    }
    
    public Booking getBookingById(Long id) {
        return bookingRepository.findById(id)
                .orElseThrow(() -> new BookingNotFoundException("Booking not found with id: " + id));
    }
    
    public List<Booking> getBookingsByUserId(Long userId) {
        return bookingRepository.findByUserId(userId);
    }
    
    public List<Booking> getBookingsByEventId(Long eventId) {
        return bookingRepository.findByEventId(eventId);
    }
    
    public Booking getBookingByConfirmationCode(String code) {
        return bookingRepository.findByConfirmationCode(code)
                .orElseThrow(() -> new BookingNotFoundException("Booking not found with code: " + code));
    }
    
    public List<Booking> getBookingsByStatus(BookingStatus status) {
        return bookingRepository.findByStatus(status);
    }
    
    public List<Booking> getPendingRefunds() {
        return bookingRepository.findByStatus(BookingStatus.REFUND_REQUESTED);
    }
    
    public List<Booking> getPendingCheckIns(Long eventId) {
        return bookingRepository.findByEventIdAndStatus(eventId, BookingStatus.CONFIRMED);
    }
    
@Transactional
@CircuitBreaker(name = "eventService", fallbackMethod = "createBookingFallback")
public Booking createBooking(Booking booking) {
    log.info("Creating booking for event: {}, ticketType: {}, user: {}", 
             booking.getEventId(), booking.getTicketTypeId(), booking.getUserId());
    
    try {
        if (booking.getTicketTypeId() != null) {
            log.info("Processing ticket type reservation: {}", booking.getTicketTypeId());
            
            Map<String, Object> ticketTypeInfo = eventClient.getTicketTypeById(booking.getTicketTypeId());
            log.info("Ticket type info: {}", ticketTypeInfo);
            
            if (ticketTypeInfo == null || ticketTypeInfo.isEmpty()) {
                throw new RuntimeException("Type de ticket non trouvé: " + booking.getTicketTypeId());
            }
            
            Map<String, Boolean> availability = eventClient.checkTicketTypeAvailability(
                booking.getTicketTypeId(), 
                booking.getQuantity()
            );
            
            if (!Boolean.TRUE.equals(availability.get("available"))) {
                String ticketName = (String) ticketTypeInfo.getOrDefault("name", "Inconnu");
                throw new RuntimeException("Pas assez de billets disponibles pour: " + ticketName);
            }
            
            Map<String, Object> reservationResult = eventClient.reserveTicketType(
                booking.getTicketTypeId(), 
                booking.getQuantity()
            );
            
            if (reservationResult == null || !Boolean.TRUE.equals(reservationResult.get("success"))) {
                log.error("Reservation failed: {}", reservationResult);
                throw new RuntimeException("Échec de la réservation du type de ticket");
            }
            
            log.info("Reservation successful: {}", reservationResult);
            
            Double ticketPrice = (Double) ticketTypeInfo.get("price");
            if (ticketPrice == null) {
                ticketPrice = 0.0;
            }
            
            booking.setTotalPrice(ticketPrice * booking.getQuantity());
            booking.setNotes("Type: " + ticketTypeInfo.get("name"));
            
        } else {
            EventDTO event = eventClient.getEventById(booking.getEventId());
            log.info("Retrieved event: {} (Price: €{})", event.getName(), event.getPrice());
            
            Map<String, Boolean> availability = eventClient.checkAvailability(
                booking.getEventId(), 
                booking.getQuantity()
            );
            
            if (!Boolean.TRUE.equals(availability.get("available"))) {
                throw new RuntimeException("Pas assez de billets disponibles pour: " + event.getName());
            }
            
            Map<String, Object> reservationResult = eventClient.reserveTickets(
                booking.getEventId(),
                booking.getQuantity()
            );
            
            if (!Boolean.TRUE.equals(reservationResult.get("success"))) {
                throw new RuntimeException("Échec de la réservation: " + event.getName());
            }
            
            booking.setTotalPrice(event.getPrice() * booking.getQuantity());
        }
        
     } catch (FeignException e) {
        log.error("Feign exception: status={}, message={}", e.status(), e.getMessage(), e);
        throw new RuntimeException("Service événementiel indisponible. Code: EVT-" + e.status());
    } catch (Exception e) {
        log.error("Error in createBooking: {}", e.getMessage(), e);
        throw new RuntimeException("Erreur lors de la création: " + e.getMessage());
    }
    
    booking.setStatus(BookingStatus.CONFIRMED);
    Booking savedBooking = bookingRepository.save(booking);
        
        try {
            sendQRCodeEmail(savedBooking);
        } catch (Exception e) {
            log.error("Failed to send QR code email: {}", e.getMessage());
        }
        
        try {
            BookingMessageDTO message = BookingMessageDTO.fromEntity(savedBooking);
            rabbitTemplate.convertAndSend(BOOKING_EXCHANGE, "booking.created", message);
            log.info("Booking event published: {}", savedBooking.getId());
        } catch (Exception e) {
            log.error("Failed to publish RabbitMQ event: {}", e.getMessage());
        }
        
        log.info("Booking created successfully with id: {}", savedBooking.getId());
        return savedBooking;
    }
    
    public Booking createBookingFallback(Booking booking, Exception ex) {
        log.error("Circuit breaker triggered! Event service unavailable");
        throw new RuntimeException(
            "Le service événementiel est temporairement indisponible. " +
            "Veuillez réessayer dans quelques minutes. " +
            "Code erreur: EVT-500"
        );
    }
    
   @Transactional
    public Booking cancelBooking(Long id) {
        Booking booking = getBookingById(id);
        
        if (booking.getStatus() == BookingStatus.CANCELLED) {
            throw new RuntimeException("Booking is already cancelled");
        }
        
        try {
            if (booking.getTicketTypeId() != null) {
                eventClient.releaseTicketType(booking.getTicketTypeId(), booking.getQuantity());
                log.info("Released {} tickets for ticket type {}", booking.getQuantity(), booking.getTicketTypeId());
            } else {
                eventClient.releaseTickets(booking.getEventId(), booking.getQuantity());
                log.info("Released {} tickets for event {}", booking.getQuantity(), booking.getEventId());
            }
        } catch (Exception e) {
            log.error("Failed to release tickets: {}", e.getMessage());
        }
        
        try {
            deleteQRCodesForBooking(booking.getId(), booking.getConfirmationCode());
        } catch (Exception e) {
            log.error("Failed to delete QR codes for booking {}: {}", booking.getId(), e.getMessage());
        }
        
        booking.setStatus(BookingStatus.CANCELLED);
        booking.setCancelledDate(LocalDateTime.now());
        
        Booking cancelledBooking = bookingRepository.save(booking);
        
        try {
            BookingMessageDTO message = BookingMessageDTO.fromEntity(cancelledBooking);
            rabbitTemplate.convertAndSend(BOOKING_EXCHANGE, "booking.cancelled", message);
        } catch (Exception e) {
            log.error("Failed to publish cancellation event: {}", e.getMessage());
        }
        
        log.info("Booking cancelled successfully: {}", id);
        return cancelledBooking;
    }
    
    private void deleteQRCodesForBooking(Long bookingId, String confirmationCode) {
        try {
            log.info("🗑️ Deleting QR codes for booking {} ({})", bookingId, confirmationCode);
            
            String checkinServiceUrl = "http://localhost:8084/api/qr-codes/booking/" + bookingId;
            
            restTemplate.delete(checkinServiceUrl);
            
            log.info("✅ QR codes deleted for booking {}", bookingId);
            
        } catch (Exception e) {
            log.error("❌ Error deleting QR codes: {}", e.getMessage(), e);
            throw e;
        }
    }
    
    @Transactional
    public Booking requestRefund(Long bookingId, String reason, Double requestedAmount) {
        Booking booking = getBookingById(bookingId);
        
        if (booking.getStatus() != BookingStatus.CONFIRMED) {
            throw new RuntimeException("Only confirmed bookings can request refund");
        }
        
        if (booking.getCancelledDate() != null) {
            throw new RuntimeException("Cannot request refund for cancelled booking");
        }
        
        try {
            EventDTO event = eventClient.getEventById(booking.getEventId());
            LocalDateTime eventDate = event.getDate();
            LocalDateTime refundDeadline = eventDate.minusHours(24);
            
            if (LocalDateTime.now().isAfter(refundDeadline)) {
                throw new RuntimeException("Refund deadline has passed (24h before event)");
            }
        } catch (Exception e) {
            log.error("Error checking refund deadline: {}", e.getMessage());
            throw new RuntimeException("Cannot verify refund deadline: " + e.getMessage());
        }
        
        booking.setStatus(BookingStatus.REFUND_REQUESTED);
        booking.setRefundRequestDate(LocalDateTime.now());
        booking.setRefundReason(reason);
        booking.setRefundAmount(requestedAmount != null ? requestedAmount : booking.getTotalPrice());
        
        Booking updatedBooking = bookingRepository.save(booking);
        publishRefundEvent(updatedBooking, "refund.requested");
        
        log.info("Refund requested for booking {}: €{}", bookingId, booking.getRefundAmount());
        return updatedBooking;
    }
    
    @Transactional
    public Booking processRefund(Long bookingId, boolean approve, String adminNotes) {
        Booking booking = getBookingById(bookingId);
        
        if (booking.getStatus() != BookingStatus.REFUND_REQUESTED) {
            throw new RuntimeException("Booking is not in refund requested status");
        }
        
        if (approve) {
            booking.setStatus(BookingStatus.REFUNDED);
            booking.setRefundProcessedDate(LocalDateTime.now());
            booking.setNotes((booking.getNotes() != null ? booking.getNotes() + " " : "") + 
                           "Refund approved: " + adminNotes);
            
            processPaymentRefund(booking);
            releaseTicketsForRefund(booking);
            
            try {
                deleteQRCodesForBooking(booking.getId(), booking.getConfirmationCode());
            } catch (Exception e) {
                log.error("Failed to delete QR codes during refund: {}", e.getMessage());
            }
            
            publishRefundEvent(booking, "refund.approved");
        } else {
            booking.setStatus(BookingStatus.REFUND_REJECTED);
            booking.setRefundRejectionReason(adminNotes);
            booking.setNotes((booking.getNotes() != null ? booking.getNotes() + " " : "") + 
                           "Refund rejected: " + adminNotes);
            publishRefundEvent(booking, "refund.rejected");
        }
        
        Booking processedBooking = bookingRepository.save(booking);
        
        log.info("Refund {} for booking {}: €{}", 
                approve ? "approved" : "rejected", 
                bookingId, booking.getRefundAmount());
        
        return processedBooking;
    }
    
    private void processPaymentRefund(Booking booking) {
        log.info("Processing refund of €{} for booking {}", 
                 booking.getRefundAmount(), booking.getId());
        booking.setNotes((booking.getNotes() != null ? booking.getNotes() + " " : "") + 
                       "Payment refund processed on " + LocalDateTime.now());
    }
    
    private void releaseTicketsForRefund(Booking booking) {
        try {
            eventClient.releaseTickets(booking.getEventId(), booking.getQuantity());
            log.info("Released {} tickets for refund of booking {}", 
                     booking.getQuantity(), booking.getId());
        } catch (Exception e) {
            log.error("Failed to release tickets for refund: {}", e.getMessage());
        }
    }
    
    private void publishRefundEvent(Booking booking, String routingKey) {
        try {
            BookingMessageDTO message = BookingMessageDTO.fromEntity(booking);
            rabbitTemplate.convertAndSend(BOOKING_EXCHANGE, routingKey, message);
            log.info("Refund event published: {} for booking {}", routingKey, booking.getId());
        } catch (Exception e) {
            log.error("Failed to publish refund event: {}", e.getMessage());
        }
    }
    
    @Transactional
    public Booking checkIn(Long bookingId, String scannerId, String deviceInfo, String location) {
        Booking booking = getBookingById(bookingId);
        
        if (booking.getStatus() != BookingStatus.CONFIRMED && 
            booking.getStatus() != BookingStatus.REFUNDED) {
            throw new RuntimeException("Only confirmed or refunded bookings can check-in");
        }
        
        booking.setStatus(BookingStatus.COMPLETED);
        booking.setNotes((booking.getNotes() != null ? booking.getNotes() + " " : "") + 
                       "Checked in at " + LocalDateTime.now() + 
                       " by scanner: " + scannerId + 
                       " at location: " + location);
        
        Booking checkedInBooking = bookingRepository.save(booking);
        publishCheckInEvent(checkedInBooking, scannerId, deviceInfo, location);
        
        log.info("Check-in successful for booking {}", bookingId);
        return checkedInBooking;
    }
    
    private void publishCheckInEvent(Booking booking, String scannerId, String deviceInfo, String location) {
        try {
            Map<String, Object> checkInData = Map.of(
                "bookingId", booking.getId(),
                "eventId", booking.getEventId(),
                "userId", booking.getUserId(),
                "scannerId", scannerId,
                "deviceInfo", deviceInfo,
                "location", location,
                "timestamp", LocalDateTime.now().toString()
            );
            
            rabbitTemplate.convertAndSend(BOOKING_EXCHANGE, "booking.checked-in", checkInData);
            log.info("Check-in event published for booking {}", booking.getId());
        } catch (Exception e) {
            log.error("Failed to publish check-in event: {}", e.getMessage());
        }
    }
    
  private void sendQRCodeEmail(Booking booking) {
    try {
        log.info("🔄 Calling checkin-service to generate and send {} QR codes for booking: {}", 
                booking.getQuantity(), booking.getId());
        
        Map<String, Object> emailRequest = new HashMap<>();
        emailRequest.put("bookingId", booking.getId());
        emailRequest.put("confirmationCode", booking.getConfirmationCode());
        emailRequest.put("userEmail", getUserEmail(booking.getUserId()));
        emailRequest.put("userName", getUserName(booking.getUserId()));
        emailRequest.put("eventName", getEventName(booking.getEventId()));
        emailRequest.put("quantity", booking.getQuantity());
        emailRequest.put("totalPrice", booking.getTotalPrice());
        
        String checkinServiceUrl = "http://localhost:8084/api/qr-codes/generate-and-email-multiple";
        restTemplate.postForObject(checkinServiceUrl, emailRequest, Map.class);
        
        log.info("✅ {} QR codes email sent successfully for booking: {}", 
                booking.getQuantity(), booking.getId());
        
    } catch (Exception e) {
        log.error("❌ Error sending QR code email: {}", e.getMessage(), e);
        throw e;
    }
}
    
    private String getUserEmail(Long userId) {
        try {
            String userServiceUrl = "http://localhost:8083/api/users/" + userId;
            Map<String, Object> user = restTemplate.getForObject(userServiceUrl, Map.class);
            return (String) user.get("email");
        } catch (Exception e) {
            log.error("Failed to fetch user email: {}", e.getMessage());
            return "default@example.com";
        }
    }
    
    private String getUserName(Long userId) {
        try {
            String userServiceUrl = "http://localhost:8083/api/users/" + userId;
            Map<String, Object> user = restTemplate.getForObject(userServiceUrl, Map.class);
            return user.get("firstName") + " " + user.get("lastName");
        } catch (Exception e) {
            log.error("Failed to fetch user name: {}", e.getMessage());
            return "Client";
        }
    }
    
    private String getEventName(Long eventId) {
        try {
            EventDTO event = eventClient.getEventById(eventId);
            return event.getName();
        } catch (Exception e) {
            log.error("Failed to fetch event name: {}", e.getMessage());
            return "Événement #" + eventId;
        }
    }
}