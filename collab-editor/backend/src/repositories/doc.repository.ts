// src/repositories/doc.repository.ts
import prisma from "../config/db";
import { Visibility } from "@prisma/client";

/**
 * createDocument
 */
export async function createDocument(data: {
  ownerId: string;
  title: string;
  content?: string;
  visibility?: Visibility;
  shareToken: string;
  language: string;
}) {
  console.log("Creating doc with ownerId:", data.ownerId);

  return prisma.document.create({
    data: {
      title: data.title,
      content: data.content ?? "",
      visibility: data.visibility ?? Visibility.PRIVATE,
      language: data.language ?? "plaintext",
      owner: {
        connect: { id: data.ownerId },
      },
    },
  });
}


/**
 * getDocumentById
 */
export async function getDocumentById(documentId: string) {
  return prisma.document.findUnique({
    where: { id: documentId },
    include: {
      owner: true,
      memberships: { include: { user: true } },
    },
  });
}

/**
 * findOwnedByUser
 */
export async function findOwnedByUser(userId: string, limit = 50) {
  return prisma.document.findMany({
    where: { ownerId: userId },
    orderBy: { updatedAt: "desc" },
    take: limit,
  });
}

/**
 * findSharedWithUser
 */
export async function findSharedWithUser(userId: string, limit = 50) {
  return prisma.document.findMany({
    where: { memberships: { some: { userId } } },
    orderBy: { updatedAt: "desc" },
    take: limit,
  });
}

/**
 * updateMeta
 */
export async function updateMeta(
  documentId: string,
  patch: { title?: string; visibility?: Visibility; language?: string }
) {
  return prisma.document.update({
    where: { id: documentId },
    data: {
      ...(patch.title ? { title: patch.title } : {}),
      ...(patch.visibility ? { visibility: patch.visibility } : {}),
      ...(patch.language ? { language: patch.language } : {}),
    },
  });
}

/**
 * updateContent
 */
export async function updateContent(documentId: string, contentText: string, language: string) {
  return prisma.document.update({
    where: { id: documentId },
    data: { 
      content: contentText ,
      language: language
    },

  });
}

/**
 * findContentById
 */
export async function findContentById(documentId: string) {
  return prisma.document.findUnique({
    where: { id: documentId },
    select: { content: true },
  });
}

/**
 * remove
 */
export async function remove(documentId: string) {
  return prisma.document.delete({ where: { id: documentId } });
}

/**
 * findById (used in duplicateDocument)
 */
export async function findById(documentId: string) {
  return prisma.document.findUnique({ where: { id: documentId } });
}

/**
 * create (used in duplicateDocument)
 */
// export async function create(data: {
//   ownerId: string;
//   title: string;
//   content: string;
//   visibility: Visibility;
// }) {
//   return prisma.document.create({ data });
// }


export async function findDocumentByIdWithMemberships(documentId: string) {
  return prisma.document.findUnique({
    where: { id: documentId },
    include: { memberships: true },
  });
}

export async function updateDocumentShareToken(documentId: string, token: string | null) {
  return prisma.document.update({
    where: { id: documentId },
    data: { shareToken: token }
  });
}
export async function findDocumentByShareToken(shareToken: string | null) {
  if (!shareToken) return null;
  return prisma.document.findFirst({
    where: { shareToken },
    include: { memberships: true },
  });
}

