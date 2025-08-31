import { Router } from "express";
import { ensureAuth } from "../middleware/auth";
import { asyncHandler } from "../middleware/asyncHandler";
import * as userService from "../services/user.service";
import { z } from "zod";
import { validate } from "../middleware/validate";

export const router = Router();

// GET /api/users/me
router.get("/me", ensureAuth, asyncHandler(async (req, res) => {
  const me = await userService.getUserById(req.user!.id);
  res.json(me);
}));

// PATCH /api/users/me
const patchMeSchema = z.object({
  name: z.string().min(1).max(120).optional(),
  preferredLanguage: z.string().min(1).max(30).optional(),
});
router.patch(
  "/me",
  ensureAuth,
  validate({ body: patchMeSchema }),
  asyncHandler(async (req, res) => {
    const { name, preferredLanguage } = req.body;
    let updated = null;

    if (preferredLanguage) {
      updated = await userService.updatePreferredLanguage(req.user!.id, preferredLanguage);
    }
    if (name) {
      // updated = await userService.updateUserPreferences(req.user!.id, { name });
    }
    if (!updated) {
      return res.status(400).json({ message: "No fields to update" });
    }
    res.json(updated);
  })
);
