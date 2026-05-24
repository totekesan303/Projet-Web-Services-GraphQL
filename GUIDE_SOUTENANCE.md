# Guide de soutenance - Smart Traffic Platform

## 1. Idee generale du projet

Ce projet est une plateforme intelligente de gestion du trafic urbain.

L'objectif est de permettre:

- la supervision des vehicules;
- l'enregistrement de positions GPS simulees;
- la creation de zones de circulation;
- l'analyse de la densite du trafic;
- la detection des zones congestionnees;
- la declaration et le suivi des incidents;
- l'envoi et la consultation des notifications.

Le projet respecte une architecture distribuee basee sur plusieurs microservices. Chaque service est responsable d'une partie precise du systeme.

## 2. Definition des mots importants

### Web Service

Un Web Service est une application backend qui expose des fonctionnalites accessibles par le reseau.

Exemple:

- le service vehicules expose des fonctions pour ajouter un vehicule ou consulter la liste des vehicules;
- le service incidents expose des fonctions pour declarer un accident ou modifier son statut.

Dans ce projet, les Web Services utilisent GraphQL.

### Microservice

Un microservice est un petit service independant qui gere une seule responsabilite.

Au lieu d'avoir une seule grande application backend, le projet est divise en plusieurs services:

- Auth Service;
- Vehicle Service;
- Traffic Service;
- Incident Service;
- Notification Service;
- API Gateway.

Avantage: chaque service est plus simple a comprendre, maintenir et deployer.

### API Gateway

L'API Gateway est la porte d'entree principale du backend.

Le frontend ne contacte pas directement tous les services. Il envoie ses requetes vers:

```text
http://localhost:4000/graphql
```

Ensuite, la Gateway redirige la requete vers le bon microservice.

Exemple:

- une requete `login` est envoyee au Auth Service;
- une requete `vehicles` est envoyee au Vehicle Service;
- une requete `incidents` est envoyee au Incident Service.

Dans ce projet, la Gateway utilise Apollo Gateway et GraphQL Federation.

### GraphQL

GraphQL est une technologie d'API qui permet au client de demander exactement les donnees dont il a besoin.

Avec REST, on utilise souvent plusieurs URLs:

```text
GET /vehicles
GET /vehicles/1
POST /vehicles
```

Avec GraphQL, on utilise un seul endpoint:

```text
POST /graphql
```

Puis on envoie une requete comme:

```graphql
query {
  vehicles {
    id
    plateNumber
    brand
    model
  }
}
```

### Query

Une Query GraphQL sert a lire des donnees.

Exemples:

```graphql
query {
  vehicles {
    id
    plateNumber
  }
}
```

```graphql
query {
  incidents {
    id
    title
    status
  }
}
```

### Mutation

Une Mutation GraphQL sert a modifier des donnees.

Exemples:

```graphql
mutation {
  login(input: { email: "admin@smarttraffic.tn", password: "admin123" }) {
    token
  }
}
```

```graphql
mutation {
  declareIncident(input: {
    type: ACCIDENT
    title: "Accident centre-ville"
    latitude: 36.8065
    longitude: 10.1815
    severity: HIGH
  }) {
    id
    status
  }
}
```

### JWT

JWT signifie JSON Web Token.

C'est un jeton de securite donne a l'utilisateur apres connexion.

Fonctionnement:

1. L'utilisateur fait login avec email et mot de passe.
2. Le Auth Service verifie les informations.
3. Si les informations sont correctes, il retourne un token JWT.
4. Le frontend stocke ce token.
5. Pour les requetes protegees, le frontend envoie:

```text
Authorization: Bearer TOKEN
```

Le token contient des informations comme:

- id utilisateur;
- email;
- role: ADMIN ou OPERATOR.

### Role ADMIN

L'administrateur a plus de droits.

Il peut par exemple:

- consulter les utilisateurs;
- modifier un utilisateur;
- supprimer certaines donnees;
- creer des zones;
- supprimer des incidents ou vehicules.

