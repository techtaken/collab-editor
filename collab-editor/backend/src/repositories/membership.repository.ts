// src/repositories/membership.repository.ts
import prisma from "../config/db";
import { AccessLevel } from "@prisma/client";

export async function upsertMembership(userId: string, documentId: string, accessLevel: AccessLevel) {
  return prisma.membership.upsert({
    where: { userId_documentId: { userId, documentId } },
    update: { accessLevel },
    create: { userId, documentId, accessLevel }
  });
}

export async function deleteMembership(userId: string, documentId: string) {
  return prisma.membership.delete({
    where: { userId_documentId: { userId, documentId } }
  });
}

export async function findMembershipsByDocument(documentId: string) {
  return prisma.membership.findMany({
    where: { documentId },
    include: { user: true }
  });
}

export async function updateMembershipRole(userId: string, documentId: string, accessLevel: AccessLevel) {
  return prisma.membership.update({
    where: { userId_documentId: { userId, documentId } },
    data: { accessLevel }
  });
}
