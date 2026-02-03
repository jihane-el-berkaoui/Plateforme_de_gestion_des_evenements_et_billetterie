package com.eventplatform.checkin.service;

import com.eventplatform.checkin.entity.CheckIn;
import com.eventplatform.checkin.repository.CheckInRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.apache.hc.core5.http.HttpStatus;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.PostMapping;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class CheckInService {
    
    private final CheckInRepository checkInRepository;
    
    public List<CheckIn> findRecentCheckins(int limit) {
        Pageable pageable = PageRequest.of(0, limit, Sort.by(Sort.Direction.DESC, "checkedInAt"));
        return checkInRepository.findAll(pageable).getContent();
    }
    
    public List<CheckIn> findByBookingId(Long bookingId) {
        return checkInRepository.findByBookingId(bookingId);
    }
    
    public List<CheckIn> findByConfirmationCode(String confirmationCode) {
        return checkInRepository.findByConfirmationCode(confirmationCode);
    }
    
    public List<CheckIn> findAll() {
        return checkInRepository.findAll();
    }
    
    public Map<String, Object> getTodayStats() {
        LocalDateTime startOfDay = LocalDateTime.now().with(LocalTime.MIN);
        LocalDateTime endOfDay = LocalDateTime.now().with(LocalTime.MAX);
        
        long todayCount = checkInRepository.countByCheckedInAtBetween(startOfDay, endOfDay);
        long totalCount = checkInRepository.count();
        
        List<Object[]> scannerStats = checkInRepository.countByScannerIdToday(startOfDay);
        Map<String, Long> byScanner = scannerStats.stream()
                .collect(Collectors.toMap(
                    obj -> (String) obj[0],
                    obj -> (Long) obj[1]
                ));
        
        Map<String, Object> stats = new HashMap<>();
        stats.put("todayCheckins", todayCount);
        stats.put("totalCheckins", totalCount);
        stats.put("byScanner", byScanner);
        stats.put("date", LocalDate.now().toString());
        stats.put("lastUpdated", LocalDateTime.now().toString());
        
        return stats;
    }
    
    public Map<String, Object> getStatsByDate(LocalDate date) {
        LocalDateTime startOfDay = date.atStartOfDay();
        LocalDateTime endOfDay = date.atTime(LocalTime.MAX);
        
        long dayCount = checkInRepository.countByCheckedInAtBetween(startOfDay, endOfDay);
        
        Map<String, Object> stats = new HashMap<>();
        stats.put("date", date.toString());
        stats.put("checkins", dayCount);
        
        return stats;
    }
    
    public List<String> getAllScanners() {
        return checkInRepository.findDistinctScannerIds();
    }
    
    public List<CheckIn> searchCheckins(String confirmationCode, Long bookingId, String scannerId) {
        if (confirmationCode != null) {
            return checkInRepository.findByConfirmationCode(confirmationCode);
        } else if (bookingId != null) {
            return checkInRepository.findByBookingId(bookingId);
        } else if (scannerId != null) {
            return checkInRepository.findByScannerId(scannerId);
        } else {
            return findRecentCheckins(50);
        }
    }
    
      @Transactional
    public CheckIn createCheckIn(Long bookingId, Long eventId, Long userId, 
                           String scannerId, String scannerType, 
                           String location, Integer quantity) {
        try {
            String confirmationCode = "BK" + bookingId;
            
            CheckIn checkIn = CheckIn.builder()
                .bookingId(bookingId)
                .confirmationCode(confirmationCode)
                .eventId(eventId != null ? eventId : 1L)
                .userId(userId != null ? userId : 1L)
                .scannerId(scannerId != null ? scannerId : "SYSTEM_SCANNER")
                .scannerType(scannerType != null ? scannerType : "QR_SCANNER") 
                .location(location != null ? location : "MAIN_ENTRANCE")
                .quantity(quantity != null ? quantity : 1)
                .status("CHECKED_IN")
                .build();
            
            log.info("📝 Check-in details before save:");
            log.info("  bookingId: {}", checkIn.getBookingId());
            log.info("  checkedInAt: {}", checkIn.getCheckedInAt());
            log.info("  scannerId: {}", checkIn.getScannerId());
            log.info("  scannerType: {}", checkIn.getScannerType());
            log.info("  location: {}", checkIn.getLocation());
            log.info("  quantity: {}", checkIn.getQuantity());
            log.info("  status: {}", checkIn.getStatus());
            
            CheckIn saved = checkInRepository.save(checkIn);
            log.info("✅ Check-in created: ID={}, Booking={}, Code={}", 
                     saved.getId(), bookingId, confirmationCode);
            
            return saved;
            
        } catch (Exception e) {
            log.error("❌ Error creating check-in: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to create check-in: " + e.getMessage());
        }
    }
    
    @Transactional
    public CheckIn createCheckIn(Long bookingId, String confirmationCode, 
                               String scannerId, String scannerType, 
                               String location, Integer quantity) {
        try {
            log.info("📝 Creating check-in for booking: {}, code: {}", bookingId, confirmationCode);
            
            CheckIn checkIn = new CheckIn();
            checkIn.setBookingId(bookingId);
            checkIn.setConfirmationCode(confirmationCode != null ? confirmationCode : "BK" + bookingId);
            checkIn.setEventId(1L); 
            checkIn.setUserId(1L);  
            checkIn.setScannerId(scannerId != null ? scannerId : "QR_SCANNER");
            checkIn.setScannerType(scannerType != null ? scannerType : "QR_CODE_SCANNER");
            checkIn.setLocation(location != null ? location : "MAIN_ENTRANCE");
            checkIn.setQuantity(quantity != null ? quantity : 1);
            checkIn.setStatus("CHECKED_IN");

            log.info("📊 Check-in details before save:");
            log.info("  bookingId: {}", checkIn.getBookingId());
            log.info("  checkedInAt: {}", checkIn.getCheckedInAt());
            log.info("  scannerId: {}", checkIn.getScannerId());
            log.info("  scannerType: {}", checkIn.getScannerType());
            log.info("  quantity: {}", checkIn.getQuantity());
            
            CheckIn saved = checkInRepository.save(checkIn);
            
            log.info("📊 Check-in details after save:");
            log.info("  id: {}", saved.getId());
            log.info("  checkedInAt: {}", saved.getCheckedInAt());
            log.info("  createdAt: {}", saved.getCreatedAt());
            
            log.info("✅ Check-in created successfully: ID={}", saved.getId());
            
            return saved;
            
        } catch (Exception e) {
            log.error("❌ Error creating check-in: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to create check-in: " + e.getMessage());
        }
    }
    
    @PostMapping("/test-checkin")
    @Transactional
    public ResponseEntity<Map<String, Object>> testCheckIn() {
        try {
            log.info("🧪 Testing check-in creation...");
            
            CheckIn checkIn = new CheckIn();
            checkIn.setBookingId(999L);
            checkIn.setConfirmationCode("BK999");
            checkIn.setEventId(1L);
            checkIn.setUserId(1L);
            checkIn.setScannerId("TEST_SCANNER");
            checkIn.setScannerType("TEST_TYPE");
            checkIn.setLocation("TEST_LOCATION");
            checkIn.setQuantity(1);
            checkIn.setStatus("CHECKED_IN");
            
            log.info("Before save - checkedInAt: {}", checkIn.getCheckedInAt());
            
            CheckIn saved = checkInRepository.save(checkIn);
            
            log.info("After save - checkedInAt: {}", saved.getCheckedInAt());
            log.info("After save - createdAt: {}", saved.getCreatedAt());
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Test check-in created",
                "id", saved.getId(),
                "checkedInAt", saved.getCheckedInAt(),
                "createdAt", saved.getCreatedAt()
            ));
            
        } catch (Exception e) {
            log.error("Test check-in failed: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.SC_INTERNAL_SERVER_ERROR)
                    .body(Map.of(
                        "success", false,
                        "error", e.getMessage()
                    ));
        }
    }
}