### Role OPERATOR

L'operateur utilise la plateforme pour superviser le trafic.

Il peut:

- consulter les vehicules;
- declarer des incidents;
- consulter les notifications;
- suivre l'etat du trafic.

## 3. Architecture du projet

Le projet est compose de deux grandes parties:

```text
smart-traffic-platform-complete
|
|-- backend
|   |-- gateway
|   |-- services
|       |-- auth-service
|       |-- vehicle-service
|       |-- traffic-service
|       |-- incident-service
|       |-- notification-service
|
|-- frontend
|   |-- src
|       |-- pages
|       |-- components
|       |-- hooks
|       |-- apollo
|
|-- docs
|   |-- uml
|   |-- api
|
|-- postman
|-- scripts
```

## 4. Technologies utilisees

### Backend

- Node.js;
- Express.js;
- Apollo Server;
- Apollo Gateway;
- GraphQL;
- Sequelize ORM;
- MySQL;
- JWT;
- Docker Compose.

### Frontend

- React;
- Vite;
- Apollo Client;
- Material UI;
- Leaflet pour la carte interactive;
- Recharts pour les graphiques.

### Base de donnees

Le projet utilise MySQL.

Il y a une base de donnees par service:

- `auth_db`;
- `vehicle_db`;
- `traffic_db`;
- `incident_db`;
- `notification_db`.

## 5. Ports du projet

| Element | Port | Role |
| --- | --- | --- |
| Frontend React | 3000 | Interface utilisateur |
| API Gateway | 4000 | Entree principale GraphQL |
| Auth Service | 4001 | Authentification |
| Vehicle Service | 4002 | Gestion vehicules |
| Traffic Service | 4003 | Gestion trafic |
| Incident Service | 4004 | Gestion incidents |
| Notification Service | 4005 | Gestion notifications |
| MySQL Auth | 13306 | Base auth |
| MySQL Vehicle | 13307 | Base vehicules |
| MySQL Traffic | 13308 | Base trafic |
| MySQL Incident | 13309 | Base incidents |
| MySQL Notification | 13310 | Base notifications |
| Redis | 16379 | Cache / notifications temps reel |

## 6. Role de chaque service

## 6.1 Auth Service

Dossier:

```text
backend/services/auth-service
```

Role:

Le Auth Service gere les utilisateurs et la securite.

Fonctionnalites:

- inscription utilisateur;
- connexion securisee;
- generation JWT;
- gestion des roles ADMIN et OPERATOR;
- consultation du profil connecte avec `me`.

Principaux fichiers:

```text
src/index.js
src/graphql/schema.js
src/graphql/resolvers.js
src/models/User.js
src/config/database.js
```

Exemple de mutation login:

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

## 6.2 Vehicle Service

Dossier:

```text
backend/services/vehicle-service
```

Role:

Le Vehicle Service gere les vehicules et leurs positions GPS.

Fonctionnalites:

- ajouter un vehicule;
- consulter la liste des vehicules;
- consulter le detail d'un vehicule;
- enregistrer une position GPS;
- simuler plusieurs positions GPS;
- consulter l'historique des deplacements.

Principaux fichiers:

```text
src/graphql/schema.js
src/graphql/resolvers.js
src/models/Vehicle.js
src/models/Position.js
src/middleware/auth.js
```

Exemple de creation:

```graphql
mutation {
  createVehicle(input: {
    plateNumber: "123 TN 4567"
    brand: "Toyota"
    model: "Corolla"
    type: CAR
    year: 2023
    color: "Blanc"
    ownerName: "Ahmed"
  }) {
    id
    plateNumber
  }
}
```

Exemple de simulation GPS:

```graphql
mutation {
  simulatePositions(vehicleId: "ID_DU_VEHICULE", count: 5) {
    latitude
    longitude
    speed
  }
}
```

## 6.3 Traffic Service

