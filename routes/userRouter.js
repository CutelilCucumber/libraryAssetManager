const { Router } = require("express");
const userController = require("../controllers/userController");
const middleware = require('../middleware')
const passport = require('passport');
const userRouter = Router();

userRouter.get('/', (req, res) => {
  if (req.user) return res.redirect('/local');
  res.render('welcome', { error: req.query.error || null });
});

userRouter.get('/login', (req, res) => {
  res.render('login', { error: req.query.error || null });
});
userRouter.get("/register", userController.registerGet);
userRouter.get("/logout", userController.logoutGet);
userRouter.get("/join", middleware.isAuth, userController.joinGet);
userRouter.post("/login", passport.authenticate('local', { 
  failureRedirect: '/login?error=Incorrect username or password', 
  successRedirect: '/local' 
}));
userRouter.post("/register", middleware.registerValidation, userController.registerPost);
userRouter.post("/join", middleware.isAuth, userController.joinPost);

module.exports = userRouter;