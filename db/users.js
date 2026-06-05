// Mock in-memory user database
// Plaintext passwords for testing: admin123 | premium123 | free123
const users = [
  {
    id: '1',
    email: 'admin@aigenius.com',
    password: '$2b$10$6GZ5KklnHncVW6ncqqOeCe1bgQwSY9Jx.dHJoZ.IH.Pzm2z.pj6su',
    role: 'Admin',
  },
  {
    id: '2',
    email: 'premium@aigenius.com',
    password: '$2b$10$Av6.pfmz8h30BOAyCw5wPej4D4Zb1JKcP5GQ3eWRWtIMZW4u52Yeq',
    role: 'Premium_User',
  },
  {
    id: '3',
    email: 'free@aigenius.com',
    password: '$2b$10$119n.i9oT6tFxhJ4aGfJSej8LsyfCSrKcjtoNg2MILJ5La6qHCUqK',
    role: 'Free_User',
  },
];

// In-memory whitelist of issued refresh tokens
const refreshTokenStore = new Set();

const findByEmail = (email) => users.find((u) => u.email === email);
const findById = (id) => users.find((u) => u.id === id);

module.exports = { refreshTokenStore, findByEmail, findById };
