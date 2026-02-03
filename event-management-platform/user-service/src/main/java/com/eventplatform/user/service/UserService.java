package com.eventplatform.user.service;

import com.eventplatform.user.dto.UserUpdateDTO;
import com.eventplatform.user.entity.User;
import com.eventplatform.user.entity.User.UserRole;
import com.eventplatform.user.exception.UserNotFoundException;
import com.eventplatform.user.repository.UserRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserService {
    
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;
    
    @Transactional
    public User register(User user) {
        if (userRepository.existsByEmail(user.getEmail())) {
            throw new RuntimeException("Un compte avec cet email existe déjà");
        }
        
        if (user.getRole() == null) {
            user.setRole(User.UserRole.CLIENT);
        }
        
        log.info("📝 Création d'un compte {}: {}", user.getRole(), user.getEmail());
        
        String verificationToken = UUID.randomUUID().toString();
        log.info("🔑 Token généré: {}", verificationToken);
        
        user.setVerificationToken(verificationToken);
        user.setTokenExpiryDate(LocalDateTime.now().plusHours(24));
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        user.setEnabled(false);
        
        User savedUser = userRepository.save(user);
        
        User verifyInDb = userRepository.findById(savedUser.getId()).orElse(null);
        if (verifyInDb != null) {
            log.info("✅ Utilisateur sauvegardé avec token: {}", verifyInDb.getVerificationToken());
        } else {
            log.error("❌ ERREUR: Utilisateur non trouvé après sauvegarde!");
        }
        
        try {
            emailService.sendVerificationEmail(
                savedUser.getEmail(), 
                verificationToken, 
                savedUser.getFirstName()
            );
            log.info("📧 Email envoyé à: {}", savedUser.getEmail());
        } catch (Exception e) {
            log.error("⚠️ Échec d'envoi d'email: {}", e.getMessage());
        }
        
        return savedUser;
    }
    
    @Transactional
    public void verifyEmail(String token) {
        log.info("🔍 Recherche du token: {}", token);
        
        User userByToken = userRepository.findByVerificationToken(token).orElse(null);
        
        if (userByToken != null) {
            log.info("✅ Utilisateur trouvé par token: {} ({})", userByToken.getEmail(), userByToken.getId());
            
            if (userByToken.getTokenExpiryDate().isBefore(LocalDateTime.now())) {
                log.error("⏰ Token expiré pour: {}", userByToken.getEmail());
                throw new RuntimeException("Le token de vérification a expiré");
            }
            
            userByToken.setEnabled(true);
            userByToken.setVerificationToken(null);
            userByToken.setTokenExpiryDate(null);
            
            userRepository.save(userByToken);
            log.info("✅ Compte activé: {}", userByToken.getEmail());
            
            try {
                emailService.sendWelcomeEmail(userByToken.getEmail(), userByToken.getFirstName());
            } catch (Exception e) {
                log.warn("Échec d'envoi d'email de bienvenue: {}", e.getMessage());
            }
            
            return;
        }
        
        log.error("❌ Token non trouvé en base: {}", token);
        throw new RuntimeException("Token de vérification invalide ou déjà utilisé");
    }
    
    public User authenticate(String email, String password) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Email ou mot de passe incorrect"));
        
        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new RuntimeException("Email ou mot de passe incorrect");
        }
        
        if (!user.isEnabled()) {
            throw new RuntimeException("Veuillez vérifier votre email avant de vous connecter");
        }
        
        return user;
    }
    
    @Transactional
    public void requestPasswordReset(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Aucun compte trouvé avec cet email"));
        
        String resetToken = UUID.randomUUID().toString();
        user.setResetToken(resetToken);
        user.setResetTokenExpiry(LocalDateTime.now().plusHours(1));
        
        userRepository.save(user);
        
        try {
            emailService.sendPasswordResetEmail(
                user.getEmail(), 
                resetToken, 
                user.getFirstName()
            );
        } catch (Exception e) {
            log.warn("Échec d'envoi d'email de réinitialisation: {}", e.getMessage());
        }
    }
    
    @Transactional
    public void resetPassword(String token, String newPassword) {
        User user = userRepository.findByResetToken(token)
                .orElseThrow(() -> new RuntimeException("Token de réinitialisation invalide"));
        
        if (user.getResetTokenExpiry().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Le token de réinitialisation a expiré");
        }
        
        user.setPassword(passwordEncoder.encode(newPassword));
        user.setResetToken(null);
        user.setResetTokenExpiry(null);
        
        userRepository.save(user);
    }
    
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }
    
    public User getUserById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new UserNotFoundException("User not found with id: " + id));
    }
    
    public User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("User not found with email: " + email));
    }
    
    public List<User> getUsersByRole(User.UserRole role) {
        return userRepository.findByRole(role);
    }
    
    @Transactional
    public User createUser(User user) {
        if (userRepository.existsByEmail(user.getEmail())) {
            throw new RuntimeException("User already exists with email: " + user.getEmail());
        }
        
        User savedUser = userRepository.save(user);
        log.info("User created with id: {}", savedUser.getId());
        
        return savedUser;
    }
    
@Transactional
public User updateUser(Long id, UserUpdateDTO userUpdateDTO) {
    log.info("Updating user {} with data: {}", id, userUpdateDTO);
    
    User user = userRepository.findById(id)
            .orElseThrow(() -> new UserNotFoundException("User not found with id: " + id));
    
    String existingPassword = user.getPassword();
    Boolean existingEnabled = user.isEnabled();
    String existingVerificationToken = user.getVerificationToken();
    LocalDateTime existingTokenExpiryDate = user.getTokenExpiryDate();
    String existingResetToken = user.getResetToken();
    LocalDateTime existingResetTokenExpiry = user.getResetTokenExpiry();
    LocalDateTime existingCreatedAt = user.getCreatedAt();
    
    if (userUpdateDTO.getFirstName() != null) {
        user.setFirstName(userUpdateDTO.getFirstName());
    }
    if (userUpdateDTO.getLastName() != null) {
        user.setLastName(userUpdateDTO.getLastName());
    }
    
    if (userUpdateDTO.getPhone() != null) {
        user.setPhone(userUpdateDTO.getPhone());
    }
    if (userUpdateDTO.getAddress() != null) {
        user.setAddress(userUpdateDTO.getAddress());
    }
    if (userUpdateDTO.getRole() != null) {
        try {
            user.setRole(UserRole.valueOf(userUpdateDTO.getRole()));
        } catch (IllegalArgumentException e) {
            log.warn("Invalid role provided: {}", userUpdateDTO.getRole());
        }
    }
    
    user.setPassword(existingPassword);
    user.setEnabled(existingEnabled);
    user.setVerificationToken(existingVerificationToken);
    user.setTokenExpiryDate(existingTokenExpiryDate);
    user.setResetToken(existingResetToken);
    user.setResetTokenExpiry(existingResetTokenExpiry);
    user.setCreatedAt(existingCreatedAt);
    user.setUpdatedAt(LocalDateTime.now());
    
    User savedUser = userRepository.save(user);
    log.info("User {} updated successfully", id);
    
    return savedUser;
}
    
    @Transactional
    public void deleteUser(Long id) {
        User user = getUserById(id);
        userRepository.delete(user);
        log.info("User deleted: {}", id);
    }
}