package com.eventplatform.checkin.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.eventplatform.checkin.entity.QRCode;
import com.eventplatform.checkin.entity.CheckIn;
import com.eventplatform.checkin.repository.QRCodeRepository;
import com.eventplatform.checkin.repository.CheckInRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.zxing.BarcodeFormat;
import com.google.zxing.EncodeHintType;
import com.google.zxing.WriterException;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;
import com.google.zxing.qrcode.decoder.ErrorCorrectionLevel;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class QRCodeService {
    
    private final QRCodeRepository qrCodeRepository;
    private final CheckInRepository checkInRepository;
    private final ObjectMapper objectMapper;
    private final CheckInService checkInService;
     
    public List<QRCode> findByBookingId(Long bookingId) {
        return qrCodeRepository.findByBookingId(bookingId);
    }
    
    @Transactional
    public Map<String, Object> scanByUniqueCode(String uniqueCode, String scannerId) {
        log.info("🔍 Scanning unique code: {}", uniqueCode);
        
        if (!uniqueCode.startsWith("EVT-")) {
            log.warn("Code format: {} (length: {})", uniqueCode, uniqueCode.length());
            throw new RuntimeException("Format de code invalide. Le code doit commencer par 'EVT-'");
        }
    
        QRCode qrCode = qrCodeRepository.findByUniqueCode(uniqueCode)
                .orElseThrow(() -> new RuntimeException("Code non trouvé: " + uniqueCode));
        
        if (qrCode.getIsUsed()) {
            throw new RuntimeException("Code déjà utilisé");
        }
        
        if (LocalDateTime.now().isAfter(qrCode.getExpiresAt())) {
            throw new RuntimeException("Code expiré");
        }
        
        qrCode.setIsUsed(true);
        qrCode.setUsedAt(LocalDateTime.now());
        qrCode.setScanCount(qrCode.getScanCount() + 1);
        qrCodeRepository.save(qrCode);
        
        checkInService.createCheckIn(
            qrCode.getBookingId(),
            null, null, qrCode.getConfirmationCode(),
            scannerId,
            scannerId, qrCode.getQuantity()
        );
        
        return Map.of(
            "success", true,
            "message", "Check-in réussi!",
            "bookingId", qrCode.getBookingId(),
            "userName", qrCode.getUserName(),
            "eventName", qrCode.getEventName(),
            "quantity", qrCode.getQuantity(),
            "uniqueCode", uniqueCode,
            "scannerId", scannerId,
            "timestamp", LocalDateTime.now().toString()
        );
    }
   
    public Map<String, Object> getQRCodeInfo(String uniqueCode) {
        try {
            log.info("🔍 Getting QR code info for: {}", uniqueCode);

            Optional<QRCode> qrCodeOpt = qrCodeRepository.findByUniqueCode(uniqueCode);

            if (qrCodeOpt.isEmpty()) {
                List<QRCode> byConfirmationCode = qrCodeRepository.findByConfirmationCode(uniqueCode);
                if (!byConfirmationCode.isEmpty()) {
                    qrCodeOpt = Optional.of(byConfirmationCode.get(0));
                }
            }

            if (qrCodeOpt.isEmpty()) {
                throw new RuntimeException("Code non trouvé: " + uniqueCode);
            }

            QRCode qrCode = qrCodeOpt.get();

            Map<String, Object> response = new HashMap<>();
            response.put("valid", true);
            response.put("bookingId", qrCode.getBookingId());
            response.put("userName", qrCode.getUserName());
            response.put("eventName", qrCode.getEventName());
            response.put("quantity", qrCode.getQuantity());
            response.put("confirmationCode", qrCode.getConfirmationCode());
            response.put("uniqueCode", qrCode.getUniqueCode());
            response.put("isUsed", qrCode.getIsUsed());
            response.put("usedAt", qrCode.getUsedAt());
            response.put("expiresAt", qrCode.getExpiresAt());
            response.put("createdAt", qrCode.getCreatedAt());

            String status;
            if (qrCode.getIsUsed()) {
                status = "DÉJÀ UTILISÉ";
            } else if (LocalDateTime.now().isAfter(qrCode.getExpiresAt())) {
                status = "EXPIRÉ";
            } else {
                status = "VALIDE";
            }

            response.put("status", status);

            return response;

        } catch (Exception e) {
            log.error("Error getting QR code info: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to get QR code info: " + e.getMessage());
        }
    }
    
    @Transactional
    public Map<String, Object> verifyUniqueCode(String uniqueCode) {
        try {
            log.info("🔍 Verifying unique code: {}", uniqueCode);
            
            Optional<QRCode> qrCodeOpt = qrCodeRepository.findByUniqueCode(uniqueCode);
            
            if (qrCodeOpt.isEmpty()) {
                List<QRCode> byConfirmationCode = qrCodeRepository.findByConfirmationCode(uniqueCode);
                if (!byConfirmationCode.isEmpty()) {
                    qrCodeOpt = Optional.of(byConfirmationCode.get(0));
                }
            }
            
            if (qrCodeOpt.isEmpty()) {
                return Map.of(
                    "success", false,
                    "message", "Code non trouvé",
                    "valid", false
                );
            }
            
            QRCode qrCode = qrCodeOpt.get();
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("valid", true);
            response.put("bookingId", qrCode.getBookingId());
            response.put("confirmationCode", qrCode.getConfirmationCode());
            response.put("uniqueCode", qrCode.getUniqueCode());
            response.put("userName", qrCode.getUserName());
            response.put("eventName", qrCode.getEventName());
            response.put("quantity", qrCode.getQuantity());
            response.put("isUsed", qrCode.getIsUsed());
            response.put("expiresAt", qrCode.getExpiresAt());
            response.put("createdAt", qrCode.getCreatedAt());
            
            String status;
            if (qrCode.getIsUsed()) {
                status = "DÉJÀ UTILISÉ";
            } else if (LocalDateTime.now().isAfter(qrCode.getExpiresAt())) {
                status = "EXPIRÉ";
            } else {
                status = "VALIDE";
            }
            
            response.put("status", status);
            
            return response;
            
        } catch (Exception e) {
            log.error("Error verifying unique code: {}", e.getMessage(), e);
            return Map.of(
                "success", false,
                "message", "Erreur serveur: " + e.getMessage(),
                "valid", false
            );
        }
    }
    
    public Optional<QRCode> findSingleByBookingId(Long bookingId) {
        List<QRCode> qrCodes = qrCodeRepository.findByBookingId(bookingId);
        return qrCodes.isEmpty() ? Optional.empty() : Optional.of(qrCodes.get(0));
    }
    
    public List<QRCode> findByConfirmationCode(String confirmationCode) {
        return qrCodeRepository.findByConfirmationCode(confirmationCode);
    }
    
    private void createCheckInRecord(QRCode qrCode, String scannerId, int quantity) {
        try {
            log.info("📝 Creating check-in for booking {} with {} tickets", 
                     qrCode.getBookingId(), quantity);
            
            checkInService.createCheckIn(
                qrCode.getBookingId(),
                null, 
                null, 
                scannerId,
                "QR Code Scanner",
                "Entrée principale",
                quantity
            );
            
        } catch (Exception e) {
            log.error("Error creating check-in record: {}", e.getMessage());
        }
    }
    
  @Transactional
public Map<String, Object> scanBookingConfirmationCode(String confirmationCode, String scannerId, Integer quantityToScan) {
    log.info("🔍 Scanning booking: {}, quantity: {}", confirmationCode, quantityToScan);
    
    try {
        List<QRCode> qrCodes = qrCodeRepository.findByConfirmationCode(confirmationCode);
        
        if (qrCodes.isEmpty()) {
            throw new RuntimeException("❌ Aucun QR code trouvé pour: " + confirmationCode);
        }
        
        List<QRCode> availableCodes = qrCodes.stream()
                .filter(qr -> !qr.getIsUsed())
                .collect(Collectors.toList());
        
        if (availableCodes.isEmpty()) {
            throw new RuntimeException("❌ Tous les billets sont déjà utilisés pour: " + confirmationCode);
        }
        
        int qty = (quantityToScan != null) ? quantityToScan : 1;
        int toScan = Math.min(qty, availableCodes.size());
        
        List<QRCode> scannedCodes = new ArrayList<>();
        List<String> scannedTicketNumbers = new ArrayList<>();
        
        for (int i = 0; i < toScan; i++) {
            QRCode qrCode = availableCodes.get(i);
            qrCode.setIsUsed(true);
            qrCode.setUsedAt(LocalDateTime.now());
            qrCode.setScanCount(qrCode.getScanCount() + 1);
            
            QRCode saved = qrCodeRepository.save(qrCode);
            scannedCodes.add(saved);
            scannedTicketNumbers.add(String.valueOf(qrCode.getTicketNumber()));
            
            log.info("✅ Scanned ticket {}/{}: {} (Ticket #{})", 
                    i + 1, toScan, qrCode.getUniqueCode(), qrCode.getTicketNumber());
            
            createCheckInRecord(qrCode, scannerId, 1);
        }
        
        return Map.of(
            "success", true,
            "message", String.format("Scanned %d/%d tickets", toScan, availableCodes.size()),
            "confirmationCode", confirmationCode,
            "totalTickets", qrCodes.size(),
            "availableTickets", availableCodes.size(),
            "scannedTickets", toScan,
            "scannedTicketNumbers", scannedTicketNumbers,
            "remainingTickets", availableCodes.size() - toScan,
            "scannerId", scannerId,
            "timestamp", LocalDateTime.now()
        );
        
    } catch (Exception e) {
        log.error("Error scanning booking: {}", e.getMessage(), e);
        throw new RuntimeException("Scan failed: " + e.getMessage());
    }
}
    
    @Transactional
    public QRCode validateAndScanQRCode(String identifier, String scannerId) {
        log.info("🔍 Scanning with identifier: {}", identifier);
        
        QRCode qrCode = null;
        
        try {
            if (identifier.startsWith("BK")) {
                List<QRCode> qrCodes = qrCodeRepository.findByConfirmationCode(identifier);
                
                if (!qrCodes.isEmpty()) {
                    if (qrCodes.size() > 1) {
                        log.warn("⚠️ Found {} QR codes for confirmation code: {}", qrCodes.size(), identifier);
                        
                        qrCode = qrCodes.stream()
                                .filter(qr -> !qr.getIsUsed())
                                .findFirst()
                                .orElse(null);
                        
                        if (qrCode == null) {
                            qrCode = qrCodes.get(0);
                            log.info("📊 All tickets used, taking first QR code: {}", qrCode.getId());
                        } else {
                            log.info("📊 Selected available QR code: {}", qrCode.getId());
                        }
                    } else {
                        qrCode = qrCodes.get(0);
                    }
                    
                    log.info("✅ Found QR code by confirmationCode: {}", identifier);
                }
            }
            
            if (qrCode == null && identifier.contains("-") && identifier.length() == 36) {
                Optional<QRCode> qrCodeOpt = qrCodeRepository.findById(identifier);
                if (qrCodeOpt.isPresent()) {
                    qrCode = qrCodeOpt.get();
                    log.info("✅ Found QR code by UUID: {}", identifier);
                }
            }
            
            if (qrCode == null) {
                try {
                    Long bookingId = Long.parseLong(identifier);
                    List<QRCode> qrCodes = qrCodeRepository.findByBookingId(bookingId);
                    if (!qrCodes.isEmpty()) {
                        qrCode = qrCodes.get(0);
                        log.info("✅ Found QR code by bookingId: {}", bookingId);
                    }
                } catch (NumberFormatException e) {
                }
            }
            
            if (qrCode == null) {
                List<String> availableCodes = qrCodeRepository.findAll().stream()
                        .map(QRCode::getConfirmationCode)
                        .filter(Objects::nonNull)
                        .distinct()
                        .collect(Collectors.toList());
                
                throw new RuntimeException(String.format(
                    "❌ Aucun QR code trouvé pour: %s%n" +
                    "Codes disponibles: %s",
                    identifier, availableCodes
                ));
            }
            
            if (qrCode.getIsUsed()) {
                throw new RuntimeException("QR code déjà utilisé");
            }
            
            if (LocalDateTime.now().isAfter(qrCode.getExpiresAt())) {
                throw new RuntimeException("QR code expiré");
            }
            
            qrCode.setIsUsed(true);
            qrCode.setUsedAt(LocalDateTime.now());
            qrCode.setScanCount(qrCode.getScanCount() + 1);
            
            QRCode savedQrCode = qrCodeRepository.save(qrCode);
            log.info("✅ QR code scanné: {} pour booking: {}", 
                     qrCode.getConfirmationCode(), qrCode.getBookingId());
            
            createCheckInRecord(savedQrCode, scannerId, 1);
            
            return savedQrCode;
            
        } catch (Exception e) {
            log.error("Error scanning QR code: {}", e.getMessage(), e);
            throw new RuntimeException("Scan failed: " + e.getMessage());
        }
    }
    
    public Map<String, Object> getBookingStats(String confirmationCode) {
        try {
            List<QRCode> allCodes = qrCodeRepository.findByConfirmationCode(confirmationCode);
            
            if (allCodes.isEmpty()) {
                throw new RuntimeException("Aucun QR code trouvé");
            }
            
            long total = allCodes.size();
            long used = allCodes.stream().filter(QRCode::getIsUsed).count();
            long available = total - used;
            
            return Map.of(
                "confirmationCode", confirmationCode,
                "bookingId", allCodes.get(0).getBookingId(),
                "totalTickets", total,
                "usedTickets", used,
                "availableTickets", available,
                "percentageUsed", total > 0 ? (used * 100 / total) : 0,
                "status", available == 0 ? "COMPLET" : "PARTIEL",
                "qrCodes", allCodes.stream().map(qr -> Map.of(
                    "id", qr.getId(),
                    "isUsed", qr.getIsUsed(),
                    "usedAt", qr.getUsedAt(),
                    "createdAt", qr.getCreatedAt()
                )).collect(Collectors.toList())
            );
            
        } catch (Exception e) {
            log.error("Error getting booking stats: {}", e.getMessage());
            throw new RuntimeException("Failed to get stats: " + e.getMessage());
        }
    }
    
    public String generateQRCodeImage(String qrData) {
        try {
            QRCodeWriter qrCodeWriter = new QRCodeWriter();
            Map<EncodeHintType, Object> hints = new HashMap<>();
            hints.put(EncodeHintType.ERROR_CORRECTION, ErrorCorrectionLevel.H);
            hints.put(EncodeHintType.MARGIN, 1);
            
            BitMatrix bitMatrix = qrCodeWriter.encode(
                qrData, 
                BarcodeFormat.QR_CODE, 
                250, 250, hints
            );
            
            BufferedImage qrImage = new BufferedImage(
                250, 250, BufferedImage.TYPE_INT_RGB
            );
            
            for (int x = 0; x < 250; x++) {
                for (int y = 0; y < 250; y++) {
                    qrImage.setRGB(x, y, bitMatrix.get(x, y) ? 0x000000 : 0xFFFFFF);
                }
            }
            
            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            ImageIO.write(qrImage, "PNG", baos);
            
            return Base64.getEncoder().encodeToString(baos.toByteArray());
        } catch (WriterException | IOException e) {
            log.error("Error generating QR code image: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to generate QR code image");
        }
    }
    
    @Transactional
    public Map<String, Object> syncQRCodeWithBooking(Long bookingId, String confirmationCode) {
        try {
            log.info("Syncing QR code for booking {} with confirmation code {}", 
                    bookingId, confirmationCode);
            
            List<QRCode> existingCodes = qrCodeRepository.findByBookingId(bookingId);
            
            if (!existingCodes.isEmpty()) {
                for (QRCode qrCode : existingCodes) {
                    if (!confirmationCode.equals(qrCode.getConfirmationCode())) {
                        qrCode.setConfirmationCode(confirmationCode);
                        
                        Map<String, Object> qrData = objectMapper.readValue(
                                qrCode.getData(), 
                                new TypeReference<Map<String, Object>>() {}
                        );
                        qrData.put("confirmationCode", confirmationCode);
                        qrCode.setData(objectMapper.writeValueAsString(qrData));
                        
                        qrCodeRepository.save(qrCode);
                        log.info("Updated QR code {} with confirmation code {}", 
                                qrCode.getId(), confirmationCode);
                    }
                }
                
                return Map.of(
                    "success", true,
                    "message", String.format("Updated %d QR codes with confirmation code %s", 
                            existingCodes.size(), confirmationCode),
                    "bookingId", bookingId,
                    "confirmationCode", confirmationCode,
                    "updatedCount", existingCodes.size()
                );
            } else {
                Map<String, Object> bookingData = new HashMap<>();
                bookingData.put("bookingId", bookingId);
                bookingData.put("confirmationCode", confirmationCode);
                bookingData.put("syncedAt", LocalDateTime.now());
                
                QRCode newQrCode = generateQRCodeForBooking(bookingId, bookingData);
                
                return Map.of(
                    "success", true,
                    "message", "Created new QR code",
                    "bookingId", bookingId,
                    "confirmationCode", confirmationCode,
                    "qrCodeId", newQrCode.getId(),
                    "action", "CREATED"
                );
            }
            
        } catch (Exception e) {
            log.error("Error syncing QR code: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to sync QR code: " + e.getMessage());
        }
    }
    
    @Transactional
    public QRCode generateQRCodeForBooking(Long bookingId, Map<String, Object> bookingData) {
        try {
            Optional<QRCode> existing = Optional.empty();
            if (existing.isPresent()) {
                log.info("QR code already exists for booking: {}", bookingId);
                return existing.get();
            }
            
            String qrId = UUID.randomUUID().toString();
            String confirmationCode = (String) bookingData.get("confirmationCode");
            if (confirmationCode == null) {
                confirmationCode = "BK" + bookingId;
            }
            
            Map<String, Object> qrData = new HashMap<>();
            qrData.put("qrId", qrId);
            qrData.put("bookingId", bookingId);
            qrData.put("confirmationCode", confirmationCode);
            qrData.put("bookingData", bookingData);
            qrData.put("timestamp", System.currentTimeMillis());
            
            String jsonData = objectMapper.writeValueAsString(qrData);
            
            QRCode qrCode = new QRCode();
            qrCode.setId(qrId);
            qrCode.setBookingId(bookingId);
            qrCode.setConfirmationCode(confirmationCode);
            qrCode.setData(jsonData);
            qrCode.setCreatedAt(LocalDateTime.now());
            qrCode.setExpiresAt(LocalDateTime.now().plusDays(7));
            
            return qrCodeRepository.save(qrCode);
        } catch (Exception e) {
            log.error("Error generating QR code: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to generate QR code: " + e.getMessage());
        }
    }
    
 
    @Transactional
    public Map<String, Object> markAsScannedByAdmin(String uniqueCode, String scannerId) {
        try {
            log.info("🔍 Admin marking as scanned: {}", uniqueCode);
            
            QRCode qrCode = qrCodeRepository.findByUniqueCode(uniqueCode)
                .orElseThrow(() -> new RuntimeException("Code non trouvé"));
            
            if (qrCode.getIsUsed()) {
                return Map.of(
                    "success", false,
                    "message", "Code déjà scanné",
                    "alreadyUsed", true,
                    "originalScanTime", qrCode.getUsedAt()
                );
            }
            
            qrCode.setIsUsed(true);
            qrCode.setUsedAt(LocalDateTime.now());
            qrCode.setScanCount(qrCode.getScanCount() + 1);
            
            QRCode saved = qrCodeRepository.save(qrCode);
            
            checkInService.createCheckIn(
                qrCode.getBookingId(),
                qrCode.getConfirmationCode(),
                scannerId,
                "ADMIN_SCANNER",
                "Admin Override",
                qrCode.getQuantity()
            );
            
            return Map.of(
                "success", true,
                "message", "Ticket marqué comme scanné par admin",
                "bookingId", qrCode.getBookingId(),
                "userName", qrCode.getUserName(),
                "eventName", qrCode.getEventName(),
                "scannedAt", LocalDateTime.now(),
                "scannerId", scannerId,
                "quantity", qrCode.getQuantity()
            );
            
        } catch (Exception e) {
            log.error("Error marking as scanned: {}", e.getMessage());
            throw new RuntimeException("Failed: " + e.getMessage());
        }
    }
 
    public List<Map<String, Object>> getAdminCheckins(String scannerId, LocalDate date) {
        List<CheckIn> allCheckins = checkInRepository.findAll(Sort.by(Sort.Direction.DESC, "checkedInAt"));
        
        List<CheckIn> filteredCheckins = allCheckins.stream()
            .filter(checkin -> {
                if (scannerId != null && !scannerId.isEmpty() && 
                    !checkin.getScannerId().equals(scannerId)) {
                    return false;
                }
                
                if (date != null && checkin.getCheckedInAt() != null) {
                    LocalDateTime checkinDate = checkin.getCheckedInAt();
                    LocalDateTime startOfDay = date.atStartOfDay();
                    LocalDateTime endOfDay = date.atTime(LocalTime.MAX);
                    
                    return !checkinDate.isBefore(startOfDay) && 
                           !checkinDate.isAfter(endOfDay);
                }
                
                return true;
            })
            .collect(Collectors.toList());
        
        return filteredCheckins.stream().map(checkin -> {
            Map<String, Object> checkinMap = new HashMap<>();
            checkinMap.put("id", checkin.getId());
            checkinMap.put("bookingId", checkin.getBookingId());
            checkinMap.put("confirmationCode", checkin.getConfirmationCode());
            checkinMap.put("scannerId", checkin.getScannerId());
            checkinMap.put("scannerType", checkin.getScannerType());
            checkinMap.put("checkedInAt", checkin.getCheckedInAt());
            checkinMap.put("quantity", checkin.getQuantity());
            checkinMap.put("location", checkin.getLocation());
            
            try {
                List<QRCode> qrCodes = qrCodeRepository.findByConfirmationCode(checkin.getConfirmationCode());
                if (!qrCodes.isEmpty()) {
                    QRCode qrCode = qrCodes.get(0);
                    checkinMap.put("userName", qrCode.getUserName());
                    checkinMap.put("eventName", qrCode.getEventName());
                }
            } catch (Exception e) {
                log.warn("Could not fetch user info for checkin: {}", checkin.getId());
            }
            
            return checkinMap;
        }).collect(Collectors.toList());
    }
 
    public Map<String, Object> checkTicketStatus(String identifier) {
        try {
            QRCode qrCode = null;
            
            if (identifier.startsWith("EVT-")) {
                qrCode = qrCodeRepository.findByUniqueCode(identifier)
                    .orElse(null);
            } else if (identifier.startsWith("BK")) {
                List<QRCode> qrCodes = qrCodeRepository.findByConfirmationCode(identifier);
                qrCode = qrCodes.isEmpty() ? null : qrCodes.get(0);
            } else {
                try {
                    Long bookingId = Long.parseLong(identifier);
                    List<QRCode> qrCodes = qrCodeRepository.findByBookingId(bookingId);
                    qrCode = qrCodes.isEmpty() ? null : qrCodes.get(0);
                } catch (NumberFormatException e) {
                }
            }
            
            if (qrCode == null) {
                return Map.of(
                    "found", false,
                    "message", "Ticket non trouvé"
                );
            }
            
            Map<String, Object> response = new HashMap<>();
            response.put("found", true);
            response.put("bookingId", qrCode.getBookingId());
            response.put("confirmationCode", qrCode.getConfirmationCode());
            response.put("uniqueCode", qrCode.getUniqueCode());
            response.put("isUsed", qrCode.getIsUsed());
            response.put("usedAt", qrCode.getUsedAt());
            response.put("eventName", qrCode.getEventName());
            response.put("userName", qrCode.getUserName());
            response.put("quantity", qrCode.getQuantity());
            response.put("status", qrCode.getIsUsed() ? "SCANNED" : "VALID");
            
            if (qrCode.getIsUsed()) {
                List<CheckIn> checkins = checkInService.findByConfirmationCode(qrCode.getConfirmationCode());
                if (!checkins.isEmpty()) {
                    CheckIn checkin = checkins.get(0);
                    response.put("checkedInAt", checkin.getCheckedInAt());
                    response.put("scannerId", checkin.getScannerId());
                    response.put("scannerType", checkin.getScannerType());
                }
            }
            
            return response;
            
        } catch (Exception e) {
            log.error("Error checking ticket status: {}", e.getMessage());
            return Map.of(
                "error", true,
                "message", "Erreur lors de la vérification: " + e.getMessage()
            );
        }
    }
}