package com.eventplatform.event.config;

import org.springframework.amqp.core.*;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.fasterxml.jackson.databind.SerializationFeature;

@Configuration
public class RabbitMQConfig {
    
    public static final String EVENT_EXCHANGE = "event.exchange";
    public static final String EVENT_CREATED_QUEUE = "event.created.queue";
    public static final String EVENT_UPDATED_QUEUE = "event.updated.queue";
    public static final String EVENT_DELETED_QUEUE = "event.deleted.queue";
    
    @Bean
    public TopicExchange eventExchange() {
        return new TopicExchange(EVENT_EXCHANGE);
    }
    
    @Bean
    public Queue eventCreatedQueue() {
        return new Queue(EVENT_CREATED_QUEUE, true);
    }
    
    @Bean
    public Queue eventUpdatedQueue() {
        return new Queue(EVENT_UPDATED_QUEUE, true);
    }
    
    @Bean
    public Queue eventDeletedQueue() {
        return new Queue(EVENT_DELETED_QUEUE, true);
    }
    
    @Bean
    public Binding eventCreatedBinding() {
        return BindingBuilder.bind(eventCreatedQueue())
                .to(eventExchange())
                .with("event.created");
    }
    
    @Bean
    public Binding eventUpdatedBinding() {
        return BindingBuilder.bind(eventUpdatedQueue())
                .to(eventExchange())
                .with("event.updated");
    }
    
    @Bean
    public Binding eventDeletedBinding() {
        return BindingBuilder.bind(eventDeletedQueue())
                .to(eventExchange())
                .with("event.deleted");
    }
    
    @Bean
    public MessageConverter jsonMessageConverter() {
        ObjectMapper objectMapper = new ObjectMapper();
        objectMapper.registerModule(new JavaTimeModule());
        objectMapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
        
        return new Jackson2JsonMessageConverter(objectMapper);
    }
    
    @Bean
    public RabbitTemplate rabbitTemplate(ConnectionFactory connectionFactory) {
        RabbitTemplate rabbitTemplate = new RabbitTemplate(connectionFactory);
        rabbitTemplate.setMessageConverter(jsonMessageConverter());
        return rabbitTemplate;
    }
}