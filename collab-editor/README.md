# Collab Editor Monorepo

A real-time collaborative code editor built with Nx, React, Express, Socket.io, MongoDB, Redis, and Google OAuth2.

## Monorepo Structure

- `frontend`: React 18 + TypeScript frontend (CodeMirror 6, Google OAuth2, Socket.io)
- `backend`: Node.js + Express + TypeScript backend (MongoDB, Redis, Socket.io, JWT, Google OAuth2)
- `shared-types`: TypeScript interfaces for users, documents, and OT operations
- `auth`: Auth utilities (JWT, Google OAuth2 helpers)
- `socket`: Socket.io server setup and OT algorithm stubs

## Getting Started

### 1. Install dependencies

```sh
npm install
```

### 2. Set up environment variables

Create a `.env` file in the root or export these variables in your shell:

```
# Database
MONGO_URI=mongodb://localhost:27017/realtimecollab
REDIS_URL=redis://localhost:6379

# Google OAuth2
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# JWT
JWT_SECRET=Ckv5QTFBf8fiBTCFQ8xNOLAz4cKpYWKbVvYm6IuaD1PpEK4pLoIFBscoxmnS6hEBUBFg3yW4Eu1wfwI1sGhtMQ==

# API URL for frontend
NX_API_URL=http://localhost:3333

```

For local development, you can use the defaults above for MongoDB and Redis.

#### 2a. set up mongo

```sh
cd mongodb-docker
rm -rf mongo-data
```
start docker server
```sh
docker compose up -d
```
go to cmd install 
```sh
brew install mongosh
mongosh "mongodb://root:example@localhost:27017/?authSource=admin"
test> use realtimecollab
switched to db realtimecollab
realtimecollab> db.test.insertOne({ hello: "world" })
```

### 2b. set up postgres
```sh
brew install postgresql
brew services start postgresql

npm run db:init
```

### 3. Run the backend API

```sh
npx nx serve backend
```

The API will start on http://localhost:3333

### 4. Run the frontend app

```sh
npx nx serve frontend
```

The UI will start on http://localhost:4200 (or as configured by Vite)

### 5. Build and test

```sh
npx nx build backend
npx nx build frontend
npx nx test shared-types
npx nx test auth
npx nx test socket
```

### 6. Nx Cloud Caching

Nx Cloud is enabled for build, serve, and test targets for fast CI and local caching.

### 7. Project Graph

To visualize dependencies:

```sh
npx nx graph
```

## Features

- Google OAuth2 and JWT authentication
- Real-time collaborative editing with Socket.io
- MongoDB for document/user storage
- Redis for session state
- Operational Transform (OT) algorithm stubbed for collaborative editing

## Environment Variables

- `MONGO_URI`: MongoDB connection string
- `REDIS_URL`: Redis connection string
- `GOOGLE_CLIENT_ID`: Google OAuth2 client ID
- `GOOGLE_CLIENT_SECRET`: Google OAuth2 client secret
- `JWT_SECRET`: Secret for signing JWTs

## License

MIT