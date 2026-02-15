import { Router } from "express";
export const router = Router();

router.get("/healthz", (req, res) => res.json({ ok: true, ts: Date.now() }));
