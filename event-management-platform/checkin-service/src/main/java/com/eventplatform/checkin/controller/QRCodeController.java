package com.eventplatform.checkin.controller;

import com.eventplatform.checkin.entity.QRCode;
import com.eventplatform.checkin.repository.QRCodeRepository;
import com.eventplatform.checkin.service.QRCodeEmailService;
import com.eventplatform.checkin.service.QRCodeService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j; 

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/qr-codes")
@RequiredArgsConstructor
@Slf4j 
public class QRCodeController {
    private final QRCodeEmailService qrCodeEmailService;
    private final QRCodeService qrCodeService;
     private final QRCodeRepository qrCodeRepository;
@PostMapping("/sync-booking/{bookingId}")
public ResponseEntity<Map<String, Object>> syncBookingWithCheckinService(
        @PathVariable Long bookingId,
        @RequestParam String confirmationCode) {
    
    try {
        log.info("🔄 Syncing booking {} with code {}", bookingId, confirmationCode);
        
        List<QRCode> existing = qrCodeService.findByConfirmationCode(confirmationCode);
        
        if (!existing.isEmpty()) {
            return ResponseEntity.ok(Map.of(
                "status", "already_exists",
                "message", "QR code déjà existant",
                "confirmationCode", confirmationCode,
                "qrCodeId", existing.get(0).getId(),
                "bookingId", bookingId
            ));
        }
        
        Map<String, Object> bookingData = new HashMap<>();
        bookingData.put("bookingId", bookingId);
        bookingData.put("confirmationCode", confirmationCode);
        bookingData.put("eventName", "Événement #" + bookingId);
        bookingData.put("userName", "Client");
        bookingData.put("quantity", 1);
        bookingData.put("totalPrice", 20.0);
        bookingData.put("status", "CONFIRMED");
        
        QRCode qrCode = qrCodeService.generateQRCodeForBooking(bookingId, bookingData);
        
        return ResponseEntity.ok(Map.of(
            "status", "created",
            "message", "QR code généré avec succès",
            "confirmationCode", confirmationCode,
            "qrCodeId", qrCode.getId(),
            "bookingId", bookingId
        ));
        
    } catch (Exception e) {
        log.error("Error syncing booking: {}", e.getMessage());
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", e.getMessage()));
    }
}

@PostMapping("/sync-all-bookings")
public ResponseEntity<Map<String, Object>> syncAllBookings() {
    try {
        log.info("🔄 Synchronisation de toutes les réservations...");
        
        return ResponseEntity.ok(Map.of(
            "message", "Synchronisation disponible",
            "existingQRCodes", 0,
            "availableCodes", List.of()
        ));
        
    } catch (Exception e) {
        log.error("❌ Erreur: {}", e.getMessage());
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", e.getMessage()));
    }
}
    @PostMapping("/generate/{bookingId}")
    public ResponseEntity<Map<String, Object>> generateQRCode(@PathVariable Long bookingId) {
        try {
            Map<String, Object> bookingData = fetchBookingData(bookingId);
            
            QRCode qrCode = qrCodeService.generateQRCodeForBooking(bookingId, bookingData);
            String qrImage = qrCodeService.generateQRCodeImage(qrCode.getData());
            
            Map<String, Object> response = new HashMap<>();
            response.put("qrCode", qrCode);
            response.put("qrImage", "data:image/png;base64," + qrImage);
            
            log.info("✅ QR code généré pour le booking: {}", bookingId); 
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("❌ Erreur génération QR code: {}", e.getMessage()); 
            throw new RuntimeException("Failed to generate QR code");
        }
    }

    
    @PostMapping("/test-email/{bookingId}")
    public ResponseEntity<Map<String, Object>> testSendEmail(
            @PathVariable Long bookingId,
            @RequestParam String email) {
        
        try {
            log.info("🧪 Test d'envoi d'email pour booking: {} à: {}", bookingId, email);
            
            QRCode qrCode = qrCodeEmailService.generateAndSendQRCodeByEmail(
                bookingId,
                "BK" + bookingId,
                email,
                "Utilisateur Test",
                "Événement de Test",
                2,
                50.0
            );
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Email de test envoyé avec succès",
                "bookingId", bookingId,
                "sentTo", email,
                "qrCodeId", qrCode.getId(),
                "uniqueCode", qrCode.getUniqueCode()
            ));
            
        } catch (Exception e) {
            log.error("❌ Échec d'envoi d'email de test: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }
    @PostMapping("/scan/{qrId}")
    public ResponseEntity<Map<String, Object>> scanQRCode(
            @PathVariable String qrId,
            @RequestParam String scannerId) {
        
        try {
            QRCode qrCode = qrCodeService.validateAndScanQRCode(qrId, scannerId);
            
            Map<String, Object> checkInData = new HashMap<>();
            checkInData.put("qrCode", qrCode);
            checkInData.put("message", "Check-in successful");
            checkInData.put("bookingId", qrCode.getBookingId());
            checkInData.put("scannerId", scannerId);
            checkInData.put("timestamp", System.currentTimeMillis());
            
            log.info("✅ QR code scanné: {} pour booking: {}", qrId, qrCode.getBookingId());
            
            return ResponseEntity.ok(checkInData);
        } catch (RuntimeException e) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", e.getMessage());
            error.put("timestamp", System.currentTimeMillis());
            
            log.error("❌ Erreur scan QR code {}: {}", qrId, e.getMessage());
            
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }
     @PostMapping("/scan-unique/{uniqueCode}")
    public ResponseEntity<Map<String, Object>> scanByUniqueCode(
            @PathVariable String uniqueCode,
            @RequestParam String scannerId) {
        
        try {
            Map<String, Object> result = qrCodeService.scanByUniqueCode(uniqueCode, scannerId);
            return ResponseEntity.ok(result);
            
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", e.getMessage()
            ));
        }
    }
   @DeleteMapping("/booking/{bookingId}")
    public ResponseEntity<Map<String, Object>> deleteQRCodesByBooking(@PathVariable Long bookingId) {
        try {
            log.info("🗑️ Deleting QR codes for booking: {}", bookingId);
            
            List<QRCode> qrCodes = qrCodeService.findByBookingId(bookingId);
            
            if (qrCodes.isEmpty()) {
                log.info("ℹ️ No QR codes found for booking: {}", bookingId);
                return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "No QR codes found",
                    "bookingId", bookingId,
                    "deletedCount", 0
                ));
            }
            
            qrCodes.forEach(qrCode -> {
                qrCodeRepository.deleteById(qrCode.getId());
                log.info("✅ Deleted QR code: {}", qrCode.getId());
            });
            
            log.info("✅ Successfully deleted {} QR code(s) for booking {}", qrCodes.size(), bookingId);
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "QR codes deleted successfully",
                "bookingId", bookingId,
                "deletedCount", qrCodes.size()
            ));
            
        } catch (Exception e) {
            log.error("❌ Error deleting QR codes for booking {}: {}", bookingId, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of(
                        "success", false,
                        "error", e.getMessage(),
                        "bookingId", bookingId
                    ));
        }
    }
    
      @GetMapping("/verify/{uniqueCode}")
    public ResponseEntity<Map<String, Object>> verifyUniqueCode(
            @PathVariable String uniqueCode) {
        
        try {
            Map<String, Object> info = qrCodeService.getQRCodeInfo(uniqueCode);
            return ResponseEntity.ok(info);
            
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of(
                "valid", false,
                "message", e.getMessage()
            ));
        }
    }
    @PostMapping("/scan-bk/{bkCode}")
    public ResponseEntity<Map<String, Object>> scanBKCode(
            @PathVariable String bkCode,
            @RequestParam String scannerId) {
        
        try {
            log.info("📱 Scanning BK code: {}", bkCode);
            
            if (!bkCode.startsWith("BK")) {
                return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Le code doit commencer par 'BK'"
                ));
            }
            
            QRCode qrCode = qrCodeService.validateAndScanQRCode(bkCode, scannerId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Check-in réussi!");
            response.put("bookingId", qrCode.getBookingId());
            response.put("confirmationCode", bkCode);
            response.put("scannerId", scannerId);
            response.put("timestamp", System.currentTimeMillis());
            
            return ResponseEntity.ok(response);
            
        } catch (RuntimeException e) {
            log.error("❌ Error scanning BK code: {}", e.getMessage()); 
            
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            error.put("timestamp", System.currentTimeMillis());
            
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }
    @PostMapping("/generate-all-existing")
