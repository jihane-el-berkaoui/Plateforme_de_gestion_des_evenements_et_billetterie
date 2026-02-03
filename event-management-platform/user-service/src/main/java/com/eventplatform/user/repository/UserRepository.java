package com.eventplatform.user.repository;

import com.eventplatform.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    
    Optional<User> findByEmail(String email);
    
    boolean existsByEmail(String email);
    
    Optional<User> findByVerificationToken(String verificationToken);
    List<User> findByRole(User.UserRole role);
    Optional<User> findByResetToken(String resetToken);
}