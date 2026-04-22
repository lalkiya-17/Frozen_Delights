const express = require("express");
const productRoutes = express.Router();
const userAuth = require("../middleware/userAuth");
const vendorAuth = require("../middleware/vendorAuth");
const adminAuth = require("../middleware/adminAuth"); // Import adminAuth
const {
  addProduct,
  getMyProducts,
  updateProduct,
  deleteProduct,
  getAllProducts,
    adminDeleteProduct,
    createProductReview,
    getSingleProduct
} = require("../controllers/ProductController");

productRoutes.get("/", getAllProducts);

productRoutes.get("/my", userAuth, vendorAuth, getMyProducts);
productRoutes.get("/:id", getSingleProduct);
productRoutes.put("/review/:id", userAuth, createProductReview);
productRoutes.post("/add", userAuth, vendorAuth, addProduct);
productRoutes.put("/:id", userAuth, vendorAuth, updateProduct);
productRoutes.delete("/:id", userAuth, vendorAuth, deleteProduct);
productRoutes.delete("/admin/:id", adminAuth, adminDeleteProduct);

module.exports = productRoutes;
