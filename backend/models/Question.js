import mongoose from "mongoose";

const questionSchema = new mongoose.Schema(
  {
    questionId: {
      type: String,
      unique: true,
      required: true,
    },

    set: {
      type: String,
      enum: ["A", "B", "C"],
      required: true,
    },

    round: {
      type: Number,
      required: true,
      min: 1,
      max: 10,
    },

    question: {
      type: String,
      required: true,
    },

    options: {
      A: {
        type: String,
        required: true,
      },

      B: {
        type: String,
        required: true,
      },

      C: {
        type: String,
        required: true,
      },

      D: {
        type: String,
        required: true,
      },
    },

    answer: {
      type: String,
      enum: ["A", "B", "C", "D"],
      required: true,
    },

    marks: {
      type: Number,
      default: 100,
    },

    time: {
      type: Number,
      default: 60,
    },

    // ==============================
    // CLUE SYSTEM
    // ==============================

    clue: {
      type: String,
      default: "",
    },

    halfCode: {
      type: String,
      default: "",
    },

    // ==============================
    // LOCATION SYSTEM
    // ==============================

    locationName: {
      type: String,
      default: "",
    },

    locationHint: {
      type: String,
      default: "",
    },

    locationCode: {
      type: String,
      default: "",
    },

    // ==============================
    // FINAL CODE
    // ==============================

    fullCode: {
      type: String,
      default: "",
    },

    explanation: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

questionSchema.index({
  set: 1,
  round: 1,
});

export default mongoose.model(
  "Question",
  questionSchema
);