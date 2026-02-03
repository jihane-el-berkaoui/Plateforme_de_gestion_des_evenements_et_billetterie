package com.eventplatform.user.controller;

import com.eventplatform.user.service.EmailService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/test")
@RequiredArgsConstructor
public class EmailTestController {
    
    private final EmailService emailService;
    
    @PostMapping("/email")
    public ResponseEntity<String> sendTestEmail(@RequestParam String email) {
        try {
            emailService.sendVerificationEmail(email, "test-token-123", "Test User");
            return ResponseEntity.ok("Email de test envoyé à: " + email);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Erreur: " + e.getMessage());
        }
    }
}