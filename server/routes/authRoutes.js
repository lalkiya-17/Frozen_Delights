const express = require('express');
const {
  register,
  login,
  logout,
  sendVerifyOtp,
  verifyEmail,
  isAuthenticated,
  resetPassword,
  sendResetOtp,
  magicLogin,
  googleLogin
} = require("../controllers/authController");

const userAuth  = require("../middleware/userAuth");

const authRouter = express.Router();

/* =========================
   AUTH ROUTES
========================= */

// Register user
authRouter.post('/register', register);
// Login user
authRouter.post('/login', login);
// Logout user
authRouter.post('/logout', logout);
authRouter.post('/send-verify-otp', userAuth, sendVerifyOtp);
authRouter.post('/verify-account', userAuth, verifyEmail); 
authRouter.post('/is-auth', userAuth, isAuthenticated );
authRouter.post('/send-reset-otp', sendResetOtp );
authRouter.post('/reset-password', resetPassword);
// Magic Login
authRouter.post('/magic-login', magicLogin);


// Google Login
authRouter.post('/google', googleLogin);

module.exports = authRouter;
