/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ([
/* 0 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


// src/index.ts
var _a, _b;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.app = void 0;
const tslib_1 = __webpack_require__(1);
const express_1 = tslib_1.__importDefault(__webpack_require__(2));
const cors_1 = tslib_1.__importDefault(__webpack_require__(3));
const routes_1 = __webpack_require__(4);
const errorHandler_1 = __webpack_require__(27);
const http_1 = tslib_1.__importDefault(__webpack_require__(28));
// 1. REMOVE the old manual server import
// import { setupManualYjsServer } from "./yjs-server-premitive";
// 2. ADD the new socket.io server import
const yjs_server_premitive_1 = __webpack_require__(29); // Assuming you named it yjs-server.ts
// 3. REMOVE the ws import
// import { WebSocketServer } from "ws";
exports.app = (0, express_1.default)();
exports.app.use((0, cors_1.default)({
    origin: (_b = (_a = process.env.FE_URL) === null || _a === void 0 ? void 0 : _a.split(",")) !== null && _b !== void 0 ? _b : "*", // 👈 exact domain, NOT '*'
    credentials: true, // 👈 must be true
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization", "x-user-id"],
}));
console.log("xxxx", process.env.FE_URL);
exports.app.options("*", (0, cors_1.default)());
exports.app.use(express_1.default.json({ limit: "1mb" }));
(0, routes_1.registerRoutes)(exports.app);
exports.app.use(errorHandler_1.notFoundHandler);
exports.app.use(errorHandler_1.errorHandler);
const PORT = process.env.PORT || 3333;
const server = http_1.default.createServer(exports.app);
// 4. REMOVE the manual wss creation
// const wss = new WebSocketServer({ noServer: true });
// 5. CALL the new setup function
(0, yjs_server_premitive_1.setupYjsSocketServer)(server);
// 6. REMOVE the entire server.on('upgrade') handler
// server.on('upgrade', (request, socket, head) => {
//   ...
// });
server.listen(3333, process.env.MY_IP, () => console.log("Server on port 3333"));


/***/ }),
/* 1 */
/***/ ((module) => {

module.exports = require("tslib");

/***/ }),
/* 2 */
/***/ ((module) => {

module.exports = require("express");

/***/ }),
/* 3 */
/***/ ((module) => {

module.exports = require("cors");

/***/ }),
/* 4 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.registerRoutes = registerRoutes;
const userController_1 = __webpack_require__(5);
const documentController_1 = __webpack_require__(16);
const membershipController_1 = __webpack_require__(21);
const sharingController_1 = __webpack_require__(24);
const healthController_1 = __webpack_require__(26);
function registerRoutes(app) {
    app.use("/api/users", userController_1.router);
    app.use("/api/documents", documentController_1.router);
    app.use("/api/documents", membershipController_1.router); // nested routes under /:id/members
    app.use("/api/documents", sharingController_1.router); // nested routes under /:id/share
    app.use("/", healthController_1.router);
}


/***/ }),
/* 5 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.router = void 0;
const tslib_1 = __webpack_require__(1);
const express_1 = __webpack_require__(2);
const auth_1 = __webpack_require__(6);
const asyncHandler_1 = __webpack_require__(8);
const userService = tslib_1.__importStar(__webpack_require__(9));
const zod_1 = __webpack_require__(14);
const validate_1 = __webpack_require__(15);
const jsonwebtoken_1 = tslib_1.__importDefault(__webpack_require__(7));
exports.router = (0, express_1.Router)();
// GET /api/users/me
exports.router.get("/me", auth_1.ensureAuth, (0, asyncHandler_1.asyncHandler)((req, res) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    const me = yield userService.getUserById(req.user.id);
    res.json(me);
})));
exports.router.post("/register", (0, asyncHandler_1.asyncHandler)((req, res, next) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, username, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }
        const user = yield userService.registerUser(email, username, password);
        if (!user) {
            return res.status(400).json({ message: "Registration failed" });
        }
        const loginUser = yield userService.validateAndGetUser(email, password);
        console.log("loginUser ", loginUser);
        // Generate JWT
        const token = jsonwebtoken_1.default.sign({ id: loginUser.id, email: loginUser.email }, process.env.JWT_SECRET, { expiresIn: '1h' } // Token valid for 1 hour
        );
        const expiresIn = 3600; // 1 hour in seconds
        return res.status(201).json({
            message: "User registered successfully",
            user: loginUser,
            token,
            expiresIn
        });
    }
    catch (err) {
        if (err.message.includes("exists")) {
            return res.status(409).json({ message: err.message });
        }
        next(err);
    }
})));
exports.router.post("/login", (0, validate_1.validate)({
    body: zod_1.z.object({
        email: zod_1.z.string().email(),
        password: zod_1.z.string().min(1).max(50),
    }),
}), (0, asyncHandler_1.asyncHandler)((req, res) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    let user = yield userService.validateAndGetUser(email, password);
    if (!user) {
        return res.status(400).json({ message: "Either User does not exist or password is wrong" });
    }
    // Generate JWT
    const token = jsonwebtoken_1.default.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1h' } // Token valid for 1 hour
    );
    const expiresIn = 3600; // 1 hour in seconds
    return res.status(201).json({
        message: "User logined successfully",
        user,
        token,
        expiresIn
    });
})));
// router.post(
//   "/errorInLoginDueToValidate", 
//   validate({
//     body: z.object({
//       username: z.string().min(1).max(50),
//     }),
//   }), 
//   asyncHandler(async (req, res) => {
//   const { email , username} = req.body;
//   let user = await userService.getOrCreateUserByEmail(email);
//   if (!user) {
//     user = await userService.createUser(email, username, "TypeScript");
//   }
//   // In real app, return JWT or set session cookie
//   res.json(user);
// }));    
// PATCH /api/users/me
const patchMeSchema = zod_1.z.object({
    name: zod_1.z.string().min(1).max(120).optional(),
    preferredLanguage: zod_1.z.string().min(1).max(30).optional(),
});
exports.router.patch("/me", auth_1.ensureAuth, (0, validate_1.validate)({ body: patchMeSchema }), (0, asyncHandler_1.asyncHandler)((req, res) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    let updated = null;
    updated = yield userService.patchUser(req.user.id, req.body);
    if (!updated) {
        return res.status(400).json({ message: "No fields to update" });
    }
    res.json(updated);
})));


/***/ }),
/* 6 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ensureAuth = ensureAuth;
exports.allowAnonymous = allowAnonymous;
const tslib_1 = __webpack_require__(1);
const jsonwebtoken_1 = tslib_1.__importDefault(__webpack_require__(7));
// Middleware to ensure the user is authenticated via JWT
function ensureAuth(req, res, next) {
    const authHeader = req.headers["authorization"];
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Unauthorized: No token provided" });
    }
    const token = authHeader.split(" ")[1]; // Extract the JWT
    try {
        // Verify token using the same secret you used while signing
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        // Attach user to request so routes can access it
        req.user = { id: decoded.id, email: decoded.email };
        // console.log("Decoded JWT:", decoded);
        // (req as any).user = { id: "1", email: "test@gmail.com" };
        next();
    }
    catch (err) {
        return res.status(401).json({ message: "Unauthorized: Invalid or expired token" });
    }
}
// Same as above but does not fail if unauthenticated
function allowAnonymous(req, _res, next) {
    const userId = req.headers["x-user-id"] || null;
    if (userId)
        req.user = { id: userId };
    next();
}


/***/ }),
/* 7 */
/***/ ((module) => {

module.exports = require("jsonwebtoken");

/***/ }),
/* 8 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.asyncHandler = void 0;
const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
exports.asyncHandler = asyncHandler;


/***/ }),
/* 9 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.registerUser = registerUser;
exports.createUser = createUser;
exports.getUserById = getUserById;
exports.getUserByEmail = getUserByEmail;
exports.patchUser = patchUser;
exports.listUsers = listUsers;
exports.deleteUser = deleteUser;
exports.validateAndGetUser = validateAndGetUser;
const tslib_1 = __webpack_require__(1);
const userRepo = tslib_1.__importStar(__webpack_require__(10));
const bcrypt = __webpack_require__(13);
function registerUser(email, name, password) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        // check if user already exists
        const existingUser = yield userRepo.findUserByEmail(email);
        if (existingUser) {
            throw new Error("User already exists with this email");
        }
        // hash password
        const hashedPassword = yield bcrypt.hash(password, 10);
        // save user
        const user = yield userRepo.createUser({
            email,
            name,
            hashedPassword,
        });
        // Optionally omit password before returning user
        const { hashedPassword: _pw } = user, userWithoutPassword = tslib_1.__rest(user, ["hashedPassword"]);
        return userWithoutPassword;
    });
}
// Create a user
function createUser(email, name, hashedPassword) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        return userRepo.createUser({ email, name, hashedPassword });
    });
}
// Fetch user by ID
function getUserById(id) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        return userRepo.findUserById(id);
    });
}
// Fetch user by email
function getUserByEmail(email) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        return userRepo.findUserByEmail(email);
    });
}
// Get existing user or create a new one
// export async function getOrCreateUserByEmail(
//   email: string,
//   name?: string,
//   preferredLanguage?: string
// ): Promise<User> {
//   const existing = await userRepo.findUserByEmail(email);
//   if (existing) return existing;
//   return userRepo.createUser({ email, name, preferredLanguage , hashedPassword});
// }
// patch User Info
function patchUser(userId, data) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        return userRepo.updateUser(userId, data);
    });
}
// List recent users
function listUsers() {
    return tslib_1.__awaiter(this, arguments, void 0, function* (limit = 50) {
        return userRepo.listUsers(limit);
    });
}
// Delete user
function deleteUser(userId) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        return userRepo.deleteUser(userId);
    });
}
function validateAndGetUser(email, password) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const user = yield getUserByEmail(email);
        if (!user) {
            return null;
        }
        const isMatch = yield bcrypt.compare(password, user.hashedPassword);
        if (!isMatch) {
            console.log("not matching");
            return null;
        }
        // Optionally omit password before returning user
        const { hashedPassword: _pw } = user, userWithoutPassword = tslib_1.__rest(user, ["hashedPassword"]);
        return userWithoutPassword;
    });
}
;


/***/ }),
/* 10 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.findUserById = findUserById;
exports.findUserByEmail = findUserByEmail;
exports.createUser = createUser;
exports.updateUser = updateUser;
exports.listUsers = listUsers;
exports.deleteUser = deleteUser;
const tslib_1 = __webpack_require__(1);
const db_1 = tslib_1.__importDefault(__webpack_require__(11));
function findUserById(id) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        return db_1.default.user.findUnique({ where: { id } });
    });
}
function findUserByEmail(email) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        return db_1.default.user.findUnique({ where: { email } });
    });
}
function createUser(data) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        var _a;
        return db_1.default.user.create({
            data: {
                email: data.email,
                name: data.name,
                preferredLanguage: (_a = data.preferredLanguage) !== null && _a !== void 0 ? _a : null,
                hashedPassword: data.hashedPassword,
            },
        });
    });
}
function updateUser(id, data) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        return db_1.default.user.update({
            where: { id },
            data: {
                name: data.name,
                preferredLanguage: data.preferredLanguage,
                // modifiedAt: new Date(),
            },
        });
    });
}
function listUsers() {
    return tslib_1.__awaiter(this, arguments, void 0, function* (limit = 50) {
        return db_1.default.user.findMany({
            take: limit,
            orderBy: { createdAt: "desc" },
        });
    });
}
function deleteUser(id) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        return db_1.default.user.delete({ where: { id } });
    });
}


/***/ }),
/* 11 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


// import mongoose from 'mongoose';
// import { Pool } from 'pg';
Object.defineProperty(exports, "__esModule", ({ value: true }));
// const connectMongoDB = async () => {
//   const mongoUri = process.env.MONGO_URI!;
//   try {
//     await mongoose.connect(mongoUri);
//     console.log('Connected to MongoDB');
//   } catch (err) {
//     console.error('MongoDB connection error:', err);
//     process.exit(1);
//   }
// };
// const postgresPool = new Pool({
//   connectionString: process.env.POSTGRES_URI!,
// });
// postgresPool.connect()
//   .then(() => console.log("Connected to Postgres"))
//   .catch((err) => {
//     console.error("Postgres connection error:", err);
//     process.exit(1);
//   });
// export {postgresPool as db, connectMongoDB};
// src/db.ts
const client_1 = __webpack_require__(12);
let prisma;
if (!global.__prisma) {
    global.__prisma = new client_1.PrismaClient();
}
prisma = global.__prisma;
exports["default"] = prisma;


/***/ }),
/* 12 */
/***/ ((module) => {

module.exports = require("@prisma/client");

/***/ }),
/* 13 */
/***/ ((module) => {

module.exports = require("bcryptjs");

/***/ }),
/* 14 */
/***/ ((module) => {

module.exports = require("zod");

/***/ }),
/* 15 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.validate = validate;
function validate(schemas) {
    return (req, res, next) => {
        var _a;
        try {
            if (schemas.body)
                req.body = schemas.body.parse(req.body);
            if (schemas.query)
                req.query = schemas.query.parse(req.query);
            if (schemas.params)
                req.params = schemas.params.parse(req.params);
            next();
        }
        catch (err) {
            res.status(400).json({ message: "Validation error", details: (_a = err.errors) !== null && _a !== void 0 ? _a : String(err) });
        }
    };
}


/***/ }),
/* 16 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.router = void 0;
const tslib_1 = __webpack_require__(1);
const express_1 = __webpack_require__(2);
const zod_1 = __webpack_require__(14);
const auth_1 = __webpack_require__(6);
const asyncHandler_1 = __webpack_require__(8);
const validate_1 = __webpack_require__(15);
const documentService = tslib_1.__importStar(__webpack_require__(17));
const access_control_service_1 = __webpack_require__(20);
const client_1 = __webpack_require__(12);
const DocumentRepository = tslib_1.__importStar(__webpack_require__(18));
exports.router = (0, express_1.Router)();
const createSchema = zod_1.z.object({
    title: zod_1.z.string().min(1).max(200),
    language: zod_1.z.string().max(50).optional(),
    visibility: zod_1.z.nativeEnum(client_1.Visibility).optional(),
});
// GET /api/documents
exports.router.get("/", auth_1.ensureAuth, (0, asyncHandler_1.asyncHandler)((req, res) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    const docs = yield documentService.listDocumentsForUser(req.user.id);
    res.json(docs);
})));
// POST /api/documents
exports.router.post("/", auth_1.ensureAuth, (0, validate_1.validate)({ body: createSchema }), (0, asyncHandler_1.asyncHandler)((req, res) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    const { title, language, visibility } = req.body;
    console.log("Creating document with ownerId:", req.user);
    const doc = yield documentService.createDocument(req.user.id, title, language, visibility);
    res.status(201).json(doc);
})));
// GET /api/documents/:id
exports.router.get("/:id", auth_1.ensureAuth, (0, asyncHandler_1.asyncHandler)((req, res) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    if (!(yield (0, access_control_service_1.canRead)({ userId: req.user.id, documentId: id })))
        return res.status(403).json({ message: "Forbidden" });
    const doc = yield documentService.getDocumentById(id);
    if (!doc)
        return res.status(404).json({ message: "Not found" });
    res.json(doc);
})));
exports.router.get("token/:token", auth_1.ensureAuth, (0, asyncHandler_1.asyncHandler)((req, res) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    const { token } = req.params;
    if (!(yield (0, access_control_service_1.canRead)({ userId: req.user.id, token })))
        return res.status(403).json({ message: "Forbidden" });
    const doc = yield DocumentRepository.findDocumentByShareToken(token);
    if (!doc)
        return res.status(404).json({ message: "Not found" });
    res.json(doc);
})));
// GET /api/documents/:id/content
exports.router.get("/:id/content", auth_1.ensureAuth, (0, asyncHandler_1.asyncHandler)((req, res) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    if (!(yield (0, access_control_service_1.canRead)({ userId: req.user.id, documentId: id })))
        return res.status(403).json({ message: "Forbidden" });
    const content = yield documentService.loadDocumentContent(id);
    res.json({ content: content !== null && content !== void 0 ? content : "" });
})));
exports.router.patch("/:id/content", auth_1.ensureAuth, (0, asyncHandler_1.asyncHandler)((req, res) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    if (!(yield (0, access_control_service_1.canWrite)({ userId: req.user.id, documentId: id })))
        return res.status(403).json({ message: "Forbidden" });
    const content = yield documentService.saveDocumentContent(id, req.body.content, req.body.language);
    res.json({ content: content !== null && content !== void 0 ? content : "" });
})));
const updateSchema = zod_1.z.object({
    title: zod_1.z.string().min(1).max(200).optional(),
    language: zod_1.z.string().max(50).optional(),
    visibility: zod_1.z.nativeEnum(client_1.Visibility).optional(),
});
// PATCH /api/documents/:id
exports.router.patch("/:id", auth_1.ensureAuth, (0, validate_1.validate)({ body: updateSchema }), (0, asyncHandler_1.asyncHandler)((req, res) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    // You may decide: only owners can change visibility; writers can change title/language
    const canW = yield (0, access_control_service_1.canWrite)({ userId: req.user.id, documentId: id });
    if (!canW)
        return res.status(403).json({ message: "Forbidden" });
    const updated = yield documentService.updateDocumentMeta(id, req.body);
    res.json(updated);
})));
// DELETE /api/documents/:id  (owner-only; enforce in access service or check owner explicitly)
exports.router.delete("/:id", auth_1.ensureAuth, (0, asyncHandler_1.asyncHandler)((req, res) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    // simplest: only allow if user is owner (canWrite may also be true for members)
    const doc = yield documentService.getDocumentById(id);
    if (!doc)
        return res.status(404).json({ message: "Not found" });
    if (doc.ownerId !== req.user.id)
        return res.status(403).json({ message: "Owner only" });
    yield documentService.deleteDocument(id);
    res.status(204).send();
})));
// POST /api/documents/:id/ai-query
exports.router.post("/:id/ai-query", auth_1.ensureAuth, (0, asyncHandler_1.asyncHandler)((req, res) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    console.log("ai-query 123");
    if (!(yield (0, access_control_service_1.canRead)({ userId: req.user.id, documentId: id })))
        return res.status(403).json({ message: "Forbidden" });
    const query = req.body.query;
    const currentCode = (yield documentService.loadDocumentContent(id)) || "";
    const aiResponse = yield documentService.generateAIResponse(query, currentCode);
    res.json({ response: aiResponse });
})));


/***/ }),
/* 17 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.generateAIResponse = void 0;
exports.createDocument = createDocument;
exports.getDocumentById = getDocumentById;
exports.listDocumentsForUser = listDocumentsForUser;
exports.updateDocumentMeta = updateDocumentMeta;
exports.saveDocumentContent = saveDocumentContent;
exports.loadDocumentContent = loadDocumentContent;
exports.deleteDocument = deleteDocument;
exports.duplicateDocument = duplicateDocument;
const tslib_1 = __webpack_require__(1);
// src/services/document.service.ts
const client_1 = __webpack_require__(12);
const DocumentRepository = tslib_1.__importStar(__webpack_require__(18));
const crypto_1 = tslib_1.__importDefault(__webpack_require__(19));
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";
/**
 * Generate a secure random token
 * @param length Length of the token in characters
 * @returns A random Base62 token (0-9a-zA-Z)
 */
