import { Router } from "express";
import { ensureAuth, allowAnonymous } from "../middleware/auth";
import { asyncHandler } from "../middleware/asyncHandler";
import * as documentService from "../services/document.service";
import * as sharingService from "../services/sharing.service";
import { evaluateAccess } from "../services/access-control.service";

export const router = Router({ mergeParams: true });
const basePath = "/:id/share"; // mounted under /api/documents

async function ensureOwner(req, res, next) {
  const doc = await documentService.getDocumentById(req.params.id);
  if (!doc) return res.status(404).json({ message: "Not found" });
  if (doc.ownerId !== req.user!.id) return res.status(403).json({ message: "Owner only" });
  return next();
}

// POST /api/documents/:id/share/token
router.post(
  `${basePath}/token`,
  ensureAuth,
  asyncHandler(ensureOwner),
  asyncHandler(async (req, res) => {
    const token = await sharingService.createShareTokenOnDocument(req.params.id);
    const origin = process.env.APP_ORIGIN || "http://localhost:3000";
    const shareLink = `${origin}/doc/${req.params.id}?token=${token}`;
    res.status(201).json({ token, shareLink });
  })
);

// DELETE /api/documents/:id/share/token
router.delete(
  `${basePath}/token`,
  ensureAuth,
  asyncHandler(ensureOwner),
  asyncHandler(async (req, res) => {
    await sharingService.revokeShareToken(req.params.id);
    res.status(204).send();
  })
);

// GET /api/documents/:id/share/access-check?token=...
router.get(
  `${basePath}/access-check`,
  allowAnonymous, // populates req.user if present, but doesn't require it
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const token = (req.query.token as string) || null;
    const result = await evaluateAccess({ userId: req.user?.id ?? null, documentId: id, token });
    res.json(result);
  })
);
