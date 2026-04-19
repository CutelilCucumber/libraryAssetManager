const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const db = require('../db/queryUserDB.js');
const { validPassword } = require('./passwordUtils')

const customFields = {
  usernameField: 'username',
  passwordField: 'password'
};

const verifyCallback = async (username, password, done) => {
  try {
    const user = await db.getUserByUsername(username);

    if (!user) return done(null, false);

    const isValid = validPassword(password, user.hash, user.salt);

    if (isValid) {
      return done(null, user);
    } else {
      return done(null, false);
    }
  } catch (err) {
    done(err);
  }
};

passport.use(new LocalStrategy(customFields, verifyCallback));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (userId, done) => {
  try {
    const user = await db.getUserById(userId);
    done(null, user);
  } catch (err) {
    done(err);
  }
});