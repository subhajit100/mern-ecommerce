const express = require("express");
const authController = require("../controller/Auth");
const authRouter = express.Router();
const passport = require("passport");

authRouter
  .post("/signup", authController.createUser)
  .post("/login", passport.authenticate("local"), authController.loginUser)
  .get("/check", passport.authenticate("jwt"), authController.checkAuth)
  .get("/logout", authController.logoutUser)
  .post(
    "/reset-password-request", // this will take the inputted email and send an actual reset password link on that
    authController.resetPasswordRequest
  )
  .post(
    "/reset-password",
    authController.resetPassword
  );

exports.authRouter = authRouter;
