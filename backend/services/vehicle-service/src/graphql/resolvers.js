const { UserInputError, ForbiddenError } = require('apollo-server-express');
const Vehicle = require('../models/Vehicle');
const Position = require('../models/Position');
const { authMiddleware } = require('../middleware/auth');

const checkAuth = async (context) => await authMiddleware(context.req);

const resolvers = {
  Vehicle: {
    positions: async (parent) => {
      return await Position.findAll({
        where: { vehicleId: parent.id },
        order: [['timestamp', 'DESC']],
        limit: 50
      });
    },
    lastPosition: async (parent) => {
      return await Position.findOne({
        where: { vehicleId: parent.id },
        order: [['timestamp', 'DESC']]
      });
    }
  },

  Query: {
    vehicles: async (_, { type, isActive }, context) => {
      await checkAuth(context);
      const where = {};
      if (type) where.type = type;
      if (isActive !== undefined) where.isActive = isActive;
      return await Vehicle.findAll({ where, order: [['createdAt', 'DESC']] });
    },

    vehicle: async (_, { id }, context) => {
      await checkAuth(context);
      const vehicle = await Vehicle.findByPk(id);
      if (!vehicle) throw new UserInputError('Vehicule non trouve');
      return vehicle;
    },

    vehicleByPlate: async (_, { plateNumber }, context) => {
      await checkAuth(context);
      const vehicle = await Vehicle.findOne({ where: { plateNumber } });
      if (!vehicle) throw new UserInputError('Vehicule non trouve');
      return vehicle;
    },

    vehicleHistory: async (_, { vehicleId, from, to, limit }, context) => {
      await checkAuth(context);
      const vehicle = await Vehicle.findByPk(vehicleId);
      if (!vehicle) throw new UserInputError('Vehicule non trouve');

      const where = { vehicleId };
      const { Op } = require('sequelize');
      if (from || to) {
        where.timestamp = {};
        if (from) where.timestamp[Op.gte] = new Date(from);
        if (to) where.timestamp[Op.lte] = new Date(to);
      }

      return await Position.findAll({
        where,
        order: [['timestamp', 'DESC']],
        limit: limit || 100
      });
    }
  },

  Mutation: {
    createVehicle: async (_, { input }, context) => {
      await checkAuth(context);
      const existing = await Vehicle.findOne({ where: { plateNumber: input.plateNumber } });
      if (existing) throw new UserInputError('Cette plaque existe deja');
      return await Vehicle.create(input);
    },

    updateVehicle: async (_, { id, input }, context) => {
      await checkAuth(context);
      const vehicle = await Vehicle.findByPk(id);
      if (!vehicle) throw new UserInputError('Vehicule non trouve');
      await vehicle.update(input);
      return vehicle;
    },

    deleteVehicle: async (_, { id }, context) => {
      const user = await checkAuth(context);
      if (user.role !== 'ADMIN') throw new ForbiddenError('Admin requis');
      const vehicle = await Vehicle.findByPk(id);
      if (!vehicle) throw new UserInputError('Vehicule non trouve');
      await Position.destroy({ where: { vehicleId: id } });
      await vehicle.destroy();
      return true;
    },

    recordPosition: async (_, { input }, context) => {
      await checkAuth(context);
      const vehicle = await Vehicle.findByPk(input.vehicleId);
      if (!vehicle) throw new UserInputError('Vehicule non trouve');
      if (!vehicle.isActive) throw new UserInputError('Vehicule inactif');
      return await Position.create(input);
    },

    simulatePositions: async (_, { vehicleId, count }, context) => {
      await checkAuth(context);
      const vehicle = await Vehicle.findByPk(vehicleId);
      if (!vehicle) throw new UserInputError('Vehicule non trouve');

      const positions = [];
      const baseLat = 36.8065;
      const baseLng = 10.1815;

      for (let i = 0; i < (count || 10); i++) {
        const position = await Position.create({
          vehicleId,
          latitude: baseLat + (Math.random() - 0.5) * 0.1,
          longitude: baseLng + (Math.random() - 0.5) * 0.1,
          speed: Math.random() * 120,
          heading: Math.random() * 360
        });
        positions.push(position);
      }
      return positions;
    }
  }
};

module.exports = resolvers;
