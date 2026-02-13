import { useState } from 'react';
import PanelRegistrationForm from '../components/PanelRegistrationForm';

export default function PanelRegistrationPage() {
  const [showForm, setShowForm] = useState(true);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-500 to-blue-500 rounded-full mb-4">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Solar Panel Registration
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Register your solar panel system to track warranty, maintenance, and performance
          </p>
        </div>

        {/* Form */}
        {showForm && (
          <PanelRegistrationForm
            onSuccess={(data) => {
              console.log('Panel registered:', data);
              // Optionally hide form after success
              // setShowForm(false);
            }}
          />
        )}
      </div>
    </div>
  );
}
