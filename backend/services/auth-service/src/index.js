require('dotenv').config();
const express = require('express');
const { ApolloServer } = require('apollo-server-express');
const cors = require('cors');
const sequelize = require('./config/database');
const typeDefs = require('./graphql/schema');
const resolvers = require('./graphql/resolvers');
const User = require('./models/User');
const bcrypt = require('bcryptjs');

const app = express();
const PORT = process.env.PORT || 4001;

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'OK', service: 'auth-service', timestamp: new Date().toISOString() });
});

const { buildSubgraphSchema } = require('@apollo/subgraph');

async function startServer() {
  const server = new ApolloServer({
    schema: buildSubgraphSchema([{ typeDefs, resolvers }]),
    context: ({ req }) => ({ authHeader: req.headers.authorization || '' }),
    formatError: (error) => ({
      message: error.message,
      code: error.extensions?.code || 'INTERNAL_SERVER_ERROR',
      path: error.path
    })
  });

  await server.start();
  server.applyMiddleware({ app, path: '/graphql' });

  await sequelize.sync({ alter: true });
  console.log('Auth database synced');

  const adminExists = await User.findOne({ where: { role: 'ADMIN' } });
  if (!adminExists) {
    await User.create({
      email: 'admin@smarttraffic.tn',
      password: await bcrypt.hash('admin123', 12),
      firstName: 'Admin',
      lastName: 'System',
      role: 'ADMIN'
    });
    console.log('Default admin created: admin@smarttraffic.tn / admin123');
  }

  app.listen(PORT, () => {
    console.log(`Auth Service running on http://localhost:${PORT}`);
    console.log(`GraphQL endpoint: http://localhost:${PORT}/graphql`);
  });
}

startServer().catch(console.error);
