# AI-Genius Path — JWT Auth & RBAC API

A secure, stateless authentication and authorization subsystem built with **Node.js**, **Express**, and **JWT**. Implements Role-Based Access Control (RBAC), access/refresh token lifecycle, and a mock AI-powered API backend.

---

## Tech Stack

- Node.js + Express
- JSON Web Tokens (`jsonwebtoken`)
- bcrypt (password hashing)
- cookie-parser (httpOnly refresh token cookie)
- dotenv (environment variable management)

---

## Project Structure

```
ai-genius-path/
├── db/
│   └── users.js              # Mock in-memory user DB + refresh token whitelist
├── middleware/
│   ├── protect.js            # Auth middleware (Bearer token verification)
│   ├── restrictTo.js         # RBAC middleware factory
│   └── errorHandler.js       # Centralized error handler
├── routes/
│   ├── auth.js               # /api/auth/* (login, refresh, logout)
│   └── ai.js                 # /api/ai/* (mock AI endpoints)
├── utils/
│   └── jwt.js                # JWT sign/verify helpers
├── server.js                 # App entry point
├── .env.example              # Environment variable template
└── package.json
```

---

## Setup

1. **Clone the repo**
   ```bash
   git clone https://github.com/issm-mursaleen/ai-genius-path.git
   cd ai-genius-path
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create your `.env` file**
   ```env
   PORT=5000
   JWT_SECRET=your_jwt_secret_here
   JWT_EXPIRES_IN=15m
   JWT_REFRESH_SECRET=your_refresh_secret_here
   JWT_REFRESH_EXPIRES_IN=7d
   ```

4. **Run the server**
   ```bash
   npm run dev      # development (nodemon)
   npm start        # production
   ```

---

## API Endpoints

### Auth Routes

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/login` | Login and receive access + refresh tokens |
| `POST` | `/api/auth/refresh` | Issue a new access token via refresh cookie |
| `POST` | `/api/auth/logout` | Revoke refresh token and clear cookie |

### AI Routes (all require `Authorization: Bearer <token>`)

| Method | Endpoint | Allowed Roles |
|--------|----------|---------------|
| `GET` | `/api/ai/free-model` | All logged-in users |
| `POST` | `/api/ai/premium-model` | `Premium_User`, `Admin` |
| `DELETE` | `/api/ai/purge-cache` | `Admin` only |

---

## Test Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@aigenius.com` | `admin123` |
| Premium User | `premium@aigenius.com` | `premium123` |
| Free User | `free@aigenius.com` | `free123` |

---

## Authentication Flow

1. **Login** → returns `accessToken` (15 min) in JSON + sets `refreshToken` (7 days) in httpOnly cookie
2. **Protected routes** → send `Authorization: Bearer <accessToken>` header
3. **Token expired** → call `POST /api/auth/refresh` (cookie sent automatically)
4. **Logout** → refresh token is revoked from whitelist and cookie is cleared

---

## Security Features

- Passwords hashed with **bcrypt** (salt rounds: 10)
- Refresh tokens stored in a **server-side whitelist** — revoked on logout
- Refresh token delivered via **httpOnly, sameSite=strict** cookie
- JWT payload contains only `id`, `email`, `role` — no sensitive data
- Centralized error handling with proper `401`/`403` HTTP status codes
- All secrets managed via `.env` — never hardcoded
