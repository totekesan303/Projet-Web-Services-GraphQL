require('dotenv').config();
const express = require('express');
const { ApolloServer } = require('apollo-server-express');
const { createServer } = require('http');
const { WebSocketServer } = require('ws');
const { useServer } = require('graphql-ws/lib/use/ws');
const cors = require('cors');
const sequelize = require('./config/database');
const typeDefs = require('./graphql/schema');
const resolvers = require('./graphql/resolvers');

const app = express();
const PORT = process.env.PORT || 4005;

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'OK', service: 'notification-service' });
});

const { buildSubgraphSchema } = require('@apollo/subgraph');

async function startServer() {
  const schema = buildSubgraphSchema([{ typeDefs, resolvers }]);

  const server = new ApolloServer({
    schema,
    context: ({ req }) => ({ req }),
    formatError: (error) => ({
      message: error.message,
      code: error.extensions?.code || 'INTERNAL_SERVER_ERROR'
    })
  });

  await server.start();
  server.applyMiddleware({ app, path: '/graphql' });

  const httpServer = createServer(app);
  const wsServer = new WebSocketServer({
    server: httpServer,
    path: '/graphql',
  });

  useServer({ schema }, wsServer);

  await sequelize.sync({ alter: true });
  console.log('Notification database synced');

  httpServer.listen(PORT, () => {
    console.log(`Notification Service running on http://localhost:${PORT}`);
    console.log(`GraphQL endpoint: http://localhost:${PORT}/graphql`);
    console.log(`WebSocket endpoint: ws://localhost:${PORT}/graphql`);
  });
}

startServer().catch(console.error);
