import { User } from "@prisma/client";
import * as userRepo from "../repositories/user.repository";

// Create a user
export async function createUser(
  email: string,
  name?: string,
  preferredLanguage?: string
): Promise<User> {
  return userRepo.createUser({ email, name, preferredLanguage });
}

// Fetch user by ID
export async function getUserById(id: string): Promise<User | null> {
  return userRepo.findUserById(id);
}

// Fetch user by email
export async function getUserByEmail(email: string): Promise<User | null> {
  return userRepo.findUserByEmail(email);
}

// Get existing user or create a new one
export async function getOrCreateUserByEmail(
  email: string,
  name?: string,
  preferredLanguage?: string
): Promise<User> {
  const existing = await userRepo.findUserByEmail(email);
  if (existing) return existing;

  return userRepo.createUser({ email, name, preferredLanguage });
}

// Update preferred language
export async function updatePreferredLanguage(
  userId: string,
  preferredLanguage: string
): Promise<User> {
  return userRepo.updateUser(userId, { preferredLanguage });
}

// List recent users
export async function listUsers(limit = 50): Promise<User[]> {
  return userRepo.listUsers(limit);
}

// Delete user
export async function deleteUser(userId: string): Promise<User> {
  return userRepo.deleteUser(userId);
}