function generateShareToken(length = 8) {
    const tokenCharacters = process.env.TOKEN_CHARACTER || "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const alphabetLength = tokenCharacters.length;
    // Generate random bytes
    const bytes = crypto_1.default.randomBytes(length);
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
function createDocument(ownerId_1, title_1, language_1) {
    return tslib_1.__awaiter(this, arguments, void 0, function* (ownerId, title, language, visibility = client_1.Visibility.PUBLIC) {
        const shareToken = generateShareToken(10);
        return DocumentRepository.createDocument({
            ownerId,
            title,
            content: "",
            visibility,
            shareToken,
            // ...(language ? { language } : {}),
            language,
        });
    });
}
function getDocumentById(documentId) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        return DocumentRepository.getDocumentById(documentId);
    });
}
/**
 * listDocumentsForUser
 * - returns documents the user owns or is a member of (read/write)
 */
function listDocumentsForUser(userId_1) {
    return tslib_1.__awaiter(this, arguments, void 0, function* (userId, limit = 50) {
        const owned = yield DocumentRepository.findOwnedByUser(userId, limit);
        const memberDocs = yield DocumentRepository.findSharedWithUser(userId, limit);
        // Merge, removing duplicates
        const map = new Map();
        owned.forEach((d) => map.set(d.id, d));
        memberDocs.forEach((d) => map.set(d.id, d));
        return Array.from(map.values());
    });
}
/**
 * updateDocumentMeta
 * Accepts partial updates: { title?, visibility?, language? }
 */
