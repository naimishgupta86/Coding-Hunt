import Team from "../models/Team.js";

// ==========================================
// GENERATE TEAM ID
// ==========================================

function generateTeamId() {
  return `CH-${Date.now()
    .toString()
    .slice(-6)}`;
}

// ==========================================
// GENERATE START CODE
// ==========================================

function generateStartCode() {
  return Math.random()
    .toString(36)
    .substring(2, 8)
    .toUpperCase();
}

// ==========================================
// CREATE TEAM
// ==========================================

export const createTeam = async (
  req,
  res
) => {
  try {
    const {
      teamName,
      college,
      members,
      set,
    } = req.body;

    if (!teamName?.trim()) {
      return res.status(400).json({
        success: false,
        message:
          "Team name is required",
      });
    }

    const teamId =
      generateTeamId();

    const startCode =
      generateStartCode();

    const team =
      await Team.create({
        teamId,

        teamName:
          teamName.trim(),

        college:
          college?.trim() || "",

        members:
          Array.isArray(members)
            ? members
            : [],

        set:
          set?.toUpperCase() || "A",

        startCode,

        round: 1,

        score: 0,

        lives: 3,

        status: "Active",

        currentQuestion: 0,

        gameStarted: false,
      });

    res.status(201).json({
      success: true,
      team,
    });
  } catch (error) {
    console.error(
      "CREATE TEAM ERROR:",
      error
    );

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================================
// GET ALL TEAMS
// ==========================================

export const getTeams = async (
  req,
  res
) => {
  try {
    const teams =
      await Team.find().sort({
        createdAt: -1,
      });

    res.json({
      success: true,
      teams,
    });
  } catch (error) {
    console.error(
      "GET TEAMS ERROR:",
      error
    );

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================================
// VERIFY TEAM LOGIN
// ==========================================

export const verifyTeam = async (
  req,
  res
) => {
  try {
    const {
      teamId,
      startCode,
    } = req.body;

    if (
      !teamId ||
      !startCode
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Team ID and Start Code are required",
      });
    }

    const team =
      await Team.findOne({
        teamId:
          teamId
            .trim()
            .toUpperCase(),

        startCode:
          startCode
            .trim()
            .toUpperCase(),
      });

    if (!team) {
      return res.status(401).json({
        success: false,
        message:
          "Invalid Team ID or Start Code",
      });
    }

    if (
      team.status !==
      "Active"
    ) {
      return res.status(403).json({
        success: false,
        message:
          `Team is ${team.status}`,
        status:
          team.status,
      });
    }

    team.lastActive =
      new Date();

    await team.save();

    res.json({
      success: true,
      team,
    });
  } catch (error) {
    console.error(
      "VERIFY TEAM ERROR:",
      error
    );

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================================
// UPDATE TEAM
// ==========================================

export const updateTeam = async (
  req,
  res
) => {
  try {
    const team =
      await Team.findOneAndUpdate(
        {
          teamId:
            req.params.id,
        },
        req.body,
        {
          new: true,
          runValidators: true,
        }
      );

    if (!team) {
      return res.status(404).json({
        success: false,
        message:
          "Team not found",
      });
    }

    res.json({
      success: true,
      team,
    });
  } catch (error) {
    console.error(
      "UPDATE TEAM ERROR:",
      error
    );

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================================
// DELETE TEAM
// ==========================================

export const deleteTeam = async (
  req,
  res
) => {
  try {
    const team =
      await Team.findOneAndDelete({
        teamId:
          req.params.id,
      });

    if (!team) {
      return res.status(404).json({
        success: false,
        message:
          "Team not found",
      });
    }

    res.json({
      success: true,
      message:
        "Team deleted successfully",
    });
  } catch (error) {
    console.error(
      "DELETE TEAM ERROR:",
      error
    );

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================================
// RESET TEAM
// ==========================================

export const resetTeam = async (
  req,
  res
) => {
  try {
    const team =
      await Team.findOneAndUpdate(
        {
          teamId:
            req.params.id,
        },
        {
          round: 1,

          score: 0,

          lives: 3,

          currentQuestion: 0,

          gameStarted: false,

          status: "Active",

          gamePhase:
            "QUESTION",

          clueUnlocked: false,

          locationUnlocked: false,

          locationVerified: false,

          codeVerified: false,

          antiCheatViolations: 0,

          eliminationReason: "",

          eliminatedAt: null,
        },
        {
          new: true,
        }
      );

    if (!team) {
      return res.status(404).json({
        success: false,
        message:
          "Team not found",
      });
    }

    res.json({
      success: true,
      team,
    });
  } catch (error) {
    console.error(
      "RESET TEAM ERROR:",
      error
    );

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};