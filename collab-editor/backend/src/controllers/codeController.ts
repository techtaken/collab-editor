import { Request, Response } from 'express';
import UserCode from '../models/UserCode';

export const saveCodeToDb = async (req: Request, res: Response) => {
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
  }

export const getCodeByUsername = async (req: Request, res: Response) => {
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
}
