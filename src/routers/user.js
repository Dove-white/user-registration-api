const express = require("express");
const router = express.Router();
const User = require("../models/user");
const auth = require("../middleware/auth");
const bcrypt = require("bcryptjs");
const {
  generateBackgroundColor,
} = require("../custom modules/background_color");

// Create a new user
router.post("/users", async (req, res) => {
  try {
    const user = new User(req?.body);
    user.background_color = generateBackgroundColor();
    await user.save();

    const token = await user.generateAuthToken();
    const message = "Account created";
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

// Edit user details (name and/or password)
router.patch("/users/me", auth, async (req, res) => {
  const { name, oldPassword, newPassword, confirmPassword } = req.body;

  if (!name && !oldPassword) {
    return res.status(400).send({ errorMsg: "Please provide valid updates." });
  }

  try {
    const user = req.user;

    if (name?.length > 0) {
      user.name = name;
      user.background_color = generateBackgroundColor();
    }

    if (oldPassword?.length > 0 || newPassword || confirmPassword) {
      if (!oldPassword || !newPassword || !confirmPassword) {
        return res
          .status(400)
          .send({ errorMsg: "All password fields are required." });
      }

      const isMatch = await bcrypt.compare(oldPassword, user.password);
      if (!isMatch) {
        return res.status(400).send({ errorMsg: "Incorrect old password." });
      }

      if (newPassword !== confirmPassword) {
        return res
          .status(400)
          .send({ errorMsg: "Confirm password do not match." });
      }

      user.password = newPassword;
    }

    await user.save();

    const message = name?.length > 0 ? "" : "Password updated";

    res.send({ user, message });
  } catch (error) {
    res.status(400).send(error);
  }
});

// View all users
router.get("/users", auth, async (req, res) => {
  try {
    const users = await User.find({});
    res.send(users);
  } catch (error) {
    res.status(500).send(error);
  }
});

// View logged in user profile
router.get("/users/me", auth, async (req, res) => {
  const user = req.user;
  res.send({ user });
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
