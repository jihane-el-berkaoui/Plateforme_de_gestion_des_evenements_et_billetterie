package com.eventplatform.checkin.config;

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
    
    public static final String CHECKIN_EXCHANGE = "checkin.exchange";
    public static final String CHECKIN_QUEUE = "checkin.queue";
    public static final String CHECKIN_ROUTING_KEY = "checkin.event";
    
    @Bean
    public TopicExchange checkinExchange() {
        return new TopicExchange(CHECKIN_EXCHANGE);
    }
    
    @Bean
    public Queue checkinQueue() {
        return new Queue(CHECKIN_QUEUE, true);
    }
    
    @Bean
    public Binding checkinBinding() {
        return BindingBuilder.bind(checkinQueue())
                .to(checkinExchange())
                .with(CHECKIN_ROUTING_KEY);
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