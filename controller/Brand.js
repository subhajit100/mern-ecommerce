const { Brand } = require("../model/Brand");

exports.fetchAllBrands = async (req, res) => {
  try {
    const brands = await Brand.find();
    res.status(200).json(brands);
  } catch (err) {
    res.status(400).json({ err });
  }
};

exports.createBrand = async (req, res) => {
  try {
    const brand = new Brand(req.body);
    const response = await brand.save();
    res.status(201).json(response);
  } catch (err) {
    res.status(400).json({ err });
  }
};
