# GraphQL API Documentation

## Point d'entrée
```
http://localhost:4000/graphql
```

## Authentification
Toutes les requêtes (sauf login/register) nécessitent un header:
```
Authorization: Bearer <token>
```

## Schémas par service

### Auth Service
```graphql
type Query {
  me: User!
  users: [User!]!        # ADMIN only
  user(id: ID!): User     # ADMIN only
}

type Mutation {
  register(input: RegisterInput!): AuthPayload!
  login(input: LoginInput!): AuthPayload!
  updateUser(id: ID!, input: UpdateUserInput!): User!    # ADMIN
  deleteUser(id: ID!): Boolean!                          # ADMIN
}
```

### Vehicle Service
```graphql
type Query {
  vehicles(type: VehicleType, isActive: Boolean): [Vehicle!]!
  vehicle(id: ID!): Vehicle
  vehicleByPlate(plateNumber: String!): Vehicle
  vehicleHistory(vehicleId: ID!, from: String, to: String, limit: Int): [Position!]!
}

type Mutation {
  createVehicle(input: CreateVehicleInput!): Vehicle!
  updateVehicle(id: ID!, input: UpdateVehicleInput!): Vehicle!
  deleteVehicle(id: ID!): Boolean!           # ADMIN
  recordPosition(input: RecordPositionInput!): Position!
  simulatePositions(vehicleId: ID!, count: Int): [Position!]!
}
```

### Traffic Service
```graphql
type Query {
  zones(density: TrafficDensity, isActive: Boolean): [Zone!]!
  zone(id: ID!): Zone
  congestedZones: [Zone!]!
  trafficSummary: TrafficSummary!
  zonesNearby(lat: Float!, lng: Float!, radius: Float): [Zone!]!
}

type Mutation {
  createZone(input: CreateZoneInput!): Zone!           # ADMIN
  updateZone(id: ID!, input: UpdateZoneInput!): Zone!
  deleteZone(id: ID!): Boolean!                        # ADMIN
  updateDensity(input: UpdateDensityInput!): Zone!
  calculateAllDensities: [Zone!]!
}
```

### Incident Service
```graphql
type Query {
  incidents(status: IncidentStatus, type: IncidentType, severity: Severity): [Incident!]!
  incident(id: ID!): Incident
  activeIncidents: [Incident!]!
  incidentStats: IncidentStats!
  incidentsNearby(lat: Float!, lng: Float!, radius: Float): [Incident!]!
}

type Mutation {
  declareIncident(input: DeclareIncidentInput!): Incident!
  updateIncident(id: ID!, input: UpdateIncidentInput!): Incident!
  updateIncidentStatus(id: ID!, input: UpdateStatusInput!): Incident!
  deleteIncident(id: ID!): Boolean!          # ADMIN
}
```

### Notification Service
```graphql
type Query {
  notifications(type: NotificationType, isRead: Boolean): [Notification!]!
  notification(id: ID!): Notification
  myNotifications: [Notification!]!
  unreadCount: Int!
  notificationStats: NotificationCount!
}

type Mutation {
  sendNotification(input: SendNotificationInput!): Notification!
  markAsRead(input: MarkReadInput!): Notification!
  markAllAsRead(input: MarkAllReadInput): Int!
  deleteNotification(id: ID!): Boolean!
}

type Subscription {
  notificationReceived(userId: ID): Notification!
  newIncidentNotification: Notification!
}
```
