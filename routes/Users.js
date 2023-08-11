const express = require("express");
const userController = require("../controller/User");
const usersRouter = express.Router();

usersRouter
  .get("/own", userController.fetchUserById)
  .patch("/:id", userController.updateUser);

exports.usersRouter = usersRouter;
