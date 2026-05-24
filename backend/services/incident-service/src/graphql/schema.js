const { gql } = require('apollo-server-express');

const typeDefs = gql`
  enum IncidentType {
    ACCIDENT
    TRAVAUX
    ROUTE_FERMEE
    EMBOUTEILLAGE
  }

  enum IncidentStatus {
    SIGNALE
    EN_COURS
    RESOLU
  }

  enum Severity {
    LOW
    MEDIUM
    HIGH
    CRITICAL
  }

  type Incident {
    id: ID!
    type: IncidentType!
    status: IncidentStatus!
    title: String!
    description: String
    latitude: Float!
    longitude: Float!
    address: String
    reportedBy: ID!
    reportedByName: String
    resolvedAt: String
    resolvedBy: ID
    severity: Severity!
    createdAt: String!
    updatedAt: String!
  }

  type IncidentStats {
    total: Int!
    byStatus: StatusBreakdown!
    byType: TypeBreakdown!
    criticalCount: Int!
  }

  type StatusBreakdown {
    signale: Int!
    enCours: Int!
    resolu: Int!
  }

  type TypeBreakdown {
    accident: Int!
    travaux: Int!
    routeFermee: Int!
    embouteillage: Int!
  }

  input DeclareIncidentInput {
    type: IncidentType!
    title: String!
    description: String
    latitude: Float!
    longitude: Float!
    address: String
    severity: Severity
  }

  input UpdateIncidentInput {
    title: String
    description: String
    severity: Severity
  }

  input UpdateStatusInput {
    status: IncidentStatus!
  }

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
    deleteIncident(id: ID!): Boolean!
  }
`;

module.exports = typeDefs;
