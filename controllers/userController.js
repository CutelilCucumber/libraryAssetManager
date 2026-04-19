const { body, validationResult } = require('express-validator');
const { genPassword } = require('../lib/passwordUtils.js')
const db = require('../db/queryUserDB.js')

async function registerPost(req, res, next) {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  console.log(req.body)
  const { firstname, lastname, username, password } = req.body;
  const saltHash = genPassword(password);

  const member = false;
  const admin = false;

  await db.createUser(username, firstname, lastname, member, admin,  saltHash.hash, saltHash.salt);
  res.redirect('/login');
}

async function loginGet(req, res) {
  res.render("login");
}

async function registerGet(req, res) {
  res.render("register");
}

async function logoutGet(req, res) {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
}

async function joinGet(req, res) {
  console.log(req.user)
  res.render("memberForm");
}

async function joinPost(req, res) {
  const { secret } = req.body;
  if (secret === process.env.ADM_PASS){
    db.addMembership(req.user.id)
    db.addAdmin(req.user.id)
    res.redirect("/");
  } else if (secret === process.env.MEM_PASS){
    db.addMembership(req.user.id)
    res.redirect("/");
  } else {
    res.redirect("/join");
  }
}

module.exports = {
  registerPost,
  loginGet,
  registerGet,
  logoutGet,
  joinGet,
  joinPost
};
