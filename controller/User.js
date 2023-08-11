const { User } = require("../model/User");

exports.fetchUserById = async (req, res) => {
  try {
    const {id} = req.user;
    const user = await User.findById(id, "id name email addresses role");
    res.status(200).json(user);
  } catch (err) {
    res.status(400).json({ err });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const id = req.params.id;
    const user = await User.findByIdAndUpdate(id, req.body, {
      returnDocument: "after",
    });
    res.status(201).json(user);
  } catch (err) {
    res.status(400).json({ err });
  }
};
