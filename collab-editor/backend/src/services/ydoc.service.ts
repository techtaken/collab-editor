// src/services/ydoc.service.ts
/**
 * Helpers to convert between Yjs document state and plain text snapshots.
 * Use these in your y-websocket server or periodic snapshot job.
 *
 * Two approaches:
 *  1) Serialize Yjs to a TEXT snapshot: ydoc.getText('content').toString()
 *  2) Serialize Yjs binary update: Y.encodeStateAsUpdate(ydoc) and persist as bytes.
 *
 * Here we implement the text snapshot approach (schema `Document.content` is TEXT).
 */
import * as Y from "yjs";
import * as documentService from "./document.service";

/**
 * Extract plain text from ydoc (text CRDT stored under 'content' key)
 */
export function serializeYDocToText(ydoc: Y.Doc): string {
  const ytext = ydoc.getText("content");
  return ytext.toString();
}

/**
 * Apply plain text snapshot into an existing Y.Doc:
 * - This is destructive (replaces content). Use carefully.
 */
export function applyTextToYDoc(text: string, ydoc: Y.Doc) {
  const ytext = ydoc.getText("content");
  // Replace entire content
  // Delete existing content
  const length = ytext.length;
  if (length > 0) {
    ytext.delete(0, length);
  }
  if (text.length > 0) {
    ytext.insert(0, text);
  }
}

/**
 * Save current Y.Doc snapshot to DB (document.content)
 */
export async function saveYDocSnapshotToDb(docId: string, ydoc: Y.Doc) {
  const text = serializeYDocToText(ydoc);
  return documentService.saveDocumentContent(docId, text);
}

/**
 * Load DB snapshot into a Y.Doc (non-destructive if you want to merge)
 */
export async function loadSnapshotFromDbToYDoc(docId: string, ydoc: Y.Doc) {
  const text = await documentService.loadDocumentContent(docId);
  if (text === null) return null;
  applyTextToYDoc(text, ydoc);
  return text;
}
