import Team from "../models/Team.js";
import Question from "../models/Question.js";
import ActivityLog from "../models/ActivityLog.js";

// ======================================================
// GET CURRENT ROUND / QUESTION
// ======================================================

export const getCurrentRound = async (req, res) => {
  try {
    const { teamId } = req.params;

    const team = await Team.findOne({
      teamId: teamId.toUpperCase(),
    });

    if (!team) {
      return res.status(404).json({
        success: false,
        message: "Team not found.",
      });
    }

    // ==================================================
    // TEAM STATUS
    // ==================================================

    if (team.status === "Eliminated") {
      return res.status(403).json({
        success: false,
        status: "Eliminated",
        message:
          "Team has been eliminated.",
      });
    }

    if (team.status === "Completed") {
      return res.status(403).json({
        success: false,
        status: "Completed",
        message:
          "Game already completed.",
      });
    }

    if (team.status !== "Active") {
      return res.status(403).json({
        success: false,
        status: team.status,
        message:
          "Team is not active.",
      });
    }

    // ==================================================
    // GET QUESTION
    // IMPORTANT:
    // ANSWER + HALF CODE HIDDEN
    // ==================================================

    const question =
      await Question.findOne({
        set: team.set,
        round: team.round,
      })
        .sort({ createdAt: 1 })
        .select(
          "-answer -explanation -halfCode"
        );

    if (!question) {
      return res.status(404).json({
        success: false,
        message:
          `Question not configured for Set ${team.set}, Round ${team.round}.`,
      });
    }

    // ==================================================
    // UPDATE ACTIVITY
    // ==================================================

    team.lastActive = new Date();

    await team.save();

    await ActivityLog.create({
      teamId: team.teamId,

      action: "ROUND_LOADED",

      details:
        `Set ${team.set}, Round ${team.round} loaded`,

      ipAddress:
        req.ip || "",
    });

    // ==================================================
    // RESPONSE
    // ==================================================

    return res.json({
      success: true,

      team: {
        teamId:
          team.teamId,

        teamName:
          team.teamName,

        college:
          team.college,

        set:
          team.set,

        round:
          team.round,

        score:
          team.score,

        lives:
          team.lives,

        status:
          team.status,
      },

      question,
    });
  } catch (error) {
    console.error(
      "GET CURRENT ROUND ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ======================================================
// SUBMIT ANSWER
// ======================================================

export const submitAnswer = async (
  req,
  res
) => {
  try {
    const {
      teamId,
      questionId,
      answer,
    } = req.body;

    // ==================================================
    // VALIDATION
    // ==================================================

    if (!teamId || !questionId) {
      return res.status(400).json({
        success: false,
        message:
          "Team ID and Question ID are required.",
      });
    }

    // ==================================================
    // FIND TEAM
    // ==================================================

    const team =
      await Team.findOne({
        teamId:
          teamId.toUpperCase(),
      });

    if (!team) {
      return res.status(404).json({
        success: false,
        message:
          "Team not found.",
      });
    }

    // ==================================================
    // TEAM STATUS
    // ==================================================

    if (
      team.status ===
      "Eliminated"
    ) {
      return res.status(403).json({
        success: false,
        status: "Eliminated",
        message:
          "Team has already been eliminated.",
      });
    }

    if (
      team.status ===
      "Completed"
    ) {
      return res.status(403).json({
        success: false,
        status: "Completed",
        message:
          "Game already completed.",
      });
    }

    if (
      team.status !==
      "Active"
    ) {
      return res.status(403).json({
        success: false,
        status:
          team.status,
        message:
          "Team is not active.",
      });
    }

    // ==================================================
    // FIND QUESTION
    // ==================================================

    const question =
      await Question.findOne({
        questionId,
      });

    if (!question) {
      return res.status(404).json({
        success: false,
        message:
          "Question not found.",
      });
    }

    // ==================================================
    // SECURITY CHECK
    // ==================================================

    if (
      question.set !==
      team.set
    ) {
      return res.status(403).json({
        success: false,
        message:
          "Question does not belong to your set.",
      });
    }

    if (
      question.round !==
      team.round
    ) {
      return res.status(403).json({
        success: false,
        message:
          "Question is not available in current round.",
      });
    }

    // ==================================================
    // CHECK ANSWER
    // ==================================================

    const submittedAnswer =
      String(answer || "")
        .trim()
        .toUpperCase();

    const correctAnswer =
      String(
        question.answer || ""
      )
        .trim()
        .toUpperCase();

    const correct =
      submittedAnswer ===
      correctAnswer;

    // ==================================================
    // CORRECT
    // ==================================================

    if (correct) {
      team.score =
        Number(
          team.score || 0
        ) +
        Number(
          question.marks || 0
        );
    }

    // ==================================================
    // WRONG
    // ==================================================

    if (!correct) {
      team.lives =
        Math.max(
          0,
          Number(
            team.lives ?? 3
          ) - 1
        );
    }

    // ==================================================
    // ELIMINATION
    // ==================================================

    if (team.lives <= 0) {
      team.lives = 0;

      team.status =
        "Eliminated";

      team.gameStarted =
        false;

      await team.save();

      await ActivityLog.create({
        teamId:
          team.teamId,

        action:
          "TEAM_ELIMINATED",

        details:
          `Wrong answer in Round ${team.round}`,

        ipAddress:
          req.ip || "",
      });

      const io =
        req.app.get("io");

      if (io) {
        io.to(
          `team-${team.teamId}`
        ).emit(
          "team-eliminated",
          {
            teamId:
              team.teamId,

            reason:
              "All lives have been lost.",
          }
        );
      }

      return res.json({
        success: true,

        correct: false,

        score:
          team.score,

        lives:
          team.lives,

        status:
          "Eliminated",

        completed:
          false,

        nextRound:
          false,

        // Correct answer can be
        // shown after submission
        correctAnswer:
          correctAnswer,
      });
    }

    // ==================================================
    // LOG ANSWER
    // ==================================================

    await ActivityLog.create({
      teamId:
        team.teamId,

      action:
        correct
          ? "CORRECT_ANSWER"
          : "WRONG_ANSWER",

      details:
        `Round ${team.round}, Question ${question.questionId}`,

      ipAddress:
        req.ip || "",
    });

    await team.save();

    // ==================================================
    // RESPONSE
    // ==================================================

    return res.json({
      success: true,

      correct,

      score:
        team.score,

      lives:
        team.lives,

      status:
        team.status,

      round:
        team.round,

      // Round direct change nahi hoga
      nextRound:
        false,

      completed:
        false,

      clueAvailable:
        correct,

      halfCodeRequired:
        correct,

      // IMPORTANT:
      // Correct answer is sent
      // AFTER submission only
      correctAnswer:
        correctAnswer,
    });
  } catch (error) {
    console.error(
      "SUBMIT ANSWER ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.message,
    });
  }
};

// ======================================================
// GET CLUE
// ======================================================

export const getClue = async (
  req,
  res
) => {
  try {
    const {
      teamId,
      questionId,
    } = req.query;

    if (
      !teamId ||
      !questionId
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Team ID and Question ID are required.",
      });
    }

    // ==================================================
    // FIND TEAM
    // ==================================================

    const team =
      await Team.findOne({
        teamId:
          teamId.toUpperCase(),
      });

    if (!team) {
      return res.status(404).json({
        success: false,
        message:
          "Team not found.",
      });
    }

    if (
      team.status ===
      "Eliminated"
    ) {
      return res.status(403).json({
        success: false,
        message:
          "Team has been eliminated.",
      });
    }

    if (
      team.status ===
      "Completed"
    ) {
      return res.status(403).json({
        success: false,
        message:
          "Game already completed.",
      });
    }

    // ==================================================
    // FIND QUESTION
    // ==================================================

    const question =
      await Question.findOne({
        questionId,
      }).select(
        "questionId set round clue locationName locationHint"
      );

    if (!question) {
      return res.status(404).json({
        success: false,
        message:
          "Question not found.",
      });
    }

    // ==================================================
    // SECURITY
    // ==================================================

    if (
      question.set !==
      team.set
    ) {
      return res.status(403).json({
        success: false,
        message:
          "Invalid question set.",
      });
    }

    if (
      question.round !==
      team.round
    ) {
      return res.status(403).json({
        success: false,
        message:
          "Invalid current round.",
      });
    }

    // ==================================================
    // CLUE RESPONSE
    // ==================================================

    return res.json({
      success: true,

      clue:
        question.clue ||
        "Follow the location hint carefully.",

      // LOCATION NAME
      locationName:
        question.locationName ||
        "",

      // LOCATION HINT
      locationHint:
        question.locationHint ||
        "",

      // Half code frontend ko
      // kabhi directly nahi bhejna
      halfCodeRequired:
        true,
    });
  } catch (error) {
    console.error(
      "GET CLUE ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.message,
    });
  }
};