function updateDocumentMeta(documentId, patch) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        return DocumentRepository.updateMeta(documentId, patch);
    });
}
/**
 * saveDocumentContent
 * Persist textual snapshot of document
 */
function saveDocumentContent(documentId, contentText, language) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        return DocumentRepository.updateContent(documentId, contentText, language);
    });
}
function loadDocumentContent(documentId) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        var _a;
        const doc = yield DocumentRepository.findContentById(documentId);
        return (_a = doc === null || doc === void 0 ? void 0 : doc.content) !== null && _a !== void 0 ? _a : null;
    });
}
function deleteDocument(documentId) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        return DocumentRepository.remove(documentId);
    });
}
/**
 * Duplicate a document (useful for forks/copies)
 */
function duplicateDocument(documentId, newOwnerId, newTitle) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const doc = yield DocumentRepository.findById(documentId);
        if (!doc)
            throw new Error("Document not found");
        const shareToken = generateShareToken(10);
        return DocumentRepository.createDocument({
            ownerId: newOwnerId,
            title: newTitle !== null && newTitle !== void 0 ? newTitle : `${doc.title} (copy)`,
            content: doc.content,
            visibility: doc.visibility,
            shareToken,
            language: doc.language,
        });
    });
}
const generateAIResponse = (query, currentCode) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    try {
        // We use gemini-1.5-flash for higher rate limits (15 RPM / 1500 RPD)
        const response = yield fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
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
        });
        const data = yield response.json();
        // Check for errors (like rate limits)
        if (data.error) {
            console.error("Gemini API Error:", data.error);
            return `Error: ${data.error.message}`;
        }
        // Extract the text from the response
        return data.candidates[0].content.parts[0].text;
    }
    catch (error) {
        console.error("Error calling Gemini:", error);
        return "Sorry, I couldn't reach the Gemini API. Please check your API key and internet connection.";
    }
});
exports.generateAIResponse = generateAIResponse;
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