public ResponseEntity<Map<String, Object>> generateQRForAllExistingBookings() {
    try {
        List<Map<String, Object>> results = new ArrayList<>();

        Long[] bookingIds = {17L, 18L, 19L, 20L, 21L, 22L, 23L};
        
        for (Long bookingId : bookingIds) {
            try {
                Map<String, Object> bookingData = new HashMap<>();
                bookingData.put("bookingId", bookingId);
                bookingData.put("confirmationCode", "BK" + bookingId);
                bookingData.put("eventName", "Événement " + bookingId);
                bookingData.put("userName", "Utilisateur " + bookingId);
                bookingData.put("quantity", 1);
                bookingData.put("totalPrice", 20.0);
                
                QRCode qrCode = qrCodeService.generateQRCodeForBooking(bookingId, bookingData);
                
                results.add(Map.of(
                    "bookingId", bookingId,
                    "confirmationCode", "BK" + bookingId,
                    "qrCodeId", qrCode.getId(),
                    "success", true
                ));
                
            } catch (Exception e) {
                results.add(Map.of(
                    "bookingId", bookingId,
                    "error", e.getMessage(),
                    "success", false
                ));
            }
        }
        
        return ResponseEntity.ok(Map.of(
            "message", "QR codes générés pour les bookings existants",
            "results", results,
            "totalProcessed", bookingIds.length,
            "successCount", results.stream().filter(r -> (Boolean) r.get("success")).count()
        ));
        
    } catch (Exception e) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Erreur: " + e.getMessage()));
    }
}
 @PostMapping("/generate-and-email")
    public ResponseEntity<Map<String, Object>> generateAndSendQRCodeByEmail(
            @RequestBody Map<String, Object> request) {
        
        try {
            Long bookingId = Long.parseLong(request.get("bookingId").toString());
            String confirmationCode = (String) request.get("confirmationCode");
            String userEmail = (String) request.get("userEmail");
            String userName = (String) request.get("userName");
            String eventName = (String) request.get("eventName");
            Integer quantity = Integer.parseInt(request.get("quantity").toString());
            Double totalPrice = Double.parseDouble(request.get("totalPrice").toString());
            
            log.info("📧 Generating and sending QR code email for booking: {}", bookingId);
            
            QRCode qrCode = qrCodeEmailService.generateAndSendQRCodeByEmail(
                bookingId,
                confirmationCode,
                userEmail,
                userName,
                eventName,
                quantity,
                totalPrice
            );
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "QR code généré et envoyé par email",
                "qrCodeId", qrCode.getId(),
                "uniqueCode", qrCode.getUniqueCode(),
                "sentTo", userEmail
            ));
            
        } catch (NumberFormatException e) {
            log.error("❌ Format de données invalide: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of(
                "error", "Format de données invalide: " + e.getMessage()
            ));
        } catch (Exception e) {
            log.error("❌ Error generating and sending QR code email: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }
    
    @GetMapping("/booking/{bookingId}")
    public ResponseEntity<Map<String, Object>> getQRCodeByBooking(@PathVariable Long bookingId) {
        try {
            log.info("🔍 Fetching QR code for booking: {}", bookingId);
            
            List<QRCode> qrCodes = qrCodeService.findByBookingId(bookingId);
            
            if (!qrCodes.isEmpty()) {
                QRCode qrCode = qrCodes.get(0);
                
                try {
                    String qrImage = qrCodeService.generateQRCodeImage(qrCode.getData());
                    
                    Map<String, Object> response = new HashMap<>();
                    response.put("success", true);
                    response.put("qrCode", qrCode);
                    response.put("qrImage", "data:image/png;base64," + qrImage);
                    response.put("message", "QR code trouvé");
                    
                    log.info("✅ QR code found for booking: {}", bookingId);
                    return ResponseEntity.ok(response);
                    
                } catch (Exception e) {
                    log.error("❌ Error generating QR image for booking {}: {}", bookingId, e.getMessage());
                    
                    Map<String, Object> response = new HashMap<>();
                    response.put("success", true);
                    response.put("qrCode", qrCode);
                    response.put("message", "QR code trouvé (image non disponible)");
                    
                    return ResponseEntity.ok(response);
                }
                
            } else {
                log.warn("⚠️ No QR code found for booking: {}", bookingId);
                
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "Aucun QR code trouvé pour cette réservation");
                response.put("bookingId", bookingId);
                response.put("generated", false);
                
                return ResponseEntity.ok(response);
            }
            
        } catch (Exception e) {
            log.error("❌ Error fetching QR code for booking {}: {}", bookingId, e.getMessage());
            
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "Erreur serveur");
            error.put("bookingId", bookingId);
            error.put("generated", false);
            
            return ResponseEntity.ok(error);
        }
    }
     @PostMapping("/admin/scan/{identifier}")
    public ResponseEntity<Map<String, Object>> adminScanTicket(
            @PathVariable String identifier,
            @RequestParam String scannerId) {
        
        try {
            Map<String, Object> status = qrCodeService.checkTicketStatus(identifier);
            
            if (!Boolean.TRUE.equals(status.get("found"))) {
                return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Ticket non trouvé"
                ));
            }
            
            Boolean isUsed = (Boolean) status.get("isUsed");
            if (Boolean.TRUE.equals(isUsed)) {
                return ResponseEntity.ok(Map.of(
                    "success", false,
                    "message", "Ticket déjà scanné",
                    "alreadyUsed", true,
                    "originalScanTime", status.get("usedAt"),
                    "bookingInfo", status
                ));
            }
            
            Map<String, Object> result;
            if (identifier.startsWith("EVT-")) {
                result = qrCodeService.scanByUniqueCode(identifier, scannerId);
            } else {
                QRCode qrCode = qrCodeService.validateAndScanQRCode(identifier, scannerId);
                result = Map.of(
                    "success", true,
                    "message", "Check-in réussi",
                    "bookingId", qrCode.getBookingId(),
                    "confirmationCode", qrCode.getConfirmationCode(),
                    "scannedAt", LocalDateTime.now()
                );
            }
            
            return ResponseEntity.ok(result);
            
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", e.getMessage()
            ));
        }
    }
    
    @GetMapping("/admin/checkins")
    public ResponseEntity<List<Map<String, Object>>> getAdminCheckins(
            @RequestParam(required = false) String scannerId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        
        try {
            List<Map<String, Object>> checkins = qrCodeService.getAdminCheckins(scannerId, date);
            return ResponseEntity.ok(checkins);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(null);
        }
    }
    
    @GetMapping("/ticket-status/{identifier}")
    public ResponseEntity<Map<String, Object>> getTicketStatus(@PathVariable String identifier) {
        try {
            Map<String, Object> status = qrCodeService.checkTicketStatus(identifier);
            return ResponseEntity.ok(status);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "error", e.getMessage()
            ));
        }
    }
    
    @PostMapping("/admin/mark-scanned/{uniqueCode}")
    public ResponseEntity<Map<String, Object>> adminMarkAsScanned(
            @PathVariable String uniqueCode,
            @RequestParam String scannerId) {
        
        try {
            Map<String, Object> result = qrCodeService.markAsScannedByAdmin(uniqueCode, scannerId);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", e.getMessage()
            ));
        }
    }
    @PostMapping("/generate-and-email-multiple")
