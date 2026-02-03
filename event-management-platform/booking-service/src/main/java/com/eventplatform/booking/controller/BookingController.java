package com.eventplatform.booking.controller;

import com.eventplatform.booking.entity.Booking;
import com.eventplatform.booking.service.BookingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
public class BookingController {
    
    private final BookingService bookingService;
    
    @GetMapping
    public ResponseEntity<List<Booking>> getAllBookings() {
        return ResponseEntity.ok(bookingService.getAllBookings());
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<Booking> getBookingById(@PathVariable Long id) {
        return ResponseEntity.ok(bookingService.getBookingById(id));
    }
    
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Booking>> getBookingsByUserId(@PathVariable Long userId) {
        return ResponseEntity.ok(bookingService.getBookingsByUserId(userId));
    }
    
    @GetMapping("/event/{eventId}")
    public ResponseEntity<List<Booking>> getBookingsByEventId(@PathVariable Long eventId) {
        return ResponseEntity.ok(bookingService.getBookingsByEventId(eventId));
    }
    
    @GetMapping("/confirmation/{code}")
    public ResponseEntity<Booking> getBookingByConfirmationCode(@PathVariable String code) {
        return ResponseEntity.ok(bookingService.getBookingByConfirmationCode(code));
    }
    
    @PostMapping
    public ResponseEntity<Booking> createBooking(@Valid @RequestBody Booking booking) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(bookingService.createBooking(booking));
    }
    
    @PutMapping("/{id}/cancel")
    public ResponseEntity<Booking> cancelBooking(@PathVariable Long id) {
        return ResponseEntity.ok(bookingService.cancelBooking(id));
    }
}