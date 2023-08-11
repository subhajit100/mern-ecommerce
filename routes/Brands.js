const express = require("express");
const brandController = require("../controller/Brand");

const brandsRouter = express.Router();

brandsRouter
  .get("/", brandController.fetchAllBrands)
  .post("/", brandController.createBrand);

exports.brandsRouter = brandsRouter;
