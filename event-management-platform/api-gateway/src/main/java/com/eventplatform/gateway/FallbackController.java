package com.eventplatform.gateway;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Mono;

import java.util.Map;

@RestController
@RequestMapping("/fallback")
public class FallbackController {

    @GetMapping("/auth")  
    public Mono<Map<String, String>> authFallback() {
        return Mono.just(Map.of(
            "error", "Authentication Service is currently unavailable",
            "message", "Please try again later",
            "service", "auth-service",
            "timestamp", String.valueOf(System.currentTimeMillis())
        ));
    }

    @GetMapping("/events")
    public Mono<Map<String, String>> eventsFallback() {
        return Mono.just(Map.of(
            "error", "Event Service is currently unavailable",
            "message", "Please try again later"
        ));
    }

    @GetMapping("/bookings")
    public Mono<Map<String, String>> bookingsFallback() {
        return Mono.just(Map.of(
            "error", "Booking Service is currently unavailable",
            "message", "Please try again later"
        ));
    }

    @GetMapping("/users")
    public Mono<Map<String, String>> usersFallback() {
        return Mono.just(Map.of(
            "error", "User Service is currently unavailable",
            "message", "Please try again later"
        ));
    }
}