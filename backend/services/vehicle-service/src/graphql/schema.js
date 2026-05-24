const { gql } = require('apollo-server-express');

const typeDefs = gql`
  enum VehicleType {
    CAR
    TRUCK
    MOTORCYCLE
    BUS
    EMERGENCY
  }

  type Vehicle {
    id: ID!
    plateNumber: String!
    brand: String!
    model: String!
    type: VehicleType!
    year: Int
    color: String
    ownerName: String!
    ownerPhone: String
    isActive: Boolean!
    positions: [Position!]!
    lastPosition: Position
    createdAt: String!
    updatedAt: String!
  }

  type Position {
    id: ID!
    vehicleId: ID!
    latitude: Float!
    longitude: Float!
    speed: Float
    heading: Float
    timestamp: String!
  }

  input CreateVehicleInput {
    plateNumber: String!
    brand: String!
    model: String!
    type: VehicleType!
    year: Int
    color: String
    ownerName: String!
    ownerPhone: String
  }

  input UpdateVehicleInput {
    brand: String
    model: String
    type: VehicleType
    year: Int
    color: String
    ownerName: String
    ownerPhone: String
    isActive: Boolean
  }

  input RecordPositionInput {
    vehicleId: ID!
    latitude: Float!
    longitude: Float!
    speed: Float
    heading: Float
  }

  type Query {
    vehicles(type: VehicleType, isActive: Boolean): [Vehicle!]!
    vehicle(id: ID!): Vehicle
    vehicleByPlate(plateNumber: String!): Vehicle
    vehicleHistory(vehicleId: ID!, from: String, to: String, limit: Int): [Position!]!
  }

  type Mutation {
    createVehicle(input: CreateVehicleInput!): Vehicle!
    updateVehicle(id: ID!, input: UpdateVehicleInput!): Vehicle!
    deleteVehicle(id: ID!): Boolean!
    recordPosition(input: RecordPositionInput!): Position!
    simulatePositions(vehicleId: ID!, count: Int): [Position!]!
  }
`;

module.exports = typeDefs;
