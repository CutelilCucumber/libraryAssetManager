const { Router } = require("express");
const userController = require("../controllers/userController");
const registerValidation = require('../middleware/registerValidation');
const auth = require('../middleware/authMiddleware.js')
const passport = require('passport');
const userRouter = Router();

userRouter.get("/login", userController.loginGet);
userRouter.get("/register", userController.registerGet);
userRouter.get("/logout", userController.logoutGet);
userRouter.get("/join", auth.isAuth, userController.joinGet);
userRouter.post("/login", passport.authenticate('local', { failureRedirect: '/login', successRedirect: '/' }));
userRouter.post("/register", registerValidation, userController.registerPost);
userRouter.post("/join", auth.isAuth, userController.joinPost);

module.exports = userRouter;