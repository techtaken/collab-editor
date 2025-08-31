// src/services/sharing.service.ts
import crypto from "crypto";
import { addMember } from "./membership.service";
import { AccessLevel } from "@prisma/client";
import { getOrCreateUserByEmail } from "./user.service";
import * as documentRepo from "../repositories/doc.repository";

/**
 * Note:
 * For a simple MVP we store a single shareToken on the Document model
 * (field: shareToken). The token may grant read-only or writer access
 * depending on how you design it. A more flexible implementation uses a
 * separate ShareLink table (with role, expiry) — you can evolve to that later.
 */

/**
 * createShareTokenOnDocument:
 * - will create a new random token and attach it to the Document.shareToken field.
 * - optionally set tokenRole ('READ'|'WRITE') by writing into document.shareTokenRole (if you have that field)
 */
export async function createShareTokenOnDocument(documentId: string): Promise<string> {
  const token = crypto.randomUUID();
  await documentRepo.updateDocumentShareToken(documentId, token);
  return token;
}

export async function revokeShareToken(documentId: string) {
  return documentRepo.updateDocumentShareToken(documentId, null);
}

/**
 * convenience: shareWithEmail
 * - Add a user (found by email) as an editor/viewer directly
 */
export async function shareWithEmail(documentId: string, email: string, role: AccessLevel = AccessLevel.READ) {
  // find or create the user
  const user = await getOrCreateUserByEmail(email);
  return addMember(documentId, user.id, role);
}
