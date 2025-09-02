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



CODE DESCRIPTION : 


Based on the provided code snippets, I'll provide an overview of the frontend module of this project. Please note that some details might be missing, and I'll do my best to fill in the gaps.

**Overview**

The frontend module is built using React, with a focus on routing using `react-router-dom`. The application is divided into several components, pages, and routes, which work together to provide a collaborative document editing experience.

**Components**

1. **Layout**: A top-level component that wraps the entire application, providing a basic layout structure. It imports `TopBar` and `Sidebar` components.
2. **TopBar**: A component that renders the top navigation bar, likely containing links to main pages or features.
3. **Sidebar**: A component that renders the sidebar, which contains a list of documents (DocCard) and a NewDocModal for creating new documents.
4. **DocCard**: A component that represents a single document, displaying its metadata (e.g., title, author).
5. **NewDocModal**: A modal component for creating new documents.
6. **EditorShell**: A component that wraps the CodeEditor and provides additional functionality, such as sharing and collaboration features.
7. **CodeEditor**: A component that renders the code editor, using the `@uiw/react-codemirror` library.
8. **LanguageSwitch**: A component that allows users to switch between programming languages.
9. **CollaboratorsList**: A component that displays a list of collaborators for a document.
10. **ShareButton**: A component that allows users to share documents.
11. **RegisterUser**: A component for user registration (not explicitly mentioned in the provided code snippets, but inferred from the `userAtom` import).

**Pages**

1. **Dashboard**: The main page of the application, which displays a list of documents (using the `DocCard` component).
2. **DocPage**: A page that displays a single document, using the `EditorShell` component.

**Routes**

1. **/**: The root route, which redirects to the `/` route (Dashboard).
2. **/doc/:id**: A route that displays a single document, using the `DocPage` component. The `:id` parameter is used to fetch the document metadata and content.
3. **\***: A catch-all route that redirects to the `/` route (Dashboard) if no other route matches.

**Tying it all together**

The application uses the `Recoil` state management library to manage global state. The `userAtom` and `docsState` atoms are used to store user data and document metadata, respectively.

The `App` component is the main entry point of the application, which renders the `Routes` component. The `Routes` component defines the application's routes, using the `Route` component to map URLs to specific pages or components.

When a user navigates to a route, the corresponding page or component is rendered. For example, when a user visits `/doc/:id`, the `DocPage` component is rendered, which fetches the document metadata and content using the `api` module. The `EditorShell` component is then rendered, which wraps the `CodeEditor` component and provides additional functionality.

The `api` module is used to make API requests to the backend server, which provides data for the frontend components. The `api` module is imported by various components, such as `DocPage` and `EditorShell`.

Overall, the frontend module provides a collaborative document editing experience, with features like user registration, document creation, and sharing. The application uses a combination of React, `react-router-dom`, and Recoil to manage state and provide a seamless user experience.