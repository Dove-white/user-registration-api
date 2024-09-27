const express = require("express");
const Note = require("../models/note");
const auth = require("../middleware/auth");
const {
  generateRandomColor,
} = require("../custom modules/random_background_color");

const router = express.Router();
const { backgroundColor, textColor } = generateRandomColor();

// Create a new note
router.post("/notes", auth, async (req, res) => {
  if (req.body?.generate_colors) {
    req.body.background_color = backgroundColor;
    req.body.text_color = textColor;
  }

  req.body.title = "New Note";
  req.body.body = "New note details...";

  const note = new Note({
    ...req.body,
    owner: req.user._id,
  });

  try {
    await note.save();
    res.status(201).send({ message: "Note created" });
  } catch (error) {
    res.status(400).send(error);
  }
});

// Get all notes for the authenticated user
router.get("/notes", auth, async (req, res) => {
  try {
    const notes = await Note.find({ owner: req.user._id });
    res.send(notes);
  } catch (e) {
    res.status(500).send();
  }
});

// Get a specific note by its ID
router.get("/notes/:id", auth, async (req, res) => {
  const _id = req.params.id;

  try {
    const note = await Note.findOne({ _id, owner: req.user._id });

    if (!note) {
      return res.status(404).send();
    }

    res.send(note);
  } catch (e) {
    res.status(500).send();
  }
});

// find note by day
router.post("/notes/day", auth, async (req, res) => {
  let today;

  if (req.body.today) {
    today = new Date(req.body.today);
  } else {
    today = new Date();
  }

  const startOfDay = new Date(today.setHours(0, 0, 0, 0));
  const endOfDay = new Date(today.setHours(23, 59, 59, 999));

  try {
    const notes = await Note.find({
      owner: req.user._id,
      createdAt: { $gte: startOfDay, $lt: endOfDay },
    });
    res.send(notes);
  } catch (error) {
    res.status(500).send({ errorMsg: error.message || "Server Error" });
  }
});

// find note by week
router.post("/notes/week", auth, async (req, res) => {
  let today;

  if (req.body.today) {
    today = new Date(req.body.today);
  } else {
    today = new Date();
  }

  const firstDayOfWeek = new Date(
    today.setDate(today.getDate() - today.getDay())
  );
  firstDayOfWeek.setHours(0, 0, 0, 0);

  const lastDayOfWeek = new Date(
    today.setDate(today.getDate() - today.getDay() + 6)
  );
  lastDayOfWeek.setHours(23, 59, 59, 999);

  try {
    const notes = await Note.find({
      owner: req.user._id,
      createdAt: { $gte: firstDayOfWeek, $lt: lastDayOfWeek },
    });
    res.send(notes);
  } catch (error) {
    res.status(500).send({ errorMsg: error.message || "Server Error" });
  }
});

// find note by month
router.post("/notes/month", auth, async (req, res) => {
  let today;

  if (req.body.today) {
    today = new Date(req.body.today);
  } else {
    today = new Date();
  }

  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const endOfMonth = new Date(
    today.getFullYear(),
    today.getMonth() + 1,
    0,
    23,
    59,
    59,
    999
  );

  try {
    const notes = await Note.find({
      owner: req.user._id,
      createdAt: { $gte: startOfMonth, $lt: endOfMonth },
    });
    res.send(notes);
  } catch (error) {
    res.status(500).send({ errorMsg: error.message || "Server Error" });
  }
});

// Find Notes by Year and Month
router.post("/notes/findByMonth", auth, async (req, res) => {
  const { year, month } = req.body;

  if (!year || !month) {
    return res
      .status(400)
      .send({ errorMsg: "Please provide both year and month." });
  }

  // Convert month name to month index (January = 0, December = 11)
  const monthIndex = new Date(`${month} 1, ${year}`).getMonth();

  if (monthIndex === -1) {
    return res.status(400).send({ errorMsg: "Invalid month provided." });
  }

  const startOfMonth = new Date(year, monthIndex, 1);
  const endOfMonth = new Date(year, monthIndex + 1, 0, 23, 59, 59, 999);

  try {
    const notes = await Note.find({
      owner: req.user._id,
      createdAt: { $gte: startOfMonth, $lt: endOfMonth },
    });

    res.send(notes);
  } catch (e) {
    res.status(500).send(e);
  }
});

// Get All Years and Months
router.post("/notes/availableMonths", auth, async (req, res) => {
  try {
    const notes = await Note.aggregate([
      {
        $match: { owner: req.user._id },
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
        },
      },
      {
        $sort: { "_id.year": -1, "_id.month": -1 },
      },
    ]);

    // Convert the result to an array of year-month objects
    const availableMonths = notes.map((note) => ({
      year: note._id.year,
      month: new Date(note._id.year, note._id.month - 1).toLocaleString(
        "default",
        { month: "long" } // Convert month number to month name
      ),
    }));

    res.send(availableMonths);
  } catch (error) {
    res.status(500).send({ errorMsg: "Unable to retrieve available months." });
  }
});

// Update a note by its ID
router.patch("/notes/:id", auth, async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ["title", "body"];
  const isValidOperation = updates.every((update) =>
    allowedUpdates.includes(update)
  );

  if (!isValidOperation) {
    return res.status(400).send({ errorMsg: "Invalid updates!" });
  }

  try {
    const note = await Note.findOne({
      _id: req.params.id,
      owner: req.user._id,
    });

    if (!note) {
      return res.status(404).send();
    }

    if (req.body.title !== undefined) {
      if (req.body.title.trim() !== "") {
        note.title = req.body.title;
      }
    }

    if (req.body.body !== undefined) {
      if (req.body.body.trim() !== "") {
        note.body = req.body.body;
      }
    }

    await note.save();

    res.send({ message: "Note undated" });
  } catch (e) {
    res.status(400).send(e);
  }
});

// Delete a note by its ID
router.delete("/notes/:id", auth, async (req, res) => {
  try {
    const note = await Note.findOneAndDelete({
      _id: req.params.id,
      owner: req.user._id,
    });

    if (!note) {
      return res.status(404).send();
    }

    res.send({ message: "Note deleted" });
  } catch (e) {
    res.status(500).send();
  }
});

module.exports = router;
