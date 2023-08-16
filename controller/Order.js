const { Order } = require("../model/Order");
const { Product } = require("../model/Product");
const { User } = require("../model/User");
const { sendMail, invoiceTemplate } = require("../services/common");

exports.fetchOrdersByUser = async (req, res) => {
  try {
    const { id } = req.user;
    const orders = await Order.find({ user: id });
    res.status(200).json(orders);
  } catch (err) {
    res.status(400).json({ err });
  }
};

exports.createOrder = async (req, res) => {
  try {
    const order = new Order(req.body);
    for(let item of order.items){
        const product = await Product.findById(item.product.id);
        product.$inc('stock', (-1)*item.quantity );
        await product.save();
    }
    const response = await order.save();
    const user = await User.findById(response.user);
    sendMail({to: user.email, subject: `Order Placed: ${response.id}` , html: invoiceTemplate(response)})
    res.status(201).json(response);
  } catch (err) {
    res.status(400).json({ err });
  }
};

exports.updateOrder = async (req, res) => {
  try {
    const id = req.params.id;
    const order = await Order.findByIdAndUpdate(id, req.body, {
      returnDocument: "after",
    });
    res.status(200).json(order);
  } catch (err) {
    res.status(400).json({ err });
  }
};

exports.deleteOrder = async (req, res) => {
  try {
    const id = req.params.id;
    const order = await Order.findByIdAndDelete(id);
    res.status(201).json(order);
  } catch (err) {
    res.status(400).json({ err });
  }
};

exports.fetchAllOrders = async (req, res) => {
  // sort = {_sort: "price", _order: "desc"}
  // pagination = {_page: 2, _limit: 10}
  try {
    let query = Order.find({});

    if (req.query._sort && req.query._order) {
      // sorting came in query params
      query = query.sort({ [req.query._sort]: req.query._order });
    }

    // finding the count before pagination because pagination will alter only based on page but above three queries are actually trimming the data off
    const totalDocs = await query.clone().count().exec();

    if (req.query._page && req.query._limit) {
      // pagination came in query params
      const pageSize = req.query._limit;
      const pageNum = req.query._page;
      query = query.skip(pageSize * (pageNum - 1)).limit(pageSize);
    }
    const orders = await query.exec();
    res.set("X-Total-Count", totalDocs);
    res.status(200).json(orders);
  } catch (err) {
    res.status(400).json({ err });
  }
};
