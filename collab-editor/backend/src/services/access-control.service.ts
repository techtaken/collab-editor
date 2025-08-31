import { AccessLevel, Visibility } from "@prisma/client";
import * as documentRepo from "../repositories/doc.repository";

/**
 * Evaluate whether a given userId (or anonymous if null) can read/write document.
 *
 * token: optional share token included in URL (?token=xxx)
 *
 * returns an object { canRead: boolean, canWrite: boolean, reason?: string }
 */
export async function evaluateAccess(params: {
  userId?: string | null;
  documentId: string;
  token?: string | null;
}) {
  const { userId, documentId, token } = params;

  // use repository instead of prisma directly
  const doc = await documentRepo.findDocumentByIdWithMemberships(documentId);
  if (!doc) return { canRead: false, canWrite: false, reason: "not_found" };

  // Owner has full access
  if (userId && doc.ownerId === userId) {
    return { canRead: true, canWrite: true, reason: "owner" };
  }

  // Public document: everyone can read; writes require membership
  if (doc.visibility === Visibility.PUBLIC) {
    const isMember =
      userId &&
      doc.memberships.some(
        (m) => m.userId === userId && m.accessLevel === AccessLevel.WRITE
      );
    return { canRead: true, canWrite: !!isMember, reason: "public" };
  }

  // Token-based access (if token present and matches)
  if (token && doc.shareToken && token === doc.shareToken) {
    // Minimal: token grants read access
    return { canRead: true, canWrite: false, reason: "share_token" };
  }

  // Check membership
  if (userId) {
    const membership = doc.memberships.find((m) => m.userId === userId);
    if (membership) {
      return {
        canRead: true,
        canWrite: membership.accessLevel === AccessLevel.WRITE,
        reason: "member",
      };
    }
  }

  // Restricted (SPECIFIC/RESTRICTED) and no token/membership => deny
  return { canRead: false, canWrite: false, reason: "forbidden" };
}

/**
 * Small helpers
 */
export async function canRead(
  userId: string | null | undefined,
  documentId: string,
  token?: string
) {
  return (
    await evaluateAccess({ userId: userId ?? null, documentId, token })
  ).canRead;
}

export async function canWrite(
  userId: string | null | undefined,
  documentId: string,
  token?: string
) {
  return (
    await evaluateAccess({ userId: userId ?? null, documentId, token })
  ).canWrite;
}
