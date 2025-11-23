import express from "express";
import { signup, login } from "../controllers/authController.js";

const router = express.Router();

// POST /auth/register
router.post("/register", signup);

// POST /auth/login
router.post("/login", login);

export default router;
