const express = require("express");
const session = require('express-session');
var passport = require('passport');
const app = express();
require('dotenv').config()

const libRouter = require("./routes/libRouter");
const userRouter = require("./routes/userRouter");

require('./lib/passport');

//usable path for asset previews, might be old
const path = require("node:path");
const assetsPath = path.join(__dirname, "public");

app.use(express.static(assetsPath));
app.use(express.urlencoded({ extended: true }));

//use passport session for user state management
app.use(session({ secret: process.env.SECRET, resave: false, saveUninitialized: false }));
app.use(passport.session());

// attach ejs view engine
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
//middleware for ejs vars
app.use((req, res, next) => {
  res.locals.user = req.user || null;
  next();
});
//use routes, maybe change to library on scale
app.use("/local", libRouter);
app.use("/", userRouter);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.statusCode || 500).send(err.message);
});

const PORT = 8000;
app.listen(PORT, (error) => {
    if (error) {
        throw error;
    }
    console.log(`listening on port ${PORT}`);
});