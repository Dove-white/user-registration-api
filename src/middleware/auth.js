const jwt = require("jsonwebtoken");
const User = require("../models/user");

const auth = async (req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");
  if (!token) {
    return res
      .status(401)
      .send({ errorMsg: "Not authorized" });
  }

  const data = jwt.verify(token, process.env.JWT_KEY);

  try {
    const user = await User.findOne({ _id: data._id, "tokens.token": token });
    if (!user) {
      throw new Error();
    }
    req.user = user;
    req.token = token;
    next();
  } catch (error) {
    res
      .status(401)
      .send({ errorMsg: "Not authorized" });
  }
};

module.exports = auth;
