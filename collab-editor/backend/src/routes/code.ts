// routes/code.ts or in your main server file

import express from 'express';
const router = express.Router();

// POST /code
router.post('/code', (req, res) => {
  const { code, userId } = req.body;

  if (!code || !userId) {
    return res.status(400).json({ message: 'Missing code or userId' });
  }

  // Save to database here (MongoDB, Postgres, etc.)
  console.log(`Saving code for user ${userId}:\n${code}`);

  res.json({ message: 'Code saved successfully' });
});

export default router;
