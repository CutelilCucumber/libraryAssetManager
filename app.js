const express = require("express");
const session = require('express-session');
var passport = require('passport');
const { PrismaSessionStore } = require('@quixo3/prisma-session-store');
const prisma = require('./db/prismaClient');
const { isAuth, isMember } = require('./middleware');

const app = express();
require('dotenv').config()

const localRouter = require("./routes/localRouter");
const publicRouter = require("./routes/publicRouter");
const userRouter = require("./routes/userRouter");

require('./lib/passport');

//usable path for asset previews, might be old
const path = require("node:path");
const assetsPath = path.join(__dirname, "public");

app.use(express.static(assetsPath));
app.use(express.urlencoded({ extended: true }));

//use prisma store and passport session for user state management
app.use(session({
  cookie: {
    maxAge: 7 * 24 * 60 * 60 * 1000 // 1 week
  },
  secret: process.env.SECRET,
  resave: true,
  saveUninitialized: true,
  store: new PrismaSessionStore(
    prisma,
    {
      checkPeriod: 2 * 60 * 1000,
      dbRecordIdIsSessionId: true,
      dbRecordIdFunction: undefined,
    }
  )
}));
app.use(passport.session());

// attach ejs view engine
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
//middleware for ejs vars
app.use((req, res, next) => {
  res.locals.user = req.user || null;
  next();
});
//use routes
app.use("/local", isAuth, localRouter);
app.use("/public", isMember, publicRouter);
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