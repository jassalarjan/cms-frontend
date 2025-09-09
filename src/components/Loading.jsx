import React from 'react';
import { ArrowPathIcon } from '@heroicons/react/24/outline';

const Loading = ({ size = 'md', type = 'spinner', text = 'Loading...', fullScreen = false }) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16'
  };

  const SpinnerComponent = () => (
    <div className="flex items-center justify-center space-x-2">
      <ArrowPathIcon className={`${sizeClasses[size]} animate-spin text-blue-600`} />
      {text && <span className="text-gray-600 font-medium">{text}</span>}
    </div>
  );

  const DotsComponent = () => (
    <div className="flex items-center justify-center space-x-2">
      <div className="flex space-x-1">
        <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
        <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" style={{ animationDelay: '0.1s' }}></div>
        <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
      </div>
      {text && <span className="text-gray-600 font-medium ml-3">{text}</span>}
    </div>
  );

  const BarsComponent = () => (
    <div className="flex items-center justify-center space-x-2">
      <div className="flex space-x-1">
        <div className="w-1 h-8 bg-blue-600 rounded animate-pulse"></div>
        <div className="w-1 h-8 bg-blue-600 rounded animate-pulse" style={{ animationDelay: '0.1s' }}></div>
        <div className="w-1 h-8 bg-blue-600 rounded animate-pulse" style={{ animationDelay: '0.2s' }}></div>
        <div className="w-1 h-8 bg-blue-600 rounded animate-pulse" style={{ animationDelay: '0.3s' }}></div>
      </div>
      {text && <span className="text-gray-600 font-medium ml-3">{text}</span>}
    </div>
  );

  const PulseComponent = () => (
    <div className="flex items-center justify-center space-x-2">
      <div className={`${sizeClasses[size]} bg-blue-600 rounded-full animate-pulse`}></div>
      {text && <span className="text-gray-600 font-medium">{text}</span>}
    </div>
  );

  const renderComponent = () => {
    switch (type) {
      case 'dots':
        return <DotsComponent />;
      case 'bars':
        return <BarsComponent />;
      case 'pulse':
        return <PulseComponent />;
      default:
        return <SpinnerComponent />;
    }
  };

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white bg-opacity-90 backdrop-blur-sm z-50 flex items-center justify-center">
        <div className="text-center">
          {renderComponent()}
        </div>
      </div>
    );
  }

  return renderComponent();
};

export default Loading;
