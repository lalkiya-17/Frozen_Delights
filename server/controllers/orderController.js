const Order = require("../models/Order");
const Cart = require("../models/Cart");
const User = require("../models/User");

const createOrder = async (req, res) => {
  try {
    const userId = req.user.id;
    const { userData, subTotal, taxAmount, discountAmount, totalAmount, couponCode } = req.body; 

    const user = await User.findById(userId);
    const cart = await Cart.findOne({ user: userId }).populate("items.product");

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ success: false, message: "Cart is empty" });
    }

    const orderItems = cart.items.map((item) => {
      return {
        product: item.product._id,
        quantity: item.quantity,
        price: item.product.price,
      };
    });

    const shippingAddress = {
        street: userData.street,
        city: userData.city,
        state: userData.state,
        zipCode: userData.zipCode,
        country: userData.country || 'India',
        mobile: userData.mobile
    };

    const paymentStatus = req.body.paymentStatus || 'pending';
    const paymentMethod = req.body.paymentMethod || 'cod';

    const order = await Order.create({
      user: userId,
      userInfo: {
        name: user.name,
        email: user.email
      },
      items: orderItems,
      totalAmount: Number(totalAmount),
      subTotal: Number(subTotal),
      taxAmount: Number(taxAmount),
      discountAmount: Number(discountAmount),
      couponCode: couponCode || null,
      shippingAddress,
      paymentStatus, 
      paymentMethod,
      razorpayOrderId: req.body.razorpayOrderId,
      paymentId: req.body.paymentId,
      paymentSignature: req.body.paymentSignature,
      deliveryOtp: null 
    });

    cart.items = [];
    await cart.save();

    res.json({
      success: true,
      message: "Order placed successfully",
      order,
    });
  } catch (error) {
    console.error("Create Order Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const getMyOrders = async (req, res) => {
  const orders = await Order.find({ user: req.user.id })
    .sort({ createdAt: -1 })
    .populate("items.product");

  res.json({ success: true, orders });
};

const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate("items.product");

    res.json({ success: true, order });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

const cancelOrder = async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    // 1️⃣ Not found
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // 2️⃣ Already cancelled
    if (order.deliveryStatus === "cancelled") {
      return res.json({
        success: false,
        message: "Order already cancelled",
      });
    }

    // 3️⃣ Cannot cancel after shipped/delivered
    if (
      order.deliveryStatus === "shipped" ||
      order.deliveryStatus === "delivered"
    ) {
      return res.json({
        success: false,
        message: "Order cannot be cancelled now",
      });
    }

    // 4️⃣ Cancel order
    order.deliveryStatus = "cancelled";
    await order.save();

    res.json({
      success: true,
      message: "Order cancelled successfully",
      order,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createOrder,
  getMyOrders,
  getOrderById,
  cancelOrder,
};
