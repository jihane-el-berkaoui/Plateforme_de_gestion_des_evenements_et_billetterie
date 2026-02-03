package com.eventplatform.checkin.service;

import com.eventplatform.checkin.entity.QRCode;
import com.eventplatform.checkin.repository.QRCodeRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.zxing.BarcodeFormat;
import com.google.zxing.WriterException;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import javax.imageio.ImageIO;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class QRCodeEmailService {
    
    private final QRCodeRepository qrCodeRepository;
    private final JavaMailSender mailSender;
    private final ObjectMapper objectMapper;
    
   
    public QRCode generateAndSendQRCodeByEmail(Long bookingId, String confirmationCode,
                                              String userEmail, String userName,
                                              String eventName, Integer quantity,
                                              Double totalPrice) {
        
        try {
            log.info("🔄 Generating single QR code for booking: {}", bookingId);
            
            List<QRCode> existingQR = qrCodeRepository.findByBookingId(bookingId);
            
            if (!existingQR.isEmpty()) {
                log.info("✅ QR code already exists for booking: {}", bookingId);
                return existingQR.get(0);
            }
            
            String uniqueCode = generateUniqueCode();
            
            Map<String, Object> qrData = new HashMap<>();
            qrData.put("bookingId", bookingId);
            qrData.put("uniqueCode", uniqueCode);
            qrData.put("confirmationCode", confirmationCode);
            qrData.put("userEmail", userEmail);
            qrData.put("userName", userName);
            qrData.put("eventName", eventName);
            qrData.put("quantity", quantity);
            qrData.put("totalPrice", totalPrice);
            qrData.put("generatedAt", LocalDateTime.now().toString());
            qrData.put("expiresAt", LocalDateTime.now().plusDays(7).toString());
            
            String jsonData = objectMapper.writeValueAsString(qrData);
            
            String qrImageBase64 = generateQRCodeImage(jsonData);
            
            QRCode qrCode = new QRCode();
            qrCode.setId(UUID.randomUUID().toString());
            qrCode.setBookingId(bookingId);
            qrCode.setConfirmationCode(confirmationCode);
            qrCode.setUniqueCode(uniqueCode);
            qrCode.setUserEmail(userEmail);
            qrCode.setUserName(userName);
            qrCode.setEventName(eventName);
            qrCode.setQuantity(quantity);
            qrCode.setTotalPrice(totalPrice);
            qrCode.setData(jsonData);
            qrCode.setCreatedAt(LocalDateTime.now());
            qrCode.setExpiresAt(LocalDateTime.now().plusDays(7));
            qrCode.setIsUsed(false);
            qrCode.setScanCount(0);
            
            QRCode savedQR = qrCodeRepository.save(qrCode);
            
            sendQRCodeEmail(userEmail, userName, savedQR, qrImageBase64);
            
            log.info("✅ QR code generated and sent by email for booking: {}", bookingId);
            
            return savedQR;
            
        } catch (Exception e) {
            log.error("❌ Error generating and sending QR code: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to generate QR code: " + e.getMessage());
        }
    }
    
    
    public List<QRCode> generateAndSendQRCodesByEmail(Long bookingId, String confirmationCode,
                                                     String userEmail, String userName,
                                                     String eventName, Integer quantity,
                                                     Double totalPrice) {
        
        try {
            log.info("🔄 Generating {} QR codes for booking: {}", quantity, bookingId);
            
            List<QRCode> generatedQRCodes = new ArrayList<>();
            
            List<QRCode> existingQR = qrCodeRepository.findByBookingId(bookingId);
            
            if (!existingQR.isEmpty()) {
                log.info("✅ {} QR codes already exist for booking: {}", existingQR.size(), bookingId);
                return existingQR;
            }
            
            Map<String, Object> commonData = new HashMap<>();
            commonData.put("bookingId", bookingId);
            commonData.put("confirmationCode", confirmationCode);
            commonData.put("userEmail", userEmail);
            commonData.put("userName", userName);
            commonData.put("eventName", eventName);
            commonData.put("totalPrice", totalPrice);
            commonData.put("generatedAt", LocalDateTime.now().toString());
            commonData.put("expiresAt", LocalDateTime.now().plusDays(7).toString());
            
            List<String> qrImagesBase64 = new ArrayList<>();
            
            for (int i = 1; i <= quantity; i++) {
                String uniqueCode = generateUniqueCode();
                
                Map<String, Object> qrData = new HashMap<>(commonData);
                qrData.put("uniqueCode", uniqueCode);
                qrData.put("ticketNumber", i);
                qrData.put("totalTickets", quantity);
                qrData.put("ticketId", String.format("%s-%03d", confirmationCode, i));
                
                String jsonData = objectMapper.writeValueAsString(qrData);
                String qrImageBase64 = generateQRCodeImage(jsonData);
                qrImagesBase64.add(qrImageBase64);
                
                QRCode qrCode = new QRCode();
                qrCode.setId(UUID.randomUUID().toString());
                qrCode.setBookingId(bookingId);
                qrCode.setConfirmationCode(confirmationCode);
                qrCode.setUniqueCode(uniqueCode);
                qrCode.setUserEmail(userEmail);
                qrCode.setUserName(userName);
                qrCode.setEventName(eventName);
                qrCode.setQuantity(1);
                qrCode.setTicketNumber(i);
                qrCode.setTotalTickets(quantity);
                qrCode.setTotalPrice(totalPrice / quantity);
                qrCode.setData(jsonData);
                qrCode.setCreatedAt(LocalDateTime.now());
                qrCode.setExpiresAt(LocalDateTime.now().plusDays(7));
                qrCode.setIsUsed(false);
                qrCode.setScanCount(0);
                
                QRCode savedQR = qrCodeRepository.save(qrCode);
                generatedQRCodes.add(savedQR);
                
                log.info("✅ Generated QR code {}/{}: {}", i, quantity, uniqueCode);
            }
            
            sendMultipleQRCodesEmail(userEmail, userName, generatedQRCodes, qrImagesBase64, 
                                   confirmationCode, eventName, quantity, totalPrice);
            
            log.info("✅ {} QR codes generated and sent by email for booking: {}", quantity, bookingId);
            
            return generatedQRCodes;
            
        } catch (Exception e) {
            log.error("❌ Error generating and sending QR codes: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to generate QR codes: " + e.getMessage());
        }
    }
    
   
    private String generateUniqueCode() {
        String part1 = UUID.randomUUID().toString().substring(0, 5).toUpperCase();
        String part2 = UUID.randomUUID().toString().substring(0, 5).toUpperCase();
        return "EVT-" + part1 + "-" + part2;
    }
  
    private String generateQRCodeImage(String data) throws WriterException, IOException {
        QRCodeWriter qrCodeWriter = new QRCodeWriter();
        BitMatrix bitMatrix = qrCodeWriter.encode(data, BarcodeFormat.QR_CODE, 250, 250);
        
        BufferedImage qrImage = MatrixToImageWriter.toBufferedImage(bitMatrix);
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        ImageIO.write(qrImage, "PNG", baos);
        
        return Base64.getEncoder().encodeToString(baos.toByteArray());
    }
    
   
    private void sendQRCodeEmail(String toEmail, String userName, QRCode qrCode, 
                               String qrImageBase64) throws MessagingException, IOException {
        
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
        
        helper.setFrom("noreply@eventplatform.com", "GoEvent");
        helper.setTo(toEmail);
        helper.setSubject("🎫 Votre billet électronique - " + qrCode.getEventName());
        
        String htmlContent = buildQRCodeEmailHTML(userName, qrCode, qrImageBase64);
        helper.setText(htmlContent, true);
        
        byte[] qrImageBytes = Base64.getDecoder().decode(qrImageBase64);
        helper.addAttachment("qrcode-billet.png", 
            new ByteArrayResource(qrImageBytes), 
            "image/png");
        
        mailSender.send(message);
        log.info("✅ QR code email sent to: {}", toEmail);
    }
    
    private void sendMultipleQRCodesEmail(String toEmail, String userName, 
                                        List<QRCode> qrCodes, List<String> qrImagesBase64,
                                        String confirmationCode, String eventName,
                                        Integer quantity, Double totalPrice) 
            throws MessagingException, IOException {
        
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
        
        helper.setFrom("noreply@eventplatform.com", "GoEvent");
        helper.setTo(toEmail);
        helper.setSubject("🎫 Vos " + quantity + " billets électroniques - " + eventName);
        
        String htmlContent = buildMultipleQRCodesEmailHTML(userName, qrCodes, confirmationCode, 
                                                          eventName, quantity, totalPrice);
        helper.setText(htmlContent, true);
        
        for (int i = 0; i < qrImagesBase64.size(); i++) {
            byte[] qrImageBytes = Base64.getDecoder().decode(qrImagesBase64.get(i));
            helper.addAttachment(String.format("qrcode-billet-%d-%03d.png", 
                    qrCodes.get(i).getBookingId(), i + 1),
                new ByteArrayResource(qrImageBytes), 
                "image/png");
        }
        
        mailSender.send(message);
        log.info("✅ {} QR codes email sent to: {}", quantity, toEmail);
    }
    
   
    private String buildQRCodeEmailHTML(String userName, QRCode qrCode, String qrImageBase64) {
        return "<!DOCTYPE html>" +
               "<html lang='fr'>" +
               "<head>" +
               "<meta charset='UTF-8'>" +
               "<style>" +
               "body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }" +
               ".container { max-width: 600px; margin: 0 auto; background: white; }" +
               ".header { background: linear-gradient(135deg, #1976d2 0%, #42a5f5 100%); " +
               "color: white; padding: 30px; text-align: center; }" +
               ".content { padding: 30px; }" +
               ".qr-container { text-align: center; margin: 20px 0; }" +
               ".code-box { background: white; border: 2px dashed #1976d2; " +
               "padding: 15px; margin: 20px 0; border-radius: 8px; " +
               "font-family: monospace; font-size: 18px; font-weight: bold; }" +
               ".info-box { background: #e3f2fd; padding: 15px; border-radius: 5px; margin: 15px 0; }" +
               ".warning { background: #fff3cd; border-left: 4px solid #ffc107; " +
               "padding: 15px; margin: 15px 0; }" +
               "</style>" +
               "</head>" +
               "<body>" +
               "<div class='container'>" +
               "<div class='header'>" +
               "<h1>🎫 Votre billet électronique</h1>" +
               "<p>GoEvent - Réservation confirmée</p>" +
               "</div>" +
               
               "<div class='content'>" +
               "<p>Bonjour <strong>" + userName + "</strong>,</p>" +
               "<p>Votre réservation a été confirmée. Voici votre billet électronique :</p>" +
               
               "<div class='info-box'>" +
               "<h3>Détails de la réservation</h3>" +
               "<p><strong>Événement :</strong> " + qrCode.getEventName() + "</p>" +
               "<p><strong>Nombre de billets :</strong> " + qrCode.getQuantity() + "</p>" +
               "<p><strong>Total payé :</strong> €" + qrCode.getTotalPrice() + "</p>" +
               "<p><strong>Code de confirmation :</strong> " + qrCode.getConfirmationCode() + "</p>" +
               "</div>" +
               
               "<div class='qr-container'>" +
               "<h3>Votre QR Code d'accès</h3>" +
               "<p>Scannez ce code à l'entrée de l'événement :</p>" +
               "<img src='cid:qrcode' alt='QR Code' style='width: 200px; height: 200px;' />" +
               "</div>" +
               
               "<div class='code-box'>" +
               "<p>Code unique pour scan manuel :</p>" +
               "<h2 style='color: #1976d2; margin: 10px 0;'>" + 
               qrCode.getUniqueCode() + 
               "</h2>" +
               "<p style='font-size: 12px; color: #666;'>Donnez ce code à l'organisateur si nécessaire</p>" +
               "</div>" +
               
               "<div class='warning'>" +
               "<h4>⚠️ Instructions importantes</h4>" +
               "<ul>" +
               "<li>Arrivez 30 minutes avant le début de l'événement</li>" +
               "<li>Présentez ce QR code sur votre smartphone ou une impression</li>" +
               "<li>Ayez une pièce d'identité avec vous</li>" +
               "<li>Ce billet est nominatif et non transférable</li>" +
               "</ul>" +
               "</div>" +
               
               "<div style='margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;'>" +
               "<p style='font-size: 12px; color: #666;'>" +
               "Cet email a été envoyé automatiquement. " +
               "Ne répondez pas à cet email.<br>" +
               "Pour toute question, contactez le support : support@eventplatform.com" +
               "</p>" +
               "</div>" +
               
               "<p>Cordialement,<br><strong>L'équipe GoEvent</strong></p>" +
               "</div>" +
               "</div>" +
               "</body>" +
               "</html>";
    }
    
   
    private String buildMultipleQRCodesEmailHTML(String userName, List<QRCode> qrCodes,
                                               String confirmationCode, String eventName,
                                               Integer quantity, Double totalPrice) {
        
        StringBuilder qrCodesHTML = new StringBuilder();
        
        for (int i = 0; i < qrCodes.size(); i++) {
            QRCode qrCode = qrCodes.get(i);
            qrCodesHTML.append("<div class='qr-ticket'>")
                      .append("<h4>Billet ").append(i + 1).append("/").append(quantity).append("</h4>")
                      .append("<div class='code-box'>")
                      .append("<p><strong>Code unique:</strong> ").append(qrCode.getUniqueCode()).append("</p>")
                      .append("<p><strong>ID Ticket:</strong> ").append(qrCode.getTicketNumber()).append("</p>")
                      .append("</div>")
                      .append("</div>");
            
            if (i < qrCodes.size() - 1) {
                qrCodesHTML.append("<hr class='ticket-divider'>");
            }
        }
        
        return "<!DOCTYPE html>" +
               "<html lang='fr'>" +
               "<head>" +
               "<meta charset='UTF-8'>" +
               "<style>" +
               "body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }" +
               ".container { max-width: 800px; margin: 0 auto; background: white; }" +
               ".header { background: linear-gradient(135deg, #1976d2 0%, #42a5f5 100%); " +
               "color: white; padding: 30px; text-align: center; }" +
               ".content { padding: 30px; }" +
               ".qr-ticket { background: #f9f9f9; border: 2px solid #ddd; padding: 20px; margin: 15px 0; border-radius: 8px; }" +
               ".ticket-divider { border: none; border-top: 2px dashed #1976d2; margin: 25px 0; }" +
               ".code-box { background: white; border: 2px solid #1976d2; padding: 15px; margin: 10px 0; " +
               "border-radius: 5px; font-family: monospace; }" +
               ".info-box { background: #e3f2fd; padding: 15px; border-radius: 5px; margin: 15px 0; }" +
               ".warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 15px 0; }" +
               "</style>" +
               "</head>" +
               "<body>" +
               "<div class='container'>" +
               "<div class='header'>" +
               "<h1>🎫 Vos " + quantity + " billets électroniques</h1>" +
               "<p>GoEvent - Réservation confirmée</p>" +
               "</div>" +
               
               "<div class='content'>" +
               "<p>Bonjour <strong>" + userName + "</strong>,</p>" +
               "<p>Votre réservation pour " + quantity + " billet(s) a été confirmée. " +
               "Voici vos billets électroniques :</p>" +
               
               "<div class='info-box'>" +
               "<h3>Détails de la réservation</h3>" +
               "<p><strong>Événement :</strong> " + eventName + "</p>" +
               "<p><strong>Nombre de billets :</strong> " + quantity + "</p>" +
               "<p><strong>Total payé :</strong> €" + totalPrice + "</p>" +
               "<p><strong>Code de confirmation :</strong> " + confirmationCode + "</p>" +
               "</div>" +
               
               "<h3>Vos billets individuels</h3>" +
               "<p>Chaque billet a son propre QR code unique :</p>" +
               
               qrCodesHTML.toString() +
               
               "<div class='warning'>" +
               "<h4>⚠️ Instructions importantes</h4>" +
               "<ul>" +
               "<li><strong>Chaque billet doit être présenté individuellement</strong> à l'entrée</li>" +
               "<li>Chaque QR code peut être utilisé une seule fois</li>" +
               "<li>Arrivez 30 minutes avant le début de l'événement</li>" +
               "<li>Présentez les QR codes sur smartphone ou impression</li>" +
               "<li>Ayez une pièce d'identité avec vous</li>" +
               "</ul>" +
               "</div>" +
               
               "<div style='margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;'>" +
               "<p style='font-size: 12px; color: #666;'>" +
               "Cet email a été envoyé automatiquement. " +
               "Ne répondez pas à cet email.<br>" +
               "Pour toute question, contactez le support : support@eventplatform.com" +
               "</p>" +
               "</div>" +
               
               "<p>Cordialement,<br><strong>L'équipe GoEvent</strong></p>" +
               "</div>" +
               "</div>" +
               "</body>" +
               "</html>";
    }
}