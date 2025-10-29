import { Router } from "express";
import { z } from "zod";
import { ensureAuth } from "../middleware/auth";
import { asyncHandler } from "../middleware/asyncHandler";
import { validate } from "../middleware/validate";
import * as documentService from "../services/document.service";
import { canRead, canWrite } from "../services/access-control.service";
import { Visibility } from "@prisma/client";
import * as DocumentRepository from "../repositories/doc.repository";


export const router = Router();

const createSchema = z.object({
  title: z.string().min(1).max(200),
  language: z.string().max(50).optional(),
  visibility: z.nativeEnum(Visibility).optional(),
});

// GET /api/documents
router.get(
  "/",
  ensureAuth,
  asyncHandler(async (req, res) => {
    const docs = await documentService.listDocumentsForUser(req.user!.id);
    res.json(docs);
  })
);

// POST /api/documents
router.post(
  "/",
  ensureAuth,
  validate({ body: createSchema }),
  asyncHandler(async (req, res) => {
    const { title, language, visibility } = req.body;
    console.log("Creating document with ownerId:", req.user);
    
    const doc = await documentService.createDocument(req.user!.id, title, language, visibility);
    res.status(201).json(doc);
  })
);

// GET /api/documents/:id
router.get(
  "/:id",
  ensureAuth,
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    if (!(await canRead({userId:req.user!.id, documentId : id}))) return res.status(403).json({ message: "Forbidden" });
    const doc = await documentService.getDocumentById(id);
    if (!doc) return res.status(404).json({ message: "Not found" });
    res.json(doc);
  })
);

router.get(
  "token/:token",
  ensureAuth,
  asyncHandler(async (req, res) => {
    const { token } = req.params;
    if (!(await canRead({userId : req.user!.id, token}))) return res.status(403).json({ message: "Forbidden" });
    const doc = await DocumentRepository.findDocumentByShareToken(token);
    if (!doc) return res.status(404).json({ message: "Not found" });
    res.json(doc);
  })
);

// GET /api/documents/:id/content
router.get(
  "/:id/content",
  ensureAuth,
  asyncHandler(async (req, res) => {
    console.log("content");
    
    const { id } = req.params;
    if (!(await canRead({userId:req.user!.id, documentId : id}))) return res.status(403).json({ message: "Forbidden" });
    const content = await documentService.loadDocumentContent(id);
    res.json({ content: content ?? "" });
  })
);

router.patch(
  "/:id/content",
  ensureAuth,
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    if (!(await canWrite({userId:req.user!.id, documentId : id}))) return res.status(403).json({ message: "Forbidden" });

    const content = await documentService.saveDocumentContent(id, req.body.content, req.body.language);
    res.json({ content: content ?? "" });
  })
);

const updateSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  language: z.string().max(50).optional(),
  visibility: z.nativeEnum(Visibility).optional(),
});

// PATCH /api/documents/:id
router.patch(
  "/:id",
  ensureAuth,
  validate({ body: updateSchema }),
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    // You may decide: only owners can change visibility; writers can change title/language
    const canW = await canWrite({userId:req.user!.id, documentId : id});
    if (!canW) return res.status(403).json({ message: "Forbidden" });

    const updated = await documentService.updateDocumentMeta(id, req.body);
    res.json(updated);
  })
);

// DELETE /api/documents/:id  (owner-only; enforce in access service or check owner explicitly)
router.delete(
  "/:id",
  ensureAuth,
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    // simplest: only allow if user is owner (canWrite may also be true for members)
    const doc = await documentService.getDocumentById(id);
    if (!doc) return res.status(404).json({ message: "Not found" });
    if (doc.ownerId !== req.user!.id) return res.status(403).json({ message: "Owner only" });

    await documentService.deleteDocument(id);
    res.status(204).send();
  })
);
