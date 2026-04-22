const { body, validationResult } = require('express-validator');
const { genPassword } = require('../lib/passwordUtils.js')
const db = require('../db/queryUserDB.js')

async function registerPost(req, res, next) {
  const errors = validationResult(req);

    if (!errors.isEmpty()) {
    return res.redirect(`/register?error=${encodeURIComponent(errors.array()[0].msg)}`);
  }
  const { username, email, password } = req.body;
  const saltHash = genPassword(password);
  await db.createUser(username, email, saltHash.hash, saltHash.salt);
  console.log("User Registered:")
  console.log(req.body)
  res.redirect('/login');
}

async function loginGet(req, res) {
  res.render("login");
}

async function registerGet(req, res) {
  res.render('register', { error: req.query.error || null });
}

async function logoutGet(req, res) {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    res.redirect("/login");
  });
}

async function joinGet(req, res) {
  console.log(req.user)
  res.render("memberForm");
}

async function joinPost(req, res) {
  console.log("User updated:")
  console.log(req.user)
  const { secret } = req.body;
  if (secret === process.env.ADM_PASS){
    db.addMembership(req.user.id)
    db.addAdmin(req.user.id)
    console.log("To: "+req.user.role)
    res.redirect("/local");
  } else if (secret === process.env.MEM_PASS){
    db.addMembership(req.user.role)
    console.log("To: "+req.user.role)
    res.redirect("/local");
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
