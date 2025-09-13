import { Router } from "express";
import { ensureAuth } from "../middleware/auth";
import { asyncHandler } from "../middleware/asyncHandler";
import * as userService from "../services/user.service";
import { z } from "zod";
import { validate } from "../middleware/validate";
import jwt from "jsonwebtoken";


export const router = Router();

// GET /api/users/me
router.get("/me", ensureAuth, asyncHandler(async (req, res) => {
  const me = await userService.getUserById(req.user!.id);
  res.json(me);
}));

// router.post("/register", asyncHandler(async (req, res, next) => {
//     try {
//       const { email, password } = req.body;

//       if (!email || !password) {
//         return res.status(400).json({ message: "Email and password are required" });
//       }

//       const user = await userService.registerUser(email, password);
//       return res.status(201).json({ message: "User registered successfully", user });
//     } catch (err) {
//       if (err.message.includes("exists")) {
//         return res.status(409).json({ message: err.message });
//       }
//       next(err);
//     }
//   })
// );

router.post(
  "/login",
  validate({
    body: z.object({
      email: z.string().email(),
      username: z.string().min(1).max(50),
    }),
  }),
  asyncHandler(async (req, res) => {
    const { email, username, password } = req.body;
    let user = await userService.getUserByEmail(email);
    if (!user) {
      user = await userService.createUser(email, username, "TypeScript");
    }
    
    // Generate JWT
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET!,
      { expiresIn: '1h' } // Token valid for 1 hour
    );
    const expiresIn = 3600; // 1 hour in seconds

    res.json({
      user,
      token,
      expiresIn
    });
  })
);

router.post(
  "/errorInLoginDueToValidate", 
  validate({
    body: z.object({
      username: z.string().min(1).max(50),
    }),
  }), 
  asyncHandler(async (req, res) => {
  const { email , username} = req.body;
  let user = await userService.getOrCreateUserByEmail(email);
  if (!user) {
    user = await userService.createUser(email, username, "TypeScript");
  }
  // In real app, return JWT or set session cookie
  res.json(user);
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
    let updated = null;

    updated = await userService.patchUser(req.user!.id, req.body);
    if (!updated) {
      return res.status(400).json({ message: "No fields to update" });
    }
    res.json(updated);
  })
);
