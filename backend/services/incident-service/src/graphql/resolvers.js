const { UserInputError, ForbiddenError } = require('apollo-server-express');
const Incident = require('../models/Incident');
const { authMiddleware } = require('../middleware/auth');
const axios = require('axios');

const checkAuth = async (context) => await authMiddleware(context.req);

const sendNotification = async (title, message, type, userId, authHeader) => {
  try {
    await axios.post(`${process.env.NOTIFICATION_SERVICE_URL}/graphql`, {
      query: `
        mutation SendNotification($input: SendNotificationInput!) {
          sendNotification(input: $input) {
            id
          }
        }
      `,
      variables: {
        input: { title, message, type, userId }
      }
    }, {
      headers: { Authorization: authHeader }
    });
  } catch (e) {
    console.log('Notification service unavailable');
  }
};

const resolvers = {
  Query: {
    incidents: async (_, { status, type, severity }, context) => {
      await checkAuth(context);
      const where = {};
      if (status) where.status = status;
      if (type) where.type = type;
      if (severity) where.severity = severity;
      return await Incident.findAll({ where, order: [['createdAt', 'DESC']] });
    },

    incident: async (_, { id }, context) => {
      await checkAuth(context);
      const incident = await Incident.findByPk(id);
      if (!incident) throw new UserInputError('Incident non trouve');
      return incident;
    },

    activeIncidents: async (_, __, context) => {
      await checkAuth(context);
      return await Incident.findAll({
        where: { status: ['SIGNALE', 'EN_COURS'] },
        order: [['createdAt', 'DESC']]
      });
    },

    incidentStats: async (_, __, context) => {
      await checkAuth(context);
      const incidents = await Incident.findAll();
      return {
        total: incidents.length,
        byStatus: {
          signale: incidents.filter(i => i.status === 'SIGNALE').length,
          enCours: incidents.filter(i => i.status === 'EN_COURS').length,
          resolu: incidents.filter(i => i.status === 'RESOLU').length
        },
        byType: {
          accident: incidents.filter(i => i.type === 'ACCIDENT').length,
          travaux: incidents.filter(i => i.type === 'TRAVAUX').length,
          routeFermee: incidents.filter(i => i.type === 'ROUTE_FERMEE').length,
          embouteillage: incidents.filter(i => i.type === 'EMBOUTEILLAGE').length
        },
        criticalCount: incidents.filter(i => i.severity === 'CRITICAL' && i.status !== 'RESOLU').length
      };
    },

    incidentsNearby: async (_, { lat, lng, radius }, context) => {
      await checkAuth(context);
      const incidents = await Incident.findAll({ where: { status: ['SIGNALE', 'EN_COURS'] } });
      const R = radius || 10;

      return incidents.filter(inc => {
        const dLat = (inc.latitude - lat) * Math.PI / 180;
        const dLng = (inc.longitude - lng) * Math.PI / 180;
        const a = Math.sin(dLat/2)**2 + Math.cos(lat*Math.PI/180)*Math.cos(inc.latitude*Math.PI/180)*Math.sin(dLng/2)**2;
        return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)) <= R;
      });
    }
  },

  Mutation: {
    declareIncident: async (_, { input }, context) => {
      const user = await checkAuth(context);
      const incident = await Incident.create({
        ...input,
        reportedBy: user.id,
        reportedByName: `${user.firstName} ${user.lastName}`
      });

      await sendNotification(
        `Nouvel incident: ${input.title}`,
        `Un incident de type ${input.type} a ete signale`,
        'INCIDENT',
        user.id,
        context.req.headers.authorization
      );

      return incident;
    },

    updateIncident: async (_, { id, input }, context) => {
      await checkAuth(context);
      const incident = await Incident.findByPk(id);
      if (!incident) throw new UserInputError('Incident non trouve');
      await incident.update(input);
      return incident;
    },

    updateIncidentStatus: async (_, { id, input }, context) => {
      const user = await checkAuth(context);
      const incident = await Incident.findByPk(id);
      if (!incident) throw new UserInputError('Incident non trouve');

      const updates = { status: input.status };
      if (input.status === 'RESOLU') {
        updates.resolvedAt = new Date();
        updates.resolvedBy = user.id;
      }

      await incident.update(updates);

      await sendNotification(
        `Mise a jour incident`,
        `L'incident "${incident.title}" est maintenant ${input.status}`,
        'STATUS_UPDATE',
        incident.reportedBy,
        context.req.headers.authorization
      );

      return incident;
    },

    deleteIncident: async (_, { id }, context) => {
      const user = await checkAuth(context);
      if (user.role !== 'ADMIN') throw new ForbiddenError('Admin requis');
      const incident = await Incident.findByPk(id);
      if (!incident) throw new UserInputError('Incident non trouve');
      await incident.destroy();
      return true;
    }
  }
};

module.exports = resolvers;
