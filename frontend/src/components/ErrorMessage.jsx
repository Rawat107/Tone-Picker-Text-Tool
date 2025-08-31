import React, { useState, useEffect } from 'react';

const ErrorMessage = ({ message, onClose, autoClose = true }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (autoClose && message) {
      const timer = setTimeout(() => {
        handleClose();
      }, 7000); // Auto close after 7 seconds

      return () => clearTimeout(timer);
    }
  }, [message, autoClose]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      onClose();
    }, 300); // Wait for exit animation
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className={`
      fixed top-4 right-4 bg-red-50 border-l-4 border-red-500 rounded-lg shadow-xl p-4 z-50 max-w-md
      transform transition-all duration-300 ease-out
      ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
    `}>
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          <div className="text-red-500 text-xl">⚠️</div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-red-800">Error</div>
          <div className="text-sm text-red-700 mt-1 leading-relaxed">{message}</div>

          {/* Retry suggestion */}
          <div className="text-xs text-red-600 mt-2 opacity-75">
            Try adjusting your text or check your internet connection.
          </div>
        </div>
        <button
          onClick={handleClose}
          className="flex-shrink-0 text-red-400 hover:text-red-600 transition-colors p-1 rounded"
          title="Close error message"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Progress bar for auto-close */}
      {autoClose && (
        <div className="mt-3 w-full bg-red-200 rounded-full h-1">
          <div 
            className="bg-red-500 h-1 rounded-full transition-all duration-[7000ms] ease-linear"
            style={{ width: isVisible ? '0%' : '100%' }}
          />
        </div>
      )}
    </div>
  );
};

export default ErrorMessage;