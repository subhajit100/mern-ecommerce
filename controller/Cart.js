const { Cart } = require("../model/Cart");

exports.fetchCartByUser = async (req, res) => {
  try {
    const { id } = req.user;
    const cartItems = await Cart.find({ user: id }).populate("product");
    res.status(200).json(cartItems);
  } catch (err) {
    res.status(400).json({ err });
  }
};

exports.addToCart = async (req, res) => {
  try {
    const {id} = req.user;
    const cart = new Cart({...req.body, user: id});
    const result = await cart.save();
    const response = await result.populate("product");
    res.status(201).json(response);
  } catch (err) {
    res.status(400).json({ err });
  }
};

exports.updateCart = async (req, res) => {
  try {
    const id = req.params.id;
    const cart = await Cart.findByIdAndUpdate(id, req.body, {
      returnDocument: "after",
    });
    const result = await cart.populate("product");
    res.status(200).json(result);
  } catch (err) {
    res.status(400).json({ err });
  }
};

exports.deleteFromCart = async (req, res) => {
  try {
    const id = req.params.id;
    const cart = await Cart.findByIdAndDelete(id);
    res.status(201).json(cart);
  } catch (err) {
    res.status(400).json({ err });
  }
};
