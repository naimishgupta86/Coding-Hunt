import mongoose from "mongoose";

const activityLogSchema = new mongoose.Schema(
  {
    teamId: {
      type: String,
      required: true,
    },

    action: {
      type: String,
      required: true,
    },

    details: {
      type: String,
      default: "",
    },

    ipAddress: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model(
  "ActivityLog",
  activityLogSchema
);