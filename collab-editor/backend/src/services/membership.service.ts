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
 * Finds (or creates) a user by email and adds them to the document.
 * If you prefer strict invite-only, replace getOrCreateUserByEmail with getUserByEmail and error if not found.
 */
export async function addMemberByEmail(documentId: string, email: string, role: AccessLevel = AccessLevel.READ) {
  const user = await userService.getUserByEmail(email);
  if(!user){
    throw new Error("User with this email does not exist");
  }
  return addMember(documentId, user.id, role);
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
