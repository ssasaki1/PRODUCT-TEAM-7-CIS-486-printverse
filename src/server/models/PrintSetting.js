const mongoose = require("mongoose");

const printSettingSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    name: { type: String, required: true },

    // These fields now match what your AI + frontend use
    copies: { type: Number },
    color: { type: String, enum: ["color", "mono"], default: "mono" },
    duplex: { type: Boolean, default: false },
    paperSize: { type: String, default: "A4" },
    orientation: {
      type: String,
      enum: ["portrait", "landscape"],
      default: "portrait",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("PrintSetting", printSettingSchema);
