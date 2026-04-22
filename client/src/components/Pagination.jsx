import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const Pagination = ({ inputs, onPageChange }) => {
    const { currentPage, totalItems, itemsPerPage } = inputs;
    const totalPages = Math.ceil(totalItems / itemsPerPage);

    if (totalPages <= 1) return null;

    return (
        <div className="pagination-container" style={{
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            gap: '0.5rem', 
            marginTop: '2rem',
            padding: '1rem'
        }}>
            <button 
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                style={{
                    background: 'var(--surface-color)',
                    border: '1px solid var(--glass-border)',
                    borderRadius: '8px',
                    padding: '0.5rem',
                    cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                    color: currentPage === 1 ? 'var(--text-secondary)' : 'var(--text-primary)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'all 0.2s'
                }}
            >
                <ChevronLeft size={20} />
            </button>
            
            <span style={{
                color: 'var(--text-secondary)', 
                fontSize: '0.9rem',
                fontWeight: '500'
            }}>
                Page <span style={{color: 'var(--primary)'}}>{currentPage}</span> of {totalPages}
            </span>

            <button 
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                style={{
                    background: 'var(--surface-color)',
                    border: '1px solid var(--glass-border)',
                    borderRadius: '8px',
                    padding: '0.5rem',
                    cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                    color: currentPage === totalPages ? 'var(--text-secondary)' : 'var(--text-primary)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'all 0.2s'
                }}
            >
                <ChevronRight size={20} />
            </button>
        </div>
    );
};

export default Pagination;
