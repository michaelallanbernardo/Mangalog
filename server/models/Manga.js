 const mongoose = require("mongoose");

const mangaSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    author: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["reading", "completed", "on-hold", "dropped", "plan-to-read"],
      default: "plan-to-read",
    },
    chapters: {
      type: Number,
      default: 0,
    },
    currentChapter: {
      type: Number,
      default: 0,
    },
    notes: {
      type: String,
      default: "",
    },
    anilistId: {
      type: Number,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Manga", mangaSchema);
