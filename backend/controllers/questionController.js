import Question from "../models/Question.js";

// ==========================================
// CREATE QUESTION
// ==========================================

export const createQuestion = async (
  req,
  res
) => {
  try {
    const {
      set,
      round,
      question,
      options,
      answer,
      marks,
      time,
      explanation,
      clue,
      halfCode,
      locationName,
      locationHint,
      locationCode,
      fullCode,
    } = req.body;

    if (
      !set ||
      !round ||
      !question ||
      !options ||
      !answer
    ) {
      return res.status(400).json({
        success: false,
        message:
          "All required fields are required",
      });
    }

    const questionId =
      `Q-${Date.now()}`;

    const newQuestion =
      await Question.create({
        questionId,

        set: set.toUpperCase(),

        round: Number(round),

        question,

        options,

        answer:
          answer.toUpperCase(),

        marks:
          Number(marks) || 100,

        time:
          Number(time) || 60,

        explanation:
          explanation || "",

        clue:
          clue || "",

        halfCode:
          halfCode || "",

        locationName:
          locationName || "",

        locationHint:
          locationHint || "",

        locationCode:
          locationCode || "",

        fullCode:
          fullCode || "",
      });

    res.status(201).json({
      success: true,
      question: newQuestion,
    });
  } catch (error) {
    console.error(
      "CREATE QUESTION ERROR:",
      error
    );

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================================
// GET ALL QUESTIONS
// ==========================================

export const getQuestions = async (
  req,
  res
) => {
  try {
    const questions =
      await Question.find().sort({
        set: 1,
        round: 1,
        createdAt: 1,
      });

    res.json({
      success: true,
      questions,
    });
  } catch (error) {
    console.error(
      "GET QUESTIONS ERROR:",
      error
    );

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================================
// GET QUESTIONS BY SET + ROUND
// ==========================================

export const getQuestionsBySetRound =
  async (req, res) => {
    try {
      const { set, round } =
        req.params;

      if (!set || !round) {
        return res.status(400).json({
          success: false,
          message:
            "Set and round are required",
        });
      }

      const questions =
        await Question.find({
          set: set.toUpperCase(),
          round: Number(round),
        }).sort({
          createdAt: 1,
        });

      res.json({
        success: true,
        questions,
      });
    } catch (error) {
      console.error(
        "GET QUESTIONS BY SET ROUND ERROR:",
        error
      );

      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  };

// ==========================================
// UPDATE QUESTION
// ==========================================

export const updateQuestion = async (
  req,
  res
) => {
  try {
    const question =
      await Question.findOneAndUpdate(
        {
          questionId:
            req.params.id,
        },
        req.body,
        {
          new: true,
          runValidators: true,
        }
      );

    if (!question) {
      return res.status(404).json({
        success: false,
        message:
          "Question not found",
      });
    }

    res.json({
      success: true,
      question,
    });
  } catch (error) {
    console.error(
      "UPDATE QUESTION ERROR:",
      error
    );

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================================
// DELETE QUESTION
// ==========================================

export const deleteQuestion = async (
  req,
  res
) => {
  try {
    const question =
      await Question.findOneAndDelete({
        questionId:
          req.params.id,
      });

    if (!question) {
      return res.status(404).json({
        success: false,
        message:
          "Question not found",
      });
    }

    res.json({
      success: true,
      message:
        "Question deleted successfully",
    });
  } catch (error) {
    console.error(
      "DELETE QUESTION ERROR:",
      error
    );

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};