# FrozenDelights 🍦

FrozenDelights is a full-stack MERN (MongoDB, Express, React, Node.js) application designed for an effortless online shopping experience for frozen treats. It features a robust multi-role system (User, Vendor, Admin), secure payments via Razorpay, and a modern, responsive UI built with Tailwind CSS.

## 🚀 Features

### 👤 Authentication & User Roles
- **Multi-Role System**: Dedicated dashboards and permissions for **Users**, **Vendors**, and **Admins**.
- **Secure Login**: JWT-based authentication with cookie-parser.
- **Google OAuth**: One-tap sign-in integrated for ease of use.
- **Role-Based Access Control (RBAC)**: Protected routes for vendor and admin actions.

### 🛍️ E-Commerce Functionality
- **Product Management**: Vendors can create, edit, and delete their products with image uploads.
- **Shopping Cart**: Dynamic cart management for users.
- **Order Flow**: Seamless checkout process with order history tracking.
- **Coupon System**: Apply discount codes to orders.
- **Payment Integration**: Secure transactions using **Razorpay**.

### 📊 Admin & Vendor Tools
- **Analytics Dashboard**: Visual data representation using **Recharts**.
- **Maintenance Mode**: Admin can toggle maintenance mode to manage site availability.
- **Vendor Statistics**: Track sales and product performance.

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 19 (Vite)
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Notifications**: React Toastify
- **Charts**: Recharts
- **Routing**: React Router 7

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB (Mongoose)
- **File Uploads**: Multer
- **Emails**: Nodemailer
- **Payments**: Razorpay SDK
- **Security**: Bcrypt, JWT

## ⚙️ Setup & Installation

### Prerequisites
- Node.js (v18+)
- MongoDB (Local or Atlas)
- Razorpay Account (for testing payments)

### 1. Clone the Repository
```bash
git clone https://github.com/lalkiya-17/Frozen_Delights.git
cd Frozen_Delights
```

### 2. Backend Setup
```bash
cd server
npm install
```
Create a `.env` file in the `server` directory:
```env
PORT=3000
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
RAZORPAY_KEY_ID=your_razorpay_key
RAZORPAY_KEY_SECRET=your_razorpay_secret
# ... other vars
```
Start the server:
```bash
npm run dev
```

### 3. Frontend Setup
```bash
cd ../client
npm install
```
Create a `.env` file in the `client` directory:
```env
VITE_API_URL=http://localhost:3000/api
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```
Start the client:
```bash
npm run dev
```

## 📁 Project Structure
```
FrozenDelights/
├── client/          # Vite + React Frontend
│   ├── src/         # Application source code
│   └── public/      # Static assets
├── server/          # Node + Express Backend
│   ├── config/      # Database & config files
│   ├── controllers/ # Route logic
│   ├── models/      # Mongoose schemas
│   ├── routes/      # API endpoints
│   └── utils/       # Helper functions
└── README.md        # Project documentation
```

## 📄 License
This project is licensed under the ISC License.

---
Developed by **Karan Lalkiya**
