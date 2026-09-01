import express from "express";

import {
  createQuestion,
  getQuestions,
  getQuestionsBySetRound,
  updateQuestion,
  deleteQuestion,
} from "../controllers/questionController.js";

const router = express.Router();

// CREATE QUESTION
router.post("/", createQuestion);

// GET ALL QUESTIONS
router.get("/", getQuestions);

// GET QUESTIONS BY SET + ROUND
router.get(
  "/set/:set/round/:round",
  getQuestionsBySetRound
);

// UPDATE QUESTION
router.put("/:id", updateQuestion);

// DELETE QUESTION
router.delete("/:id", deleteQuestion);

export default router;