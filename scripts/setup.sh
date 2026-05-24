#!/bin/bash

# ============================================
# Smart Traffic Platform - Script d'installation
# ============================================

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}===========================================${NC}"
echo -e "${BLUE}  Smart Traffic Platform - Setup${NC}"
echo -e "${BLUE}===========================================${NC}"
echo ""

# Verifier les prerequis
echo -e "${YELLOW}[1/5] Verification des prerequis...${NC}"

if ! command -v docker &> /dev/null; then
    echo -e "${RED}Docker n'est pas installe. Veuillez l'installer:${NC}"
    echo "https://docs.docker.com/get-docker/"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}Docker Compose n'est pas installe.${NC}"
    exit 1
fi

if ! command -v node &> /dev/null; then
    echo -e "${RED}Node.js n'est pas installe. Veuillez l'installer:${NC}"
    echo "https://nodejs.org/"
    exit 1
fi

echo -e "${GREEN}✓ Tous les prerequis sont satisfaits${NC}"

# Demarrer les bases de donnees
echo ""
echo -e "${YELLOW}[2/5] Demarrage des bases de donnees...${NC}"
cd backend
docker-compose up -d auth-db vehicle-db traffic-db incident-db notification-db redis
echo -e "${GREEN}✓ Bases de donnees demarrees${NC}"

# Attendre que MySQL soit pret
echo ""
echo -e "${YELLOW}[3/5] Attente de l'initialisation des bases...${NC}"
sleep 15
echo -e "${GREEN}✓ Bases de donnees pretes${NC}"

# Installer les dependances backend
echo ""
echo -e "${YELLOW}[4/5] Installation des dependances backend...${NC}"

cd services/auth-service
npm install
echo -e "${GREEN}✓ Auth Service${NC}"

cd ../vehicle-service
npm install
echo -e "${GREEN}✓ Vehicle Service${NC}"

cd ../traffic-service
npm install
echo -e "${GREEN}✓ Traffic Service${NC}"

cd ../incident-service
npm install
echo -e "${GREEN}✓ Incident Service${NC}"

cd ../notification-service
npm install
echo -e "${GREEN}✓ Notification Service${NC}"

cd ../../gateway
npm install
echo -e "${GREEN}✓ Gateway${NC}"

# Installer les dependances frontend
echo ""
echo -e "${YELLOW}[5/5] Installation des dependances frontend...${NC}"
cd ../../frontend
npm install
echo -e "${GREEN}✓ Frontend${NC}"

echo ""
echo -e "${GREEN}===========================================${NC}"
echo -e "${GREEN}  Installation terminee avec succes!${NC}"
echo -e "${GREEN}===========================================${NC}"
echo ""
echo -e "${BLUE}Pour demarrer:${NC}"
echo "  1. Terminal 1: cd backend && docker-compose up -d"
echo "  2. Terminal 2: cd backend/services/auth-service && npm run dev"
echo "  3. Terminal 3: cd backend/services/vehicle-service && npm run dev"
echo "  4. Terminal 4: cd backend/services/traffic-service && npm run dev"
echo "  5. Terminal 5: cd backend/services/incident-service && npm run dev"
echo "  6. Terminal 6: cd backend/services/notification-service && npm run dev"
echo "  7. Terminal 7: cd backend/gateway && npm run dev"
echo "  8. Terminal 8: cd frontend && npm run dev"
echo ""
echo -e "${BLUE}Ou utilisez Docker Compose:${NC}"
echo "  cd backend && docker-compose up -d"
echo ""
echo -e "${BLUE}Acces:${NC}"
echo "  Frontend: http://localhost:3000"
echo "  API:    http://localhost:4000/graphql"
echo "  Login:  admin@smarttraffic.tn / admin123"
