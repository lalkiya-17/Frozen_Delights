import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Trash2, User } from 'lucide-react';
import { toast } from 'react-toastify';
import ConfirmToast from '../../components/ConfirmToast';
import '../../pages/Dashboard.css';

import Pagination from '../../components/Pagination';

const AdminUsers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [processing, setProcessing] = useState(null);

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('adminToken');
            const res = await axios.get('/api/admin/users/all', { 
                headers: { token },
                withCredentials: true 
            });
            if (res.data.success) {
                setUsers(res.data.users);
            }
        } catch (error) {
            console.error("Failed to fetch users", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    // Reset pagination when search changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);

    const handleDelete = async (id) => {
        toast(<ConfirmToast 
            message="Are you sure you want to delete this user? This action cannot be undone."
            onConfirm={async () => {
                setProcessing(id);
                try {
                    const token = localStorage.getItem('adminToken');
                    const res = await axios.delete(`/api/admin/users/delete/${id}`, { 
                        headers: { token },
                        withCredentials: true 
                    });
                    
                    if (res.data.success) {
                        toast.success(res.data.message);
                        fetchUsers(); // Refresh list
                    } else {
                        toast.error(res.data.message || "Failed to delete user");
                    }
                } catch (error) {
                    toast.error("Action failed: " + (error.response?.data?.message || error.message));
                } finally {
                    setProcessing(null);
                }
            }}
        />, { autoClose: false, closeButton: false });
    };

    const filteredUsers = users.filter(user => 
        user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Pagination Logic
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentUsers = filteredUsers.slice(indexOfFirstItem, indexOfLastItem);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    return (
        <div>
            <div className="dashboard-header">
                <div className="dashboard-title">
                    <h1>User Management</h1>
                    <p>Manage registered customers</p>
                </div>
                <div className="search-bar" style={{background: 'rgba(255,255,255,0.05)', padding: '0.5rem 1rem', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '0.5rem', border: '1px solid var(--glass-border)'}}>
                    <Search size={18} color="var(--text-secondary)" />
                    <input 
                        type="text" 
                        placeholder="Search users..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{background: 'transparent', border: 'none', color: 'var(--text-primary)', outline: 'none', width: '250px'}} 
                    />
                </div>
            </div>

            <div className="stats-grid" style={{gridTemplateColumns: 'repeat(1, 1fr)', marginBottom: '2rem'}}>
                <div className="stat-card">
                    <div style={{display: 'flex', justifyContent: 'space-between'}}>
                         <span className="stat-label">Total Customers</span>
                         <User size={20} color="var(--primary)" />
                    </div>
                    <div className="stat-value">{users.length}</div>
                    <div className="stat-trend">Registered Users</div>
                </div>
            </div>

            <div className="table-container">
                <table className="dashboard-table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Joined Date</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="5" style={{textAlign: 'center', padding: '2rem'}}>Loading users...</td></tr>
                        ) : currentUsers.length === 0 ? (
                            <tr><td colSpan="5" style={{textAlign: 'center', padding: '2rem'}}>No users found</td></tr>
                        ) : (
                            currentUsers.map(user => (
                                <tr key={user._id}>
                                    <td>
                                        <div style={{display: 'flex', alignItems: 'center', gap: '0.8rem'}}>
                                            <div style={{width: '32px', height: '32px', borderRadius: '50%', background: 'var(--surface-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--glass-border)'}}>
                                                {user.name.charAt(0).toUpperCase()}
                                            </div>
                                            {user.name}
                                        </div>
                                    </td>
                                    <td>{user.email}</td>
                                    <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                                    <td>
                                        <span className="status-badge status-active">
                                            Active
                                        </span>
                                    </td>
                                    <td>
                                        <button 
                                            className="action-btn btn-reject" 
                                            onClick={() => handleDelete(user._id)}
                                            disabled={processing === user._id}
                                            title="Delete User"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
                <Pagination 
                    inputs={{ currentPage, totalItems: filteredUsers.length, itemsPerPage }}
                    onPageChange={paginate}
                />
            </div>
        </div>
    );
};

export default AdminUsers;