Dossier:

```text
backend/services/traffic-service
```

Role:

Le Traffic Service gere les zones de circulation et analyse la densite du trafic.

Fonctionnalites:

- creer une zone de circulation;
- consulter les zones;
- mesurer la densite du trafic;
- detecter les zones congestionnees;
- classer les zones en FAIBLE, MOYEN ou ELEVE.

Regle de classement:

- `ELEVE`: beaucoup de vehicules et vitesse faible;
- `MOYEN`: nombre moyen de vehicules ou vitesse reduite;
- `FAIBLE`: trafic normal.

Principaux fichiers:

```text
src/graphql/schema.js
src/graphql/resolvers.js
src/models/Zone.js
```

Exemple:

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

## 6.4 Incident Service

Dossier:

```text
backend/services/incident-service
```

Role:

Le Incident Service gere la declaration et le suivi des incidents routiers.

Types d'incidents:

- ACCIDENT;
- TRAVAUX;
- ROUTE_FERMEE;
- EMBOUTEILLAGE.

Statuts:

- SIGNALE;
- EN_COURS;
- RESOLU.

Fonctionnalites:

- declarer un incident;
- consulter les incidents;
- consulter les incidents actifs;
- modifier le statut d'un incident;
- consulter des statistiques.

Principaux fichiers:

```text
src/graphql/schema.js
src/graphql/resolvers.js
src/models/Incident.js
```

Exemple:

```graphql
mutation {
  updateIncidentStatus(id: "ID_INCIDENT", input: { status: EN_COURS }) {
    id
    title
    status
  }
}
```

## 6.5 Notification Service

Dossier:

```text
backend/services/notification-service
```

Role:

Le Notification Service gere les notifications envoyees aux utilisateurs.

Fonctionnalites:

- envoyer une notification;
- consulter les notifications;
- consulter les notifications non lues;
- marquer une notification comme lue;
- marquer toutes les notifications comme lues;
- envoyer des notifications en temps reel via WebSocket.

Principaux fichiers:

```text
src/graphql/schema.js
src/graphql/resolvers.js
src/models/Notification.js
src/config/redis.js
```

Exemple:

```graphql
query {
  myNotifications {
    id
    title
    message
    type
    isRead
  }
}
```

## 6.6 API Gateway

Dossier:

```text
backend/gateway
```

Role:

La Gateway regroupe tous les schemas GraphQL des microservices.

Le frontend contacte seulement:

```text
http://localhost:4000/graphql
```

La Gateway contacte ensuite:

- Auth Service;
- Vehicle Service;
- Traffic Service;
- Incident Service;
- Notification Service.

Pourquoi utiliser une Gateway?

- un seul endpoint pour le frontend;
- meilleure organisation;
- separation des responsabilites;
- architecture conforme au cahier des charges;
- facilite l'evolution du projet.

## 7. Communication entre services

Le projet contient plusieurs formes de communication.

### Frontend vers Gateway

Le frontend React utilise Apollo Client pour envoyer les requetes GraphQL vers:

```text
http://localhost:4000/graphql
```

Fichier:

```text
frontend/src/apollo/client.js
```

### Gateway vers microservices

La Gateway utilise Apollo Federation pour interroger les services:

```text
auth-service:4001/graphql
vehicle-service:4002/graphql
traffic-service:4003/graphql
incident-service:4004/graphql
notification-service:4005/graphql
```

### Services vers Auth Service

Les services proteges verifient le JWT en appelant le Auth Service.

Exemple:

- Vehicle Service recoit une requete;
- il lit le header `Authorization`;
- il contacte Auth Service pour verifier l'utilisateur;
- si le token est valide, il execute la requete.

### Incident Service vers Notification Service

Quand un incident est declare ou mis a jour, le Incident Service peut envoyer une notification au Notification Service.

## 8. Frontend React

Dossier:

```text
frontend
```

Pages principales:

