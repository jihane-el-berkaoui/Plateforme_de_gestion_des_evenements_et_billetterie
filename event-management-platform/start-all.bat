@echo off
echo ========================================
echo      Demarrage Plateforme Evenement
echo ========================================
echo.

REM 1. Configuration Server
echo [1/7] Demarrage Config Server...
start "Config Server" cmd /k "cd config-server && mvn spring-boot:run"
timeout /t 10 /nobreak > nul
echo ✓ Config Server lance sur localhost:8888
echo.

REM 2. Eureka Server
echo [2/7] Demarrage Eureka Server...
start "Eureka Server" cmd /k "cd eureka-server && mvn spring-boot:run"
timeout /t 15 /nobreak > nul
echo ✓ Eureka Server lance sur localhost:8761
echo.

REM 3. User Service
echo [3/7] Demarrage User Service...
start "User Service" cmd /k "cd user-service && mvn spring-boot:run"
timeout /t 10 /nobreak > nul
echo ✓ User Service lance sur localhost:8083
echo.

REM 4. Event Service
echo [4/7] Demarrage Event Service...
start "Event Service" cmd /k "cd event-service && mvn spring-boot:run"
timeout /t 10 /nobreak > nul
echo ✓ Event Service lance sur localhost:8081
echo.

REM 5. Booking Service
echo [5/7] Demarrage Booking Service...
start "Booking Service" cmd /k "cd booking-service && mvn spring-boot:run"
timeout /t 10 /nobreak > nul
echo ✓ Booking Service lance sur localhost:8082
echo.

REM 6. Checkin Service (NOUVEAU)
echo [6/7] Demarrage Checkin Service...
start "Checkin Service" cmd /k "cd checkin-service && mvn spring-boot:run"
timeout /t 10 /nobreak > nul
echo ✓ Checkin Service lance sur localhost:8084
echo.

REM 7. API Gateway
echo [7/7] Demarrage API Gateway...
start "API Gateway" cmd /k "cd api-gateway && mvn spring-boot:run"
timeout /t 10 /nobreak > nul
echo ✓ API Gateway lance sur localhost:8080
echo.

echo ========================================
echo      Tous les services sont lances !
echo ========================================
echo.
echo 📍 Points d'acces :
echo   - API Gateway : http://localhost:8080
echo   - Eureka Dashboard : http://localhost:8761
echo   - Config Server : http://localhost:8888
echo.
echo 📋 Services :
echo   - User Service : http://localhost:8083
echo   - Event Service : http://localhost:8081
echo   - Booking Service : http://localhost:8082
echo   - Checkin Service : http://localhost:8084
echo.
echo 🆕 Nouvelles fonctionnalites :
echo   - Types de billets (VIP, Standard)
echo   - Systeme de remboursements
echo   - Check-in avec QR codes
echo.
pause