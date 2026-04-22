const Cart = require('../models/Cart');

const  addToCart = async (req, res) => {
    try {
        const {productId, quantity} = req.body;

        const userId = req.user.id;

        let cart = await Cart.findOne({user: userId});

        if(!cart){
            cart = await Cart.create({user: userId, items: []});
        }

        const itemIndex = cart.items.findIndex(
            item => item.product.toString() === productId
        );

        if(itemIndex > -1){
            cart.items[itemIndex].quantity += quantity;
        }else {
            cart.items.push({product: productId, quantity});
        }

        await cart.save();

        res.json({success: true, message: "Added to cart"});
    } catch (error) {
        res.json({success: false, message: error.message});
    }
};


const getCart = async (req, res) => {
    try{
    const cart = await Cart.findOne({user: req.user.id}).populate("items.product");

    if(!cart){
        cart = await Cart.create({
            user: req.user.id,
            items: [],
        });
    }

    // Filter out null products (if product was deleted)
    cart.items = cart.items.filter(item => item.product);
    if(cart.isModified('items')){
        await cart.save();
    }

    res.json({success: true, cart});


    }catch(error){
        res.json({success: false, message: error.message});
    }
}

const removeItem = async (req,res) => {
    try{
        const {productId} = req.body;
        const cart = await Cart.findOne({user: req.user.id});

        cart.items = cart.items.filter(
            items => items.product.toString() !== productId
        );
        await cart.save();

        res.json({success: true, message: "Item removed"});

    }catch(error){
        res.json({success: false, message: error.message});
    }




}

module.exports = {
    addToCart,
    getCart,
    removeItem,
}