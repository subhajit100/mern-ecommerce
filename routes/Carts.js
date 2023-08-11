const express = require("express");
const cartController = require("../controller/Cart");

const cartsRouter = express.Router();

cartsRouter
  .get("/", cartController.fetchCartByUser)
  .post("/", cartController.addToCart)
  .patch("/:id", cartController.updateCart)
  .delete("/:id", cartController.deleteFromCart);

exports.cartsRouter = cartsRouter;
