const { Product } = require("../model/Product");

exports.createProduct = async (req, res) => {
  try {
    const product = new Product(req.body);
    const response = await product.save();
    res.status(201).json(response);
  } catch (err) {
    res.status(400).json({ err });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const id = req.params.id;
    const product = await Product.findByIdAndUpdate(id, req.body, {
      returnDocument: "after",
    });
    res.status(200).json(product);
  } catch (err) {
    res.status(400).json({ err });
  }
};

exports.fetchAllProducts = async (req, res) => {
  // here we need all query strings
  // filter = {"category": ["smartphone", "laptop"]}
  // sort = {_sort: "price", _order: "desc"}
  // pagination = {_page: 2, _limit: 10}
  // TODO:- We have to try with multiple category and brand when fixed in front end
  try {
    let condition = {};
    if(!req.query.admin){
        condition.deleted = { $ne: true };
    }
    let query = Product.find(condition);
    if (req.query.category) {
      // finding by category field
      query = query.find({ category: req.query.category });
    }
    if (req.query.brand) {
      // finding by category field
      query = query.find({ brand: req.query.brand });
    }

    // TODO:- sorting should be done based on discounted price, but now happening on price
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
    const products = await query.exec();
    res.set("X-Total-Count", totalDocs);
    res.status(200).json(products);
  } catch (err) {
    res.status(400).json({ err });
  }
};

exports.fetchProductById = async (req, res) => {
  try {
    const id = req.params.id;
    const product = await Product.findById(id);
    res.status(200).json(product);
  } catch (err) {
    res.status(400).json({ err });
  }
};
