package com.eventplatform.checkin.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.JavaMailSenderImpl;

import java.util.Properties;

@Configuration
public class EmailConfig {
    
    @Bean
    public JavaMailSender javaMailSender() {
        try {
            JavaMailSenderImpl mailSender = new JavaMailSenderImpl();
            
            mailSender.setHost("smtp.gmail.com");
            mailSender.setPort(587);
            mailSender.setUsername("iot22926@gmail.com");
            mailSender.setPassword("xthqghulkqockwnk");
            
            Properties props = mailSender.getJavaMailProperties();
            props.put("mail.transport.protocol", "smtp");
            props.put("mail.smtp.auth", "true");
            props.put("mail.smtp.starttls.enable", "true");
            props.put("mail.smtp.starttls.required", "true");
            props.put("mail.debug", "true");
            props.put("mail.smtp.connectiontimeout", "5000");
            props.put("mail.smtp.timeout", "5000");
            props.put("mail.smtp.writetimeout", "5000");
            
            mailSender.testConnection();
            
            return mailSender;
            
        } catch (Exception e) {
            System.err.println("⚠️ Email configuration failed: " + e.getMessage());
            System.err.println("ℹ️ Email feature will be disabled");
            return null; 
        }
    }
}