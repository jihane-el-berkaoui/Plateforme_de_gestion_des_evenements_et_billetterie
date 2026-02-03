# 🎫 Plateforme de Gestion d'Événements - Microservices

## 📋 Architecture

- **Eureka Server** (8761) - Service Registry
- **Config Server** (8888) - Configuration centralisée
- **API Gateway** (8080) - Point d'entrée unique
- **Event Service** (8081) - Gestion des événements
- **Booking Service** (8082) - Gestion des réservations
- **User Service** (8083) - Gestion des utilisateurs

## 🚀 Démarrage
```bash
docker-compose up --build
```

## 🧪 Tests Postman

### 1. Créer un événement
```http
POST http://localhost:8080/api/events
Content-Type: application/json

{
  "name": "Concert Rock 2025",
  "description": "Un concert exceptionnel",
  "date": "2025-06-15T20:00:00",
  "location": "Stade National",
  "capacity": 5000,
  "availableTickets": 5000,
  "price": 50.0,
  "category": "CONCERT",
  "status": "ACTIVE"
}
```

### 2. Lister les événements
```http
GET http://localhost:8080/api/events
```

### 3. Créer une réservation
```http
POST http://localhost:8080/api/bookings
Content-Type: application/json

{
  "eventId": 1,
  "userId": 1,
  "quantity": 2
}
```

### 4. Lister les réservations
```http
GET http://localhost:8080/api/bookings
```