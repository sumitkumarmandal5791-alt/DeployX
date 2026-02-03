const express = require("express");
const authRoute = express.Router();
const { Register, Login, Logout, getProfile, deleteProfile, adminRegister } = require("../controllers/userController")
const tokenVerify = require("../middlewares/userAuthMiddleware");

const authMiddleware = require("../middlewares/userAuthMiddleware")
const adminMiddleware = require("../middlewares/adminMiddleware")

authRoute.post("/register", Register);
authRoute.post("/login", Login);
authRoute.post("/logout", tokenVerify, Logout);

authRoute.get("/profile", tokenVerify, getProfile);
authRoute.delete("/profileDelete", tokenVerify, deleteProfile);


authRoute.post("/admin/register", tokenVerify, adminMiddleware, adminRegister);


// authRoute.get("/check", authMiddleware, (req, res) => {
//   const reply = {
//     name: req.user.name,
//     email: req.user.email,
//     _id: req.user._id,
//     role: req.user.role,
//   };

//   res.status(200).json({
//     user: reply,
//     message: "User verified!"
//   });
// });

module.exports = authRoute;
