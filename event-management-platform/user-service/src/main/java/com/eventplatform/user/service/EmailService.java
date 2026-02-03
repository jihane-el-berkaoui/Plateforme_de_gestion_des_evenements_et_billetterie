package com.eventplatform.user.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import java.io.UnsupportedEncodingException;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {
    
    private final JavaMailSender mailSender;
    
    @Value("${spring.mail.username:no-reply@eventplatform.com}")
    private String fromEmail;
    
    @Value("${app.frontend.url:http://localhost:3000}")
    private String frontendUrl;
    
    @Async
    public void sendVerificationEmail(String toEmail, String verificationToken, String firstName) {
        try {
            String subject = "Vérifiez votre compte GoEvent";
            String htmlContent = buildVerificationEmailWithToken(firstName, verificationToken);
            
            sendHtmlEmail(toEmail, subject, htmlContent);
            log.info("Verification email sent to: {}", toEmail);
            
        } catch (Exception e) {
            log.error("Failed to send verification email to {}: {}", toEmail, e.getMessage());
        }
    }
    
    @Async
    public void sendWelcomeEmail(String toEmail, String firstName) {
        try {
            String subject = "Bienvenue sur GoEvent !";
            String htmlContent = buildWelcomeEmail(firstName);
            
            sendHtmlEmail(toEmail, subject, htmlContent);
            log.info("Welcome email sent to: {}", toEmail);
            
        } catch (Exception e) {
            log.error("Failed to send welcome email to {}: {}", toEmail, e.getMessage());
        }
    }
    
    @Async
    public void sendPasswordResetEmail(String toEmail, String resetToken, String firstName) {
        try {
            String subject = "Réinitialisation de votre mot de passe GoEvent";
            String htmlContent = buildPasswordResetEmail(firstName, resetToken);
            
            sendHtmlEmail(toEmail, subject, htmlContent);
            log.info("Password reset email sent to: {}", toEmail);
            
        } catch (Exception e) {
            log.error("Failed to send password reset email to {}: {}", toEmail, e.getMessage());
        }
    }
    
   
    private String buildVerificationEmailWithToken(String firstName, String token) {
        return "<!DOCTYPE html>" +
               "<html>" +
               "<head><meta charset='UTF-8'></head>" +
               "<body style='font-family: Arial, sans-serif; line-height: 1.6; background-color: #f4f4f4; padding: 20px;'>" +
               "<div style='max-width: 600px; margin: 0 auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);'>" +
               
               "<!-- Header -->" +
               "<div style='background: linear-gradient(135deg, #1976d2 0%, #42a5f5 100%); color: white; padding: 30px; text-align: center;'>" +
               "<h1 style='margin: 0; font-size: 28px;'>🎫 GoEvent</h1>" +
               "<p style='margin: 10px 0 0 0; font-size: 16px;'>Vérification de compte</p>" +
               "</div>" +
               
               "<!-- Content -->" +
               "<div style='padding: 40px 30px;'>" +
               "<p style='font-size: 18px; color: #333;'>Bonjour <strong>" + firstName + "</strong>,</p>" +
               "<p style='color: #666; font-size: 16px;'>Merci de vous être inscrit sur <strong>GoEvent</strong> !</p>" +
               "<p style='color: #666; font-size: 16px;'>Pour activer votre compte, <strong>copiez le code de vérification ci-dessous</strong> et collez-le dans la page de vérification :</p>" +
               
               "<!-- Token Box -->" +
               "<div style='background: #f8f9fa; border: 2px solid #1976d2; border-radius: 8px; padding: 20px; margin: 30px 0; text-align: center;'>" +
               "<p style='margin: 0 0 10px 0; color: #666; font-size: 14px; font-weight: bold;'>CODE DE VÉRIFICATION</p>" +
               "<div style='background: white; border: 1px dashed #1976d2; border-radius: 5px; padding: 15px; margin: 10px 0;'>" +
               "<code style='font-size: 18px; color: #1976d2; font-weight: bold; letter-spacing: 2px; word-break: break-all;'>" +
               token +
               "</code>" +
               "</div>" +
               "<p style='margin: 10px 0 0 0; color: #999; font-size: 12px;'>Cliquez sur le code pour le sélectionner puis Ctrl+C pour copier</p>" +
               "</div>" +
               
               "<!-- Instructions -->" +
               "<div style='background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 5px;'>" +
               "<p style='margin: 0; color: #856404; font-size: 14px;'><strong>📋 Instructions :</strong></p>" +
               "<ol style='margin: 10px 0 0 0; padding-left: 20px; color: #856404; font-size: 14px;'>" +
               "<li>Retournez sur la page de vérification de GoEvent</li>" +
               "<li>Collez ce code dans le champ prévu</li>" +
               "<li>Cliquez sur \"Vérifier\"</li>" +
               "</ol>" +
               "</div>" +
               
               "<!-- Warning -->" +
               "<div style='background: #f8d7da; border-left: 4px solid #dc3545; padding: 15px; margin: 20px 0; border-radius: 5px;'>" +
               "<p style='margin: 0; color: #721c24; font-size: 14px;'>" +
               "⚠️ <strong>Important :</strong> Ce code expire dans <strong>24 heures</strong>. " +
               "Ne le partagez avec personne." +
               "</p>" +
               "</div>" +
               
               "<p style='color: #666; font-size: 14px; margin-top: 30px;'>Cordialement,<br>" +
               "<strong>L'équipe GoEvent</strong></p>" +
               "</div>" +
               
               "<!-- Footer -->" +
               "<div style='background: #f8f9fa; padding: 20px 30px; text-align: center; border-top: 1px solid #e0e0e0;'>" +
               "<p style='margin: 0; color: #999; font-size: 12px;'>" +
               "Vous avez reçu cet email car vous vous êtes inscrit sur GoEvent.<br>" +
               "Si vous n'êtes pas à l'origine de cette inscription, ignorez ce message." +
               "</p>" +
               "</div>" +
               
               "</div>" +
               "</body>" +
               "</html>";
    }
    
    private String buildWelcomeEmail(String firstName) {
        return "<!DOCTYPE html>" +
               "<html>" +
               "<head><meta charset='UTF-8'></head>" +
               "<body style='font-family: Arial, sans-serif; line-height: 1.6;'>" +
               "<div style='max-width: 600px; margin: 0 auto; padding: 20px;'>" +
               "<div style='background: #4CAF50; color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0;'>" +
               "<h1 style='margin: 0;'>🎉 Bienvenue !</h1>" +
               "</div>" +
               "<div style='background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;'>" +
               "<p>Bonjour <strong>" + firstName + "</strong>,</p>" +
               "<p>Félicitations ! Votre compte a été activé avec succès.</p>" +
               "<p>Vous pouvez maintenant :</p>" +
               "<ul>" +
               "<li>📅 Explorer tous nos événements</li>" +
               "<li>🎫 Réserver vos billets en ligne</li>" +
               "<li>👤 Gérer vos réservations</li>" +
               "</ul>" +
               "<p style='text-align: center; margin: 30px 0;'>" +
               "<a href='" + frontendUrl + "/login' style='background: #4CAF50; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;'>" +
               "Se connecter" +
               "</a>" +
               "</p>" +
               "<p>Cordialement,<br>L'équipe GoEvent</p>" +
               "</div>" +
               "</div>" +
               "</body>" +
               "</html>";
    }
    
    private String buildPasswordResetEmail(String firstName, String token) {
        return "<!DOCTYPE html>" +
               "<html>" +
               "<head><meta charset='UTF-8'></head>" +
               "<body style='font-family: Arial, sans-serif; line-height: 1.6;'>" +
               "<div style='max-width: 600px; margin: 0 auto; padding: 20px;'>" +
               "<div style='background: #FF9800; color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0;'>" +
               "<h1 style='margin: 0;'>Réinitialisation de mot de passe</h1>" +
               "</div>" +
               "<div style='background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;'>" +
               "<p>Bonjour <strong>" + firstName + "</strong>,</p>" +
               "<p>Vous avez demandé à réinitialiser votre mot de passe GoEvent.</p>" +
               "<p>Cliquez sur le lien ci-dessous pour créer un nouveau mot de passe :</p>" +
               "<p style='text-align: center; margin: 30px 0;'>" +
               "<a href='" + frontendUrl + "/reset-password/" + token + "' style='background: #FF9800; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;'>" +
               "Réinitialiser mon mot de passe" +
               "</a>" +
               "</p>" +
               "<p><strong>Attention :</strong> Ce lien expire dans 1 heure.</p>" +
               "<p>Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.</p>" +
               "<p>Cordialement,<br>L'équipe GoEvent</p>" +
               "</div>" +
               "</div>" +
               "</body>" +
               "</html>";
    }
    
    private void sendHtmlEmail(String to, String subject, String htmlContent) throws MessagingException, UnsupportedEncodingException {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
        
        helper.setFrom(fromEmail, "GoEvent Platform");
        helper.setTo(to);
        helper.setSubject(subject);
        helper.setText(htmlContent, true);
        
        mailSender.send(message);
    }
}