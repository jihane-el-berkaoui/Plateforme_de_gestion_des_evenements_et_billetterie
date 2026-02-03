package com.eventplatform.checkin.controller;

import com.eventplatform.checkin.entity.CheckIn;
import com.eventplatform.checkin.service.CheckInService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/checkins")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "http://localhost:3000", maxAge = 3600) 
public class CheckInController {
    
    private final CheckInService checkInService;
    
    @GetMapping("/recent")
    public ResponseEntity<List<CheckIn>> getRecentCheckins(
            @RequestParam(defaultValue = "20") int limit) {
        log.info("Fetching recent checkins, limit: {}", limit);
        List<CheckIn> recent = checkInService.findRecentCheckins(limit);
        return ResponseEntity.ok(recent);
    }
    
    @GetMapping("/by-booking/{bookingId}")
    public ResponseEntity<List<CheckIn>> getCheckInsByBooking(@PathVariable Long bookingId) {
        log.info("Fetching checkins for booking: {}", bookingId);
        List<CheckIn> checkIns = checkInService.findByBookingId(bookingId);
        return ResponseEntity.ok(checkIns);
    }
    
    @GetMapping("/by-code/{confirmationCode}")
    public ResponseEntity<List<CheckIn>> getCheckInsByConfirmationCode(
            @PathVariable String confirmationCode) {
        log.info("Fetching checkins for code: {}", confirmationCode);
        List<CheckIn> checkIns = checkInService.findByConfirmationCode(confirmationCode);
        return ResponseEntity.ok(checkIns);
    }
    
    @GetMapping("/stats/today")
    public ResponseEntity<Map<String, Object>> getTodayStats() {
        log.info("Fetching today's stats");
        Map<String, Object> stats = checkInService.getTodayStats();
        return ResponseEntity.ok(stats);
    }
    
    @GetMapping("/stats/date/{date}")
    public ResponseEntity<Map<String, Object>> getStatsByDate(
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        log.info("Fetching stats for date: {}", date);
        Map<String, Object> stats = checkInService.getStatsByDate(date);
        return ResponseEntity.ok(stats);
    }
    
    @GetMapping("/all")
    public ResponseEntity<List<CheckIn>> getAllCheckins() {
        log.info("Fetching all checkins");
        List<CheckIn> all = checkInService.findAll();
        return ResponseEntity.ok(all);
    }
    
    @GetMapping("/scanners")
    public ResponseEntity<List<String>> getAllScanners() {
        log.info("Fetching all scanners");
        List<String> scanners = checkInService.getAllScanners();
        return ResponseEntity.ok(scanners);
    }
    
    @GetMapping("/search")
    public ResponseEntity<List<CheckIn>> searchCheckins(
            @RequestParam(required = false) String confirmationCode,
            @RequestParam(required = false) Long bookingId,
            @RequestParam(required = false) String scannerId) {
        log.info("Searching checkins - code: {}, booking: {}, scanner: {}", 
                confirmationCode, bookingId, scannerId);
        List<CheckIn> results = checkInService.searchCheckins(confirmationCode, bookingId, scannerId);
        return ResponseEntity.ok(results);
    }
}