```text
src/pages/Login.jsx
src/pages/Dashboard.jsx
src/pages/Vehicles.jsx
src/pages/Traffic.jsx
src/pages/Incidents.jsx
src/pages/Notifications.jsx
```

### Login

Permet a l'utilisateur de se connecter.

Compte par defaut:

```text
admin@smarttraffic.tn
admin123
```

### Dashboard

Affiche:

- nombre de vehicules;
- nombre de zones;
- incidents actifs;
- zones congestionnees;
- graphiques de densite et d'incidents.

### Vehicles

Permet:

- afficher les vehicules;
- ajouter un vehicule;
- simuler des positions GPS.

### Traffic

Permet:

- afficher les zones;
- voir la carte interactive;
- recalculer les densites;
- voir les zones congestionnees.

### Incidents

Permet:

- declarer un incident;
- consulter les incidents;
- passer un incident de SIGNALE a EN_COURS;
- passer un incident a RESOLU.

### Notifications

Permet:

- consulter les notifications;
- voir les notifications non lues;
- marquer comme lu.

## 9. Docker Compose

Docker Compose permet de lancer tout le backend avec une seule commande.

Fichier:

```text
backend/docker-compose.yml
```

Commande:

```powershell
cd C:\Users\admin\Downloads\smart-traffic-platform-complete\backend
docker-compose up -d
```

Cette commande lance:

- les 5 bases MySQL;
- Redis;
- les 5 microservices;
- la Gateway.

Pour voir l'etat:

```powershell
docker-compose ps
```

Pour voir les logs:

```powershell
docker-compose logs gateway
```

Pour arreter:

```powershell
docker-compose down
```

## 10. Comment lancer le projet

### Etape 1: demarrer Docker Desktop

Il faut ouvrir Docker Desktop et attendre qu'il soit pret.

### Etape 2: lancer le backend

```powershell
cd C:\Users\admin\Downloads\smart-traffic-platform-complete\backend
docker-compose up -d
```

### Etape 3: verifier la Gateway

```powershell
Invoke-RestMethod -Uri http://localhost:4000/graphql -Method Post -ContentType "application/json" -Body '{"query":"query { __typename }"}'
```

Resultat attendu:

```text
Query
```

### Etape 4: lancer le frontend

```powershell
cd C:\Users\admin\Downloads\smart-traffic-platform-complete\frontend
npm install
npm run dev
```

### Etape 5: ouvrir l'application

```text
http://localhost:3000
```

Login:

```text
Email: admin@smarttraffic.tn
Password: admin123
```

### Etape 6: ajouter des donnees demo

```powershell
cd C:\Users\admin\Downloads\smart-traffic-platform-complete
node scripts\seed-data.js
```

## 11. Correspondance avec le cahier des charges

| Exigence | Etat dans le projet |
| --- | --- |
| Architecture Web Service | Oui, plusieurs services Node.js/Express |
| API Gateway GraphQL | Oui, `backend/gateway` avec Apollo Gateway |
| Service Authentification | Oui |
| Inscription utilisateurs | Oui, mutation `register` |
| Connexion securisee | Oui, mutation `login` avec mot de passe hash |
| Generation JWT | Oui |
| Roles ADMIN / OPERATOR | Oui |
| Service Vehicules | Oui |
| Ajouter vehicule | Oui |
| Liste vehicules | Oui |
| Detail vehicule | Oui |
| Positions GPS simulees | Oui |
| Historique deplacements | Oui |
| Service Trafic | Oui |
| Creation zones | Oui |
| Densite trafic | Oui |
| Detection congestion | Oui |
| Classement Faible/Moyen/Eleve | Oui: FAIBLE, MOYEN, ELEVE |
| Service Incidents | Oui |
| Declarer incident | Oui |
| Consulter incidents | Oui |
| Modifier statut | Oui |
| Types Accident/Travaux/Route fermee/Embouteillage | Oui |
| Statuts Signale/En cours/Resolu | Oui |
| Service Notifications | Oui |
| Envoyer notification | Oui |
| Consulter notifications | Oui |
| Marquer comme lue | Oui |
| Backend Node.js / Express | Oui |
| GraphQL obligatoire | Oui |
| Base relationnelle MySQL | Oui |
| Validation donnees | Oui, champs obligatoires + erreurs GraphQL |
| Gestion erreurs | Oui, `UserInputError`, `AuthenticationError`, `ForbiddenError` |
| JWT Authentication | Oui |
| Docker Compose | Oui |
| WebSocket temps reel | Oui, dans Notification Service |
| Dashboard React | Oui |
| Carte interactive | Oui, Leaflet |
| Collection Postman | Oui, dossier `postman` |
| UML | Oui, dossier `docs/uml` |
| Requetes GraphQL test | Oui, README + docs API |