/***/ }),
/* 18 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.createDocument = createDocument;
exports.getDocumentById = getDocumentById;
exports.findOwnedByUser = findOwnedByUser;
exports.findSharedWithUser = findSharedWithUser;
exports.updateMeta = updateMeta;
exports.updateContent = updateContent;
exports.findContentById = findContentById;
exports.remove = remove;
exports.findById = findById;
exports.findDocumentByIdWithMemberships = findDocumentByIdWithMemberships;
exports.updateDocumentShareToken = updateDocumentShareToken;
exports.findDocumentByShareToken = findDocumentByShareToken;
const tslib_1 = __webpack_require__(1);
// src/repositories/doc.repository.ts
const db_1 = tslib_1.__importDefault(__webpack_require__(11));
const client_1 = __webpack_require__(12);
/**
 * createDocument
 */
function createDocument(data) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        var _a, _b, _c;
        console.log("Creating doc with ownerId:", data.ownerId);
        return db_1.default.document.create({
            data: {
                title: data.title,
                content: (_a = data.content) !== null && _a !== void 0 ? _a : "",
                visibility: (_b = data.visibility) !== null && _b !== void 0 ? _b : client_1.Visibility.PRIVATE,
                language: (_c = data.language) !== null && _c !== void 0 ? _c : "plaintext",
                owner: {
                    connect: { id: data.ownerId },
                },
            },
        });
    });
}
/**
 * getDocumentById
 */
