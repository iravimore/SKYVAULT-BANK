import React from 'react';

const variants = {
  primary: 'bg-vault-500 hover:bg-vault-600 text-white',
  secondary: 'bg-gray-100 hover:bg-gray-200 text-gray-800',
  danger: 'bg-red-500 hover:bg-red-600 text-white'
};

export default function Button({ children, variant = 'primary', loading = false, className = '', ...props }) {
  return (
    <button
      className={`px-4 py-2 rounded-lg font-medium transition disabled:opacity-60 disabled:cursor-not-allowed ${variants[variant]} ${className}`}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading ? (
        <span className="flex items-center justify-center gap-2">
          <span className="h-4 w-4 border-2 border-white/60 border-t-white rounded-full animate-spin" />
          Please wait...
        </span>
      ) : (
        children
      )}
    </button>
  );
}
