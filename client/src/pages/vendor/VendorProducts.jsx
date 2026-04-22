import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Trash2, Edit, Package, X, Upload, Tag } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import ConfirmToast from '../../components/ConfirmToast';

import Pagination from '../../components/Pagination';

const VendorProducts = () => {
    const { user } = useAuth();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    
    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        price: '',
        description: '',
        stock: '',
        image: '',
        category: 'Cup',
        promoCode: '',
        discountPercentage: ''
    });

    const categories = ["Cone", "Cup", "Stick", "Cake", "Tub", "Family Pack"];

    const fetchMyProducts = async () => {
        try {
            const token = localStorage.getItem('vendorToken');
             // Note: 'my' products usually implies 'vendor' products in this context
            const res = await axios.get('/api/products/my', { 
                headers: { token }, 
                withCredentials: true 
            });
            if (res.data.success) {
                setProducts(res.data.products);
            }
        } catch (error) {
            console.error("Failed to fetch products", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMyProducts();
    }, []);

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('vendorToken');
            const res = await axios.post('/api/products/add', formData, { 
                headers: { token },
                withCredentials: true 
            });
            if (res.data.success) {
                toast.success("Product Added Successfully!");
                setShowAddModal(false);
                setFormData({ name: '', price: '', description: '', stock: '', image: '', category: 'Cup', promoCode: '', discountPercentage: '' });
                fetchMyProducts();
            } else {
                toast.error(res.data.message || "Failed to add product");
            }
        } catch (error) {
            toast.error("Error adding product: " + (error.response?.data?.message || error.message));
        }
    };

    const handleDelete = async (id) => {
        toast(<ConfirmToast 
            message="Delete this product? This action cannot be undone."
            onConfirm={async () => {
                try {
                    const token = localStorage.getItem('vendorToken');
                    const res = await axios.delete(`/api/products/${id}`, { 
                        headers: { token },
                        withCredentials: true 
                    });
                    if (res.data.success) {
                        toast.success("Product deleted successfully");
                        fetchMyProducts();
                        if(selectedProduct && selectedProduct._id === id) setSelectedProduct(null);
                    } else {
                        toast.error("Failed to delete product");
                    }
                } catch (error) {
                    toast.error("Error deleting product");
                }
            }}
        />, { autoClose: false, closeButton: false });
    };

    // Pagination Logic
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentProducts = products.slice(indexOfFirstItem, indexOfLastItem);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    return (
        <div className="vendor-products-page">
            <div className="page-header" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem'}}>
                <div>
                    <h1>My Products</h1>
                    <p className="text-secondary">Manage your shop inventory</p>
                </div>
                <button 
                    className="btn btn-primary" 
                    style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}
                    onClick={() => setShowAddModal(true)}
                >
                    <Plus size={18} /> Add Product
                </button>
            </div>

            {loading ? (
                <div style={{textAlign: 'center', padding: '2rem'}}>Loading products...</div>
            ) : products.length === 0 ? (
                 <div style={{textAlign: 'center', padding: '4rem', background: 'rgba(255,255,255,0.05)', borderRadius: '12px'}}>
                    <Package size={48} color="var(--text-secondary)" style={{marginBottom: '1rem'}} />
                    <h3>No products yet</h3>
                    <p className="text-secondary">Start by adding your first ice cream flavor!</p>
                 </div>
            ) : (
                <div className="table-container">
                    <table className="dashboard-table">
                        <thead>
                            <tr>
                                <th>Image</th>
                                <th>Name</th>
                                <th>Price</th>
                                <th>Stock</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentProducts.map(product => (
                                <tr key={product._id}>
                                    <td>
                                        <img 
                                            src={product.image || "https://via.placeholder.com/50"} 
                                            alt={product.name} 
                                            style={{width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px', cursor: 'pointer'}} 
                                            onClick={() => setSelectedProduct(product)}
                                            title="View Details"
                                        />
                                    </td>
                                    <td>
                                        <div 
                                            style={{fontWeight: '600', cursor: 'pointer', color: 'var(--primary)'}}
                                            onClick={() => setSelectedProduct(product)}
                                            title="View Details"
                                        >
                                            {product.name}
                                        </div>
                                        <div style={{fontSize: '0.8rem', color: 'var(--text-secondary)'}}>{product.description?.substring(0, 30)}...</div>
                                    </td>
                                    <td>₹{product.price}</td>
                                    <td>{product.stock}</td>
                                    <td>
                                        <div style={{display: 'flex', gap: '0.5rem'}}>
                                            <button className="action-btn btn-view" onClick={() => setSelectedProduct(product)} title="View Product">
                                                <Package size={16} />
                                            </button>
                                            <button className="action-btn btn-reject" onClick={() => handleDelete(product._id)} title="Delete Product">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <Pagination 
                        inputs={{ currentPage, totalItems: products.length, itemsPerPage }}
                        onPageChange={paginate}
                    />
                </div>
            )}

            {/* Add Product Modal */}
            {showAddModal && (
                <div className="modal-overlay" style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.5)', 
                    display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000,
                    padding: '1rem'
                }}>
                    <div className="no-scrollbar" style={{
                        width: '100%', maxWidth: '500px', padding: '2.5rem', 
                        position: 'relative', borderRadius: '24px', 
                        background: 'var(--bg-color)', 
                        border: '1px solid var(--border-color)',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                        overflowY: 'auto', maxHeight: '90vh'
                    }}>
                        <button 
                            onClick={() => setShowAddModal(false)}
                            style={{
                                position: 'absolute', top: '1.5rem', right: '1.5rem', 
                                background: 'var(--surface-color)', border: 'none', 
                                color: 'var(--text-secondary)', cursor: 'pointer', padding: '0.5rem',
                                borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                transition: 'all 0.2s', zIndex: 10
                            }}
                            onMouseOver={(e) => {e.currentTarget.style.color = 'var(--text-primary)'; e.currentTarget.style.background = 'var(--border-color)'}}
                            onMouseOut={(e) => {e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.background = 'var(--surface-color)'}}
                        >
                            <X size={20} />
                        </button>
                        
                        <h2 style={{
                            marginBottom: '2rem', 
                            color: 'var(--text-primary)',
                            fontSize: '1.5rem',
                            textAlign: 'center',
                            fontWeight: '700',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem'
                        }}>
                            <div style={{
                                padding: '0.75rem', borderRadius: '12px', 
                                background: 'rgba(255, 77, 109, 0.1)', 
                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}>
                                <Package size={24} color="var(--primary)" /> 
                            </div>
                            New Product
                        </h2>
                        
                        <form onSubmit={handleSubmit} style={{display: 'flex', flexDirection: 'column', gap: '1.5rem'}}>
                            <div className="form-group">
                                <label style={{color: 'var(--text-primary)', marginBottom: '0.5rem', display: 'block', fontSize: '0.95rem', fontWeight: '600'}}>Product Name</label>
                                <div style={{position: 'relative'}}>
                                    <input 
                                        type="text" 
                                        name="name" 
                                        value={formData.name} 
                                        onChange={handleInputChange} 
                                        required 
                                        className="input-field" 
                                        placeholder="e.g. Midnight Berries"
                                        style={{
                                            width: '100%', padding: '1rem 1rem 1rem 3rem', borderRadius: '12px', 
                                            background: 'var(--surface-color)', 
                                            border: '1px solid transparent', 
                                            color: 'var(--text-primary)',
                                            outline: 'none', transition: 'all 0.2s ease',
                                            fontSize: '1rem',
                                            boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                                        }}
                                        onFocus={(e) => {
                                            e.target.style.border = '1px solid var(--primary)';
                                            e.target.style.background = 'var(--bg-color)';
                                        }}
                                        onBlur={(e) => {
                                            e.target.style.border = '1px solid transparent';
                                            e.target.style.background = 'var(--surface-color)';
                                        }}
                                    />
                                    <div style={{position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)', pointerEvents: 'none'}}>
                                        <Edit size={18} />
                                    </div>
                                </div>
                            </div>

                            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem'}}>
                                <div className="form-group">
                                    <label style={{color: 'var(--text-primary)', marginBottom: '0.5rem', display: 'block', fontSize: '0.95rem', fontWeight: '600'}}>Price (₹)</label>
                                    <div style={{position: 'relative'}}>
                                        <input 
                                            type="number" 
                                            name="price" 
                                            value={formData.price} 
                                            onChange={handleInputChange} 
                                            required 
                                            className="input-field" 
                                            placeholder="350"
                                            style={{
                                                width: '100%', padding: '1rem 1rem', borderRadius: '12px', 
                                                background: 'var(--surface-color)', 
                                                border: '1px solid transparent', 
                                                color: 'var(--text-primary)',
                                                outline: 'none', transition: 'all 0.2s ease',
                                                fontSize: '1rem',
                                                boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                                            }}
                                            onFocus={(e) => {
                                                e.target.style.border = '1px solid var(--primary)';
                                                e.target.style.background = 'var(--bg-color)';
                                            }}
                                            onBlur={(e) => {
                                                e.target.style.border = '1px solid transparent';
                                                e.target.style.background = 'var(--surface-color)';
                                            }}
                                        />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label style={{color: 'var(--text-primary)', marginBottom: '0.5rem', display: 'block', fontSize: '0.95rem', fontWeight: '600'}}>Stock</label>
                                    <div style={{position: 'relative'}}>
                                        <input 
                                            type="number" 
                                            name="stock" 
                                            value={formData.stock} 
                                            onChange={handleInputChange} 
                                            required 
                                            className="input-field" 
                                            placeholder="100"
                                            style={{
                                                width: '100%', padding: '1rem 1rem', borderRadius: '12px', 
                                                background: 'var(--surface-color)', 
                                                border: '1px solid transparent', 
                                                color: 'var(--text-primary)',
                                                outline: 'none', transition: 'all 0.2s ease',
                                                fontSize: '1rem',
                                                boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                                            }}
                                            onFocus={(e) => {
                                                e.target.style.border = '1px solid var(--primary)';
                                                e.target.style.background = 'var(--bg-color)';
                                            }}
                                            onBlur={(e) => {
                                                e.target.style.border = '1px solid transparent';
                                                e.target.style.background = 'var(--surface-color)';
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="form-group">
                                <label style={{color: 'var(--text-primary)', marginBottom: '0.5rem', display: 'block', fontSize: '0.95rem', fontWeight: '600'}}>Category</label>
                                <div style={{position: 'relative'}}>
                                    <select
                                        name="category"
                                        value={formData.category}
                                        onChange={handleInputChange}
                                        required
                                        className="input-field"
                                        style={{
                                            width: '100%', padding: '1rem', borderRadius: '12px',
                                            background: 'var(--surface-color)',
                                            border: '1px solid transparent',
                                            color: 'var(--text-primary)',
                                            outline: 'none', transition: 'all 0.2s ease',
                                            fontSize: '1rem',
                                            appearance: 'none',
                                            boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                                        }}
                                        onFocus={(e) => {
                                            e.target.style.border = '1px solid var(--primary)';
                                            e.target.style.background = 'var(--bg-color)';
                                        }}
                                        onBlur={(e) => {
                                            e.target.style.border = '1px solid transparent';
                                            e.target.style.background = 'var(--surface-color)';
                                        }}
                                    >
                                        {categories.map(cat => (
                                            <option key={cat} value={cat} style={{background: 'var(--bg-color)', color: 'var(--text-primary)'}}>{cat}</option>
                                        ))}
                                    </select>
                                    <div style={{position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--text-secondary)'}}>
                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6"/></svg>
                                    </div>
                                </div>
                            </div>

                            <div className="form-group">
                                <label style={{color: 'var(--text-primary)', marginBottom: '0.5rem', display: 'block', fontSize: '0.95rem', fontWeight: '600'}}>Image URL</label>
                                <div style={{position: 'relative'}}>
                                    <input 
                                        type="text" 
                                        name="image" 
                                        value={formData.image} 
                                        onChange={handleInputChange} 
                                        className="input-field" 
                                        placeholder="https://..."
                                        style={{
                                            width: '100%', padding: '1rem 1rem 1rem 3rem', borderRadius: '12px', 
                                            background: 'var(--surface-color)', 
                                            border: '1px solid transparent', 
                                            color: 'var(--text-primary)',
                                            outline: 'none', transition: 'all 0.2s ease',
                                            fontSize: '1rem',
                                            boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                                        }}
                                        onFocus={(e) => {
                                            e.target.style.border = '1px solid var(--primary)';
                                            e.target.style.background = 'var(--bg-color)';
                                        }}
                                        onBlur={(e) => {
                                            e.target.style.border = '1px solid transparent';
                                            e.target.style.background = 'var(--surface-color)';
                                        }}
                                    />
                                    <div style={{position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)', pointerEvents: 'none'}}>
                                        <Upload size={18} />
                                    </div>
                                </div>
                                {formData.image && (
                                    <div style={{marginTop: '0.75rem', height: '60px', width: '60px', borderRadius: '10px', overflow: 'hidden', border: '2px solid var(--surface-color)', boxShadow: '0 2px 8px rgba(0,0,0,0.1)'}}>
                                        <img src={formData.image} alt="Preview" style={{width: '100%', height: '100%', objectFit: 'cover'}} />
                                    </div>
                                )}
                            </div>

                            <div className="form-group" style={{background: 'rgba(255, 77, 109, 0.05)', padding: '1rem', borderRadius: '12px', border: '1px dashed rgba(255, 77, 109, 0.3)'}}>
                                <label style={{color: 'var(--primary)', marginBottom: '0.75rem', display: 'block', fontSize: '0.95rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px'}}>
                                    <Tag size={14} style={{display: 'inline', marginRight: '5px'}}/> 
                                    Promo Code (Optional)
                                </label>
                                <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem'}}>
                                    <div>
                                        <input 
                                            type="text" 
                                            name="promoCode" 
                                            value={formData.promoCode} 
                                            onChange={(e) => setFormData({...formData, promoCode: e.target.value.toUpperCase()})} 
                                            className="input-field" 
                                            placeholder="CODE (e.g. SUMMER50)"
                                            style={{
                                                width: '100%', padding: '0.8rem', borderRadius: '8px', 
                                                background: 'var(--surface-color)', 
                                                border: '1px solid var(--border-color)', 
                                                color: 'var(--text-primary)',
                                                outline: 'none'
                                            }}
                                        />
                                    </div>
                                    <div style={{position: 'relative'}}>
                                        <input 
                                            type="number" 
                                            name="discountPercentage" 
                                            value={formData.discountPercentage} 
                                            onChange={handleInputChange} 
                                            className="input-field" 
                                            placeholder="Discount %"
                                            max="100"
                                            style={{
                                                width: '100%', padding: '0.8rem', borderRadius: '8px', 
                                                background: 'var(--surface-color)', 
                                                border: '1px solid var(--border-color)', 
                                                color: 'var(--text-primary)',
                                                outline: 'none'
                                            }}
                                        />
                                        <span style={{position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)'}}>%</span>
                                    </div>
                                </div>
                                <p style={{fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.5rem'}}>
                                    Create a coupon code specifically for this product.
                                </p>
                            </div>

                            <div className="form-group">
                                <label style={{color: 'var(--text-primary)', marginBottom: '0.5rem', display: 'block', fontSize: '0.95rem', fontWeight: '600'}}>Description</label>
                                <textarea 
                                    name="description" 
                                    value={formData.description} 
                                    onChange={handleInputChange} 
                                    required 
                                    className="input-field" 
                                    rows="3"
                                    placeholder="Describe your flavor..."
                                    style={{
                                        width: '100%', padding: '1rem', borderRadius: '12px', 
                                        background: 'var(--surface-color)', 
                                        border: '1px solid transparent', 
                                        color: 'var(--text-primary)', 
                                        resize: 'vertical', outline: 'none',
                                        fontFamily: 'inherit',
                                        fontSize: '1rem',
                                        boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                                    }}
                                    onFocus={(e) => {
                                        e.target.style.border = '1px solid var(--primary)';
                                        e.target.style.background = 'var(--bg-color)';
                                    }}
                                    onBlur={(e) => {
                                        e.target.style.border = '1px solid transparent';
                                        e.target.style.background = 'var(--surface-color)';
                                    }}
                                ></textarea>
                            </div>

                            <button type="submit" className="btn btn-primary" style={{
                                marginTop: '1.5rem', padding: '1.1rem', borderRadius: '12px', fontWeight: '600',
                                fontSize: '1.1rem', letterSpacing: '0.5px',
                                boxShadow: '0 10px 20px -5px rgba(255, 77, 109, 0.4)',
                                transition: 'all 0.3s ease'
                            }}
                            onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                            onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                            >
                                <Plus size={22} style={{marginRight: '0.75rem'}} /> Create Product
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* View Product Modal */}
            {selectedProduct && (
                <div className="modal-overlay" style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.5)',
                    display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000,
                    padding: '1rem'
                }}>
                    <div className="no-scrollbar" style={{
                        width: '100%', maxWidth: '450px', padding: '0', 
                        position: 'relative', borderRadius: '24px', 
                        background: 'var(--bg-color)',
                        border: '1px solid var(--border-color)',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                        overflow: 'hidden'
                    }}>
                        {/* Header Image */}
                        <div style={{height: '240px', width: '100%', overflow: 'hidden', position: 'relative'}}>
                            <img 
                                src={selectedProduct.image || "https://via.placeholder.com/400x200"} 
                                alt={selectedProduct.name}
                                style={{width: '100%', height: '100%', objectFit: 'cover'}} 
                            />
                             <div style={{
                                position: 'absolute', inset: 0, 
                                background: 'linear-gradient(to bottom, rgba(0,0,0,0.3), transparent 30%, transparent 70%, rgba(0,0,0,0.6))'
                            }}></div>
                            <button 
                                onClick={() => setSelectedProduct(null)}
                                style={{
                                    position: 'absolute', top: '1rem', right: '1rem', 
                                    background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.3)', 
                                    color: 'white', cursor: 'pointer', padding: '0.5rem',
                                    borderRadius: '50%', backdropFilter: 'blur(4px)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    transition: 'all 0.2s'
                                }}
                                onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.3)'}
                                onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Content */}
                        <div style={{padding: '2rem'}}>
                            <div style={{marginBottom: '1.5rem'}}>
                                <h2 style={{fontSize: '1.75rem', color: 'var(--text-primary)', margin: '0 0 0.5rem 0', fontWeight: '700', lineHeight: 1.2}}>{selectedProduct.name}</h2>
                                <span style={{
                                    display: 'inline-block',
                                    background: 'rgba(255, 77, 109, 0.1)', color: 'var(--primary)', 
                                    padding: '0.25rem 0.75rem', borderRadius: '50px', 
                                    fontSize: '0.85rem', fontWeight: '600',
                                    border: '1px solid rgba(255, 77, 109, 0.2)'
                                }}>
                                    {selectedProduct.category || "Uncategorized"}
                                </span>
                            </div>

                            <div style={{
                                display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', 
                                background: 'var(--surface-color)', padding: '1rem', borderRadius: '12px',
                                marginBottom: '1.5rem', border: '1px solid var(--border-color)'
                            }}>
                                <div>
                                    <div style={{fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.25rem'}}>Price</div>
                                    <div style={{fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--text-primary)'}}>₹{selectedProduct.price}</div>
                                </div>
                                <div>
                                    <div style={{fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.25rem'}}>In Stock</div>
                                    <div style={{fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--text-primary)'}}>{selectedProduct.stock}</div>
                                </div>
                            </div>

                            <div style={{marginBottom: '2rem'}}>
                                <div style={{fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px'}}>Description</div>
                                <p style={{color: 'var(--text-primary)', fontSize: '1rem', lineHeight: '1.6', margin: 0}}>
                                    {selectedProduct.description}
                                </p>
                            </div>

                            <button 
                                onClick={() => handleDelete(selectedProduct._id)}
                                style={{
                                    width: '100%',
                                    color: '#ef4444', background: 'rgba(239, 68, 68, 0.08)', 
                                    border: '1px solid rgba(239, 68, 68, 0.2)', 
                                    padding: '0.9rem', borderRadius: '12px',
                                    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                                    fontSize: '1rem', fontWeight: '600',
                                    transition: 'all 0.2s'
                                }}
                                onMouseOver={(e) => {
                                    e.currentTarget.style.background = 'rgba(239, 68, 68, 0.15)';
                                    e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.3)';
                                }}
                                onMouseOut={(e) => {
                                    e.currentTarget.style.background = 'rgba(239, 68, 68, 0.08)';
                                    e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.2)';
                                }}
                            >
                                <Trash2 size={18} /> Delete Product
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VendorProducts;
