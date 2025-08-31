import { Router } from "express";
import { z } from "zod";
import { ensureAuth } from "../middleware/auth";
import { asyncHandler } from "../middleware/asyncHandler";
import { validate } from "../middleware/validate";
import * as membershipService from "../services/membership.service";
import * as documentService from "../services/document.service";
import { AccessLevel } from "@prisma/client";

export const router = Router({ mergeParams: true });

const basePath = "/:id/members"; // mounted under /api/documents

async function ensureOwner(req, res, next) {
  const doc = await documentService.getDocumentById(req.params.id);
  if (!doc) return res.status(404).json({ message: "Not found" });
  if (doc.ownerId !== req.user!.id) return res.status(403).json({ message: "Owner only" });
  return next();
}

// GET /api/documents/:id/members
router.get(
  basePath,
  ensureAuth,
  asyncHandler(ensureOwner),
  asyncHandler(async (req, res) => {
    const members = await membershipService.getMembers(req.params.id);
    res.json(members);
  })
);

const addSchema = z.object({
  email: z.string().email(),
  role: z.nativeEnum(AccessLevel).default(AccessLevel.READ),
});
// POST /api/documents/:id/members
router.post(
  basePath,
  ensureAuth,
  asyncHandler(ensureOwner),
  validate({ body: addSchema }),
  asyncHandler(async (req, res) => {
    const { email, role } = req.body;
    const m = await membershipService.addMemberByEmail(req.params.id, email, role);
    res.status(201).json(m);
  })
);

const patchSchema = z.object({
  role: z.nativeEnum(AccessLevel),
});
// PATCH /api/documents/:id/members/:userId
router.patch(
  `${basePath}/:userId`,
  ensureAuth,
  asyncHandler(ensureOwner),
  validate({ body: patchSchema }),
  asyncHandler(async (req, res) => {
    const m = await membershipService.changeMemberRole(req.params.id, req.params.userId, req.body.role);
    res.json(m);
  })
);

// DELETE /api/documents/:id/members/:userId
router.delete(
  `${basePath}/:userId`,
  ensureAuth,
  asyncHandler(ensureOwner),
  asyncHandler(async (req, res) => {
    await membershipService.removeMember(req.params.id, req.params.userId);
    res.status(204).send();
  })
);