public ResponseEntity<Map<String, Object>> generateAndSendMultipleQRCodesByEmail(
        @RequestBody Map<String, Object> request) {
    
    try {
        Long bookingId = Long.parseLong(request.get("bookingId").toString());
        String confirmationCode = (String) request.get("confirmationCode");
        String userEmail = (String) request.get("userEmail");
        String userName = (String) request.get("userName");
        String eventName = (String) request.get("eventName");
        Integer quantity = Integer.parseInt(request.get("quantity").toString());
        Double totalPrice = Double.parseDouble(request.get("totalPrice").toString());
        
        log.info("📧 Generating and sending {} QR codes for booking: {}", quantity, bookingId);
        
        List<QRCode> qrCodes = qrCodeEmailService.generateAndSendQRCodesByEmail(
            bookingId,
            confirmationCode,
            userEmail,
            userName,
            eventName,
            quantity,
            totalPrice
        );
        
        return ResponseEntity.ok(Map.of(
            "success", true,
            "message", quantity + " QR codes générés et envoyés par email",
            "qrCodesCount", qrCodes.size(),
            "bookingId", bookingId,
            "sentTo", userEmail
        ));
        
    } catch (Exception e) {
        log.error("❌ Error generating and sending QR codes: {}", e.getMessage(), e);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", e.getMessage()));
    }
}
@GetMapping("/booking/{bookingId}/all")
public ResponseEntity<List<QRCode>> getAllQRCodesByBooking(@PathVariable Long bookingId) {
    List<QRCode> qrCodes = qrCodeService.findByBookingId(bookingId);
    return ResponseEntity.ok(qrCodes);
}
    @PostMapping("/sync/{bookingId}")
