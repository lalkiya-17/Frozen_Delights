import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { User, Package, MapPin, LogOut, Store, Upload, Plus, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import ConfirmToast from '../components/ConfirmToast';
import './Profile.css';

const Profile = () => {
  const { user, logout, updateProfile, applyForVendor } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('orders');
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  useEffect(() => {
     if (activeTab === 'orders') {
         setLoadingOrders(true);
         const token = localStorage.getItem('userToken');
         axios.get('/api/orders/my', { 
             headers: { token },
             withCredentials: true 
         })
             .then(res => {
                 if (res.data.success) setOrders(res.data.orders);
             })
             .catch(err => console.error(err))
             .finally(() => setLoadingOrders(false));
     }
  }, [activeTab]);

  if (!user) {
    navigate('/login');
    return null;
  }

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getInitials = (name) => {
    return name ? name.charAt(0).toUpperCase() : 'U';
  };

  return (
    <div className="profile-page">
      <div className="container profile-container">
        
        {/* Sidebar */}
        <aside className="profile-sidebar">
          <div className="profile-user-info">
            <div className="profile-avatar">
              {getInitials(user.name)}
            </div>
            <h2 className="profile-name">{user.name}</h2>
            <p className="profile-email">{user.email}</p>
          </div>

          <nav className="profile-nav">
            <button 
              className={`profile-nav-btn ${activeTab === 'orders' ? 'active' : ''}`}
              onClick={() => setActiveTab('orders')}
            >
              <Package size={20} /> My Orders
            </button>
            {/* Removed Saved Addresses Tab */}
            <button 
              className={`profile-nav-btn ${activeTab === 'address' ? 'active' : ''}`}
              onClick={() => setActiveTab('address')}
            >
              <MapPin size={20} /> Saved Addresses
            </button>
            <button 
              className={`profile-nav-btn ${activeTab === 'edit' ? 'active' : ''}`}
              onClick={() => setActiveTab('edit')}
            >
              <User size={20} /> Edit Profile
            </button>
            <button 
              className={`profile-nav-btn ${activeTab === 'vendor' ? 'active' : ''}`}
              onClick={() => setActiveTab('vendor')}
            >
              <Store size={20} /> Become a Vendor
            </button>
            <button 
              className="profile-nav-btn"
              onClick={handleLogout}
              style={{marginTop: '1rem', color: '#ff4d6d'}}
            >
              <LogOut size={20} /> Logout
            </button>


          </nav>
        </aside>

        {/* Content Area */}
        <main className="profile-content glass-panel">


          {activeTab === 'orders' && (
            <div className="orders-section">
              <div className="profile-header">
                <h2>Order History</h2>
              </div>
              
              {loadingOrders ? (
                  <div style={{textAlign: 'center', padding: '2rem'}}>Loading...</div>
              ) : !orders || orders.length === 0 ? (
                  <div style={{textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)'}}>
                      You haven't placed any orders yet.
                  </div>
              ) : (
                  orders.map(order => (
                    <div className="order-card" key={order._id}>
                        <div className="order-header">
                        <div>
                            <div className="order-id">Order #{order._id.slice(-6).toUpperCase()}</div>
                            <div className="order-date">{new Date(order.createdAt).toLocaleDateString()}</div>
                        </div>
                        <span className={`order-status status-${order.deliveryStatus}`}>
                            {order.deliveryStatus.charAt(0).toUpperCase() + order.deliveryStatus.slice(1)}
                        </span>
                        </div>
                        <div className="order-items-list">
                            {order.items.map((item, idx) => (
                                <div key={idx} style={{display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem'}}>
                                    <img 
                                        src={item.product?.image || "https://via.placeholder.com/60"} 
                                        alt={item.product?.name} 
                                        style={{width: '60px', height: '60px', objectFit: 'cover', borderRadius: '6px', cursor: 'pointer'}}
                                        onClick={() => item.product?._id && navigate(`/shop/${item.product._id}`)}
                                    />
                                    <div style={{flex: 1}}>
                                        <div 
                                            onClick={() => item.product?._id && navigate(`/shop/${item.product._id}`)}
                                            style={{cursor: item.product?._id ? 'pointer' : 'default', fontWeight: '500'}}
                                        >
                                            {item.product?.name || 'Unknown Item'}
                                        </div>
                                        <div style={{fontSize: '0.85rem', color: 'var(--text-secondary)'}}>
                                            qty: {item.quantity} × ₹{item.price}
                                        </div>
                                    </div>
                                    <div style={{fontWeight: '600'}}>₹{item.price * item.quantity}</div>
                                </div>
                            ))}
                        </div>
                        <div className="order-footer" style={{borderTop: '1px solid var(--border-color)', paddingTop: '1rem', marginTop: '1rem'}}>
                            <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)'}}>
                                <span>Subtotal:</span>
                                <span>₹{order.subTotal || order.totalAmount}</span>
                            </div>
                            {order.taxAmount > 0 && (
                                <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)'}}>
                                    <span>Tax:</span>
                                    <span>+₹{order.taxAmount}</span>
                                </div>
                            )}
                            {order.discountAmount > 0 && (
                                <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem', color: '#4caf50'}}>
                                    <span>Discount:</span>
                                    <span>-₹{order.discountAmount}</span>
                                </div>
                            )}
                            <div style={{display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '1.1rem', marginTop: '0.5rem', borderTop: '1px dashed var(--border-color)', paddingTop: '0.5rem'}}>
                                <span>Total:</span>
                                <span>₹{order.totalAmount}</span>
                            </div>
                        </div>
                    </div>
                  ))
              )}
            </div>
          )}

          {activeTab === 'address' && (
            <div className="address-section">
              <div className="profile-header" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                <h2>Saved Addresses</h2>
                <button className="btn btn-primary" onClick={() => document.getElementById('add-address-form').scrollIntoView({behavior: 'smooth'})}>
                    <Plus size={18} style={{marginRight: '5px'}}/> Add New
                </button>
              </div>
              
              {user.addresses && user.addresses.length > 0 ? (
                  <div className="address-grid">
                      {user.addresses.map((addr) => (
                          <div key={addr._id} className="address-card glass-panel">
                              <div className="address-card-header">
                                  <div style={{fontWeight: 'bold', fontSize: '1.1rem'}}>{addr.street}</div>
                                  <button 
                                    className="btn-icon-danger" 
                                    onClick={() => {
                                        toast(<ConfirmToast 
                                            message="Delete this address?" 
                                            onConfirm={async () => {
                                                try {
                                                    const token = localStorage.getItem('userToken');
                                                    const res = await axios.delete(`/api/user/delete-address/${addr._id}`, { 
                                                        headers: { token },
                                                        withCredentials: true 
                                                    });
                                                    if(res.data.success) {
                                                        toast.success("Address Deleted");
                                                        // Small delay to let toast show? Or just reload. 
                                                        // Reload might kill toast. Better to update state locally or just reload.
                                                        // Since we reload, let's just reload.
                                                        setTimeout(() => window.location.reload(), 1000);
                                                    }
                                                } catch(err) { toast.error('Failed to delete'); }
                                            }}
                                        />, { autoClose: false, closeButton: false });
                                    }}
                                  >
                                      <Trash2 size={18} />
                                  </button>
                              </div>
                              <p>{addr.city}, {addr.state} - {addr.zipCode}</p>
                              <p>{addr.country}</p>
                              <p style={{marginTop: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)'}}>Mobile: {addr.mobile}</p>
                          </div>
                      ))}
                  </div>
              ) : (
                <p style={{color: 'var(--text-secondary)', marginBottom: '2rem'}}>You haven't saved any addresses yet.</p>
              )}

              <div id="add-address-form" style={{marginTop: '2rem', paddingTop: '2rem', borderTop: '1px solid var(--glass-border)'}}>
                  <h3 style={{marginBottom: '1rem'}}>Add New Address</h3>
                  <form onSubmit={async (e) => {
                      e.preventDefault();
                      const formData = {
                          street: e.target.street.value,
                          city: e.target.city.value,
                          state: e.target.state.value,
                          zipCode: e.target.zipCode.value,
                          mobile: e.target.mobile.value
                      };
                      try {
                          const token = localStorage.getItem('userToken');
                          const res = await axios.post('/api/user/add-address', formData, { 
                              headers: { token },
                              withCredentials: true 
                          });
                          if(res.data.success) {
                              toast.success("Address Added!");
                              setTimeout(() => window.location.reload(), 1000);
                          } else {
                              toast.error(res.data.message);
                          }
                      } catch(err) {
                          console.error("Add address error:", err);
                          toast.error("Failed to add address: " + (err.response?.data?.message || err.message));
                      }
                  }}>
                      <div className="form-group" style={{marginBottom: '1rem'}}>
                          <label>Street Address</label>
                          <input name="street" type="text" className="form-input" required placeholder="House No, Street Name" />
                      </div>
                      <div className="form-grid">
                          <div className="form-group">
                              <label>City</label>
                              <input name="city" type="text" className="form-input" required />
                          </div>
                          <div className="form-group">
                              <label>State</label>
                              <input name="state" type="text" className="form-input" required />
                          </div>
                      </div>
                      <div className="form-grid" style={{marginTop: '1rem'}}>
                          <div className="form-group">
                              <label>Zip Code</label>
                              <input name="zipCode" type="text" className="form-input" required />
                          </div>
                          <div className="form-group">
                              <label>Mobile Number</label>
                              <input name="mobile" type="text" className="form-input" required />
                          </div>
                      </div>
                      <button type="submit" className="btn btn-primary" style={{marginTop: '1.5rem'}}>Save Address</button>
                  </form>
              </div>
            </div>
          )}

          {activeTab === 'edit' && (
            <div className="edit-profile-section">
               <div className="profile-header">
                <h2>Edit Profile</h2>
                <p className="text-secondary">Update your personal information.</p>
              </div>
              <EditProfileForm user={user} updateProfile={updateProfile} />
            </div>
          )}

          {activeTab === 'vendor' && (
            <div className="vendor-section">
              <div className="profile-header">
                <h2>Become a Vendor</h2>
                <p className="text-secondary">Start selling your frozen delights with us.</p>
              </div>

              <form className="vendor-form" onSubmit={async (e) => { 
                e.preventDefault(); 
                
                const formData = new FormData();
                formData.append('shopName', e.target.shopName.value);
                formData.append('gstNumber', e.target.gstNumber.value);
                formData.append('address', e.target.address.value);

                // Append files
                if(e.target.idProof.files[0]) formData.append('idProof', e.target.idProof.files[0]);
                if(e.target.gstCertificate.files[0]) formData.append('gstCertificate', e.target.gstCertificate.files[0]);
                if(e.target.shopLicense.files[0]) formData.append('shopLicense', e.target.shopLicense.files[0]);



                const { success, message } = await applyForVendor(formData);
                if(success) {
                    toast.success("Request Submitted Successfully!");
                    setActiveTab('orders'); 
                } else {
                    toast.error("Submission Failed: " + message);
                }
               }}>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Shop Name</label>
                    <input name="shopName" type="text" placeholder="e.g. Frosty Treats" className="form-input" required />
                  </div>
                  <div className="form-group">
                    <label>GST Number</label>
                    <input name="gstNumber" type="text" placeholder="22AAAAA0000A1Z5" className="form-input" required />
                  </div>
                </div>

                <div className="form-group">
                  <label>Shop Address</label>
                  <textarea name="address" placeholder="Full address of your shop..." className="form-input" rows="3" required></textarea>
                </div>

                <div className="upload-section">
                    <h3>Documents</h3>
                    <div className="upload-grid">
                        <FileUploadField label="ID Proof (Aadhar/PAN)" name="idProof" />
                        <FileUploadField label="GST Certificate" name="gstCertificate" />
                        <FileUploadField label="Shop License" name="shopLicense" />
                    </div>
                </div>

                <button type="submit" className="btn btn-primary" style={{marginTop: '1.5rem'}}>Submit Request</button>

              </form>
            </div>
          )}
        </main>

      </div>
    </div>
  );
};

const EditProfileForm = ({ user, updateProfile }) => {
    const [name, setName] = useState(user.name);
    const [phone, setPhone] = useState(user.phone || '');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const { success, message: resMessage } = await updateProfile(name, phone);
        setLoading(false);
        if(success) toast.success(resMessage);
        else toast.error(resMessage);
    };

    return (
        <form onSubmit={handleSubmit} style={{maxWidth: '500px'}}>
            <div className="form-group" style={{marginBottom: '1rem'}}>
                <label>Full Name</label>
                <input 
                    type="text" 
                    className="form-input" 
                    value={name} 
                    onChange={(e) => setName(e.target.value)} 
                    required 
                />
            </div>
            <div className="form-group" style={{marginBottom: '1rem'}}>
                <label>Phone Number</label>
                <input 
                    type="tel" 
                    className="form-input" 
                    value={phone} 
                    onChange={(e) => setPhone(e.target.value)} 
                    placeholder="Enter your phone number"
                />
            </div>
            <div className="form-group" style={{marginBottom: '1.5rem'}}>
                <label>Email (Cannot be changed)</label>
                <input 
                    type="email" 
                    className="form-input" 
                    value={user.email} 
                    disabled 
                    style={{opacity: 0.7, cursor: 'not-allowed'}}
                />
            </div>
            <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Updating...' : 'Save Changes'}
            </button>
        </form>
    );
};

const FileUploadField = ({ label, name }) => {
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
            if (selectedFile.type.startsWith('image/')) {
                setPreview(URL.createObjectURL(selectedFile));
            } else {
                setPreview(null); // No preview for non-images
            }
        }
    };

    const clearFile = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setFile(null);
        setPreview(null);
        // Reset input value needs a ref, but simple way is to just let user re-click
        // Actually to clear input we need ref. Let's keep it simple for now or adding ref.
        const input = document.getElementById(`file-input-${name}`);
        if(input) input.value = '';
    };

    return (
        <div className="upload-box">
            <label>{label}</label>
            <div 
                className={`file-input-wrapper ${file ? 'has-file' : ''}`} 
                style={preview ? {backgroundImage: `url(${preview})`, backgroundSize: 'cover', backgroundPosition: 'center'} : {}}
            >
                {!file && (
                    <div className="upload-placeholder">
                        <Upload size={24} className="upload-icon"/>
                        <span>Click to Upload</span>
                        <span style={{fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '2px'}}>(Image or PDF)</span>
                    </div>
                )}
                
                {file && !preview && (
                    <div className="file-info">
                         <div style={{background: 'var(--primary)', padding: '10px', borderRadius: '50%', marginBottom: '10px', color: 'white'}}>
                            <Package size={24} /> 
                         </div>
                         <span className="file-name">{file.name}</span>
                    </div>
                )}

                {file && (
                    <div className="file-actions-overlay">
                        {preview && <span className="file-name-overlay">{file.name}</span>}
                        <button type="button" className="btn-remove-file" onClick={clearFile}>
                            <Trash2 size={16} />
                        </button>
                    </div>
                )}

                <input id={`file-input-${name}`} type="file" name={name} onChange={handleFileChange} accept="image/*,.pdf" />
            </div>
        </div>
    );
};

export default Profile;
