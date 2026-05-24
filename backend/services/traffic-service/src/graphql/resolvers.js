const { UserInputError, ForbiddenError } = require('apollo-server-express');
const Zone = require('../models/Zone');
const { authMiddleware } = require('../middleware/auth');

const checkAuth = async (context) => await authMiddleware(context.req);

const calculateDensity = (vehicleCount, avgSpeed) => {
  if (vehicleCount > 50 && avgSpeed < 20) return 'ELEVE';
  if (vehicleCount > 20 && avgSpeed < 40) return 'MOYEN';
  return 'FAIBLE';
};

const defaultZones = [
  {
    name: 'Centre-ville Tunis',
    description: 'Zone centrale',
    coordinates: [
      { lat: 36.81, lng: 10.18 },
      { lat: 36.81, lng: 10.19 },
      { lat: 36.80, lng: 10.19 },
      { lat: 36.80, lng: 10.18 }
    ],
    centerLat: 36.805,
    centerLng: 10.185
  },
  {
    name: 'Ariana',
    description: 'Zone nord',
    coordinates: [
      { lat: 36.86, lng: 10.18 },
      { lat: 36.86, lng: 10.19 },
      { lat: 36.85, lng: 10.19 },
      { lat: 36.85, lng: 10.18 }
    ],
    centerLat: 36.855,
    centerLng: 10.185
  },
  {
    name: 'La Marsa',
    description: 'Zone cotiere',
    coordinates: [
      { lat: 36.89, lng: 10.32 },
      { lat: 36.89, lng: 10.33 },
      { lat: 36.88, lng: 10.33 },
      { lat: 36.88, lng: 10.32 }
    ],
    centerLat: 36.885,
    centerLng: 10.325
  }
];

const resolvers = {
  Zone: {
    coordinates: (parent) => parent.coordinates || []
  },

  Query: {
    zones: async (_, { density, isActive }, context) => {
      await checkAuth(context);
      const where = {};
      if (density) where.density = density;
      if (isActive !== undefined) where.isActive = isActive;
      return await Zone.findAll({ where, order: [['createdAt', 'DESC']] });
    },

    zone: async (_, { id }, context) => {
      await checkAuth(context);
      const zone = await Zone.findByPk(id);
      if (!zone) throw new UserInputError('Zone non trouvee');
      return zone;
    },

    congestedZones: async (_, __, context) => {
      await checkAuth(context);
      return await Zone.findAll({
        where: { density: 'ELEVE', isActive: true },
        order: [['vehicleCount', 'DESC']]
      });
    },

    trafficSummary: async (_, __, context) => {
      await checkAuth(context);
      const zones = await Zone.findAll();
      const faible = zones.filter(z => z.density === 'FAIBLE').length;
      const moyen = zones.filter(z => z.density === 'MOYEN').length;
      const eleve = zones.filter(z => z.density === 'ELEVE').length;

      return {
        totalZones: zones.length,
        congestedZones: eleve,
        averageDensity: zones.length > 0 
          ? ((faible * 1 + moyen * 2 + eleve * 3) / zones.length).toFixed(1)
          : '0',
        zonesByDensity: { faible, moyen, eleve }
      };
    },

    zonesNearby: async (_, { lat, lng, radius }, context) => {
      await checkAuth(context);
      const zones = await Zone.findAll({ where: { isActive: true } });
      const R = radius || 5;

      return zones.filter(zone => {
        const dLat = (zone.centerLat - lat) * Math.PI / 180;
        const dLng = (zone.centerLng - lng) * Math.PI / 180;
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                  Math.cos(lat * Math.PI/180) * Math.cos(zone.centerLat * Math.PI/180) *
                  Math.sin(dLng/2) * Math.sin(dLng/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return 6371 * c <= R;
      });
    }
  },

  Mutation: {
    createZone: async (_, { input }, context) => {
      const user = await checkAuth(context);
      if (user.role !== 'ADMIN') throw new ForbiddenError('Admin requis');
      return await Zone.create({ ...input, coordinates: input.coordinates });
    },

    updateZone: async (_, { id, input }, context) => {
      await checkAuth(context);
      const zone = await Zone.findByPk(id);
      if (!zone) throw new UserInputError('Zone non trouvee');
      await zone.update(input);
      return zone;
    },

    deleteZone: async (_, { id }, context) => {
      const user = await checkAuth(context);
      if (user.role !== 'ADMIN') throw new ForbiddenError('Admin requis');
      const zone = await Zone.findByPk(id);
      if (!zone) throw new UserInputError('Zone non trouvee');
      await zone.destroy();
      return true;
    },

    updateDensity: async (_, { input }, context) => {
      await checkAuth(context);
      const zone = await Zone.findByPk(input.zoneId);
      if (!zone) throw new UserInputError('Zone non trouvee');

      const newDensity = calculateDensity(
        input.vehicleCount || zone.vehicleCount,
        input.averageSpeed || zone.averageSpeed
      );

      await zone.update({
        vehicleCount: input.vehicleCount !== undefined ? input.vehicleCount : zone.vehicleCount,
        averageSpeed: input.averageSpeed !== undefined ? input.averageSpeed : zone.averageSpeed,
        density: newDensity
      });

      return zone;
    },

    calculateAllDensities: async (_, __, context) => {
      await checkAuth(context);
      let zones = await Zone.findAll();

      if (zones.length === 0) {
        await Zone.bulkCreate(defaultZones);
        zones = await Zone.findAll();
      }

      for (const zone of zones) {
        const vehicleCount = Math.floor(Math.random() * 100);
        const avgSpeed = Math.random() * 80;
        const density = calculateDensity(vehicleCount, avgSpeed);
        await zone.update({ vehicleCount, averageSpeed: avgSpeed.toFixed(2), density });
      }
      return zones;
    }
  }
};

module.exports = resolvers;
