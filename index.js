require("dotenv").config();
const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");
const nodemailer = require("nodemailer");
const mongoose = require("mongoose");
const cors = require("cors");
const session = require("express-session");
const passport = require("passport");
const crypto = require("crypto");
const LocalStrategy = require("passport-local").Strategy;
const JwtStrategy = require("passport-jwt").Strategy;
const jwt = require("jsonwebtoken");
const path = require("path");

const { productsRouter } = require("./routes/Products");
const { categoriesRouter } = require("./routes/Categories");
const { brandsRouter } = require("./routes/Brands");
const { usersRouter } = require("./routes/Users");
const { authRouter } = require("./routes/Auth");
const { cartsRouter } = require("./routes/Carts");
const { ordersRouter } = require("./routes/Orders");
const { User } = require("./model/User");
const { isAuth, sanitizeUser, cookieExtractor } = require("./services/common");
const port = process.env.PORT || 8080;

// Webhooks

// TODO:- We will capture actual orders after deploying the application on public URL

// This is your Stripe CLI webhook secret for testing your endpoint locally.
const endpointSecret = process.env.STRIPE_ENDPOINT_SECRET;

app.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  (request, response) => {
    const sig = request.headers["stripe-signature"];

    let event;

    try {
      event = stripe.webhooks.constructEvent(request.body, sig, endpointSecret);
    } catch (err) {
      response.status(400).send(`Webhook Error: ${err.message}`);
      return;
    }

    // Handle the event
    switch (event.type) {
      case "payment_intent.succeeded":
        const paymentIntentSucceeded = event.data.object;
        console.log({ paymentIntentSucceeded });
        // Then define and call a function to handle the event payment_intent.succeeded
        break;
      // ... handle other event types
      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    // Return a 200 response to acknowledge receipt of the event
    response.send();
  }
);

// JWT options
const opts = {};
opts.jwtFromRequest = cookieExtractor;
opts.secretOrKey = process.env.JWT_SECRET_KEY; // should be present in .env file

// middlewares
// for handling Cross origin resource sharing between frontend and backend
app.use(
  cors({
    exposedHeaders: ["X-Total-Count"],
  })
);
// app.use(express.raw({ type: "application/json" }));
app.use(express.static(path.resolve(__dirname, "build")));
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(express.json()); // for parsing the req.body in json format
app.use(
  session({
    secret: process.env.SESSION_KEY,
    resave: false, // don't save session if unmodified
    saveUninitialized: false, // don't create session until something stored
  })
);
app.use(passport.authenticate("session"));

// Passport strategies
passport.use(
  "local",
  new LocalStrategy(
    {
      usernameField: "email",
      passwordField: "password",
    },
    async function (email, password, done) {
      // by default passport uses username
      try {
        const user = await User.findOne({ email: email });
        if (!user) {
          done(null, false, { message: "Invalid Credentials" }); // for safety
        }
        crypto.pbkdf2(
          password,
          user.salt,
          310000,
          32,
          "sha256",
          async function (err, hashedPassword) {
            if (crypto.timingSafeEqual(user.password, hashedPassword)) {
              const token = jwt.sign(
                sanitizeUser(user),
                process.env.JWT_SECRET_KEY
              );
              done(null, { id: user.id, role: user.role, token }); // this line is sending the token having the encrypted user info to serializer
            } else {
              done(null, false, { message: "Invalid Credentials" }); // for safety
            }
          }
        );
      } catch (err) {
        done(err);
      }
    }
  )
);

passport.use(
  "jwt",
  new JwtStrategy(opts, async function (jwt_payload, done) {
    try {
      const user = await User.findById(jwt_payload.id);
      if (user) {
        return done(null, sanitizeUser(user)); // this calls serializer
      } else {
        return done(null, false);
        // or you could create a new account
      }
    } catch (err) {
      return done(err, false);
    }
  })
);

// this creates session variable req.user on begin called from callbacks
passport.serializeUser(function (user, cb) {
  console.log("serialize", user);
  process.nextTick(function () {
    return cb(null, { id: user.id, role: user.role });
  });
});

// this changes session variable req.user on begin called from authorized requests
passport.deserializeUser(function (user, cb) {
  console.log("de-serialize", user);
  process.nextTick(function () {
    return cb(null, user);
  });
});

// payments
// This is a public sample test API key.
// Don’t submit any personally identifiable information in requests made with this key.
// Sign in to see your own test secret API key embedded in code samples.
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

app.post("/create-payment-intent", async (req, res) => {
  const { totalAmount } = req.body;

  // Create a PaymentIntent with the order amount and currency
  const paymentIntent = await stripe.paymentIntents.create({
    amount: totalAmount * 100, // for decimal compensation
    currency: "inr",
    automatic_payment_methods: {
      enabled: true,
    },
  });

  res.send({
    clientSecret: paymentIntent.client_secret,
  });
});

// mongodb connection part
main().catch((err) => console.log(err));

async function main() {
  await mongoose.connect(process.env.MONGODB_URL);
  console.log("mongodb connected successfully");
}

app.use("/products", isAuth(), productsRouter);
// We can also use JWT token for client only auth
app.use("/categories", isAuth(), categoriesRouter);
app.use("/brands", isAuth(), brandsRouter);
app.use("/users", isAuth(), usersRouter);
app.use("/auth", authRouter);
app.use("/cart", isAuth(), cartsRouter);
app.use("/orders", isAuth(), ordersRouter);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
