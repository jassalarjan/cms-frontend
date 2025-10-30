import React from 'react';
import ComplaintForm from '../../components/ComplaintForm';

export default function CustomerCreate() {
  const handleSuccess = (data) => {
    // Complaint created successfully
    // Redirect or update list
    window.location.href = '/customer';
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Create New Complaint</h1>
      <ComplaintForm onSuccess={handleSuccess} />
    </div>
  );
}