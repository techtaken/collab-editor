import express from 'express';
import * as path from 'path';
import mongoose from 'mongoose';

const app = express();

// Middleware to parse JSON
app.use(express.json());

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
    const newUserCode = new UserCode({ username, code });
    await newUserCode.save();
    res.status(201).send({ message: 'Code saved successfully', data: newUserCode });
  } catch (error) {
    console.error('Error saving code:', error);
    res.status(500).send({ error: 'Failed to save code' });
  }
});

// Start the server
const port = process.env.PORT || 3333;
const server = app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}/api`);
});
server.on('error', console.error);