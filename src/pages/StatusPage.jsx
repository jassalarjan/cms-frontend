import React, { useState, useEffect } from 'react';
import {
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline';
import API from '../api/axios';
import Loading from '../components/Loading';

const StatusPage = () => {
  const [status, setStatus] = useState({
    backend: 'checking',
    database: 'checking',
    frontend: 'active'
  });

  useEffect(() => {
    checkBackendStatus();
  }, []);

  const checkBackendStatus = async () => {
    try {
      // Test backend connection
      const response = await API.get('/');
      if (response.status === 200) {
        setStatus(prev => ({ ...prev, backend: 'active' }));
        // If backend is working, test database
        await checkDatabaseStatus();
      }
    } catch (error) {
      console.error('Backend check failed:', error);
      setStatus(prev => ({ ...prev, backend: 'error', database: 'error' }));
    }
  };

  const checkDatabaseStatus = async () => {
    try {
      // Try to fetch users to test database
      const response = await API.get('/admin/users');
      setStatus(prev => ({ ...prev, database: 'active' }));
    } catch (error) {
      console.error('Database check failed:', error);
      setStatus(prev => ({ ...prev, database: 'error' }));
    }
  };

  const StatusItem = ({ label, status: itemStatus }) => {
    const getStatusIcon = () => {
      switch (itemStatus) {
        case 'active':
          return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
        case 'error':
          return <XCircleIcon className="h-5 w-5 text-red-500" />;
        case 'checking':
        default:
          return <ClockIcon className="h-5 w-5 text-yellow-500" />;
      }
    };

    const getStatusText = () => {
      switch (itemStatus) {
        case 'active':
          return 'Active';
        case 'error':
          return 'Error';
        case 'checking':
        default:
          return 'Checking...';
      }
    };

    const getStatusColor = () => {
      switch (itemStatus) {
        case 'active':
          return 'text-green-600 bg-green-50';
        case 'error':
          return 'text-red-600 bg-red-50';
        case 'checking':
        default:
          return 'text-yellow-600 bg-yellow-50';
      }
    };

    return (
      <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
        <div className="flex items-center space-x-3">
          {getStatusIcon()}
          <span className="font-medium text-gray-900">{label}</span>
        </div>
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor()}`}>
          {getStatusText()}
        </span>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <ExclamationCircleIcon className="h-12 w-12 text-blue-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">System Status</h1>
          <p className="text-gray-600">Check the status of all system components</p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 space-y-4">
          <StatusItem label="Frontend Application" status={status.frontend} />
          <StatusItem label="Backend API" status={status.backend} />
          <StatusItem label="Database Connection" status={status.database} />
          
          <div className="pt-4 border-t border-gray-200">
            <button
              onClick={checkBackendStatus}
              className="w-full btn-primary flex items-center justify-center"
            >
              <Loading type="spinner" size="sm" text="" />
              <span className="ml-2">Refresh Status</span>
            </button>
          </div>
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            Visit the{' '}
            <a href="/login" className="text-blue-600 hover:text-blue-500">
              Login Page
            </a>{' '}
            to access the application
          </p>
        </div>
      </div>
    </div>
  );
};

export default StatusPage;
