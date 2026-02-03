@echo off
echo Arret de tous les services...
taskkill /FI "WINDOWTITLE eq Config Server" /F > nul 2>&1
taskkill /FI "WINDOWTITLE eq Eureka Server" /F > nul 2>&1
taskkill /FI "WINDOWTITLE eq User Service" /F > nul 2>&1
taskkill /FI "WINDOWTITLE eq Event Service" /F > nul 2>&1
taskkill /FI "WINDOWTITLE eq Booking Service" /F > nul 2>&1
taskkill /FI "WINDOWTITLE eq Checkin Service" /F > nul 2>&1
taskkill /FI "WINDOWTITLE eq API Gateway" /F > nul 2>&1
echo Tous les services ont ete arretes.
pause