package com.eventplatform.event.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Mono;

import java.util.Map;

@RestController
@RequestMapping("/fallback")
public class FallbackController {

    @GetMapping("/events")
    public Mono<Map<String, Object>> eventsFallback() {
        return Mono.just(Map.of(
            "error", "Event Service is currently unavailable",
            "message", "Please try again later",
            "timestamp", System.currentTimeMillis()
        ));
    }

    @GetMapping("/bookings")
    public Mono<Map<String, Object>> bookingsFallback() {
        return Mono.just(Map.of(
            "error", "Booking Service is currently unavailable",
            "message", "Please try again later",
            "timestamp", System.currentTimeMillis()
        ));
    }

    @GetMapping("/users")
    public Mono<Map<String, Object>> usersFallback() {
        return Mono.just(Map.of(
            "error", "User Service is currently unavailable",
            "message", "Please try again later",
            "timestamp", System.currentTimeMillis()
        ));
    }
}