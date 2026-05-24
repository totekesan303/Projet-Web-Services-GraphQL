const axios = require('axios');

const authMiddleware = async (req) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) throw new Error('Authentification requise');

  try {
    const response = await axios.post(
      `${process.env.AUTH_SERVICE_URL}/graphql`,
      { query: 'query { me { id email role firstName lastName } }' },
      { headers: { Authorization: authHeader } }
    );
    if (response.data.errors) throw new Error(response.data.errors[0].message);
    return response.data.data.me;
  } catch (error) {
    throw new Error('Token invalide');
  }
};

module.exports = { authMiddleware };
