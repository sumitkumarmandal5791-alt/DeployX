const jwt = require("jsonwebtoken");
const redisClient = require("../config/Reddis");
const userCollection = require("../Schema/userSchema");
const User = require("../Schema/userSchema");

const tokenVerify = async (req, res, next) => {
  try {
    let token = req.cookies.token;

    // Check header if cookie missing
    if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) throw new Error("token not present!")
    const payload = jwt.verify(token, process.env.JWT_SECRET_KEY);

    const { _id, email } = payload;
    if (!_id) {
      throw new Error("ID missing");
    }
    if (!email) {
      throw new Error("Email is missing");
    }
    const isBlocked = await redisClient.exists(`blocked:${token}`);
    if (isBlocked) throw new Error("Token expired!");
    const user = await User.findById(_id);

    req.user = user;
    next();
  } catch (err) {
    res.send(err.message);
  }
};
module.exports = tokenVerify;
