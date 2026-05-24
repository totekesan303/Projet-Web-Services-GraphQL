#!/bin/bash

# ============================================
# Demarrage de tous les services en parallele
# ============================================

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}Demarrage de Smart Traffic Platform...${NC}"

# Fonction pour demarrer un service
start_service() {
    local name=$1
    local dir=$2
    local port=$3

    echo -e "${YELLOW}Demarrage de $name (port $port)...${NC}"
    cd "$dir"
    npm run dev > /tmp/$name.log 2>&1 &
    echo $! > /tmp/$name.pid
    echo -e "${GREEN}✓ $name demarre (PID: $(cat /tmp/$name.pid))${NC}"
}

# Demarrer les bases de donnees
echo -e "${YELLOW}Demarrage des bases de donnees...${NC}"
cd backend
docker-compose up -d auth-db vehicle-db traffic-db incident-db notification-db redis
cd ..

# Attendre que les DB soient pretes
echo -e "${YELLOW}Attente de l'initialisation (15s)...${NC}"
sleep 15

# Demarrer les services
start_service "auth-service" "backend/services/auth-service" "4001"
start_service "vehicle-service" "backend/services/vehicle-service" "4002"
start_service "traffic-service" "backend/services/traffic-service" "4003"
start_service "incident-service" "backend/services/incident-service" "4004"
start_service "notification-service" "backend/services/notification-service" "4005"

# Attendre que les services soient prets
echo -e "${YELLOW}Attente des services (10s)...${NC}"
sleep 10

# Demarrer la gateway
start_service "gateway" "backend/gateway" "4000"

# Attendre la gateway
echo -e "${YELLOW}Attente de la gateway (5s)...${NC}"
sleep 5

# Demarrer le frontend
echo -e "${YELLOW}Demarrage du frontend...${NC}"
cd frontend
npm run dev &
echo $! > /tmp/frontend.pid
echo -e "${GREEN}✓ Frontend demarre${NC}"

echo ""
echo -e "${GREEN}===========================================${NC}"
echo -e "${GREEN}  Tous les services sont demarres!${NC}"
echo -e "${GREEN}===========================================${NC}"
echo ""
echo -e "${BLUE}Acces:${NC}"
echo "  Frontend: http://localhost:3000"
echo "  API:    http://localhost:4000/graphql"
echo ""
echo -e "${BLUE}Pour arreter:${NC}"
echo "  ./scripts/stop-all.sh"
