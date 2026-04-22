import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Trash2, Package } from 'lucide-react';
import { toast } from 'react-toastify';
import ConfirmToast from '../../components/ConfirmToast';

const AdminProducts = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    
    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [productsPerPage] = useState(10);

    const fetchProducts = async () => {
        try {
            const token = localStorage.getItem('adminToken');
            const res = await axios.get('/api/admin/products/all', { 
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
        fetchProducts();
    }, []);

    const handleDelete = async (id) => {
        toast(<ConfirmToast 
            message="Are you sure you want to delete this product? This action cannot be undone."
            onConfirm={async () => {
                try {
                    const token = localStorage.getItem('adminToken');
                    const res = await axios.delete(`/api/admin/products/delete/${id}`, { 
                        headers: { token },
                        withCredentials: true 
                    });
                    
                    if (res.data.success) {
                        toast.success(res.data.message || "Product deleted successfully");
                        fetchProducts();
                    } else {
                        toast.error(res.data.message || "Failed to delete product");
                    }
                } catch (error) {
                    toast.error("Delete failed: " + (error.response?.data?.message || error.message));
                }
            }}
        />, { autoClose: false, closeButton: false });
    };

    const [selectedProduct, setSelectedProduct] = useState(null);

    // Filter and Pagination Logic
    const filteredProducts = products.filter(product => 
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.vendor?.vendorDetails?.shopName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const indexOfLastProduct = currentPage * productsPerPage;
    const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
    const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    return (
        <div>
            <div className="dashboard-header">
                <div className="dashboard-title">
                    <h1>Manage Products</h1>
                    <p>View and manage all vendor products</p>
                </div>
                <div className="search-bar" style={{background: 'rgba(255,255,255,0.05)', padding: '0.5rem 1rem', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '0.5rem', border: '1px solid var(--glass-border)'}}>
                    <Search size={18} color="var(--text-secondary)" />
                    <input 
                        type="text" 
                        placeholder="Search products..." 
                        style={{background: 'transparent', border: 'none', color: 'var(--text-primary)', outline: 'none', width: '200px'}} 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="table-container" style={{marginTop: '2rem'}}>
                <table className="dashboard-table">
                    <thead>
                        <tr>
                            <th>Image</th>
                            <th>Product Name</th>
                            <th>Category</th>
                            <th>Price</th>
                            <th>Stock</th>
                            <th>Vendor</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="7" style={{textAlign: 'center', padding: '2rem'}}>Loading products...</td></tr>
                        ) : currentProducts.length === 0 ? (
                            <tr><td colSpan="7" style={{textAlign: 'center', padding: '2rem'}}>No products found</td></tr>
                        ) : (
                            currentProducts.map(product => (
                                <tr key={product._id}>
                                    <td>
                                        <div 
                                            style={{width: '40px', height: '40px', borderRadius: '8px', overflow: 'hidden', background: '#f0f0f0', cursor: 'pointer'}}
                                            onClick={() => setSelectedProduct(product)}
                                        >
                                            {product.image ? (
                                                <img src={product.image} alt={product.name} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
                                            ) : (
                                                <div style={{width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                                                    <Package size={20} color="#ccc" />
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td style={{fontWeight: '500'}}>{product.name}</td>
                                    <td>
                                        <span className="status-badge" style={{background: 'rgba(42, 157, 143, 0.1)', color: '#2a9d8f'}}>
                                            {product.category}
                                        </span>
                                    </td>
                                    <td>₹{product.price}</td>
                                    <td>
                                        <span style={{color: product.stock < 10 ? '#e63946' : 'inherit', fontWeight: product.stock < 10 ? 'bold' : 'normal'}}>
                                            {product.stock}
                                        </span>
                                    </td>
                                    <td>
                                        {product.vendor?.vendorDetails?.shopName || 'Unknown Shop'}
                                        <div style={{fontSize: '0.8rem', color: 'var(--text-secondary)'}}>
                                            {product.vendor?.name}
                                        </div>
                                    </td>
                                    <td>
                                        <div style={{display: 'flex', gap: '0.5rem'}}>
                                            <button 
                                                className="action-btn" 
                                                onClick={() => setSelectedProduct(product)}
                                                style={{background: 'rgba(56, 189, 248, 0.1)', color: 'var(--primary)', flex: 1, justifyContent: 'center'}}
                                                title="View Details"
                                            >
                                                <Package size={16} /> View
                                            </button>
                                            <button 
                                                className="action-btn" 
                                                onClick={() => handleDelete(product._id)}
                                                style={{background: '#ffebee', color: '#e63946', flex: 1, justifyContent: 'center'}}
                                                title="Delete Product"
                                            >
                                                <Trash2 size={16} /> Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
                
                {/* Pagination */}
                {filteredProducts.length > productsPerPage && (
                    <div style={{display: 'flex', justifyContent: 'center', marginTop: '1rem'}}>
                        <div className="pagination">
                            <button 
                                onClick={() => paginate(currentPage - 1)} 
                                disabled={currentPage === 1}
                                style={{
                                    padding: '0.5rem', 
                                    border: '1px solid var(--glass-border)', 
                                    background: currentPage === 1 ? 'rgba(255,255,255,0.05)' : 'var(--surface-color)', 
                                    color: currentPage === 1 ? 'var(--text-secondary)' : 'var(--text-primary)', 
                                    borderRadius: '6px', 
                                    cursor: currentPage === 1 ? 'not-allowed' : 'pointer'
                                }}
                            >
                                Previous
                            </button>
                            <span style={{padding: '0.5rem 1rem', display: 'flex', alignItems: 'center'}}>
                                Page {currentPage} of {Math.ceil(filteredProducts.length / productsPerPage)}
                            </span>
                            <button 
                                onClick={() => paginate(currentPage + 1)} 
                                disabled={currentPage === Math.ceil(filteredProducts.length / productsPerPage)}
                                style={{
                                    padding: '0.5rem', 
                                    border: '1px solid var(--glass-border)', 
                                    background: currentPage === Math.ceil(filteredProducts.length / productsPerPage) ? 'rgba(255,255,255,0.05)' : 'var(--surface-color)', 
                                    color: currentPage === Math.ceil(filteredProducts.length / productsPerPage) ? 'var(--text-secondary)' : 'var(--text-primary)', 
                                    borderRadius: '6px', 
                                    cursor: currentPage === Math.ceil(filteredProducts.length / productsPerPage) ? 'not-allowed' : 'pointer'
                                }}
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* View Product Modal */}
            {selectedProduct && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
                    display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000,
                    padding: '1rem'
                }}>
                    <div className="no-scrollbar" style={{
                        width: '100%', maxWidth: '500px', 
                        background: 'var(--surface-color)',
                        borderRadius: '24px', 
                        border: '1px solid var(--glass-border)',
                        boxShadow: 'var(--glass-shadow)',
                        overflow: 'hidden',
                        position: 'relative',
                        animation: 'fadeIn 0.3s ease'
                    }}>
                        <button 
                            onClick={() => setSelectedProduct(null)}
                            style={{
                                position: 'absolute', top: '1rem', right: '1rem', 
                                background: 'rgba(0,0,0,0.5)', border: 'none', 
                                color: 'white', cursor: 'pointer', padding: '0.5rem',
                                borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                zIndex: 10
                            }}
                        >
                            <span style={{display: 'none'}}>Close</span>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                        </button>

                        <div style={{height: '250px', width: '100%', background: '#eee'}}>
                           {selectedProduct.image ? (
                                <img 
                                    src={selectedProduct.image} 
                                    alt={selectedProduct.name}
                                    style={{width: '100%', height: '100%', objectFit: 'cover'}} 
                                />
                           ) : (
                               <div style={{width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', color: '#999'}}>
                                   <Package size={48} />
                                   <span>No Image</span>
                               </div>
                           )}
                        </div>

                        <div style={{padding: '2rem'}}>
                            <div style={{marginBottom: '1rem'}}>
                                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'start'}}>
                                    <h2 style={{fontSize: '1.5rem', fontWeight: '700', margin: '0 0 0.5rem 0', color: 'var(--text-primary)'}}>{selectedProduct.name}</h2>
                                    <span style={{
                                        background: 'rgba(42, 157, 143, 0.1)', color: '#2a9d8f',
                                        padding: '0.25rem 0.75rem', borderRadius: '50px', fontSize: '0.85rem', fontWeight: '600'
                                    }}>
                                        {selectedProduct.category}
                                    </span>
                                </div>
                                <div style={{color: 'var(--text-secondary)', fontSize: '0.9rem'}}>
                                    Sold by: <span style={{color: 'var(--primary)', fontWeight: '600'}}>{selectedProduct.vendor?.vendorDetails?.shopName || selectedProduct.vendor?.name}</span>
                                </div>
                            </div>
                            
                            <div style={{
                                display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', 
                                background: 'var(--bg-color)', padding: '1rem', borderRadius: '12px',
                                marginBottom: '1.5rem'
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
                                <div style={{fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', fontWeight: '600'}}>Description</div>
                                <p style={{color: 'var(--text-primary)', fontSize: '0.95rem', lineHeight: '1.6', margin: 0, maxHeight: '100px', overflowY: 'auto'}}>
                                    {selectedProduct.description || "No description available."}
                                </p>
                            </div>

                            <button 
                                onClick={() => handleDelete(selectedProduct._id)}
                                style={{
                                    width: '100%',
                                    color: '#ef4444', background: 'rgba(239, 68, 68, 0.1)', 
                                    border: '1px solid rgba(239, 68, 68, 0.2)', 
                                    padding: '0.9rem', borderRadius: '12px',
                                    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                                    fontSize: '1rem', fontWeight: '600',
                                    transition: 'all 0.2s'
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

export default AdminProducts;
