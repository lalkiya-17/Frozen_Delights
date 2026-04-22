import React from 'react';

const ConfirmToast = ({ message, onConfirm, closeToast }) => (
  <div>
    <p style={{ margin: '0 0 10px 0', fontSize: '0.9rem' }}>{message}</p>
    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
      <button 
        onClick={closeToast}
        style={{
            background: 'transparent',
            border: '1px solid #ccc',
            borderRadius: '4px',
            padding: '4px 8px',
            cursor: 'pointer',
            fontSize: '0.8rem',
            color: '#333'
        }}
      >
        No
      </button>
      <button 
        onClick={() => { onConfirm(); closeToast(); }}
        style={{
            background: '#ff4d6d',
            border: 'none',
            borderRadius: '4px',
            padding: '4px 12px',
            cursor: 'pointer',
            fontSize: '0.8rem',
            color: 'white'
        }}
      >
        Yes
      </button>
    </div>
  </div>
);

export default ConfirmToast;
