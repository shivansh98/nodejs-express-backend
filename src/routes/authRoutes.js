const express = require("express");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const User = mongoose.model("User");
const router = express.Router();
const client = require("prom-client");
const counter = new client.Counter({
  name: "node_requests_status_422_operations_total",
  help: "The total no of rejected requests of status 422",
});

router.post("/signup", async (req, res) => {
  const {
    email,
    password,
    firstname,
    lastname,
    mobile,
    address,
    username,
    image,
  } = req.body;

  try {
    const user = new User({
      email,
      password,
      firstname,
      lastname,
      mobile,
      address,
      username,
      image,
    });
    await user.save();

    const token = jwt.sign({ userId: user._id }, "MY_SECRET_KEY");
    res.send({ token });
  } catch (err) {
    counter.inc();

    return res.status(422).send(err.message);
  }
});

router.post("/signin", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    counter.inc();
    return res.status(422).send({ error: "Must provide email and password" });
  }

  const user = await User.findOne({ email });
  if (!user) {
    counter.inc();
    return res.status(422).send({ error: "Invalid password or email" });
  }

  try {
    await user.comparePassword(password);
    const token = jwt.sign({ userId: user._id }, "MY_SECRET_KEY");
    res.send({ token });
  } catch (err) {
    counter.inc();
    return res.status(422).send({ error: "Invalid password or email" });
  }
});

client.register.metrics();

module.exports = router;
