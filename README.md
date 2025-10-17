# Authorization App Backend

A lightweight, extensible Node.js backend that provides authentication and authorization functionality for web and mobile applications. This repository implements typical authorization primitives such as user registration, login (JWT-based), role and permission management, and token refresh/revocation flows.

Built with plain JavaScript, the codebase aims to be easy to read and adapt so you can drop it into existing projects or use it as a learning reference for secure auth patterns.

Status: Stable (adjust as needed)

## Table of contents

- [Features](#features)
- [Tech stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Environment variables](#environment-variables)
- [Running](#running)
- [API](#api)
  - [Auth / Account](#auth--account)
  - [Users](#users)
  - [Roles & Permissions](#roles--permissions)
- [Authentication flow](#authentication-flow)
- [Database](#database)
- [Testing](#testing)
- [Linting & formatting](#linting--formatting)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [Security](#security)
- [License](#license)
- [Contact](#contact)

## Features

- User registration and email/username uniqueness checks
- Password hashing (bcrypt)
- JSON Web Token (JWT) based authentication (access + refresh tokens)
- Role-based access control (RBAC) with permissions
- Token refresh and logout (revocation) endpoints
- Input validation and basic error handling
- Example middleware for protecting routes and checking permissions
- Ready for extension: add OAuth, MFA, audit logging, etc.

## Tech stack

- Node.js (JavaScript)
- Express (HTTP server)
- bcrypt (password hashing)
- jsonwebtoken (JWT handling)
- Any relational/no-SQL DB (MongoDB, PostgreSQL, etc.) — repository is DB-agnostic; adapt models to your chosen DB
- dotenv for environment configuration

## Prerequisites

- Node >= 14 (recommended >= 16)
- npm or yarn
- A configured database (MongoDB / PostgreSQL / MySQL) or memory/mock DB for development

## Installation

1. Clone the repository

   git clone https://github.com/Ritabrata-Mandal/Authorization-App-Backend.git
   cd Authorization-App-Backend

2. Install dependencies

   npm install

3. Create a `.env` file (see below for required variables)

4. Run migrations / seeders (if applicable for your DB)

5. Start the server

   npm start

For development with automatic restarts:

   npm run dev

## Environment variables

Create a `.env` file in the project root. Example:

PORT=4000
NODE_ENV=development

# JWT
JWT_ACCESS_SECRET=replace_with_a_random_secret_for_access_tokens
JWT_REFRESH_SECRET=replace_with_a_random_secret_for_refresh_tokens
ACCESS_TOKEN_EXPIRES_IN=15m
REFRESH_TOKEN_EXPIRES_IN=7d

# Database (example for MongoDB)
DATABASE_URL=mongodb://localhost:27017/auth-app

# Optional
LOG_LEVEL=info

Important: Use strong, unpredictable secrets for the JWT secrets and never commit `.env` to source control.

## Running

Start production server:

   npm start

Start development server (with nodemon):

   npm run dev

Build (if there is a build step — adjust if project uses Babel/TypeScript):

   npm run build

## API

Below are the canonical endpoints typically provided by an authorization backend. Adjust exact paths and payloads to match the routes implemented in this repository.

Base URL: http://localhost:4000 (or PORT from your .env)

Auth / Account
- POST /api/auth/register
  - Register a new user
  - Body:
    {
      "email": "alice@example.com",
      "password": "StrongPassword123!",
      "name": "Alice"
    }
  - Returns: created user (without password) and optionally tokens

- POST /api/auth/login
  - Body:
    {
      "email": "alice@example.com",
      "password": "StrongPassword123!"
    }
  - Returns:
    {
      "accessToken": "<jwt-access-token>",
      "refreshToken": "<jwt-refresh-token>",
      "user": { "id": "...", "email": "...", "roles": [...] }
    }

- POST /api/auth/refresh
  - Exchange a refresh token for a new access token
  - Body:
    { "refreshToken": "<jwt-refresh-token>" }
  - Returns new accessToken (and optionally a new refreshToken)

- POST /api/auth/logout
  - Revoke a refresh token (logout)
  - Body:
    { "refreshToken": "<jwt-refresh-token>" }
  - Returns success status

Users
- GET /api/users
  - Protected; returns list of users (requires appropriate role/permission)
- GET /api/users/:id
  - Protected; returns user details
- PUT /api/users/:id
  - Protected; update user profile or roles (admin-only for role changes)
- DELETE /api/users/:id
  - Protected; delete user (admin-only)

Roles & Permissions
- GET /api/roles
- POST /api/roles
- PUT /api/roles/:id
- DELETE /api/roles/:id
- GET /api/permissions
- POST /api/permissions
- etc.

Example protected route (header):
Authorization: Bearer <access-token>

Example curl (login):

curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"alice@example.com","password":"Secret123"}'

If your implementation supports refresh tokens as HttpOnly cookies, the flows will differ slightly — this README uses header/token body examples for clarity.

## Authentication flow

1. Registration creates a user and stores a hashed password.
2. Login validates credentials and responds with:
   - Short-lived access token (JWT) for authorization
   - Long-lived refresh token (JWT or opaque) to obtain new access tokens
3. Access token is used in the Authorization header for protected endpoints.
4. When access token expires, use the refresh endpoint to obtain a new access token.
5. On logout, refresh tokens are revoked (blacklisted) so they cannot be reused.

Consider storing refresh tokens on the server side (DB or cache) to allow revocation/rotation.

## Database

This repository is intentionally flexible about the DB. Typical options:

- MongoDB: Use Mongoose models for User, Role, Permission, RefreshToken
- PostgreSQL / MySQL: Use an ORM such as Sequelize or Prisma

Suggested models:

- User: id, name, email (unique), passwordHash, roles[], createdAt, updatedAt
- Role: id, name (unique), permissions[]
- Permission: id, name, description
- RefreshToken: token, userId, revoked, expiresAt, createdAt

## Testing

If tests exist:

   npm test

Write unit and integration tests for:
- Auth flows (login, refresh, logout)
- Password hashing & validation
- Protected route middleware
- Role/permission checks

## Linting & formatting

If ESLint / Prettier are configured:

   npm run lint
   npm run format

Follow repository linting rules for consistent code style.

## Deployment

- Use environment variables to configure secrets and DB connection strings.
- Use HTTPS in production to protect tokens in transit.
- Use a process manager (pm2) or containerization (Docker) for reliability.
- Consider putting refresh token cookies on the HttpOnly, Secure flags if using cookie-based refresh.

Example Docker (pseudo):
- Build a Dockerfile that installs node, copies app, installs deps, sets NODE_ENV=production, and runs npm start.
- Use an orchestrator (Kubernetes, Docker Compose) to provide DB and secrets.

## Contributing

Contributions welcome.

- Fork the repo
- Create a feature branch: git checkout -b feat/your-feature
- Commit changes: git commit -m "feat: add ..."
- Open a Pull Request describing changes and rationale
- Add tests where appropriate

Please follow the existing code style and include tests for new behavior.

## Security

- Use strong, unique JWT secrets.
- Store refresh tokens securely and consider short-lived access tokens.
- Rate-limit authentication endpoints to mitigate brute-force attacks.
- Keep dependencies up-to-date and run security audits (npm audit).
- Do not log sensitive data (passwords, tokens).

## License

This project is provided under the MIT License. See LICENSE file for details.

## Contact

Maintainer: Ritabrata Mandal
Repository: https://github.com/Ritabrata-Mandal/Authorization-App-Backend

If you'd like, I can:
- Add example Postman collection for the API
- Add a sample .env.example file
- Generate basic API documentation (OpenAPI/Swagger)
Tell me which of these you'd like and I will add them to the repo.
