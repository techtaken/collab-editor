import express from 'express';
import * as path from 'path';
import mongoose from 'mongoose';
import cors from 'cors';

const app = express();

// Middleware to parse JSON
app.use(express.json());
app.use(cors({
  origin: process.env.FE_URL,
}));

// MongoDB connection
const mongoUri = process.env.MONGO_URI
mongoose.connect(mongoUri)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Mongoose schema and model
const UserCodeSchema = new mongoose.Schema({
  username: { type: String, required: true },
  code: { type: String, required: true },
}, { timestamps: true });

const UserCode = mongoose.model('UserCode', UserCodeSchema);

// Serve static assets
app.use('/assets', express.static(path.join(__dirname, 'assets')));

// API routes
app.get('/api', (req, res) => {
  res.send({ message: 'Welcome to backend!' });
});

// POST endpoint to save user and code
app.post('/api/save-code', async (req, res) => {
  const { username, code } = req.body;

  if (!username || !code) {
    return res.status(400).send({ error: 'Username and code are required' });
  }

  try {
    const updatedUserCode = await UserCode.findOneAndUpdate(
      { username }, // Search for an entry with the given username
      { code }, // Update the code field
      { new: true, upsert: true } // Return the updated document and create a new one if it doesn't exist
    );
    res.status(201).send({ message: 'Code saved successfully', data: updatedUserCode });
  } catch (error) {
    console.error('Error saving code:', error);
    res.status(500).send({ error: 'Failed to save code' });
  }
});

// GET endpoint to retrieve saved code by username
app.get('/api/get-code/:username', async (req, res) => {
  const { username } = req.params;

  if (!username) {
    return res.status(400).send({ error: 'Username is required' });
  }

  try {
    const userCode = await UserCode.findOne({ username });

    if (!userCode) {
      return res.status(404).send({ error: 'No code found for the specified username' });
    }

    res.status(200).send({ message: 'Code retrieved successfully', data: userCode });
  } catch (error) {
    console.error('Error retrieving code:', error);
    res.status(500).send({ error: 'Failed to retrieve code' });
  }
});

// Start the server
const port = process.env.PORT || 3333;
const server = app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}/api`);
});
server.on('error', console.error);