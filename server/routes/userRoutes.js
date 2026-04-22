const express = require('express');
const userAuth = require('../middleware/userAuth');
const upload = require('../middleware/multer');
const { getUserData, updateUserProfile, applyForVendor, addAddress, removeAddress, verifyCoupon } = require('../controllers/userController');

const userRouter = express.Router();

userRouter.get('/data', userAuth, getUserData);
userRouter.put('/update', userAuth, updateUserProfile);
userRouter.post('/apply-vendor', userAuth, upload.fields([
    { name: 'idProof', maxCount: 1 }, 
    { name: 'gstCertificate', maxCount: 1 }, 
    { name: 'shopLicense', maxCount: 1 }
]), applyForVendor);

userRouter.post('/add-address', userAuth, addAddress);
userRouter.delete('/delete-address/:addressId', userAuth, removeAddress);
userRouter.post('/verify-coupon', userAuth, verifyCoupon);

module.exports = userRouter;