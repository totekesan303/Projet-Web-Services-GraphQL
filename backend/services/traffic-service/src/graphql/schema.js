const { gql } = require('apollo-server-express');

const typeDefs = gql`
  enum TrafficDensity {
    FAIBLE
    MOYEN
    ELEVE
  }

  type Zone {
    id: ID!
    name: String!
    description: String
    coordinates: [Coordinate!]!
    centerLat: Float!
    centerLng: Float!
    density: TrafficDensity!
    vehicleCount: Int!
    averageSpeed: Float!
    isActive: Boolean!
    createdAt: String!
    updatedAt: String!
  }

  type Coordinate {
    lat: Float!
    lng: Float!
  }

  type TrafficSummary {
    totalZones: Int!
    congestedZones: Int!
    averageDensity: String!
    zonesByDensity: DensityBreakdown!
  }

  type DensityBreakdown {
    faible: Int!
    moyen: Int!
    eleve: Int!
  }

  input CoordinateInput {
    lat: Float!
    lng: Float!
  }

  input CreateZoneInput {
    name: String!
    description: String
    coordinates: [CoordinateInput!]!
    centerLat: Float!
    centerLng: Float!
  }

  input UpdateZoneInput {
    name: String
    description: String
    coordinates: [CoordinateInput!]
    isActive: Boolean
  }

  input UpdateDensityInput {
    zoneId: ID!
    vehicleCount: Int
    averageSpeed: Float
  }

  type Query {
    zones(density: TrafficDensity, isActive: Boolean): [Zone!]!
    zone(id: ID!): Zone
    congestedZones: [Zone!]!
    trafficSummary: TrafficSummary!
    zonesNearby(lat: Float!, lng: Float!, radius: Float): [Zone!]!
  }

  type Mutation {
    createZone(input: CreateZoneInput!): Zone!
    updateZone(id: ID!, input: UpdateZoneInput!): Zone!
    deleteZone(id: ID!): Boolean!
    updateDensity(input: UpdateDensityInput!): Zone!
    calculateAllDensities: [Zone!]!
  }
`;

module.exports = typeDefs;