public ResponseEntity<Map<String, Object>> syncQRCodeWithBooking(
        @PathVariable Long bookingId,
        @RequestParam String confirmationCode) {
    
    try {
        Map<String, Object> result = qrCodeService.syncQRCodeWithBooking(bookingId, confirmationCode);
        return ResponseEntity.ok(result);
        
    } catch (Exception e) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(Map.of("error", e.getMessage()));
    }
}
@PostMapping("/scan-booking/{confirmationCode}")
public ResponseEntity<Map<String, Object>> scanBooking(
        @PathVariable String confirmationCode,
        @RequestParam(required = false) Integer quantity,
        @RequestParam String scannerId) {
    
    try {
        log.info("📱 Scanning booking {} with quantity {}", confirmationCode, quantity);
        
        Map<String, Object> result = qrCodeService.scanBookingConfirmationCode(
            confirmationCode, scannerId, quantity
        );
        
        return ResponseEntity.ok(result);
        
    } catch (RuntimeException e) {
        log.error("❌ Error scanning booking: {}", e.getMessage());
        
        Map<String, Object> error = new HashMap<>();
        error.put("success", false);
        error.put("message", e.getMessage());
        error.put("timestamp", System.currentTimeMillis());
        
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
    }
}

@GetMapping("/booking-stats/{confirmationCode}")
public ResponseEntity<Map<String, Object>> getBookingStats(@PathVariable String confirmationCode) {
    try {
        Map<String, Object> stats = qrCodeService.getBookingStats(confirmationCode);
        return ResponseEntity.ok(stats);
        
    } catch (Exception e) {
        log.error("Error getting booking stats: {}", e.getMessage());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(Map.of("error", e.getMessage()));
    }
}
    @PostMapping("/generate-for-booking/{bookingId}")
    public ResponseEntity<Map<String, Object>> generateQRForBooking(@PathVariable Long bookingId) {
        try {
            Map<String, Object> bookingData = new HashMap<>();
            bookingData.put("bookingId", bookingId);
            bookingData.put("confirmationCode", "BK" + bookingId);
            bookingData.put("eventName", "Événement Test");
            bookingData.put("userName", "Utilisateur Test");
            bookingData.put("quantity", 1);
            bookingData.put("totalPrice", 20.0);
            
            QRCode qrCode = qrCodeService.generateQRCodeForBooking(bookingId, bookingData);
            
            String qrImage = qrCodeService.generateQRCodeImage(qrCode.getData());
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "QR code généré avec succès");
            response.put("qrCodeId", qrCode.getId());
            response.put("bookingId", bookingId);
            response.put("confirmationCode", "BK" + bookingId);
            response.put("qrImage", "data:image/png;base64," + qrImage);
            
            log.info("✅ QR code généré pour booking: {}", bookingId);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("❌ Erreur génération QR code: {}", e.getMessage());
            
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "Erreur: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
    
    private Map<String, Object> fetchBookingData(Long bookingId) {
        Map<String, Object> data = new HashMap<>();
        data.put("bookingId", bookingId);
        data.put("eventName", "Test Event");
        data.put("userName", "Test User");
        data.put("quantity", 1);
        data.put("totalPrice", 50.0);
        data.put("generatedAt", System.currentTimeMillis());

        
        return data;
    }
}