const express = require('express');
const cartRoutes = express.Router();
const userAuth = require('../middleware/userAuth');
const { addToCart, getCart, removeItem } = require('../controllers/cartController');

cartRoutes.post("/add", userAuth, addToCart);
cartRoutes.get("/",userAuth, getCart);
cartRoutes.delete("/remove", userAuth, removeItem);

module.exports = cartRoutes;