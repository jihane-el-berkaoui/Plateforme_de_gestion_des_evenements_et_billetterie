package com.eventplatform.booking.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.springframework.amqp.core.*;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {
    
    public static final String BOOKING_EXCHANGE = "booking.exchange";
    public static final String BOOKING_CREATED_QUEUE = "booking.created.queue";
    public static final String BOOKING_CANCELLED_QUEUE = "booking.cancelled.queue";
    
    public static final String BOOKING_CREATED_ROUTING_KEY = "booking.created";
    public static final String BOOKING_CANCELLED_ROUTING_KEY = "booking.cancelled";
    
    @Bean
    public TopicExchange bookingExchange() {
        return new TopicExchange(BOOKING_EXCHANGE);
    }
    
    @Bean
    public Queue bookingCreatedQueue() {
        return new Queue(BOOKING_CREATED_QUEUE, true);
    }
    
    @Bean
    public Queue bookingCancelledQueue() {
        return new Queue(BOOKING_CANCELLED_QUEUE, true);
    }
    
    @Bean
    public Binding bookingCreatedBinding() {
        return BindingBuilder.bind(bookingCreatedQueue())
                .to(bookingExchange())
                .with(BOOKING_CREATED_ROUTING_KEY);
    }
    
    @Bean
    public Binding bookingCancelledBinding() {
        return BindingBuilder.bind(bookingCancelledQueue())
                .to(bookingExchange())
                .with(BOOKING_CANCELLED_ROUTING_KEY);
    }
    
    @Bean
    public MessageConverter jsonMessageConverter() {
        ObjectMapper objectMapper = new ObjectMapper();
        objectMapper.registerModule(new JavaTimeModule()); 
        objectMapper.configure(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS, false); 
        
        Jackson2JsonMessageConverter converter = new Jackson2JsonMessageConverter(objectMapper);
        converter.setAlwaysConvertToInferredType(true);
        return converter;
    }
    
    @Bean
    public RabbitTemplate rabbitTemplate(ConnectionFactory connectionFactory) {
        RabbitTemplate rabbitTemplate = new RabbitTemplate(connectionFactory);
        rabbitTemplate.setMessageConverter(jsonMessageConverter());
        rabbitTemplate.setChannelTransacted(true); 
        return rabbitTemplate;
    }
}