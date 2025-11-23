import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

import authRoutes from "./routers/authRoutes.js";
import shortlinkRoutes from "./routers/shortLinkRoute.js";
import { authMiddleware } from "./middleware/authMiddleware.js";
import { redirectShortURL } from "./controllers/ShortLinkController.js";

dotenv.config();
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/auth", authRoutes);
app.use("/shortlink", authMiddleware, shortlinkRoutes); // Protected

// Root
app.get("/", (req, res) => res.send("TinyLink Backend Running"));

// Redirect route (IMPORTANT: must be the last route)
app.get("/:code", redirectShortURL);

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log(err));

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
