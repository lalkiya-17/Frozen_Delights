import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState([]);

  // Fetch Cart from Backend
  // Fetch Cart from Backend
  useEffect(() => {
    if (user) {
        const token = localStorage.getItem('userToken');
        axios.get('/api/cart', { 
            headers: { token },
            withCredentials: true 
        })
            .then(res => {
                if (res.data.success && res.data.cart) {
                    const backendItems = res.data.cart.items
                        .filter(item => item.product) // Filter out null products
                        .map(item => ({
                            id: item.product._id,
                            name: item.product.name,
                            price: item.product.price,
                            image: item.product.image || "https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?auto=format&fit=crop&w=800&q=80",
                            quantity: item.quantity,
                            vendor: item.product.vendor
                        }));
                    setCartItems(backendItems);
                }
            })
            .catch(err => console.error("Failed to fetch cart:", err));
    } else {
        setCartItems([]);
    }
  }, [user]);

  const addToCart = async (product) => {
    try {
        console.log("Adding to cart:", product);
        // Optimistic UI Update
        // Ensure we are comparing checks against the correct ID field
        const productId = product.id || product._id;
        const existingItem = cartItems.find(item => item.id === productId);
        let newItems;
        if (existingItem) {
            newItems = cartItems.map(item =>
                item.id === productId ? { ...item, quantity: item.quantity + 1 } : item
            );
        } else {
             // Normalizing the product object structure for the cart
            newItems = [...cartItems, { 
                id: productId,
                name: product.name,
                price: product.price,
                image: product.image,
                vendor: product.vendor,
                quantity: 1
            }]; 
        }
        setCartItems(newItems);

        // Backend Sync
        if (user) {
            const token = localStorage.getItem('userToken');
            await axios.post('/api/cart/add', 
                { productId: productId, quantity: 1 }, 
                { 
                    headers: { token },
                    withCredentials: true 
                }
            );
        } else {
             // For guest users - strictly unrelated to current task but good for hygiene
             // In a real app we might verify if user is not logged in and prompt login
        }
    } catch (error) {
        console.error("Add to cart failed:", error);
    }
  };

  const removeFromCart = async (id) => {
    try {
        const itemToRemove = cartItems.find(item => item.id === id);
        setCartItems(prevItems => prevItems.filter(item => item.id !== id));
        
        if(itemToRemove) {
            toast.error(`${itemToRemove.name} removed from cart`);
        }

        if (user) {
            const token = localStorage.getItem('userToken');
            await axios.delete('/api/cart/remove', { 
                headers: { token },
                data: { productId: id },
                withCredentials: true 
            });
        }
    } catch (error) {
        console.error("Remove from cart failed:", error);
        toast.error("Failed to remove item");
    }
  };

  const updateQuantity = (id, quantity) => {
    if (quantity < 1) return;
    setCartItems(prevItems =>
      prevItems.map(item =>
        item.id === id ? { ...item, quantity: quantity } : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getCartCount = () => {
    return cartItems.reduce((count, item) => count + item.quantity, 0);
  };

  return (
    <CartContext.Provider value={{
      cartItems,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      getCartTotal,
      getCartCount
    }}>
      {children}
    </CartContext.Provider>
  );
};
