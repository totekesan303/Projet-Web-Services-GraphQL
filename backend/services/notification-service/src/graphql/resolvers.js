const { UserInputError, ForbiddenError } = require('apollo-server-express');
const { PubSub } = require('graphql-subscriptions');
const Notification = require('../models/Notification');
const { authMiddleware } = require('../middleware/auth');
const redis = require('../config/redis');

const pubsub = new PubSub();
const NOTIFICATION_RECEIVED = 'NOTIFICATION_RECEIVED';
const NEW_INCIDENT = 'NEW_INCIDENT';

const checkAuth = async (context) => await authMiddleware(context.req);

const resolvers = {
  Query: {
    notifications: async (_, { type, isRead }, context) => {
      const user = await checkAuth(context);
      const where = { userId: user.id };
      if (type) where.type = type;
      if (isRead !== undefined) where.isRead = isRead;
      return await Notification.findAll({ where, order: [['createdAt', 'DESC']] });
    },

    notification: async (_, { id }, context) => {
      const user = await checkAuth(context);
      const notification = await Notification.findOne({ where: { id, userId: user.id } });
      if (!notification) throw new UserInputError('Notification non trouvee');
      return notification;
    },

    myNotifications: async (_, __, context) => {
      const user = await checkAuth(context);
      return await Notification.findAll({
        where: { userId: user.id },
        order: [['createdAt', 'DESC']],
        limit: 50
      });
    },

    unreadCount: async (_, __, context) => {
      const user = await checkAuth(context);
      return await Notification.count({ where: { userId: user.id, isRead: false } });
    },

    notificationStats: async (_, __, context) => {
      const user = await checkAuth(context);
      const total = await Notification.count({ where: { userId: user.id } });
      const unread = await Notification.count({ where: { userId: user.id, isRead: false } });
      return { total, unread, read: total - unread };
    }
  },

  Mutation: {
    sendNotification: async (_, { input }, context) => {
      const user = await checkAuth(context);
      if (input.userId !== user.id && user.role !== 'ADMIN') {
        throw new ForbiddenError('Acces refuse');
      }

      const notification = await Notification.create({ ...input, userId: input.userId });

      pubsub.publish(NOTIFICATION_RECEIVED, { notificationReceived: notification });
      if (input.type === 'INCIDENT') {
        pubsub.publish(NEW_INCIDENT, { newIncidentNotification: notification });
      }

      try {
        if (redis.isOpen) {
          await redis.setEx(`notification:${notification.id}`, 86400, JSON.stringify(notification));
        }
      } catch (error) {
        console.log('Redis cache skipped for notification:', error.message);
      }

      return notification;
    },

    markAsRead: async (_, { input }, context) => {
      const user = await checkAuth(context);
      const notification = await Notification.findOne({
        where: { id: input.notificationId, userId: user.id }
      });
      if (!notification) throw new UserInputError('Notification non trouvee');

      await notification.update({ isRead: true, readAt: new Date() });
      return notification;
    },

    markAllAsRead: async (_, { input }, context) => {
      const user = await checkAuth(context);
      const targetUserId = input?.userId || user.id;
      if (targetUserId !== user.id && user.role !== 'ADMIN') {
        throw new ForbiddenError('Acces refuse');
      }

      const [count] = await Notification.update(
        { isRead: true, readAt: new Date() },
        { where: { userId: targetUserId, isRead: false } }
      );
      return count;
    },

    deleteNotification: async (_, { id }, context) => {
      const user = await checkAuth(context);
      const notification = await Notification.findOne({
        where: { id, userId: user.id }
      });
      if (!notification) throw new UserInputError('Notification non trouvee');
      await notification.destroy();
      return true;
    }
  },

  Subscription: {
    notificationReceived: {
      subscribe: () => pubsub.asyncIterator([NOTIFICATION_RECEIVED])
    },
    newIncidentNotification: {
      subscribe: () => pubsub.asyncIterator([NEW_INCIDENT])
    }
  }
};

module.exports = resolvers;
