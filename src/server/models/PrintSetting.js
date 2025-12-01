const mongoose = require("mongoose");

const printSettingSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    name: { type: String, required: true },
    pages: Number,
    colorMode: { type: String, enum: ["color", "grayscale"], default: "grayscale" },
    duplex: Boolean,
    paperSize: { type: String, default: "A4" }
  },
  { timestamps: true }
);

module.exports = mongoose.model("PrintSetting", printSettingSchema);