function getDocumentById(documentId) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        return db_1.default.document.findUnique({
            where: { id: documentId },
            include: {
                owner: true,
                memberships: { include: { user: true } },
            },
        });
    });
}
/**
 * findOwnedByUser
 */
function findOwnedByUser(userId_1) {
    return tslib_1.__awaiter(this, arguments, void 0, function* (userId, limit = 50) {
        return db_1.default.document.findMany({
            where: { ownerId: userId },
            orderBy: { updatedAt: "desc" },
            take: limit,
        });
    });
}
/**
 * findSharedWithUser
 */
function findSharedWithUser(userId_1) {
    return tslib_1.__awaiter(this, arguments, void 0, function* (userId, limit = 50) {
        return db_1.default.document.findMany({
            where: { memberships: { some: { userId } } },
            orderBy: { updatedAt: "desc" },
            take: limit,
        });
    });
}
/**
 * updateMeta
 */
function updateMeta(documentId, patch) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        return db_1.default.document.update({
            where: { id: documentId },
            data: Object.assign(Object.assign(Object.assign({}, (patch.title ? { title: patch.title } : {})), (patch.visibility ? { visibility: patch.visibility } : {})), (patch.language ? { language: patch.language } : {})),
        });
    });
}
/**
 * updateContent
 */
function updateContent(documentId, contentText, language) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        return db_1.default.document.update({
            where: { id: documentId },
            data: {
                content: contentText,
                language: language
            },
        });
    });
}
/**
 * findContentById
 */
function findContentById(documentId) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        return db_1.default.document.findUnique({
            where: { id: documentId },
            select: { content: true },
        });
    });
}
/**
 * remove
 */
function remove(documentId) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        return db_1.default.document.delete({ where: { id: documentId } });
    });
}
/**
 * findById (used in duplicateDocument)
 */
function findById(documentId) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        return db_1.default.document.findUnique({ where: { id: documentId } });
    });
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
function findDocumentByIdWithMemberships(documentId) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        return db_1.default.document.findUnique({
            where: { id: documentId },
            include: { memberships: true },
        });
    });
}
function updateDocumentShareToken(documentId, token) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        return db_1.default.document.update({
            where: { id: documentId },
            data: { shareToken: token }
        });
    });
}
function findDocumentByShareToken(shareToken) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        if (!shareToken)
            return null;
        return db_1.default.document.findFirst({
            where: { shareToken },
            include: { memberships: true },
        });
    });
}


/***/ }),
/* 19 */
/***/ ((module) => {

module.exports = require("crypto");

/***/ }),
/* 20 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.evaluateAccessUsinfDocId = evaluateAccessUsinfDocId;
exports.evaluateAccessUsingToken = evaluateAccessUsingToken;
exports.canRead = canRead;
exports.canWrite = canWrite;
const tslib_1 = __webpack_require__(1);
const client_1 = __webpack_require__(12);
const documentRepo = tslib_1.__importStar(__webpack_require__(18));
/**
 * Evaluate whether a given userId (or anonymous if null) can read/write document.
 *
 * token: optional share token included in URL (?token=xxx)
 *
 * returns an object { canRead: boolean, canWrite: boolean, reason?: string }
 */
