const express = require("express");
const userRouter = require("./routers/user");
require("dotenv").config();
require("./db/db");

const app = express();
app.use(express.json());
app.use(userRouter);

const port = process.env.PORT;

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
