const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true,
        trim: true,
    },
    price:{
        type: Number,
        required: true,
    },
    category: {
        type: String,
        required: true,
        enum: ["Cone", "Cup", "Stick", "Cake", "Tub", "Family Pack"],
        default: "Cup"
    },
    image:{
        type: String,
        default: "",
    },
    stock: {
        type: Number,
        default: 0,
    },
    description: {
        type: String,
        required: true,
    },
    category: {
        type: String,
        required: true,
        enum: ["Cone", "Cup", "Stick", "Cake", "Tub", "Family Pack"],
        default: "Cup"
    },
    reviews: [
        {
            user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
                required: true,
            },
            name: {
                type: String,
                required: true,
            },
            rating: {
                type: Number,
                required: true,
            },
            comment: {
                type: String,
                required: true,
            },
            createdAt: {
               type: Date,
               default: Date.now, 
            }
        }
    ],
    rating: {
        type: Number,
        default: 0,
    },
    numReviews: {
        type: Number,
        default: 0,
    },
    vendor:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
}, {timestamps: true});

module.exports = mongoose.model("Product", productSchema);