## 12. Ce qui est partiellement couvert

### Tests unitaires

Le projet contient des tests unitaires Jest pour le service d'authentification.

Fichier:

```text
backend/services/auth-service/src/graphql/resolvers.test.js
```

Commande:

```powershell
cd C:\Users\admin\Downloads\smart-traffic-platform-complete\backend
npm test
```

Les tests verifient:

- inscription utilisateur;
- refus d'un email deja utilise;
- connexion avec identifiants valides;
- refus d'un mauvais mot de passe.

Pendant la soutenance, tu peux dire:

> Nous avons ajoute des tests unitaires Jest sur la partie authentification, car c'est une partie critique du projet. Les tests utilisent des mocks du modele User pour verifier les resolvers sans avoir besoin de demarrer MySQL.

### CI/CD

Le projet ne contient pas encore de pipeline CI/CD complet.

Tu peux dire:

> Le CI/CD est une perspective d'amelioration. On peut ajouter GitHub Actions pour lancer les tests et verifier la build a chaque push.

## 13. Questions possibles pendant la soutenance

### Question: Pourquoi vous avez utilise des microservices?

Reponse:

> Nous avons utilise une architecture microservices pour separer les responsabilites. Chaque service gere un domaine precis: authentification, vehicules, trafic, incidents ou notifications. Cela rend le projet plus modulaire, plus facile a maintenir et conforme au cahier des charges qui demande plusieurs services independants.

### Question: Quel est le role de la Gateway?

Reponse:

> La Gateway est le point d'entree unique du backend. Le frontend envoie toutes les requetes a la Gateway sur le port 4000. Ensuite, la Gateway redirige chaque requete vers le microservice concerne. Cela evite au frontend de connaitre tous les services.

### Question: Pourquoi GraphQL?

Reponse:

> GraphQL permet de demander exactement les champs necessaires. Par exemple, pour les vehicules, le frontend peut demander seulement `id`, `plateNumber` et `brand`. Cela evite de recevoir trop de donnees et donne une API plus flexible.

### Question: Comment fonctionne l'authentification?

Reponse:

> L'utilisateur se connecte avec email et mot de passe. Le Auth Service verifie le mot de passe hash dans MySQL. Si la connexion est correcte, il genere un JWT. Le frontend envoie ensuite ce JWT dans le header Authorization pour acceder aux services proteges.

### Question: Comment les roles sont geres?

Reponse:

> Le token JWT contient le role de l'utilisateur: ADMIN ou OPERATOR. Dans les resolvers, certaines actions verifient le role. Par exemple, seul un ADMIN peut supprimer certaines donnees ou gerer les utilisateurs.

### Question: Comment detecter une zone congestionnee?

Reponse:

> Le Traffic Service utilise le nombre de vehicules et la vitesse moyenne. Si le nombre de vehicules est eleve et la vitesse faible, la zone est classee ELEVE. Sinon elle peut etre MOYEN ou FAIBLE.

### Question: Ou sont stockees les donnees?

Reponse:

> Les donnees sont stockees dans MySQL. Chaque microservice a sa propre base de donnees: auth_db, vehicle_db, traffic_db, incident_db et notification_db.

### Question: Pourquoi Docker Compose?

Reponse:

> Docker Compose permet de lancer facilement toutes les bases de donnees, Redis, les microservices et la Gateway avec une seule commande. Cela simplifie l'installation et evite les problemes de configuration manuelle.

### Question: C'est quoi WebSocket dans ce projet?

Reponse:

> WebSocket permet une communication temps reel. Dans ce projet, il est utilise dans le Notification Service pour envoyer des notifications sans que le frontend doive actualiser la page.

## 14. Scenario de demonstration

Pendant la soutenance, tu peux faire cette demo:

1. Lancer le backend avec Docker Compose.
2. Lancer le frontend avec `npm run dev`.
3. Ouvrir `http://localhost:3000`.
4. Se connecter avec:

```text
admin@smarttraffic.tn
admin123
```

5. Montrer le Dashboard.
6. Aller dans Vehicules et ajouter un vehicule.
7. Cliquer sur Simuler GPS.
8. Aller dans Trafic et montrer la carte interactive.
9. Recalculer les densites.
10. Aller dans Incidents et declarer un incident.
11. Modifier son statut vers EN_COURS puis RESOLU.
12. Aller dans Notifications et montrer les notifications.
13. Ouvrir GraphQL Gateway et tester une requete.

## 15. Requetes GraphQL utiles pour la demonstration

### Login

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

### Profil connecte

Ne pas oublier le header Authorization.

```graphql
query {
  me {
    id
    email
    fullName
    role
  }
}
```

### Vehicules

```graphql
query {
  vehicles {
    id
    plateNumber
    brand
    model
    type
  }
}
```

### Zones congestionnees

```graphql
query {
  congestedZones {
    id
    name
    density
    vehicleCount
    averageSpeed
  }
}
```

### Incidents actifs

```graphql
query {
  activeIncidents {
    id
    title
    type
    status
    severity
  }
}
```

### Notifications

```graphql
query {
  myNotifications {
    id
    title
    message
    isRead
  }
}
```

## 16. Explication simple du flux complet

Exemple: declaration d'un incident.

1. L'utilisateur est connecte dans le frontend React.
2. Le frontend possede un token JWT.
3. L'utilisateur remplit le formulaire d'incident.
4. React envoie une mutation GraphQL a la Gateway.
5. La Gateway transmet la mutation au Incident Service.
6. Le Incident Service verifie le JWT avec le Auth Service.
7. Le Incident Service enregistre l'incident dans MySQL.
8. Le Incident Service demande au Notification Service de creer une notification.
9. La notification est stockee dans MySQL.
10. Le frontend peut afficher l'incident et la notification.

## 17. Points forts du projet

- Architecture microservices claire.
- API Gateway GraphQL unique.
- Authentification JWT.
- Gestion des roles.
- Base MySQL separee par service.
- Dashboard React.
- Carte interactive.
- Notifications.
- Docker Compose.
- Documentation UML et Postman.

## 18. Ameliorations possibles

- Ajouter des tests unitaires Jest.
- Ajouter GitHub Actions pour CI/CD.
- Ajouter une meilleure validation avec une bibliotheque comme Joi ou Zod.
- Ajouter une vraie carte avec plus de donnees GPS.
- Ajouter un historique plus detaille des incidents.
- Ajouter des permissions plus fines par role.
- Deployer le projet sur un serveur cloud.

## 19. Conclusion pour la soutenance

Phrase possible:

> Notre projet repond au cahier des charges car il implemente une plateforme de gestion intelligente du trafic urbain basee sur plusieurs microservices independants, une API Gateway GraphQL, une authentification JWT, une base MySQL et un dashboard React. Les services permettent de gerer les utilisateurs, les vehicules, le trafic, les incidents et les notifications. Docker Compose facilite le lancement de toute l'architecture.
