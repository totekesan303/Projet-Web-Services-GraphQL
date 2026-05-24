#!/bin/bash

echo "Arret de Smart Traffic Platform..."

# Arreter les services Node
for service in auth-service vehicle-service traffic-service incident-service notification-service gateway frontend; do
    if [ -f /tmp/$service.pid ]; then
        kill $(cat /tmp/$service.pid) 2>/dev/null || true
        rm /tmp/$service.pid
        echo "✓ $service arrete"
    fi
done

# Arreter Docker
cd backend
docker-compose down
cd ..

echo ""
echo "✓ Tous les services sont arretes"
