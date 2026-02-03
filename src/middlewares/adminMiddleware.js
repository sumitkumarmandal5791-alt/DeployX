const jwt = require("jsonwebtoken");
const redisClient = require("../config/Reddis");
const User = require("../Schema/userSchema")

const adminMiddleware = async (req, res, next) => {
  try {
    const { token } = req.cookies;
    const payload = jwt.verify(token, process.env.JWT_KEY);
    if (payload.role != "admin") {
      throw new Error("Admin authorisation failed!");
    }
   
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
module.exports = adminMiddleware;
