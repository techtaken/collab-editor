import express from 'express';
import * as path from 'path';
import cors from 'cors';
import { getCodeByUsername, saveCodeToDb } from './controllers/CodeController';
import { getUserByCollabCode, generateCollabCodeForUser } from './controllers/UserController';

const app = express();

// Middleware to parse JSON
app.use(express.json());
app.use(cors({
  origin: process.env.FE_URL,
}));

// Serve static assets
app.use('/assets', express.static(path.join(__dirname, 'assets')));

// API routes
app.get('/api', (req, res) => {
  res.send({ message: 'Welcome to backend!' });
});

// POST endpoint to save user and code
app.post('/api/save-code', saveCodeToDb);

// GET endpoint to retrieve saved code by username
app.get('/api/get-code/:username',getCodeByUsername );

app.post('/api/generate-collab-code', generateCollabCodeForUser);
app.get('/api/get-user-by-collab-code/:collabCode', getUserByCollabCode);

// Start the server
const port = process.env.PORT || 3333;
const server = app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}/api`);
});
server.on('error', console.error);