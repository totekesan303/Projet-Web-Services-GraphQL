process.env.JWT_SECRET = 'test_secret';
process.env.JWT_EXPIRES_IN = '1h';

jest.mock('../models/User', () => ({
  findOne: jest.fn(),
  findByPk: jest.fn(),
  findAll: jest.fn(),
  create: jest.fn()
}));

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const resolvers = require('./resolvers');

describe('Auth resolvers', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Mutation.register', () => {
    it('creates an operator account and returns a JWT', async () => {
      const input = {
        email: 'operator@test.com',
        password: 'secret123',
        firstName: 'Test',
        lastName: 'Operator'
      };
      const createdUser = {
        id: 'user-1',
        email: input.email,
        firstName: input.firstName,
        lastName: input.lastName,
        role: 'OPERATOR',
        isActive: true
      };

      User.findOne.mockResolvedValue(null);
      User.create.mockResolvedValue(createdUser);

      const result = await resolvers.Mutation.register(null, { input });
      const decoded = jwt.verify(result.token, process.env.JWT_SECRET);

      expect(User.create).toHaveBeenCalledWith(expect.objectContaining({
        email: input.email,
        firstName: input.firstName,
        lastName: input.lastName,
        role: 'OPERATOR'
      }));
      expect(User.create.mock.calls[0][0].password).not.toBe(input.password);
      expect(await bcrypt.compare(input.password, User.create.mock.calls[0][0].password)).toBe(true);
      expect(decoded).toMatchObject({
        userId: createdUser.id,
        email: createdUser.email,
        role: createdUser.role
      });
      expect(result.user).toBe(createdUser);
    });

    it('rejects an already used email', async () => {
      User.findOne.mockResolvedValue({ id: 'existing-user' });

      await expect(resolvers.Mutation.register(null, {
        input: {
          email: 'admin@test.com',
          password: 'secret123',
          firstName: 'Admin',
          lastName: 'User'
        }
      })).rejects.toThrow('Cet email est deja utilise');

      expect(User.create).not.toHaveBeenCalled();
    });
  });

  describe('Mutation.login', () => {
    it('returns a JWT for valid credentials', async () => {
      const hashedPassword = await bcrypt.hash('admin123', 12);
      const user = {
        id: 'admin-1',
        email: 'admin@smarttraffic.tn',
        password: hashedPassword,
        role: 'ADMIN',
        isActive: true
      };

      User.findOne.mockResolvedValue(user);

      const result = await resolvers.Mutation.login(null, {
        input: { email: user.email, password: 'admin123' }
      });
      const decoded = jwt.verify(result.token, process.env.JWT_SECRET);

      expect(decoded).toMatchObject({
        userId: user.id,
        email: user.email,
        role: user.role
      });
      expect(result.user).toBe(user);
    });

    it('rejects invalid credentials', async () => {
      const hashedPassword = await bcrypt.hash('admin123', 12);
      User.findOne.mockResolvedValue({
        id: 'admin-1',
        email: 'admin@smarttraffic.tn',
        password: hashedPassword,
        role: 'ADMIN',
        isActive: true
      });

      await expect(resolvers.Mutation.login(null, {
        input: { email: 'admin@smarttraffic.tn', password: 'wrong-password' }
      })).rejects.toThrow('Email ou mot de passe incorrect');
    });
  });
});
