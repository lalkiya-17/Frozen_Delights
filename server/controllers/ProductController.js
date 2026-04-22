const Product = require('../models/Products');


const Coupon = require('../models/Coupon');

const addProduct = async(req,res) =>{
    try{
        const {name,price,stock,description,image,category, promoCode, discountPercentage} = req.body;

        const product = await Product.create({
            name,
            price,
            stock,
            description,
            image,
            category,
            vendor: req.user.id,
        });

        // Create Coupon if promo details are provided
        if (promoCode && discountPercentage) {
             await Coupon.create({
                 code: promoCode,
                 discountType: 'percentage',
                 discountValue: Number(discountPercentage),
                 vendor: req.user.id,
                 product: product._id,
                 expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days default
                 isActive: true
             });
        }

        res.json({
            success: true,
            message: "Product added",
        })
    }catch(error){
        res.json({sucess: false, message: error.message});
    }
};

const getMyProducts = async (req, res) => {
    try{
        const products = await Product.find({
            vendor: req.user.id,
        });

        res.json({success: true, products});


    }catch(error){
        res.json({success: false, message: error.message});
    }
};


const updateProduct = async (req,res) => {
    try{
        const product = await Product.findOneAndUpdate(
            {_id:req.params.id, vendor: req.user.id},
            req.body,
            {new: true, runValidators: true}
        )

        res.json({success: true, message: "Product Updated", product});
    }catch(error){
        res.json({success: false, message: error.message});
    }
};


const deleteProduct = async (req,res) => {
    try{
        await Product.findOneAndDelete({
            _id: req.params.id,
            vendor: req.user.id,
        });

        res.json({success: true, message: "Product Deleted"});

    }catch(error){
        res.json({success: false, message: error.message});
    }
};

const getAllProducts = async (req, res) => {
    try{
        const product = await Product.find().populate("vendor", "name");

        res.json({success: true, product});

    }catch(error){
        res.json({success: false, message: error.message});
    }
}

const adminDeleteProduct = async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);
        if (!product) {
            return res.json({ success: false, message: "Product not found" });
        }
        res.json({ success: true, message: "Product deleted by admin" });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

const createProductReview = async (req, res) => {
    try {
        const { rating, comment } = req.body;
        const product = await Product.findById(req.params.id);

        if (product) {
            const alreadyReviewed = product.reviews.find(
                (r) => r.user.toString() === req.user.id.toString()
            );

            if (alreadyReviewed) {
                return res.status(400).json({ success: false, message: "Product already reviewed" });
            }

            const review = {
                name: req.user.name || "Anonymous", // Ensure name is available from auth middleware
                rating: Number(rating),
                comment,
                user: req.user.id,
            };

            product.reviews.push(review);
            product.numReviews = product.reviews.length;

            product.rating =
                product.reviews.reduce((acc, item) => item.rating + acc, 0) /
                product.reviews.length;

            await product.save();
            res.status(201).json({ success: true, message: "Review added" });
        } else {
            res.status(404).json({ success: false, message: "Product not found" });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const getSingleProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id).populate("vendor", "name");
        if (product) {
            res.json({ success: true, product });
        } else {
            res.status(404).json({ success: false, message: "Product not found" });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};


module.exports = {
    addProduct,
    getMyProducts,
    updateProduct,
    deleteProduct,
    getAllProducts,
    adminDeleteProduct,
    createProductReview,
    getSingleProduct
}