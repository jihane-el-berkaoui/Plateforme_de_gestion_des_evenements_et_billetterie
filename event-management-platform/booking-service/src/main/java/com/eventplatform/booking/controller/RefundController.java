package com.eventplatform.booking.controller;

import com.eventplatform.booking.dto.RefundRequestDTO;
import com.eventplatform.booking.entity.Booking;
import com.eventplatform.booking.service.BookingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/refunds")
@RequiredArgsConstructor
public class RefundController {
    
    private final BookingService bookingService;
    
    @PostMapping("/request")
    public ResponseEntity<Booking> requestRefund(@Valid @RequestBody RefundRequestDTO request) {
        try {
            System.out.println("📝 Demande de remboursement reçue: " + request);
            
            Booking booking = bookingService.requestRefund(
                request.getBookingId(), 
                request.getReason(),
                request.getRequestedAmount()
            );
            
            return ResponseEntity.ok(booking);
            
        } catch (Exception e) {
            System.err.println("❌ Erreur dans requestRefund: " + e.getMessage());
            e.printStackTrace();
            throw e; 
        }
    }
    
    @PutMapping("/{id}/process")
    public ResponseEntity<Booking> processRefund(
            @PathVariable Long id,
            @RequestBody Map<String, Object> request) {
        
        boolean approve = request.get("approve") != null ? (Boolean) request.get("approve") : false;
        String adminNotes = request.get("adminNotes") != null ? 
                           (String) request.get("adminNotes") : "";
        
        Booking booking = bookingService.processRefund(id, approve, adminNotes);
        return ResponseEntity.ok(booking);
    }
    
    @GetMapping("/pending")
    public ResponseEntity<List<Booking>> getPendingRefunds() {
        return ResponseEntity.ok(bookingService.getPendingRefunds());
    }
}