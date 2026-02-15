// src/services/document.service.ts
import { Visibility } from "@prisma/client";
import * as DocumentRepository from "../repositories/doc.repository";
import crypto from "crypto";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";

/**
 * Generate a secure random token
 * @param length Length of the token in characters
 * @returns A random Base62 token (0-9a-zA-Z)
 */
function generateShareToken(length: number = 8): string {
  const tokenCharacters = process.env.TOKEN_CHARACTER || "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const alphabetLength = tokenCharacters.length;

  // Generate random bytes
  const bytes = crypto.randomBytes(length);

  // Map each byte to a character in the alphabet
  let token = "";
  for (let i = 0; i < length; i++) {
    token += tokenCharacters[bytes[i] % alphabetLength];
  }

  return token;
}

/**
 * createDocument
 * - ownerId must be an existing user id
 * - language is optional metadata for editor UI
 */
export async function createDocument(
  ownerId: string,
  title: string,
  language?: string,
  visibility: Visibility = Visibility.PUBLIC
) {
  const shareToken  = generateShareToken(10)
  return DocumentRepository.createDocument({
    ownerId,
    title,
    content: "",
    visibility,
    shareToken,
    // ...(language ? { language } : {}),
    language,
  });
}

export async function getDocumentById(documentId: string) {
  return DocumentRepository.getDocumentById(documentId);
}

/**
 * listDocumentsForUser
 * - returns documents the user owns or is a member of (read/write)
 */
export async function listDocumentsForUser(userId: string, limit = 50) {
  const owned = await DocumentRepository.findOwnedByUser(userId, limit);
  const memberDocs = await DocumentRepository.findSharedWithUser(userId, limit);

  // Merge, removing duplicates
  const map = new Map<string, any>();
  owned.forEach((d) => map.set(d.id, d));
  memberDocs.forEach((d) => map.set(d.id, d));
  return Array.from(map.values());
}

/**
 * updateDocumentMeta
 * Accepts partial updates: { title?, visibility?, language? }
 */
export async function updateDocumentMeta(
  documentId: string,
  patch: { title?: string; visibility?: Visibility; language?: string }
) {
  return DocumentRepository.updateMeta(documentId, patch);
}

/**
 * saveDocumentContent
 * Persist textual snapshot of document
 */
export async function saveDocumentContent(documentId: string, contentText: string, language: string) {
  return DocumentRepository.updateContent(documentId, contentText, language);
}

export async function loadDocumentContent(documentId: string): Promise<string | null> {
  const doc = await DocumentRepository.findContentById(documentId);
  return doc?.content ?? null;
}

export async function deleteDocument(documentId: string) {
  return DocumentRepository.remove(documentId);
}

/**
 * Duplicate a document (useful for forks/copies)
 */
export async function duplicateDocument(documentId: string, newOwnerId: string, newTitle?: string) {
  const doc = await DocumentRepository.findById(documentId);
  if (!doc) throw new Error("Document not found");

  const shareToken  = generateShareToken(10);

  return DocumentRepository.createDocument({
    ownerId: newOwnerId,
    title: newTitle ?? `${doc.title} (copy)`,
    content: doc.content,
    visibility: doc.visibility,
    shareToken,
    language: doc.language,
  });
}

export const generateAIResponse = async (query, currentCode) => {
  try {
    // We use gemini-1.5-flash for higher rate limits (15 RPM / 1500 RPD)
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `You are an expert coding assistant. 
                     Here is the user's code context:
                     ${currentCode}
                     
                     User Query: ${query}`
            }]
          }]
        }),
      }
    );

    const data = await response.json();
    
    // Check for errors (like rate limits)
    if (data.error) {
       console.error("Gemini API Error:", data.error);
       return `Error: ${data.error.message}`;
    }

    // Extract the text from the response
    return data.candidates[0].content.parts[0].text;
    
  } catch (error) {
    console.error("Error calling Gemini:", error);
    return "Sorry, I couldn't reach the Gemini API. Please check your API key and internet connection.";
  }
};


// CURL command for testing Gemini API:
// curl -X POST "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=YOUR_API_KEY" \
//      -H "Content-Type: application/json" \
//      -d '{
//            "contents": [{
//              "parts": [{
//                "text": "Hello, Gemini!"
//              }]
//            }]
//          }'  