const options = require("./knexfile.js");
const knex = require("knex")(options);
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const helmet = require('helmet');
const cors = require('cors');

const indexRouter = require("./routes/queryRouter");
const usersRouter = require("./routes/usersRouter");
const swaggerRouter = require("./routes/swaggerRouter");

const app = express();

app.use(cors());
app.use(helmet());
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use((req, res, next) => {
  req.db = knex;
  next();
});

// set up routers
app.use("/stocks", indexRouter);
app.use("/user", usersRouter);
app.use("/", swaggerRouter);

// 404 handling
app.use(function (req, res, next) {
  res.status(404).json({error: true, message: "route not found"});
});

// set up logging
logger.token("req", (req, res) => JSON.stringify(req.headers));
logger.token("res", (req, res) => {
  const headers = {};
  res.getHeaderNames().map((h) => (headers[h] = res.getHeader(h)));
  return JSON.stringify(headers);
});

module.exports = app;
