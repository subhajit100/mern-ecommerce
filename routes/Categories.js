const express = require("express");
const categoryController = require("../controller/Category");

const categoriesRouter = express.Router();

categoriesRouter
  .get("/", categoryController.fetchAllCategories)
  .post("/", categoryController.createCategory);

exports.categoriesRouter = categoriesRouter;
