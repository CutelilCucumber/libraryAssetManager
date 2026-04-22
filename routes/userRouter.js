const { Router } = require("express");
const userController = require("../controllers/userController");
const registerValidation = require('../middleware/registerValidation');
const auth = require('../middleware/checkAuth.js')
const passport = require('passport');
const userRouter = Router();

userRouter.get('/', (req, res) => {
  if (req.user) return res.redirect('/local');
  res.render('welcome');
});

userRouter.get('/login', (req, res) => {
  res.render('login', { error: req.query.error || null });
});
userRouter.get("/register", userController.registerGet);
userRouter.get("/logout", userController.logoutGet);
userRouter.get("/join", auth.isAuth, userController.joinGet);
userRouter.post("/login", passport.authenticate('local', { 
  failureRedirect: '/login?error=Incorrect username or password', 
  successRedirect: '/local' 
}));
userRouter.post("/register", registerValidation, userController.registerPost);
userRouter.post("/join", auth.isAuth, userController.joinPost);

module.exports = userRouter;