const mongoose = require("mongoose")

const userSchema = new mongoose.Schema(
  {
    /* ================= BASIC INFO ================= */
    name: {
      type: String,
      required: true,
      minlength: 2,
    },
    phone: {
        type: String,
        default: ""
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    googleId: {
      type: String,
      unique: true,
      sparse: true,
    },

    password: {
      type: String,
      required: true,
    },

    /* ================= EMAIL VERIFICATION ================= */
    verifyOtp: {
      type: String,
      default: "",
    },

    verifyOtpExpiresAt: {
      type: Date,
      default: 0,
    },

    isAccountVerified: {
      type: Boolean,
      default: false,
    },

    /* ================= PASSWORD RESET ================= */
    resetOtp: {
      type: String,
      default: "",
    },

    resetOtpExpiresAt: {
      type: Date,
      default: 0,
    },

    /* ================= ROLE SYSTEM ================= */
    role: {
      type: String,
      enum: ["user", "vendor", "admin"],
      default: "user",
    },

    /* ================= VENDOR REQUEST ================= */
    vendorRequestStatus: {
      type: String,
      enum: ["none", "pending", "approved", "rejected"],
      default: "none",
    },

    vendorDetails: {
      shopName: {
        type: String,
        default: "",
      },
      gstNumber: {
        type: String,
        default: "",
      },
      address: {
        type: String,
        default: "",
      },
      description: {
          type: String,
          default: "",
      },
      openingTime: {
          type: String,
          default: "09:00",
      },
      closingTime: {
          type: String,
          default: "21:00",
      },
      isOpen: {
          type: Boolean,
          default: true,
      }
    },

    /* ================= VENDOR DOCUMENTS ================= */
    vendorDocuments: {
      idProof: {
        type: String,
        default: "",
      },
      gstCertificate: {
        type: String,
        default: "",
      },
      shopLicense: {
        type: String,
        default: "",
      },
    },

    /* ================= ADDRESSES ================= */
    addresses: [{
        street: { type: String, required: true },
        city: { type: String, required: true },
        state: { type: String, required: true },
        zipCode: { type: String, required: true },
        country: { type: String, default: "India" },
        mobile: { type: String, required: true }
    }],

    /* ================= MAGIC LOGIN ================= */
    magicLoginToken: {
      type: String,
      default: "",
    },
    magicLoginExpiresAt: {
      type: Date,
      default: 0,
    },

    /* ================= COD OTP ================= */
    codOtp: {
      type: String,
      default: "",
    },
    codOtpExpiresAt: {
      type: Date,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
