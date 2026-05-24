# Smart Traffic Platform

Plateforme intelligente de gestion du trafic urbain realisee avec une architecture microservices, une API Gateway GraphQL, JWT, MySQL, Redis et un dashboard React.

## Architecture

- Backend: Node.js + Express + Apollo GraphQL Federation
- Frontend: React + Vite + Material UI + Leaflet
- Base de donnees: MySQL, une base par service
- Cache / temps reel: Redis + WebSocket pour les notifications
- Deploiement local: Docker Compose

## Services

| Service | Port | Role |
| --- | --- | --- |
| API Gateway | 4000 | Point d'entree GraphQL |
| Auth Service | 4001 | Inscription, connexion, JWT, roles ADMIN/OPERATOR |
| Vehicle Service | 4002 | Vehicules, positions GPS, historique |
| Traffic Service | 4003 | Zones, densite, congestion |
| Incident Service | 4004 | Declaration et suivi des incidents |
| Notification Service | 4005 | Notifications et WebSocket |

## Prerequis

- Node.js 18 ou plus
- Docker Desktop
- Docker Compose

Si `npm run ...` affiche une erreur du type `Cannot find module ... npm-cli.js`, l'installation Node/NVM de Windows est mal referencee. Solution rapide avec NVM Windows:

```powershell
nvm list
nvm use 20
node -v
npm -v
```

## Demarrage recommande avec Docker

Ouvrir un terminal dans la racine du projet:

```powershell
cd C:\Users\admin\Downloads\smart-traffic-platform-complete
cd backend
docker compose up -d
```

Attendre 1 a 2 minutes. Les conteneurs installent les dependances et synchronisent les tables MySQL au premier demarrage.

Verifier les conteneurs:

```powershell
docker compose ps
```

Demarrer le frontend dans un deuxieme terminal:

```powershell
cd C:\Users\admin\Downloads\smart-traffic-platform-complete\frontend
npm install
npm run dev
```

Acces:

- Frontend: http://localhost:3000
- API Gateway GraphQL: http://localhost:4000/graphql
- Compte admin: `admin@smarttraffic.tn`
- Mot de passe: `admin123`

## Donnees de demonstration

Quand les services backend sont demarres, lancer:

```powershell
cd C:\Users\admin\Downloads\smart-traffic-platform-complete
node scripts\seed-data.js
```

Le script cree des vehicules, des zones, des incidents et calcule des densites de trafic.

## Tests unitaires

Les tests Jest se trouvent dans le backend, par exemple:

```text
backend/services/auth-service/src/graphql/resolvers.test.js
```

Pour lancer les tests:

```powershell
cd C:\Users\admin\Downloads\smart-traffic-platform-complete\backend
npm test
```

Les tests actuels verifient le service d'authentification:

- inscription utilisateur;
- refus d'un email deja utilise;
- connexion avec identifiants valides;
- refus d'un mauvais mot de passe.

## Requetes GraphQL de test

Login:

```graphql
mutation {
  login(input: { email: "admin@smarttraffic.tn", password: "admin123" }) {
    token
    user {
      id
      email
      role
    }
  }
}
```

Ensuite ajouter le header:

```text
Authorization: Bearer VOTRE_TOKEN
```

Lister les vehicules:

```graphql
query {
  vehicles {
    id
    plateNumber
    brand
    model
    type
    lastPosition {
      latitude
      longitude
      speed
    }
  }
}
```

Lister les zones:

```graphql
query {
  zones {
    id
    name
    density
    vehicleCount
    averageSpeed
    coordinates {
      lat
      lng
    }
  }
}
```

Declarer un incident:

```graphql
mutation {
  declareIncident(input: {
    type: ACCIDENT
    title: "Accident centre-ville"
    description: "Collision entre deux voitures"
    latitude: 36.8065
    longitude: 10.1815
    severity: HIGH
  }) {
    id
    title
    status
  }
}
```

## Arret du projet

```powershell
cd C:\Users\admin\Downloads\smart-traffic-platform-complete\backend
docker compose down
```

Pour supprimer aussi les donnees MySQL locales:

```powershell
docker compose down -v
```

## Livrables

- Code source complet
- Docker Compose: [backend/docker-compose.yml](backend/docker-compose.yml)
- Documentation GraphQL: [docs/api/graphql-schema.md](docs/api/graphql-schema.md)
- Diagrammes UML: [docs/uml](docs/uml)
- Collection Postman: [postman/Smart-Traffic-GraphQL.postman_collection.json](postman/Smart-Traffic-GraphQL.postman_collection.json)
