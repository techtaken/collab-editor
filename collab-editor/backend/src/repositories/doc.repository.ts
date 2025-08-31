// src/repositories/documentRepo.ts
import prisma from "../config/db";
import * as Y from "yjs";

export async function createDocument(ownerId: string, title: string, visibility: "PRIVATE" | "PUBLIC" = "PRIVATE") {
  return prisma.document.create({
    data: { ownerId, title, visibility }
  });
}

export async function getDocumentById(id: string) {
  return prisma.document.findUnique({ where: { id } });
}

export async function listUserDocuments(userId: string) {
  return prisma.document.findMany({
    where: { ownerId: userId }
  });
}

export async function updateDocumentTitle(id: string, title: string) {
  return prisma.document.update({
    where: { id },
    data: { title }
  });
}

export async function deleteDocument(id: string) {
  return prisma.document.delete({ where: { id } });
}

// 🔹 Save Yjs state
export async function saveDocumentContent(id: string, ydoc: Y.Doc) {
  const update = Y.encodeStateAsUpdate(ydoc); // Uint8Array
  return prisma.document.update({
    where: { id },
    data: { content: Buffer.from(update) }
  });
}

// 🔹 Load Yjs state
export async function loadDocumentContent(id: string): Promise<Y.Doc | null> {
  const doc = await prisma.document.findUnique({ where: { id } });
  if (!doc || !doc.content) return null;

  const ydoc = new Y.Doc();
  Y.applyUpdate(ydoc, new Uint8Array(doc.content as Buffer));
  return ydoc;
}

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

