const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },

    items: [
        {
            product: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Product",
            },
            quantity: Number,
            price: Number,
        }
    ],

    shippingAddress: {
        street: String,
        city: String,
        state: String,
        zipCode: String,
        country: String,
        mobile: String
    },

    userInfo: {
        name: String,
        email: String
    },

    totalAmount: {
        type: Number,
        required: true,
    },
    subTotal: {
        type: Number,
        required: true,
        default: 0
    },
    taxAmount: {
        type: Number,
        default: 0
    },
    discountAmount: {
        type: Number,
        default: 0
    },
    couponCode: {
        type: String,
        default: null
    },

    paymentStatus: {
        type: String,
        enum: ["pending", "paid", "failed"],
        default: "pending",
    },

    paymentMethod: {
        type: String,
        enum: ["cod", "online"],
        default: "cod"
    },

    deliveryStatus: {
        type: String,
        enum: ["placed","processing","shipped","delivered","cancelled"],
        default: "placed",
    },

    razorpayOrderId: {
        type: String,
    },
    paymentId: {
        type: String,
    },
    paymentSignature: {
        type: String,
    },
     deliveryOtp: {
        type: String,
    },

},{timestamps: true});

module.exports = mongoose.model("Order", orderSchema);