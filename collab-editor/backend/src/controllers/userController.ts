// import CollabCode from '../models/CollabCode';
import { Request, Response } from 'express';

export const getUserByCollabCode = async (req: Request, res: Response) => {
  const { collabCode } = req.params;

  if (!collabCode) {
    return res.status(400).send({ error: 'Collaboration code is required' });
  }

  try {
    const userCollab = await CollabCode.findOne({ collabCode });

    if (!userCollab) {
      return res.status(404).send({ error: 'No user found for the specified collaboration code' });
    }

    res.status(200).send({ message: 'User retrieved successfully', data: userCollab });
  } catch (error) {
    console.error('Error retrieving user by collaboration code:', error);
    res.status(500).send({ error: 'Failed to retrieve user by collaboration code' });
  }
};

export const generateCollabCodeForUser = async (req: Request, res: Response) => {
  const { username } = req.body;

  if (!username) {
    return res.status(400).send({ error: 'Username is required' });
  }

  try {
    // Generate a random collaboration code
    const collabCode = Math.random().toString(36).substring(2, 10).toUpperCase();

    // Create or update the user with the collaboration code
    const updatedCollabCode = await CollabCode.findOneAndUpdate(
      { username }, // Search for an entry with the given username
      { collabCode }, // Update the collabCode field
      { new: true, upsert: true } // Return the updated document and create a new one if it doesn't exist
    );

    res.status(201).send({ message: 'Collaboration code generated successfully', data: updatedCollabCode });
  } catch (error) {
    console.error('Error generating collaboration code:', error);
    res.status(500).send({ error: 'Failed to generate collaboration code' });
  }
}