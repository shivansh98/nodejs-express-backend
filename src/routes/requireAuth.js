const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const User = mongoose.model("User");
///req===request   res===== response
module.exports = (req, res, next) => {
  const { authorization } = req.headers;

  if (!authorization) {
    return res.status(401).send({ error: "You are already logged in!!" });
  }

  const token = authorization.replace("Bearer ", "");

  jwt.verify(token, "MY_SECRET_KEY", async (err, payload) => {
    if (err) {
      return res.status(401).send({ error: "You are already logged in!!" });
    }

    const { userId } = payload;

    try {
      const user = await User.findById(userId);
      req.user = user;
    } catch (error) {
      console.log("Error !! " + error.message);
    }
    next();
  });
};
