import React, { useState, useEffect } from 'react';
import { X, FileText, Check, AlertCircle, ExternalLink } from 'lucide-react';

const DocumentReviewModal = ({ 
    isOpen, 
    onClose, 
    vendor, 
    onApprove, 
    onReject, 
    processing, 
    readOnly = false 
}) => {
    const [docChecks, setDocChecks] = useState({
        idProof: false,
        gstCertificate: false,
        shopLicense: false
    });

    // Reset checks when vendor changes or modal opens
    useEffect(() => {
        if (isOpen) {
            setDocChecks({
                idProof: false,
                gstCertificate: false,
                shopLicense: false
            });
        }
    }, [isOpen, vendor]);

    if (!isOpen || !vendor) return null;

    const documents = vendor.vendorDocuments || {};

    const handleCheck = (docType) => {
        if (readOnly) return;
        setDocChecks(prev => ({ ...prev, [docType]: !prev[docType] }));
    };

    const isAllChecked = () => {
        if (readOnly) return true; 
        if (documents.idProof && !docChecks.idProof) return false;
        if (documents.gstCertificate && !docChecks.gstCertificate) return false;
        if (documents.shopLicense && !docChecks.shopLicense) return false;
        return true;
    };

    const renderDocItem = (label, docKey, docUrl) => {
        const isChecked = docChecks[docKey];
        const hasDoc = !!docUrl;

        return (
            <div style={{
                background: 'var(--bg-color)', 
                padding: '1rem', 
                borderRadius: '12px',
                border: '1px solid var(--glass-border)',
                marginBottom: '1rem',
                transition: 'all 0.2s ease'
            }}>
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem'}}>
                    <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                        <div style={{
                            padding: '0.5rem', 
                            borderRadius: '8px', 
                            background: 'rgba(89, 195, 195, 0.1)', 
                            color: 'var(--secondary)'
                        }}>
                            <FileText size={18} />
                        </div>
                        <h4 style={{margin: 0, fontSize: '1rem', fontWeight: '600'}}>{label}</h4>
                    </div>
                    
                    {hasDoc && !readOnly && (
                        <label style={{
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '0.5rem', 
                            cursor: 'pointer',
                            padding: '0.25rem 0.5rem',
                            borderRadius: '6px',
                            background: isChecked ? 'rgba(89, 195, 195, 0.1)' : 'transparent',
                            border: isChecked ? '1px solid var(--secondary)' : '1px solid transparent',
                            transition: 'all 0.2s ease'
                        }}>
                            <input 
                                type="checkbox" 
                                checked={isChecked} 
                                onChange={() => handleCheck(docKey)}
                                style={{
                                    accentColor: 'var(--secondary)', 
                                    width: '18px', 
                                    height: '18px',
                                    cursor: 'pointer'
                                }}
                            />
                            <span style={{
                                fontSize: '0.85rem', 
                                fontWeight: '500',
                                color: isChecked ? 'var(--secondary)' : 'var(--text-secondary)'
                            }}>
                                {isChecked ? 'Verified' : 'Verify'}
                            </span>
                        </label>
                    )}
                </div>

                {hasDoc ? (
                    <div style={{
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '0.5rem',
                        marginTop: '0.5rem',
                        paddingLeft: '3rem'
                    }}>
                        <a 
                            href={docUrl} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.25rem',
                                color: 'var(--primary)', 
                                textDecoration: 'none',
                                fontSize: '0.9rem',
                                fontWeight: '500',
                            }}
                            className="hover-underline"
                        >
                            View Document <ExternalLink size={14} />
                        </a>
                    </div>
                ) : (
                    <div style={{
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '0.5rem',
                        marginTop: '0.5rem',
                        paddingLeft: '3rem',
                        color: 'var(--text-secondary)',
                        fontSize: '0.9rem'
                    }}>
                        <AlertCircle size={14} /> Not Uploaded
                    </div>
                )}
            </div>
        );
    };

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.6)', 
            backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
            padding: '1rem'
        }}>
            <div 
                className="glass-panel"
                style={{
                    background: 'var(--surface-color)', 
                    width: '600px', 
                    maxWidth: '100%', 
                    maxHeight: '85vh', 
                    display: 'flex',
                    flexDirection: 'column',
                    boxShadow: 'var(--glass-shadow)',
                    border: '1px solid var(--glass-border)'
                }}
            >
                {/* Header */}
                <div style={{
                    padding: '1.5rem', 
                    borderBottom: '1px solid var(--glass-border)',
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center'
                }}>
                    <div>
                        <h2 style={{margin: 0, fontSize: '1.25rem', color: 'var(--text-primary)'}}>Review Documents</h2>
                        <p style={{margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '0.25rem'}}>
                            Vendor: <span style={{color: 'var(--text-primary)', fontWeight: '600'}}>{vendor.name}</span>
                        </p>
                    </div>
                    <button 
                        onClick={onClose} 
                        style={{
                            background: 'transparent', 
                            border: 'none', 
                            color: 'var(--text-secondary)',
                            padding: '0.5rem',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'background 0.2s'
                        }}
                        onMouseOver={(e) => {
                            e.currentTarget.style.color = 'var(--text-primary)';
                            e.currentTarget.style.background = 'var(--glass-bg)';
                        }}
                        onMouseOut={(e) => {
                            e.currentTarget.style.color = 'var(--text-secondary)';
                            e.currentTarget.style.background = 'transparent';
                        }}
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Content */}
                <div style={{
                    padding: '1.5rem',
                    overflowY: 'auto',
                    flex: 1
                }}>
                    {renderDocItem('ID Proof', 'idProof', documents.idProof)}
                    {renderDocItem('GST Certificate', 'gstCertificate', documents.gstCertificate)}
                    {renderDocItem('Shop License', 'shopLicense', documents.shopLicense)}
                </div>

                {/* Footer */}
                <div style={{
                    padding: '1.5rem', 
                    borderTop: '1px solid var(--glass-border)',
                    display: 'flex', 
                    justifyContent: 'flex-end', 
                    gap: '1rem',
                    background: 'var(--bg-color)',
                    borderBottomLeftRadius: '16px',
                    borderBottomRightRadius: '16px'
                }}>
                    {!readOnly ? (
                        <>
                            <button 
                                className="action-btn btn-reject" 
                                onClick={() => onReject(vendor._id)}
                                disabled={processing === vendor._id}
                                style={{
                                    padding: '0.75rem 1.5rem',
                                    borderRadius: '8px',
                                    fontWeight: '600',
                                    border: '1px solid rgba(255, 77, 109, 0.3)',
                                    background: 'rgba(255, 77, 109, 0.1)',
                                    color: 'var(--primary)',
                                    cursor: processing === vendor._id ? 'not-allowed' : 'pointer'
                                }}
                            >
                                {processing === vendor._id ? 'Processing...' : 'Reject Request'}
                            </button>
                            <button 
                                className="action-btn btn-approve" 
                                onClick={() => onApprove(vendor._id)}
                                disabled={processing === vendor._id || !isAllChecked()}
                                title={!isAllChecked() ? "Please verify all documents first" : "Approve Vendor"}
                                style={{
                                    padding: '0.75rem 1.5rem',
                                    borderRadius: '8px',
                                    fontWeight: '600',
                                    border: 'none',
                                    background: !isAllChecked() ? 'var(--text-secondary)' : 'var(--secondary)',
                                    color: 'white',
                                    opacity: !isAllChecked() ? 0.3 : 1,
                                    cursor: (!isAllChecked() || processing === vendor._id) ? 'not-allowed' : 'pointer',
                                    boxShadow: isAllChecked() ? '0 4px 12px rgba(89, 195, 195, 0.3)' : 'none',
                                    transition: 'all 0.3s ease'
                                }}
                            >
                                {processing === vendor._id ? 'Processing...' : 'Approve Request'}
                            </button>
                        </>
                    ) : (
                        <button 
                            className="btn-primary" 
                            onClick={onClose}
                            style={{
                                padding: '0.75rem 1.5rem',
                                borderRadius: '8px',
                                border: 'none',
                                background: 'var(--primary)',
                                color: 'white',
                                fontWeight: '600',
                                cursor: 'pointer',
                                boxShadow: '0 4px 12px rgba(255, 77, 109, 0.3)'
                            }}
                        >
                            Close
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DocumentReviewModal;