// ======================================================
// VERIFY HALF CODE
// ======================================================

export const verifyHalfCode =
  async (req, res) => {
    try {
      const {
        teamId,
        questionId,
        halfCode,
      } = req.body;

      // ==================================================
      // VALIDATION
      // ==================================================

      if (
        !teamId ||
        !questionId ||
        !halfCode
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Team ID, Question ID and Half Code are required.",
        });
      }

      // ==================================================
      // FIND TEAM
      // ==================================================

      const team =
        await Team.findOne({
          teamId:
            teamId.toUpperCase(),
        });

      if (!team) {
        return res.status(404).json({
          success: false,
          message:
            "Team not found.",
        });
      }

      if (
        team.status ===
        "Eliminated"
      ) {
        return res.status(403).json({
          success: false,
          message:
            "Team has been eliminated.",
        });
      }

      if (
        team.status ===
        "Completed"
      ) {
        return res.status(403).json({
          success: false,
          message:
            "Game already completed.",
        });
      }

      // ==================================================
      // FIND QUESTION
      // ==================================================

      const question =
        await Question.findOne({
          questionId,
        });

      if (!question) {
        return res.status(404).json({
          success: false,
          message:
            "Question not found.",
        });
      }

      // ==================================================
      // SECURITY
      // ==================================================

      if (
        question.set !==
        team.set
      ) {
        return res.status(403).json({
          success: false,
          message:
            "Invalid question set.",
        });
      }

      if (
        question.round !==
        team.round
      ) {
        return res.status(403).json({
          success: false,
          message:
            "Invalid round.",
        });
      }

      // ==================================================
      // VERIFY HALF CODE
      // ==================================================

      const submittedCode =
        String(halfCode)
          .trim()
          .toUpperCase();

      const actualHalfCode =
        String(
          question.halfCode ||
            ""
        )
          .trim()
          .toUpperCase();

      if (!actualHalfCode) {
        return res.status(400).json({
          success: false,
          message:
            "Half code is not configured for this question.",
        });
      }

      if (
        submittedCode !==
        actualHalfCode
      ) {
        await ActivityLog.create({
          teamId:
            team.teamId,

          action:
            "WRONG_HALF_CODE",

          details:
            `Wrong half code for Round ${team.round}`,

          ipAddress:
            req.ip || "",
        });

        return res.status(400).json({
          success: false,

          correct:
            false,

          message:
            "Wrong half code. Try again.",

          roundUnlocked:
            false,
        });
      }

      // ==================================================
      // CORRECT HALF CODE
      // ==================================================

      await ActivityLog.create({
        teamId:
          team.teamId,

        action:
          "HALF_CODE_VERIFIED",

        details:
          `Half code verified for Round ${team.round}`,

        ipAddress:
          req.ip || "",
      });

      // ==================================================
      // LAST ROUND
      // ==================================================

      if (
        team.round >= 10
      ) {
        team.status =
          "Completed";

        team.gameStarted =
          false;

        await team.save();

        await ActivityLog.create({
          teamId:
            team.teamId,

          action:
            "GAME_COMPLETED",

          details:
            `Completed all 10 rounds with score ${team.score}`,

          ipAddress:
            req.ip || "",
        });

        return res.json({
          success: true,

          correct:
            true,

          roundUnlocked:
            false,

          completed:
            true,

          round:
            10,

          score:
            team.score,

          lives:
            team.lives,

          message:
            "Congratulations! Hunt completed.",
        });
      }

      // ==================================================
      // UNLOCK NEXT ROUND
      // ==================================================

      team.round =
        Number(
          team.round || 1
        ) + 1;

      team.currentQuestion =
        0;

      await team.save();

      // ==================================================
      // RESPONSE
      // ==================================================

      return res.json({
        success: true,

        correct:
          true,

        roundUnlocked:
          true,

        completed:
          false,

        nextRound:
          true,

        round:
          team.round,

        score:
          team.score,

        lives:
          team.lives,

        message:
          `Round ${team.round} unlocked!`,
      });
    } catch (error) {
      console.error(
        "VERIFY HALF CODE ERROR:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          error.message,
      });
    }
  };

