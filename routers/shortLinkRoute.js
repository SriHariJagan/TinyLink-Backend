import express from "express";
import {
  createShortURL,
  getUserLinks,
  getLinkById,
  redirectShortURL,
  updateShortURL,
  deleteShortURL
} from "../controllers/shortLinkController.js";

import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

// Create
router.post("/", authMiddleware, createShortURL);

// Read
router.get("/my-links", authMiddleware, getUserLinks);
router.get("/:id", authMiddleware, getLinkById);

// Update
router.put("/:id", authMiddleware, updateShortURL);

// Delete
router.delete("/:id", authMiddleware, deleteShortURL);

// Public redirect
router.get("/r/:code", redirectShortURL);

export default router;