function evaluateAccessUsinfDocId(params) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const { userId, documentId } = params;
        // use repository instead of prisma directly
        const doc = yield documentRepo.findDocumentByIdWithMemberships(documentId);
        if (!doc)
            return { canRead: false, canWrite: false, reason: "not_found" };
        // Owner has full access
        if (userId && doc.ownerId === userId) {
            return { canRead: true, canWrite: true, reason: "owner" };
        }
        // Public document: everyone can read; writes require membership
        if (doc.visibility === client_1.Visibility.PUBLIC) {
            const isMember = userId &&
                doc.memberships.some((m) => m.userId === userId && m.accessLevel === client_1.AccessLevel.WRITE);
            return { canRead: true, canWrite: !!isMember, reason: "public" };
        }
        // // Token-based access (if token present and matches)
        // if (token && doc.shareToken && token === doc.shareToken) {
        //   // Minimal: token grants read access
        //   return { canRead: true, canWrite: false, reason: "share_token" };
        // }
        // Check membership
        if (userId) {
            const membership = doc.memberships.find((m) => m.userId === userId);
            if (membership) {
                return {
                    canRead: true,
                    canWrite: membership.accessLevel === client_1.AccessLevel.WRITE,
                    reason: "member",
                };
            }
        }
        // Restricted (SPECIFIC/RESTRICTED) and no token/membership => deny
        return { canRead: false, canWrite: false, reason: "forbidden" };
    });
}
function evaluateAccessUsingToken(params) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const { userId, shareToken } = params;
        // use repository instead of prisma directly
        const doc = yield documentRepo.findDocumentByShareToken(shareToken);
        if (!doc)
            return { canRead: false, canWrite: false, reason: "not_found" };
        // Owner has full access
        if (userId && doc.ownerId === userId) {
            return { canRead: true, canWrite: true, reason: "owner" };
        }
        // Public document: everyone can read; writes require membership
        if (doc.visibility === client_1.Visibility.PUBLIC) {
            const isMember = userId &&
                doc.memberships.some((m) => m.userId === userId && m.accessLevel === client_1.AccessLevel.WRITE);
            return { canRead: true, canWrite: !!isMember, reason: "public" };
        }
        // Token-based access (if token present and matches)
        if (shareToken && doc.shareToken && shareToken === doc.shareToken) {
            // Minimal: token grants read access
            return { canRead: true, canWrite: false, reason: "share_token" };
        }
        // Check membership
        if (userId) {
            const membership = doc.memberships.find((m) => m.userId === userId);
            if (membership) {
                return {
                    canRead: true,
                    canWrite: membership.accessLevel === client_1.AccessLevel.WRITE,
                    reason: "member",
                };
            }
        }
        // Restricted (SPECIFIC/RESTRICTED) and no token/membership => deny
        return { canRead: false, canWrite: false, reason: "forbidden" };
    });
}
function canRead(_a) {
    return tslib_1.__awaiter(this, arguments, void 0, function* ({ userId, documentId, token, }) {
        if (documentId !== undefined) {
            return (yield evaluateAccessUsinfDocId({ userId: userId !== null && userId !== void 0 ? userId : null, documentId })).canRead;
        }
        else if (token !== undefined) {
            return (yield evaluateAccessUsingToken({ userId: userId !== null && userId !== void 0 ? userId : null, shareToken: token })).canRead;
        }
        return false;
    });
}
function canWrite(_a) {
    return tslib_1.__awaiter(this, arguments, void 0, function* ({ userId, documentId, token, }) {
        if (documentId !== undefined) {
            return (yield evaluateAccessUsinfDocId({ userId: userId !== null && userId !== void 0 ? userId : null, documentId })).canWrite;
        }
        else if (token !== undefined) {
            return (yield evaluateAccessUsingToken({ userId: userId !== null && userId !== void 0 ? userId : null, shareToken: token })).canRead;
        }
        return false;
    });
}


/***/ }),
/* 21 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.router = void 0;
const tslib_1 = __webpack_require__(1);
const express_1 = __webpack_require__(2);
const zod_1 = __webpack_require__(14);
const auth_1 = __webpack_require__(6);
const asyncHandler_1 = __webpack_require__(8);
const validate_1 = __webpack_require__(15);
const membershipService = tslib_1.__importStar(__webpack_require__(22));
const documentService = tslib_1.__importStar(__webpack_require__(17));
const client_1 = __webpack_require__(12);
exports.router = (0, express_1.Router)({ mergeParams: true });
const basePath = "/:id/members"; // mounted under /api/documents
function ensureOwner(req, res, next) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const doc = yield documentService.getDocumentById(req.params.id);
        if (!doc)
            return res.status(404).json({ message: "Not found" });
        if (doc.ownerId !== req.user.id)
            return res.status(403).json({ message: "Owner only" });
        return next();
    });
}
// GET /api/documents/:id/members
exports.router.get(basePath, auth_1.ensureAuth, (0, asyncHandler_1.asyncHandler)(ensureOwner), (0, asyncHandler_1.asyncHandler)((req, res) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    const members = yield membershipService.getMembers(req.params.id);
    res.json(members);
})));
const addSchema = zod_1.z.object({
    email: zod_1.z.array(zod_1.z.string().email()),
    role: zod_1.z.nativeEnum(client_1.AccessLevel).default(client_1.AccessLevel.READ),
});
// POST /api/documents/:id/members
exports.router.post(basePath, auth_1.ensureAuth, (0, asyncHandler_1.asyncHandler)(ensureOwner), (0, validate_1.validate)({ body: addSchema }), (0, asyncHandler_1.asyncHandler)((req, res) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    const { email, role } = req.body;
    const m = yield membershipService.addMemberByEmail(req.params.id, email, role);
    res.status(201).json(m);
})));
const patchSchema = zod_1.z.object({
    role: zod_1.z.nativeEnum(client_1.AccessLevel),
});
// PATCH /api/documents/:id/members/:userId
exports.router.patch(`${basePath}/:userId`, auth_1.ensureAuth, (0, asyncHandler_1.asyncHandler)(ensureOwner), (0, validate_1.validate)({ body: patchSchema }), (0, asyncHandler_1.asyncHandler)((req, res) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    const m = yield membershipService.changeMemberRole(req.params.id, req.params.userId, req.body.role);
    res.json(m);
})));
// DELETE /api/documents/:id/members/:userId
exports.router.delete(`${basePath}/:userId`, auth_1.ensureAuth, (0, asyncHandler_1.asyncHandler)(ensureOwner), (0, asyncHandler_1.asyncHandler)((req, res) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    yield membershipService.removeMember(req.params.id, req.params.userId);
    res.status(204).send();
})));


/***/ }),
/* 22 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.addMember = addMember;
exports.addMemberByEmail = addMemberByEmail;
exports.removeMember = removeMember;
exports.getMembers = getMembers;
exports.changeMemberRole = changeMemberRole;
const tslib_1 = __webpack_require__(1);
// src/services/membership.service.ts
const client_1 = __webpack_require__(12);
const membershipRepo = tslib_1.__importStar(__webpack_require__(23));
const userService = tslib_1.__importStar(__webpack_require__(9));
/**
 * addMember
 * - role: AccessLevel.READ | AccessLevel.WRITE
 * - returns the membership record
 */
