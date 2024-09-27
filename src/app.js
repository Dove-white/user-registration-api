const express = require("express");
const userRouter = require("./routers/user");
const noteRouter = require("./routers/note");
const cors = require("cors");
require("dotenv").config();
require("./db/db");

const app = express();
app.use(cors());
app.use(express.json());
app.use(userRouter);
app.use(noteRouter);

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
