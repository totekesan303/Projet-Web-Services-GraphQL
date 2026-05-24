const { gql } = require('apollo-server-express');

const typeDefs = gql`
  enum NotificationType {
    INCIDENT
    STATUS_UPDATE
    TRAFFIC_ALERT
    SYSTEM
    GENERAL
  }

  type Notification {
    id: ID!
    title: String!
    message: String!
    type: NotificationType!
    userId: ID!
    isRead: Boolean!
    readAt: String
    data: String
    createdAt: String!
  }

  type NotificationCount {
    total: Int!
    unread: Int!
    read: Int!
  }

  input SendNotificationInput {
    title: String!
    message: String!
    type: NotificationType
    userId: ID!
    data: String
  }

  input MarkReadInput {
    notificationId: ID!
  }

  input MarkAllReadInput {
    userId: ID
  }

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
`;

module.exports = typeDefs;
