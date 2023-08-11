const express = require("express");
const orderController = require("../controller/Order");

const ordersRouter = express.Router();

ordersRouter
  .get("/", orderController.fetchAllOrders)
  .get("/own", orderController.fetchOrdersByUser)
  .post("/", orderController.createOrder)
  .patch("/:id", orderController.updateOrder)
  .delete("/:id", orderController.deleteOrder);

exports.ordersRouter = ordersRouter;
