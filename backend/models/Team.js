import mongoose from "mongoose";

const teamSchema = new mongoose.Schema(
  {
    gamePhase: {
  type: String,
  enum: [
    "QUESTION",
    "CLUE",
    "LOCATION",
    "CODE",
    "COMPLETED"
  ],
  default: "QUESTION",
},

clueUnlocked: {
  type: Boolean,
  default: false,
},

locationUnlocked: {
  type: Boolean,
  default: false,
},

locationVerified: {
  type: Boolean,
  default: false,
},

codeVerified: {
  type: Boolean,
  default: false,
},
    teamId: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },

    teamName: {
      type: String,
      required: true,
      trim: true,
    },

    college: {
      type: String,
      default: "",
    },

    members: {
      type: [String],
      default: [],
    },

    startCode: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
    },

    set: {
      type: String,
      enum: ["A", "B", "C"],
      default: "A",
    },

    round: {
      type: Number,
      default: 1,
    },

    score: {
      type: Number,
      default: 0,
    },

    lives: {
      type: Number,
      default: 3,
    },

    status: {
      type: String,
      enum: [
        "Active",
        "Disabled",
        "Completed",
        "Eliminated",
      ],
      default: "Active",
    },

    currentQuestion: {
      type: Number,
      default: 0,
    },

    gameStarted: {
      type: Boolean,
      default: false,
    },
    antiCheatViolations: {
  type: Number,
  default: 0,
},

eliminationReason: {
  type: String,
  default: "",
},

eliminatedAt: {
  type: Date,
  default: null,
},

    lastActive: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Team", teamSchema);