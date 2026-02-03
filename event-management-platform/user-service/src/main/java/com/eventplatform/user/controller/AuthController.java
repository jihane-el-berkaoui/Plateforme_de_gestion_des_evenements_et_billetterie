package com.eventplatform.user.controller;

import com.eventplatform.user.entity.User;
import com.eventplatform.user.service.UserService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {
    
    private final UserService userService;
    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@Valid @RequestBody LoginRequest request) {
        try {
            User user = userService.authenticate(request.getEmail(), request.getPassword());
            
            Map<String, Object> response = new HashMap<>();
            response.put("token", "demo-token-" + user.getId()); 
            response.put("user", user);
            response.put("message", "Login successful");
            
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
        }
    }
    
  @PostMapping("/register")
public ResponseEntity<Map<String, Object>> register(@Valid @RequestBody RegistrationRequest request) {
    try {
        User user = new User();
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setEmail(request.getEmail());
        user.setPassword(request.getPassword());
        user.setPhone(request.getPhone());
        user.setAddress(request.getAddress());
        user.setRole(request.getRole()); 
        
        User savedUser = userService.register(user);
        
        Map<String, Object> response = new HashMap<>();
        response.put("message", "User registered successfully. Please verify your email.");
        response.put("userId", savedUser.getId());
        response.put("role", savedUser.getRole());
        response.put("verificationToken", savedUser.getVerificationToken());
        
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    } catch (RuntimeException e) {
        Map<String, Object> error = new HashMap<>();
        error.put("error", e.getMessage());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
    }
}

@Data
@NoArgsConstructor
@AllArgsConstructor
public static class RegistrationRequest {
    @NotBlank(message = "First name is required")
    private String firstName;
    
    @NotBlank(message = "Last name is required")
    private String lastName;
    
    @NotBlank(message = "Email is required")
    @Email(message = "Email should be valid")
    private String email;
    
    @NotBlank(message = "Password is required")
    @Size(min = 6, message = "Password must be at least 6 characters")
    private String password;
    
    @NotNull(message = "Role is required")
    private User.UserRole role = User.UserRole.CLIENT; 
    
    private String phone;
    private String address;
}
    
    @GetMapping("/verify/{token}")
    public ResponseEntity<Map<String, Object>> verifyEmail(@PathVariable String token) {
        try {
            userService.verifyEmail(token);
            
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Email verified successfully");
            response.put("verified", true);
            
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }
    
    @GetMapping("/profile")
    public ResponseEntity<User> getProfile(@RequestHeader("Authorization") String token) {
        Long userId = extractUserIdFromToken(token);
        User user = userService.getUserById(userId);
        return ResponseEntity.ok(user);
    }
    
    private Long extractUserIdFromToken(String token) {
        if (token != null && token.startsWith("Bearer ")) {
            token = token.substring(7); 
        }
        
        if (token != null && token.startsWith("demo-token-")) {
            try {
                String idStr = token.substring(11); 
                return Long.parseLong(idStr);
            } catch (NumberFormatException e) {
                throw new RuntimeException("Invalid token format");
            }
        }
        

        throw new RuntimeException("Invalid token");
    }
    

    
    @PostMapping("/forgot-password")
    public ResponseEntity<Map<String, Object>> forgotPassword(@RequestBody ForgotPasswordRequest request) {
        try {
            userService.requestPasswordReset(request.getEmail());
            
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Un email de réinitialisation a été envoyé");
            
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }
    
    @PostMapping("/reset-password")
    public ResponseEntity<Map<String, Object>> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        try {
            userService.resetPassword(request.getToken(), request.getNewPassword());
            
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Mot de passe réinitialisé avec succès");
            
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ForgotPasswordRequest {
        @NotBlank(message = "Email is required")
        @Email(message = "Email should be valid")
        private String email;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ResetPasswordRequest {
        @NotBlank(message = "Token is required")
        private String token;
        
        @NotBlank(message = "New password is required")
        @Size(min = 6, message = "Password must be at least 6 characters")
        private String newPassword;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class LoginRequest {
        @NotBlank(message = "Email is required")
        @Email(message = "Email should be valid")
        private String email;
        
        @NotBlank(message = "Password is required")
        private String password;
    }
}