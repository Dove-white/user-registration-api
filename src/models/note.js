const mongoose = require("mongoose");
const {
  generateRandomColor,
} = require("../custom modules/random_background_color");

// Note schema
const { backgroundColor, textColor } = generateRandomColor();

const noteSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    body: {
      type: String,
      required: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    background_color: {
      type: String,
      default: backgroundColor,
    },
    text_color: {
      type: String,
      default: textColor,
    },
    starred: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const Note = mongoose.model("Note", noteSchema);

module.exports = Note;
