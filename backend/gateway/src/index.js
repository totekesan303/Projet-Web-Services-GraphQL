require('dotenv').config();
const express = require('express');
const { ApolloGateway, IntrospectAndCompose, RemoteGraphQLDataSource } = require('@apollo/gateway');
const { ApolloServer } = require('apollo-server-express');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'OK', service: 'api-gateway' });
});

async function startGateway() {
  const gateway = new ApolloGateway({
    supergraphSdl: new IntrospectAndCompose({
      subgraphs: [
        { name: 'auth', url: process.env.AUTH_SERVICE_URL || 'http://localhost:4001/graphql' },
        { name: 'vehicle', url: process.env.VEHICLE_SERVICE_URL || 'http://localhost:4002/graphql' },
        { name: 'traffic', url: process.env.TRAFFIC_SERVICE_URL || 'http://localhost:4003/graphql' },
        { name: 'incident', url: process.env.INCIDENT_SERVICE_URL || 'http://localhost:4004/graphql' },
        { name: 'notification', url: process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:4005/graphql' },
      ],
      pollIntervalInMs: 30000,
    }),
    buildService({ name, url }) {
      return new RemoteGraphQLDataSource({
        url,
        fetcher: fetch,
        willSendRequest({ request, context }) {
          if (context.authHeader) {
            request.http.headers.set('Authorization', context.authHeader);
          }
        },
      });
    },
  });

  const server = new ApolloServer({
    gateway,
    subscriptions: false,
    context: ({ req }) => {
      const authHeader = req.headers.authorization || '';
      return {
        authHeader,
        user: authHeader ? decodeToken(authHeader) : null
      };
    },
    formatError: (error) => {
      console.error('Gateway Error:', error.message);
      return {
        message: error.message,
        code: error.extensions?.code || 'INTERNAL_SERVER_ERROR',
        path: error.path
      };
    }
  });

  await server.start();
  server.applyMiddleware({ app, path: '/graphql' });

  app.listen(PORT, () => {
    console.log(`API Gateway running on http://localhost:${PORT}`);
    console.log(`GraphQL Federation endpoint: http://localhost:${PORT}/graphql`);
    console.log('');
    console.log('Services connectes:');
    console.log('  - Auth Service:        http://localhost:4001/graphql');
    console.log('  - Vehicle Service:     http://localhost:4002/graphql');
    console.log('  - Traffic Service:     http://localhost:4003/graphql');
    console.log('  - Incident Service:    http://localhost:4004/graphql');
    console.log('  - Notification Service: http://localhost:4005/graphql');
  });
}

function decodeToken(authHeader) {
  try {
    const token = authHeader.replace('Bearer ', '');
    return jwt.decode(token);
  } catch (e) {
    return null;
  }
}

async function run() {
  let attempt = 1;
  while (true) {
    try {
      await startGateway();
      break;
    } catch (err) {
      console.error(`[Gateway Retry] Attempt ${attempt} failed: ${err.message}. Retrying in 5 seconds...`);
      attempt++;
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }
}

run();
