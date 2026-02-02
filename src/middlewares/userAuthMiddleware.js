const jwt = require("jsonwebtoken");
const redisClient = require("../config/Reddis");
const userCollection = require("../Schema/userSchema");
const User = require("../Schema/userSchema");

const tokenVerify = async (req, res, next) => {
  try {
    const { token } = req.cookies;
    if (!token) throw new Error ("token not present!")
    const payload = jwt.verify(token, process.env.JWT_KEY);
  
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
