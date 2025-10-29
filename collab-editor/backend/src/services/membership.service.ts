// src/services/membership.service.ts
import { AccessLevel } from "@prisma/client";
import * as membershipRepo from "../repositories/membership.repository";
import * as userService from "./user.service";

/**
 * addMember
 * - role: AccessLevel.READ | AccessLevel.WRITE
 * - returns the membership record
 */
export async function addMember(documentId: string, userId: string, role: AccessLevel = AccessLevel.READ) {
  return membershipRepo.upsertMembership(userId, documentId, role);
}

/**
 * addMemberByEmail
 * Finds (or creates) users by email and adds them to the document.
 * - emails: string[] - list of emails to add
 * - role: AccessLevel.READ | AccessLevel.WRITE
 * - returns array of membership records
 *
 * Note: current implementation uses strict invite-only behavior (errors if any email has no user).
 * If you prefer to auto-create users, replace userService.getUserByEmail with userService.getOrCreateUserByEmail.
 */
export async function addMemberByEmail(documentId: string, emails: string[], role: AccessLevel = AccessLevel.READ) {
  if (!Array.isArray(emails) || emails.length === 0) {
    throw new Error("emails must be a non-empty array of email strings");
  }

  const notFound: string[] = [];
  const addedMembers = [];

  // sequentially ensure predictable errors / ordering; switch to Promise.all if parallelism desired
  for (const email of emails) {
    const user = await userService.getUserByEmail(email);
    if (!user) {
      notFound.push(email);
      continue;
    }
    const membership = await addMember(documentId, user.id, role);
    addedMembers.push(membership);
  }

  if (notFound.length) {
    throw new Error(`User(s) not found for email(s): ${notFound.join(", ")}`);
  }

  return addedMembers;
}

export async function removeMember(documentId: string, userId: string) {
  return membershipRepo.deleteMembership(userId, documentId);
}

export async function getMembers(documentId: string) {
  return membershipRepo.findMembershipsByDocument(documentId);
}

/**
 * changeMemberRole
 */
export async function changeMemberRole(documentId: string, userId: string, role: AccessLevel) {
  return membershipRepo.updateMembershipRole(userId, documentId, role);
}
