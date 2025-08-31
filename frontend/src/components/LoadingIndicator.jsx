import React from 'react';

const LoadingIndicator = () => {
  return (
    <div className="fixed top-4 right-4 bg-white rounded-lg shadow-xl p-4 z-50 border-l-4 border-blue-500 max-w-sm">
      <div className="flex items-center space-x-3">
        <div className="relative">
          <div className="loading-spinner w-6 h-6 border-3 border-blue-500 border-t-transparent rounded-full"></div>
          <div className="absolute inset-0 loading-spinner w-6 h-6 border-3 border-blue-300 border-b-transparent rounded-full" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
        </div>
        <div>
          <div className="font-semibold text-gray-800">Adjusting tone...</div>
          <div className="text-sm text-gray-600">This may take a few seconds</div>
        </div>
      </div>

      {/* Progress dots */}
      <div className="flex space-x-1 mt-3 justify-center">
        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
      </div>
    </div>
  );
};

export default LoadingIndicator;