const express = require("express");
const productController = require("../controller/Product");

const productsRouter = express.Router();

productsRouter
  .post("/", productController.createProduct)
  .get("/", productController.fetchAllProducts)
  .get("/:id", productController.fetchProductById)
  .patch("/:id", productController.updateProduct);

exports.productsRouter = productsRouter;
