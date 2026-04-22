const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const transporter = require("../config/nodemailer");

/* REGISTER  */
// const register = async (req, res) => {
//   try {
//     const { name, email, password, phone } = req.body;

//     if (!name || !email || !password || !phone) {
//       return res.status(400).json({
//         success: false,
//         message: "All fields are required",
//       });
//     }

//     const existingUser = await User.findOne({ email });
//     if (existingUser) {
//       return res.status(400).json({
//         success: false,
//         message: "User already exists",
//       });
//     }

//     const hashedPassword = await bcrypt.hash(password, 10);
//     const otp = Math.floor(100000 + Math.random() * 900000).toString();

//     const user = await User.create({
//       name,
//       email,
//       phone,
//       password: hashedPassword,
//       isAccountVerified: false,
//       verifyOtp: otp,
//       verifyOtpExpiresAt: Date.now() + 24 * 60 * 60 * 1000
//     });

//     const token = jwt.sign(
//       { id: user._id },
//       process.env.JWT_SECRET,
//       { expiresIn: "7d" }
//     );

//     // Register sets a temporary cookie/token for verification context
//     res.cookie("userToken", token, {
//       httpOnly: true,
//       secure: process.env.NODE_ENV === "production", 
//       sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
//       maxAge: 7 * 24 * 60 * 60 * 1000,
//     });

//     // Send Verification Email
//     try {
//       await transporter.sendMail({
//         from: process.env.SENDER_EMAIL,
//         to: email,
//         subject: "Verify Your Account | FrozenDelights 🍦",
//         html: `
//         <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
//             <h2 style="color: #ff4d6d; text-align: center;">Welcome to FrozenDelights!</h2>
//             <p>Thank you for registering. Please use the following OTP to verify your email address:</p>
//             <div style="background: #fff0f3; padding: 15px; text-align: center; border-radius: 5px; border: 1px dashed #ff4d6d; margin: 20px 0;">
//                 <span style="font-size: 24px; font-weight: bold; color: #ff4d6d; letter-spacing: 5px;">${otp}</span>
//             </div>
//             <p>This OTP is valid for 24 hours.</p>
//             <p>If you did not request this, please ignore this email.</p>
//         </div>
//         `,
//       });
//     } catch (err) {
//       console.log("Verification email failed:", err.message);
//     }