function addMember(documentId_1, userId_1) {
    return tslib_1.__awaiter(this, arguments, void 0, function* (documentId, userId, role = client_1.AccessLevel.READ) {
        return membershipRepo.upsertMembership(userId, documentId, role);
    });
}
/**
 * addMemberByEmail
 * Finds (or creates) users by email and adds them to the document.
 * - emails: string[] - list of emails to add
 * - role: AccessLevel.READ | AccessLevel.WRITE
 * - returns array of membership records
 *
 * Note: current implementation uses strict invite-only behavior (errors if any email has no user).
 * If you prefer to auto-create users, replace userService.getUserByEmail with userService.getOrCreateUserByEmail.
 */
function addMemberByEmail(documentId_1, emails_1) {
    return tslib_1.__awaiter(this, arguments, void 0, function* (documentId, emails, role = client_1.AccessLevel.READ) {
        if (!Array.isArray(emails) || emails.length === 0) {
            throw new Error("emails must be a non-empty array of email strings");
        }
        const notFound = [];
        const addedMembers = [];
        // sequentially ensure predictable errors / ordering; switch to Promise.all if parallelism desired
        for (const email of emails) {
            const user = yield userService.getUserByEmail(email);
            if (!user) {
                notFound.push(email);
                continue;
            }
            const membership = yield addMember(documentId, user.id, role);
            addedMembers.push(membership);
        }
        if (notFound.length) {
            throw new Error(`User(s) not found for email(s): ${notFound.join(", ")}`);
        }
        return addedMembers;
    });
}
function removeMember(documentId, userId) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        return membershipRepo.deleteMembership(userId, documentId);
    });
}
function getMembers(documentId) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        return membershipRepo.findMembershipsByDocument(documentId);
    });
}
/**
 * changeMemberRole
 */
function changeMemberRole(documentId, userId, role) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        return membershipRepo.updateMembershipRole(userId, documentId, role);
    });
}


/***/ }),
/* 23 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.upsertMembership = upsertMembership;
exports.deleteMembership = deleteMembership;
exports.findMembershipsByDocument = findMembershipsByDocument;
exports.updateMembershipRole = updateMembershipRole;
const tslib_1 = __webpack_require__(1);
// src/repositories/membership.repository.ts
const db_1 = tslib_1.__importDefault(__webpack_require__(11));
function upsertMembership(userId, documentId, accessLevel) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        return db_1.default.membership.upsert({
            where: { userId_documentId: { userId, documentId } },
            update: { accessLevel },
            create: { userId, documentId, accessLevel }
        });
    });
}
function deleteMembership(userId, documentId) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        return db_1.default.membership.delete({
            where: { userId_documentId: { userId, documentId } }
        });
    });
}
function findMembershipsByDocument(documentId) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        return db_1.default.membership.findMany({
            where: { documentId },
            include: { user: true }
        });
    });
}
function updateMembershipRole(userId, documentId, accessLevel) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        return db_1.default.membership.update({
            where: { userId_documentId: { userId, documentId } },
            data: { accessLevel }
        });
    });
}


/***/ }),
/* 24 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.router = void 0;
const tslib_1 = __webpack_require__(1);
const express_1 = __webpack_require__(2);
const auth_1 = __webpack_require__(6);
const asyncHandler_1 = __webpack_require__(8);
const documentService = tslib_1.__importStar(__webpack_require__(17));
const sharingService = tslib_1.__importStar(__webpack_require__(25));
const access_control_service_1 = __webpack_require__(20);
exports.router = (0, express_1.Router)({ mergeParams: true });
const basePath = "/:id/share"; // mounted under /api/documents
function ensureOwner(req, res, next) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const doc = yield documentService.getDocumentById(req.params.id);
        if (!doc)
            return res.status(404).json({ message: "Not found" });
        if (doc.ownerId !== req.user.id)
            return res.status(403).json({ message: "Owner only" });
        return next();
    });
}
// POST /api/documents/:id/share/token
exports.router.post(`${basePath}/token`, auth_1.ensureAuth, (0, asyncHandler_1.asyncHandler)(ensureOwner), (0, asyncHandler_1.asyncHandler)((req, res) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    const token = yield sharingService.createShareTokenOnDocument(req.params.id);
    const origin = process.env.APP_ORIGIN || "http://0.0.0.0:3000";
    const shareLink = `${origin}/doc/${req.params.id}?token=${token}`;
    res.status(201).json({ token, shareLink });
})));
// DELETE /api/documents/:id/share/token
exports.router.delete(`${basePath}/token`, auth_1.ensureAuth, (0, asyncHandler_1.asyncHandler)(ensureOwner), (0, asyncHandler_1.asyncHandler)((req, res) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    yield sharingService.revokeShareToken(req.params.id);
    res.status(204).send();
})));
// GET /api/documents/:id/share/access-check?token=...
exports.router.get(`${basePath}/access-check`, auth_1.allowAnonymous, // populates req.user if present, but doesn't require it
(0, asyncHandler_1.asyncHandler)((req, res) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const token = req.query.token || null;
    const result = yield (0, access_control_service_1.evaluateAccessUsingToken)({ userId: (_b = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id) !== null && _b !== void 0 ? _b : null, shareToken: token });
    res.json(result);
})));


/***/ }),
/* 25 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.createShareTokenOnDocument = createShareTokenOnDocument;
exports.revokeShareToken = revokeShareToken;
const tslib_1 = __webpack_require__(1);
// src/services/sharing.service.ts
const crypto_1 = tslib_1.__importDefault(__webpack_require__(19));
// import { getOrCreateUserByEmail } from "./user.service";
const documentRepo = tslib_1.__importStar(__webpack_require__(18));
/**
 * Note:
 * For a simple MVP we store a single shareToken on the Document model
 * (field: shareToken). The token may grant read-only or writer access
 * depending on how you design it. A more flexible implementation uses a
 * separate ShareLink table (with role, expiry) — you can evolve to that later.
 */
