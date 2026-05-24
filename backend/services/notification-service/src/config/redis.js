const { createClient } = require('redis');

const client = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
});

client.on('error', (err) => console.log('Redis Client Error:', err));

(async () => {
  try {
    await client.connect();
    console.log('Redis connected');
  } catch (err) {
    console.log('Redis unavailable, notifications will continue without cache:', err.message);
  }
})();

module.exports = client;
