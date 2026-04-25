const express = require('express');
const dotenv = require('dotenv');
dotenv.config(); // Load env vars first
const connectDB = require('./config/db');
const app = express();
const authRoutes = require('./routes/authRoutes');
const cookieParser = require("cookie-parser");
const cors = require('cors');
const userRouter = require('./routes/userRoutes');
const vendorRoutes = require('./routes/vendorRoutes');
const adminRoutes = require('./routes/adminRoutes');
const productRoutes = require('./routes/productRoutes');
const cartRoutes = require('./routes/cartRoutes');
const orderRoutes = require('./routes/orderRoutes');



connectDB();

app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'token']
}));

app.use('/uploads', express.static('uploads')); // Serve uploaded files

// Maintenance Mode Middleware
const maintenanceMiddleware = require('./middleware/maintenanceMiddleware');
app.use(maintenanceMiddleware);

app.use('/api/auth', authRoutes);
app.use('/api/user', userRouter);
app.use('/api/vendor', vendorRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payment', require('./routes/paymentRoutes'));
app.use('/api/coupons', require('./routes/couponRoutes'));

const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
    res.status(200).send("API is running!");
})

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
})