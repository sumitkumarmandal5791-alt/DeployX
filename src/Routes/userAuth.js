const express = require("express");
const authRoute = express.Router();
const authMiddleware = require ("../middlewares/userAuthMiddleware")
const adminMiddleware = require ("../middlewares/adminMiddleware")

authRoute.post("/register", register);
authRoute.post("/login", login);
authRoute.post("/logout",  logout);

authRoute.get("/profile", authMiddleware, getProfile);
authRoute.delete("/profile", authMiddleware, deleteProfile);


authRoute.post("/admin/register", authMiddleware, adminMiddleware, adminRegister);


authRoute.get("/check", authMiddleware, (req, res) => {
  const reply = {
    name: req.user.name,
    email: req.user.email,
    _id: req.user._id,
    role: req.user.role,
  };

  res.status(200).json({
    user: reply,
    message: "User verified!"
  });
});

module.exports = authRoute;
