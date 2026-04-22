const express = require('express');
const { createOrder, getOrderById, cancelOrder, getMyOrders, generateCodOtp } = require('../controllers/orderController');
const orderRoutes = express.Router();
const userAuth = require('../middleware/userAuth');


orderRoutes.post("/create", userAuth, createOrder);
orderRoutes.get("/my", userAuth, getMyOrders);
orderRoutes.get("/:id", userAuth, getOrderById);
orderRoutes.put("/cancel/:id", userAuth, cancelOrder);

module.exports = orderRoutes;