// ======================================================
// ANTI-CHEAT VIOLATION
// ======================================================

export const reportViolation =
  async (req, res) => {
    try {
      const {
        teamId,
        violation,
      } = req.body;

      if (
        !teamId ||
        !violation
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Team ID and violation are required.",
        });
      }

      const team =
        await Team.findOne({
          teamId:
            teamId.toUpperCase(),
        });

      if (!team) {
        return res.status(404).json({
          success: false,
          message:
            "Team not found.",
        });
      }

      if (
        team.status ===
        "Eliminated"
      ) {
        return res.json({
          success: true,
          status:
            "Eliminated",
          message:
            "Team already eliminated.",
        });
      }

      team.status =
        "Eliminated";

      team.gameStarted =
        false;

      await team.save();

      await ActivityLog.create({
        teamId:
          team.teamId,

        action:
          "ANTI_CHEAT_VIOLATION",

        details:
          violation,

        ipAddress:
          req.ip || "",
      });

      const io =
        req.app.get("io");

      if (io) {
        io.to(
          `team-${team.teamId}`
        ).emit(
          "team-eliminated",
          {
            teamId:
              team.teamId,

            reason:
              `Anti-cheat violation: ${violation}`,
          }
        );

        io.emit(
          "team-updated",
          {
            teamId:
              team.teamId,

            status:
              "Eliminated",

            reason:
              violation,
          }
        );
      }

      return res.json({
        success: true,

        status:
          "Eliminated",

        message:
          "Team eliminated due to anti-cheat violation.",
      });
    } catch (error) {
      console.error(
        "VIOLATION ERROR:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          error.message,
      });
    }
  };