/**
 * createShareTokenOnDocument:
 * - will create a new random token and attach it to the Document.shareToken field.
 * - optionally set tokenRole ('READ'|'WRITE') by writing into document.shareTokenRole (if you have that field)
 */
function createShareTokenOnDocument(documentId) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const token = crypto_1.default.randomUUID();
        yield documentRepo.updateDocumentShareToken(documentId, token);
        return token;
    });
}
function revokeShareToken(documentId) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        return documentRepo.updateDocumentShareToken(documentId, null);
    });
}
/**
 * convenience: shareWithEmail
 * - Add a user (found by email) as an editor/viewer directly
 */
// export async function shareWithEmail(documentId: string, email: string, role: AccessLevel = AccessLevel.READ) {
//   // find or create the user
//   const user = await getOrCreateUserByEmail(email);
//   return addMember(documentId, user.id, role);
// }


/***/ }),
/* 26 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.router = void 0;
const express_1 = __webpack_require__(2);
exports.router = (0, express_1.Router)();
exports.router.get("/healthz", (req, res) => res.json({ ok: true, ts: Date.now() }));


/***/ }),
/* 27 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.notFoundHandler = notFoundHandler;
exports.errorHandler = errorHandler;
function notFoundHandler(req, res) {
    res.status(404).json({ message: "Route not found" });
}
function errorHandler(err, req, res, _next) {
    console.error(err);
    if (res.headersSent)
        return;
    const status = err.statusCode || 500;
    res.status(status).json({ message: err.message || "Internal Server Error" });
}


/***/ }),
/* 28 */
/***/ ((module) => {

module.exports = require("http");

/***/ }),
/* 29 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.setupYjsSocketServer = void 0;
const tslib_1 = __webpack_require__(1);
const socket_io_1 = __webpack_require__(30);
const server_1 = __webpack_require__(31);
const jsonwebtoken_1 = tslib_1.__importDefault(__webpack_require__(7));
const document_service_1 = __webpack_require__(17);
const setupYjsSocketServer = (server) => {
    var _a, _b;
    const io = new socket_io_1.Server(server, {
        cors: { origin: (_b = (_a = process.env.FE_URL) === null || _a === void 0 ? void 0 : _a.split(",")) !== null && _b !== void 0 ? _b : "*", credentials: true },
    });
    // Auth Middleware remains the same...
    io.use((socket, next) => {
        const token = socket.handshake.auth.token;
        try {
            jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || 'YOUR_SECRET_KEY');
            next();
        }
        catch (err) {
            next(new Error('Authentication error'));
        }
    });
    io.on('connection', (socket) => {
        console.log(`[Socket] User connected : ${socket.id}`);
    });
    const ysocketio = new server_1.YSocketIO(io);
    const saveTimeouts = new Map();
    // Use the 'document-loaded' event which provides (doc, roomName)
    ysocketio.on('document-loaded', (doc) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
        const documentId = doc.name;
        if (!documentId || typeof documentId !== 'string') {
            console.error('❌ Could not extract documentId');
            return;
        }
        console.log(`[Yjs] Document loaded: ${documentId}`);
        // Load from DB
        const existingContent = yield (0, document_service_1.loadDocumentContent)(documentId);
        if (existingContent) {
            const ytext = doc.getText('content');
            if (ytext.length === 0) {
                console.log(`📥 Seeding DB content into Y.Text: ${existingContent.slice(0, 50)}`);
                ytext.insert(0, existingContent);
            }
        }
        // Persist updates
        doc.on('update', () => {
            if (saveTimeouts.has(documentId)) {
                clearTimeout(saveTimeouts.get(documentId));
            }
            const timeout = setTimeout(() => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
                try {
                    const contentText = doc.getText('content').toString();
                    console.log(`💾 Persisting update for ${documentId}: ${contentText.slice(0, 50)}`);
                    yield (0, document_service_1.saveDocumentContent)(documentId, contentText, 'javascript');
                    saveTimeouts.delete(documentId);
                }
                catch (error) {
                    console.error(`❌ Save failed for ${documentId}:`, error);
                }
            }), 2000);
            saveTimeouts.set(documentId, timeout);
        });
    }));
    ysocketio.initialize();
};
exports.setupYjsSocketServer = setupYjsSocketServer;


/***/ }),
/* 30 */
/***/ ((module) => {

module.exports = require("socket.io");

/***/ }),
/* 31 */
/***/ ((module) => {

module.exports = require("y-socket.io/dist/server");

/***/ })
/******/ 	]);
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module is referenced by other modules so it can't be inlined
/******/ 	var __webpack_exports__ = __webpack_require__(0);
/******/ 	
/******/ })()
;