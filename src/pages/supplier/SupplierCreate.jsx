import React from 'react';
import ComplaintForm from '../../components/ComplaintForm';

export default function SupplierCreate() {
  const handleSuccess = (data) => {
    console.log('Complaint created:', data);
    // Redirect or update list
    window.location.href = '/supplier/home';
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Create New Complaint</h1>
      <ComplaintForm onSuccess={handleSuccess} />
    </div>
  );
}


