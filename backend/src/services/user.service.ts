import { User } from "@prisma/client";
import * as userRepo from "../repositories/user.repository";

const bcrypt = require("bcryptjs");

export async function registerUser(email, name, password) {
  // check if user already exists
  const existingUser = await userRepo.findUserByEmail(email);
  if (existingUser) {
    throw new Error("User already exists with this email");
  }

  // hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // save user
  const user = await userRepo.createUser({
    email,
    name,
    hashedPassword,
  });

  // Optionally omit password before returning user
  const { hashedPassword: _pw, ...userWithoutPassword } = user;
  return userWithoutPassword;
}
// Create a user
export async function createUser(
  email: string,
  name: string,
  hashedPassword: string,
  
): Promise<User> {
  return userRepo.createUser({ email, name, hashedPassword });
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
// export async function getOrCreateUserByEmail(
//   email: string,
//   name?: string,
//   preferredLanguage?: string
// ): Promise<User> {
//   const existing = await userRepo.findUserByEmail(email);
//   if (existing) return existing;

//   return userRepo.createUser({ email, name, preferredLanguage , hashedPassword});
// }

// patch User Info
export async function patchUser(
  userId: string,
  data: { name?: string; preferredLanguage?: string }
): Promise<User> {
  return userRepo.updateUser(userId, data );
}

// List recent users
export async function listUsers(limit = 50): Promise<User[]> {
  return userRepo.listUsers(limit);
}

// Delete user
export async function deleteUser(userId: string): Promise<User> {
  return userRepo.deleteUser(userId);
}
/**
 * Validate user credentials and return user if valid.
 * @param email User's email
 * @param password User's password
 * @returns User object if credentials are valid, otherwise null
 */
// add a safe user type that omits the hashed password
type PublicUser = Omit<User, "hashedPassword">;

export async function  validateAndGetUser(email: string, password: string): Promise<PublicUser | null> {
  const user = await getUserByEmail(email);
  if (!user) {
    return null;
  }
  
  const isMatch = await bcrypt.compare(password, user.hashedPassword);
  if (!isMatch) {
    console.log("not matching");
    return null;
  }
  // Optionally omit password before returning user
  const { hashedPassword: _pw, ...userWithoutPassword } = user;
  
  return userWithoutPassword;

};


