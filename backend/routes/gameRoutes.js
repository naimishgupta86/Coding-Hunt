import express from "express";

import {
  getCurrentRound,
  submitAnswer,
  getClue,
  verifyHalfCode,
  reportViolation,
} from "../controllers/gameController.js";

const router = express.Router();

// Current question
router.get(
  "/round/:teamId",
  getCurrentRound
);

// Submit answer
router.post(
  "/answer",
  submitAnswer
);

// Get clue + location
router.get(
  "/clue",
  getClue
);

// Verify half code
router.post(
  "/half-code",
  verifyHalfCode
);

// Anti cheat
router.post(
  "/violation",
  reportViolation
);

export default router;