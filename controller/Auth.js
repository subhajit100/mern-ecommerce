const { User } = require("../model/User");
const crypto = require("crypto");
const { sanitizeUser, sendMail } = require("../services/common");
const jwt = require("jsonwebtoken");

exports.createUser = async (req, res) => {
  try {
    const salt = crypto.randomBytes(16);
    crypto.pbkdf2(
      req.body.password,
      salt,
      310000,
      32,
      "sha256",
      async function (err, hashedPassword) {
        if (err) {
          throw err;
        }
        const userResponse = await User.find({ email: req.body.email });
        if (userResponse && userResponse.length > 0) {
          res.status(401).send("User already exists");
          return;
        }
        const user = new User({ ...req.body, password: hashedPassword, salt });
        const response = await user.save();

        // create a login session just after signup
        req.login(sanitizeUser(response), (err) => {
          if (err) {
            res.status(400).json(err);
          } else {
            const token = jwt.sign(
              sanitizeUser(response),
              process.env.JWT_SECRET_KEY
            );
            res
              .cookie("jwt", token, {
                expires: new Date(Date.now() + 3600000),
                httpOnly: true,
              })
              .status(201)
              .json({ id: response.id, role: response.role });
          }
        });
      }
    );
  } catch (err) {
    res.status(400).json({ err });
  }
};

exports.loginUser = async (req, res) => {
  const user = req.user;
  res
    .cookie("jwt", user.token, {
      expires: new Date(Date.now() + 3600000),
      httpOnly: true,
    })
    .status(201)
    .json({ id: user.id, role: user.role }); // user will be given by passport when we will use it before login as middleware, if it succeeds
};

exports.checkAuth = async (req, res) => {
  if (req.user) {
    res.json(req.user);
  } else {
    res.status(401).send("User not logged in");
  }
};

exports.logoutUser = async (req, res) => {
  res
    .cookie("jwt", null, {
      expires: new Date(Date.now()),
      httpOnly: true,
    })
    // .clearCookie('jwt')
    .status(200)
    .send("Successfull log out");
};

exports.resetPasswordRequest = async (req, res) => {
  try {
    const email = req.body.email;
    const user = await User.findOne({ email: email });
    if (user) {
      const token = crypto.randomBytes(48).toString("hex");
      user.resetPasswordToken = token;
      await user.save();
      const resetPageLink = `https://mern-ecommerce-git-main-subhajit100.vercel.app/reset-my-password?token=${token}&email=${email}`;
      const subject = "Reset password for your E-Commerce account";
      const html = `<p>Click <a href = ${resetPageLink}>here</a> to reset password</p>`;

      // lets send email and token in the email body so we can verify that user clicked the right link
      if (email) {
        const response = await sendMail({
          to: email,
          subject,
          html,
        });
        res.json(response);
      } else {
        res.sendStatus(400);
      }
    } else {
      res.sendStatus(400);
    }
  } catch (error) {
    res.status(400).json(error);
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { email, token, password } = req.body;
    const user = await User.findOne({
      email: email,
      resetPasswordToken: token,
    });
    if (user) {
      const salt = crypto.randomBytes(16);
      crypto.pbkdf2(
        password,
        salt,
        310000,
        32,
        "sha256",
        async function (err, hashedPassword) {
          if (err) {
            throw err;
          }
          user.password = hashedPassword;
          user.salt = salt;
          await user.save();
        }
      );

      const subject = "Password reset successful for E-Commerce account";
      const html = `<p>We have resetted your password successfully, please login again to continue.</p>`;
      // lets send email and token in the email body so we can verify that user clicked the right link
      if (email) {
        const response = await sendMail({
          to: email,
          subject,
          html,
        });
        res.json(response);
      } else {
        res.sendStatus(400);
      }
    } else {
      res.sendStatus(400);
    }
  } catch (error) {
    res.status(400).json(error);
  }
};