//     res.status(201).json({
//       success: true,
//       message: "Registration successful. Please verify your email.",
//       needsVerification: true,
//       token
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };
const register = async (req, res) => {
  try {
    console.log("BODY:", req.body); // DEBUG

    const { name, email, password, phone } = req.body;

    // ✅ validation
    if (!name || !email || !password || !phone) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // ✅ check existing user
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }

    // ✅ hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // ✅ generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // ✅ create user
    const user = await User.create({
      name,
      email,
      phone,
      password: hashedPassword,
      isAccountVerified: false,
      verifyOtp: otp,
      verifyOtpExpiresAt: Date.now() + 24 * 60 * 60 * 1000,
      role: "user",
      addresses: []
    });

    // ✅ generate JWT
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // ✅ set cookie
    res.cookie("userToken", token, {
      httpOnly: true,
      secure: false, // ⚠️ keep false in dev
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    // ✅ send email (optional - won't break API)
    try {
      await transporter.sendMail({
        from: process.env.SENDER_EMAIL,
        to: email,
        subject: "Verify Your Account | FrozenDelights 🍦",
        html: `<h2>Your OTP is: ${otp}</h2>`
      });
    } catch (err) {
      console.log("Email failed:", err.message);
    }

    // ✅ response
    res.status(201).json({
      success: true,
      message: "Registration successful. Verify your email.",
      token
    });

  } catch (error) {
    console.error("REGISTER ERROR:", error); // 🔥 IMPORTANT
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
/* LOGIN  */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid email",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid password",
      });
    }

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Set cookie based on role
    let cookieName = "userToken";
    if (user.role === 'admin') cookieName = "adminToken";
    if (user.role === 'vendor') cookieName = "vendorToken";

    // Block unverified users (except admins maybe? but usually everyone verified)
    if (!user.isAccountVerified && user.role !== 'admin') {
         return res.json({
            success: false,
            message: "Please verify your account first",
            needsVerification: true,
            email: user.email,
            token // Send token so they can use verify endpoint
         });
    }

    res.cookie(cookieName, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({
      success: true,
      message: "Login successful",
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        vendorRequestStatus: user.vendorRequestStatus,
        vendorDetails: user.vendorDetails
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* LOGOUT  */
const logout = (req, res) => {
  // Clear ALL possible tokens to ensure clean logout
  const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  };

  res.clearCookie("token", cookieOptions); // Legacy
  res.clearCookie("userToken", cookieOptions);
  res.clearCookie("adminToken", cookieOptions);
  res.clearCookie("vendorToken", cookieOptions);

  res.json({
    success: true,
    message: "Logged out successfully",
  });
};

/* SEND VERIFY OTP  */
const sendVerifyOtp = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (user.isAccountVerified) {
      return res.json({
        success: false,
        message: "Account already verified",
      });
    }

    if(!user){
      return res.json({sucess: false, message: "User not found"});
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    user.verifyOtp = otp;
    user.verifyOtpExpiresAt = Date.now() + 24 * 60 * 60 * 1000;

    await user.save();

    await transporter.sendMail({
      from: process.env.SENDER_EMAIL,
      to: user.email,
      subject: "Verify Your Account | FrozenDelights 🍦",
      html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h2 style="color: #ff4d6d; text-align: center;">Welcome to FrozenDelights!</h2>
          <p>Please use the following OTP to verify your email address:</p>
          <div style="background: #fff0f3; padding: 15px; text-align: center; border-radius: 5px; border: 1px dashed #ff4d6d; margin: 20px 0;">
              <span style="font-size: 24px; font-weight: bold; color: #ff4d6d; letter-spacing: 5px;">${otp}</span>
          </div>
          <p>This OTP is valid for 24 hours.</p>
          <p>If you did not request this, please ignore this email.</p>
      </div>
      `,
    });

    res.json({
      success: true,
      message: "Verification OTP sent to your email",
    });
  } catch (error) {
    res.json({
      success: false,
      message: error.message,
    });
  }
};

/* VERIFY EMAIL USING OTP  */
const verifyEmail = async (req, res) => {
  try {
    const userId = req.user.id;
    const { otp } = req.body;

    if (!otp) {
      return res.json({
        success: false,
        message: "OTP is required",
      });
    }

    const user = await User.findById(userId);

    if (!user || user.verifyOtp !== otp) {
      return res.json({
        success: false,
        message: "Invalid OTP",
      });
    }

    if (user.verifyOtpExpiresAt < Date.now()) {
      return res.json({
        success: false,
        message: "OTP expired",
      });
    }

    user.isAccountVerified = true;  
    user.verifyOtp = "";
    user.verifyOtpExpiresAt = 0;

    await user.save();

    res.json({
      success: true,
      message: "Email verified successfully",
    });
  } catch (error) {
    res.json({
      success: false,
      message: error.message,
    });
  }
};

//check if authenticated
const isAuthenticated = async (req, res) => {
  try{
    return res.json({success: true })

  }catch(error){
    res.json({success: false, message: error.message});
  }
}

const sendResetOtp = async(req, res) => {
  const {email} = req.body;

  if(!email){
    return res.json({
      sucess: false, message: 'Email is require'
    });
  }

  try{

    const user = await User.findOne({email});
    if(!user){
      return res.json({sucess: false, message: 'User not found'});
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    user.resetOtp = otp;
    user.resetOtpExpiresAt = Date.now() + 15 * 60 * 1000;

    await user.save();

    await transporter.sendMail({
      from: process.env.SENDER_EMAIL,
      to: user.email,
      subject: "Password Reset OTP",
      html: `<div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05); border: 1px solid #f0f0f0;">
            <div style="background-color: #ff4d6d; padding: 30px; text-align: center;">
                <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 600;">FrozenDelights 🍦</h1>
            </div>
            <div style="padding: 40px 30px; text-align: center;">
                <h2 style="color: #333333; margin-top: 0; margin-bottom: 15px; font-size: 22px;">Password Reset Request</h2>
                <p style="color: #666666; font-size: 16px; line-height: 1.5; margin-bottom: 25px;">
                    We received a request to reset your password. Use the OTP below to complete the process.
                </p>
                <div style="background-color: #fff0f3; border: 2px dashed #ff4d6d; border-radius: 8px; padding: 15px; display: inline-block; margin-bottom: 25px;">
                    <span style="font-size: 32px; font-weight: 700; color: #ff4d6d; letter-spacing: 6px; font-family: monospace;">${otp}</span>
                </div>
                <p style="color: #888888; font-size: 14px; margin-bottom: 0;">
                    This OTP is valid for <strong>15 minutes</strong>.
                </p>
            </div>
            <div style="background-color: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #eeeeee;">
                <p style="color: #aaaaaa; font-size: 12px; margin: 0;">
                    If you didn't request a password reset, you can safely ignore this email.
                </p>
                <p style="color: #cccccc; font-size: 12px; margin-top: 10px;">
                    &copy; ${new Date().getFullYear()} FrozenDelights. All rights reserved.
                </p>
            </div>
        </div>`,
    });


    res.json({sucess: true, message: 'OTP sent to your Email.'});

  }catch(error){
    res.json({sucess: false, message: error.message});
  }
}

//Reset User Password

const resetPassword = async (req, res) => {
  const {email, otp, newPassword} = req.body;

  if(!email || !otp || !newPassword){
    return res.json({sucess: false, message: 'All fields are required'});
  }

  try{

    const user = await User.findOne({email});
    if(!user){
      return res.json({sucess: false, message: 'User Not Found'});
    }

    if(user.resetOtp === "" || user.resetOtp !== otp){
      return res.json({sucess: false, message: 'Invalid OTP'});
    }

    if(user.resetOtpExpiredAt < Date.now()){
      return res.json({sucess: false, message:'OTP is Expired'});
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;
    user.resetOtp = '';
    user.resetOtpExpiresAt = 0;

    await user.save();

    return res.json({sucess: true, message: 'Password has been reset sucessfully'});

  } catch(error){
    res.json({sucess: false, message: error.message});
  }
}



/* MAGIC LOGIN */
const magicLogin = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.json({ success: false, message: "Token is required" });
    }

    console.log("Magic Login Attempt with token:", token);

    const user = await User.findOne({ 
      magicLoginToken: token,
      // magicLoginExpiresAt check removed to allow permanent links (handled by revocation)
    });

    if (!user) {
      console.log("User not found for token:", token);
      return res.json({ success: false, message: "Invalid magic link" });
    }

    // Security Check: Only Vendors allowed
    if (user.role !== 'vendor') {
         return res.json({ success: false, message: "Access denied: Not a vendor" });
    }

    // Checking if revoked (redundant with role check but good practice)
    if (user.vendorRequestStatus !== 'approved') {
        return res.json({ success: false, message: "Access denied: Vendor access revoked" });
    }

    // PERMANENT LINK: Do NOT clear token.
    // user.magicLoginToken = ""; // Removed
    // user.magicLoginExpiresAt = ... // Removed
    // await user.save(); // Not needed as we aren't changing anything

    // Generate JWT (same as normal login)
    const jwtToken = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.cookie("vendorToken", jwtToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({
      success: true,
      message: "Login successful",
      token: jwtToken, // Return token for frontend localStorage
      user: {
        _id: user._id, // Return ID too
        name: user.name,
        role: user.role,
        email: user.email,
        vendorDetails: user.vendorDetails
      }
    });

  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

/* GOOGLE LOGIN */
const googleLogin = async (req, res) => {
  try {
    const { token } = req.body;
    const { OAuth2Client } = require('google-auth-library');
    const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const { name, email, sub: googleId, picture } = ticket.getPayload();

    let user = await User.findOne({ email });

    if (user) {
      if (!user.googleId) {
        user.googleId = googleId;
        await user.save();
      }
    } else {
      user = await User.create({
        name,
        email,
        password: await bcrypt.hash(Math.random().toString(36).slice(-8), 10),
        googleId,
        isAccountVerified: true,
      });
    }

    const jwtToken = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.cookie("userToken", jwtToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({
      success: true,
      message: "Login successful",
      token: jwtToken,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      }
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  register,
  login,
  logout,
  sendVerifyOtp,
  verifyEmail,
  isAuthenticated,
  sendResetOtp,
  resetPassword,
  magicLogin,
  googleLogin
};
