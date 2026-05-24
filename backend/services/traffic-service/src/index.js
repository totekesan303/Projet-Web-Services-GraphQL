require('dotenv').config();
const express = require('express');
const { ApolloServer } = require('apollo-server-express');
const cors = require('cors');
const sequelize = require('./config/database');
const typeDefs = require('./graphql/schema');
const resolvers = require('./graphql/resolvers');

const app = express();
const PORT = process.env.PORT || 4003;

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'OK', service: 'traffic-service' });
});

const { buildSubgraphSchema } = require('@apollo/subgraph');

async function startServer() {
  const server = new ApolloServer({
    schema: buildSubgraphSchema([{ typeDefs, resolvers }]),
    context: ({ req }) => ({ req }),
    formatError: (error) => ({
      message: error.message,
      code: error.extensions?.code || 'INTERNAL_SERVER_ERROR'
    })
  });

  await server.start();
  server.applyMiddleware({ app, path: '/graphql' });

  await sequelize.sync({ alter: true });
  console.log('Traffic database synced');

  app.listen(PORT, () => {
    console.log(`Traffic Service running on http://localhost:${PORT}`);
    console.log(`GraphQL endpoint: http://localhost:${PORT}/graphql`);
  });
}

startServer().catch(console.error);
