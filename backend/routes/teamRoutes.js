import express from "express";

import {
  createTeam,
  getTeams,
  verifyTeam,
  updateTeam,
  deleteTeam,
  resetTeam,
} from "../controllers/teamController.js";

const router = express.Router();

// Create team
router.post("/", createTeam);

// Get all teams
router.get("/", getTeams);

// Verify team
router.post("/verify", verifyTeam);

// Update team
router.put("/:id", updateTeam);

// Delete team
router.delete("/:id", deleteTeam);

// Reset team
router.post("/:id/reset", resetTeam);

export default router;