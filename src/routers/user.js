const express = require("express");
const router = express.Router();
const User = require("../models/user");
const auth = require("../middleware/auth");

// Create a new user
router.post("/users", async (req, res) => {
  try {
    const user = new User(req?.body);
    await user.save();

    const token = await user.generateAuthToken();
    const message = "User created successfully";
    res.status(201).send({ message, token });
  } catch (error) {
    if (error?.message?.includes("Email is invalid")) {
      error.errorMsg = "Email is invalid";
    }
    if (error?.errorResponse?.errmsg?.includes("duplicate")) {
      error.errorMsg = "Email already exists";
    }
    res.status(400).send(error);
  }
});

// Login a user
router.post("/users/login", async (req, res) => {
  const { email, password } = req?.body;

  try {
    const user = await User.findByCredentials(email, password);
    const token = await user.generateAuthToken();

    const message = "Login successfully";
    res.status(201).send({ message, token });
  } catch (error) {
    error.errorMsg = error?.message;
    res.status(400).send(error);
  }
});

// View logged in user profile
router.get("/users/me", auth, async (req, res) => {
  res.send(req.user);
});

// Log user out of the application
router.post("/users/logout", auth, async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter((token) => {
      return token.token != req.token;
    });
    await req.user.save();

    res.send();
  } catch (error) {
    res.status(500).send(error);
  }
});

// Log user out of all devices
router.post("/users/logoutAll", auth, async (req, res) => {
  try {
    req.user.tokens.splice(0, req.user.tokens.length);
    await req.user.save();

    res.send();
  } catch (error) {
    res.status(500).send(error);
  }
});

module.exports = router;
