const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { UserInputError, AuthenticationError, ForbiddenError } = require('apollo-server-express');
const User = require('../models/User');

const generateToken = (user) => {
  return jwt.sign(
    { userId: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
  );
};

const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    throw new AuthenticationError('Token invalide ou expire');
  }
};

const getUser = async (authHeader) => {
  if (!authHeader) throw new AuthenticationError('Authentification requise');
  const token = authHeader.replace('Bearer ', '');
  const decoded = verifyToken(token);
  const user = await User.findByPk(decoded.userId);
  if (!user || !user.isActive) throw new AuthenticationError('Utilisateur non trouve ou inactif');
  return user;
};

const requireRole = (user, roles) => {
  if (!roles.includes(user.role)) throw new ForbiddenError('Acces refuse - Privileges insuffisants');
};

const resolvers = {
  User: {
    fullName: (parent) => `${parent.firstName} ${parent.lastName}`
  },

  Query: {
    me: async (_, __, { authHeader }) => await getUser(authHeader),
    users: async (_, __, { authHeader }) => {
      const user = await getUser(authHeader);
      requireRole(user, ['ADMIN']);
      return await User.findAll({ order: [['createdAt', 'DESC']] });
    },
    user: async (_, { id }, { authHeader }) => {
      const user = await getUser(authHeader);
      requireRole(user, ['ADMIN']);
      const found = await User.findByPk(id);
      if (!found) throw new UserInputError('Utilisateur non trouve');
      return found;
    }
  },

  Mutation: {
    register: async (_, { input }) => {
      if (!input.email || !input.password || !input.firstName || !input.lastName) {
        throw new UserInputError('Tous les champs sont requis');
      }
      if (input.password.length < 6) throw new UserInputError('Mot de passe minimum 6 caracteres');

      const existing = await User.findOne({ where: { email: input.email } });
      if (existing) throw new UserInputError('Cet email est deja utilise');

      const hashedPassword = await bcrypt.hash(input.password, 12);
      const user = await User.create({
        email: input.email,
        password: hashedPassword,
        firstName: input.firstName,
        lastName: input.lastName,
        role: input.role || 'OPERATOR'
      });

      return { token: generateToken(user), user };
    },

    login: async (_, { input }) => {
      const user = await User.findOne({ where: { email: input.email } });
      if (!user) throw new AuthenticationError('Email ou mot de passe incorrect');
      if (!user.isActive) throw new AuthenticationError('Compte desactive');

      const isValid = await bcrypt.compare(input.password, user.password);
      if (!isValid) throw new AuthenticationError('Email ou mot de passe incorrect');

      return { token: generateToken(user), user };
    },

    updateUser: async (_, { id, input }, { authHeader }) => {
      const user = await getUser(authHeader);
      requireRole(user, ['ADMIN']);
      const target = await User.findByPk(id);
      if (!target) throw new UserInputError('Utilisateur non trouve');
      await target.update(input);
      return target;
    },

    deleteUser: async (_, { id }, { authHeader }) => {
      const user = await getUser(authHeader);
      requireRole(user, ['ADMIN']);
      const target = await User.findByPk(id);
      if (!target) throw new UserInputError('Utilisateur non trouve');
      if (target.id === user.id) throw new ForbiddenError('Vous ne pouvez pas supprimer votre propre compte');
      await target.destroy();
      return true;
    }
  }
};

module.exports = resolvers;
