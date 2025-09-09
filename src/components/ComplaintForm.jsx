import React, { useState, useContext } from 'react';
import {
  DocumentArrowUpIcon,
  XMarkIcon,
  ExclamationTriangleIcon,
  CalendarDaysIcon,
  BuildingOfficeIcon,
  CubeIcon,
  UserIcon
} from '@heroicons/react/24/outline';
import { AuthContext } from '../context/AuthContext';
import API from '../api/axios';
import toast from 'react-hot-toast';
import Loading from './Loading';

const ComplaintForm = ({ onSuccess, onCancel, editingComplaint = null }) => {
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    product_name: editingComplaint?.product_name || '',
    product_model: editingComplaint?.product_model || '',
    manufacturing_year: editingComplaint?.manufacturing_year || new Date().getFullYear(),
    warranty_handler: editingComplaint?.warranty_handler || '',
    description: editingComplaint?.description || '',
    customer_id: editingComplaint?.customer_id || (user?.role === 'CUSTOMER' ? user.user_id : ''),
    priority: editingComplaint?.priority || 'MEDIUM',
    category: editingComplaint?.category || 'PRODUCT_DEFECT'
  });
  const [files, setFiles] = useState([]);
  const [errors, setErrors] = useState({});

  const priorities = [
    { value: 'LOW', label: 'Low Priority', color: 'bg-green-100 text-green-800' },
    { value: 'MEDIUM', label: 'Medium Priority', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'HIGH', label: 'High Priority', color: 'bg-orange-100 text-orange-800' },
    { value: 'CRITICAL', label: 'Critical', color: 'bg-red-100 text-red-800' }
  ];

  const categories = [
    { value: 'PRODUCT_DEFECT', label: 'Product Defect' },
    { value: 'SERVICE_ISSUE', label: 'Service Issue' },
    { value: 'DELIVERY_PROBLEM', label: 'Delivery Problem' },
    { value: 'WARRANTY_CLAIM', label: 'Warranty Claim' },
    { value: 'BILLING_DISPUTE', label: 'Billing Dispute' },
    { value: 'OTHER', label: 'Other' }
  ];

  const validateStep = (step) => {
    const newErrors = {};
    
    if (step === 1) {
      if (!formData.product_name.trim()) newErrors.product_name = 'Product name is required';
      if (!formData.description.trim()) newErrors.description = 'Description is required';
      if (formData.description.trim().length < 10) newErrors.description = 'Description must be at least 10 characters';
      if (!formData.category) newErrors.category = 'Category is required';
      if (!formData.priority) newErrors.priority = 'Priority is required';
    }

    if (step === 2) {
      if (formData.manufacturing_year < 1900 || formData.manufacturing_year > new Date().getFullYear()) {
        newErrors.manufacturing_year = 'Please enter a valid year';
      }
      if (user?.role === 'SUPPLIER' && !formData.customer_id) {
        newErrors.customer_id = 'Customer selection is required';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleFileUpload = (event) => {
    const selectedFiles = Array.from(event.target.files);
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'text/plain'];
    
    const validFiles = selectedFiles.filter(file => {
      if (file.size > maxSize) {
        toast.error(`File ${file.name} is too large. Maximum size is 5MB.`);
        return false;
      }
      if (!allowedTypes.includes(file.type)) {
        toast.error(`File ${file.name} has unsupported format.`);
        return false;
      }
      return true;
    });

    setFiles(prev => [...prev, ...validFiles].slice(0, 5)); // Max 5 files
  };

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(2);
    } else {
      toast.error('Please fix the errors below');
    }
  };

  const handleBack = () => {
    setCurrentStep(1);
    setErrors({});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateStep(2)) {
      toast.error('Please fix the errors below');
      return;
    }

    setLoading(true);
    try {
      const complaintData = new FormData();
      
      // Append form data
      Object.keys(formData).forEach(key => {
        complaintData.append(key, formData[key]);
      });

      // Append files
      files.forEach(file => {
        complaintData.append('attachments', file);
      });

      const url = editingComplaint 
        ? `/complaints-enhanced/${editingComplaint.complaint_id}`
        : '/complaints-enhanced';
      
      const method = editingComplaint ? 'PUT' : 'POST';
      
      const response = await API({
        method,
        url,
        data: complaintData,
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      toast.success(editingComplaint ? 'Complaint updated successfully!' : 'Complaint submitted successfully!');
      onSuccess && onSuccess(response.data);
      
    } catch (err) {
      console.error('Error submitting complaint:', err);
      const errorMessage = err.response?.data?.error || 'Failed to submit complaint';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const InputField = ({ field, label, type = 'text', placeholder, required = false, children }) => (
    <div className="mb-4">
      <label htmlFor={field} className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children || (
        <input
          id={field}
          type={type}
          placeholder={placeholder}
          className={`input-field ${errors[field] ? 'border-red-500 focus:ring-red-500' : ''}`}
          value={formData[field]}
          onChange={(e) => handleInputChange(field, e.target.value)}
          required={required}
        />
      )}
      {errors[field] && (
        <p className="mt-1 text-sm text-red-600 flex items-center">
          <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
          {errors[field]}
        </p>
      )}
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress Indicator */}
      <div className="flex items-center justify-center space-x-4 mb-8">
        <div className={`flex items-center ${currentStep >= 1 ? 'text-blue-600' : 'text-gray-400'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
            currentStep >= 1 ? 'border-blue-600 bg-blue-600 text-white' : 'border-gray-300'
          }`}>
            1
          </div>
          <span className="ml-2 text-sm font-medium">Complaint Details</span>
        </div>
        <div className={`w-16 h-0.5 ${currentStep >= 2 ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
        <div className={`flex items-center ${currentStep >= 2 ? 'text-blue-600' : 'text-gray-400'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
            currentStep >= 2 ? 'border-blue-600 bg-blue-600 text-white' : 'border-gray-300'
          }`}>
            2
          </div>
          <span className="ml-2 text-sm font-medium">Additional Info</span>
        </div>
      </div>

      <form onSubmit={currentStep === 1 ? (e) => { e.preventDefault(); handleNext(); } : handleSubmit}>
        {currentStep === 1 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Complaint Details</h3>

            <InputField
              field="product_name"
              label="Product Name"
              placeholder="Enter the product name"
              required
            />

            <InputField
              field="product_model"
              label="Product Model"
              placeholder="Enter the product model (optional)"
            />

            <InputField
              field="category"
              label="Category"
              required
            >
              <select
                className={`input-field ${errors.category ? 'border-red-500 focus:ring-red-500' : ''}`}
                value={formData.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
              >
                <option value="">Select a category</option>
                {categories.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </InputField>

            <InputField
              field="priority"
              label="Priority Level"
              required
            >
              <div className="grid grid-cols-2 gap-2">
                {priorities.map(priority => (
                  <label
                    key={priority.value}
                    className={`flex items-center justify-center p-3 border-2 rounded-lg cursor-pointer transition-all ${
                      formData.priority === priority.value
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="priority"
                      value={priority.value}
                      checked={formData.priority === priority.value}
                      onChange={(e) => handleInputChange('priority', e.target.value)}
                      className="sr-only"
                    />
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${priority.color}`}>
                      {priority.label}
                    </span>
                  </label>
                ))}
              </div>
            </InputField>

            <InputField
              field="description"
              label="Description"
              required
            >
              <textarea
                className={`input-field resize-none ${errors.description ? 'border-red-500 focus:ring-red-500' : ''}`}
                rows={4}
                placeholder="Describe the issue in detail..."
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
              />
              <div className="mt-1 text-xs text-gray-500">
                {formData.description.length}/500 characters (minimum 10 required)
              </div>
            </InputField>

            <button type="submit" className="w-full btn-primary">
              Next Step
            </button>
          </div>
        )}

        {currentStep === 2 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Additional Information</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputField
                field="manufacturing_year"
                label="Manufacturing Year"
                type="number"
                placeholder="2024"
              />

              <InputField
                field="warranty_handler"
                label="Warranty Handler"
                placeholder="Company handling warranty"
              />
            </div>

            {user?.role === 'SUPPLIER' && (
              <InputField
                field="customer_id"
                label="Customer"
                required
              >
                <select
                  className={`input-field ${errors.customer_id ? 'border-red-500 focus:ring-red-500' : ''}`}
                  value={formData.customer_id}
                  onChange={(e) => handleInputChange('customer_id', e.target.value)}
                >
                  <option value="">Select a customer</option>
                  {/* This would be populated with actual customers */}
                  <option value="3">Jane Customer</option>
                </select>
              </InputField>
            )}

            {/* File Upload */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Attachments <span className="text-gray-500">(Optional)</span>
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                <DocumentArrowUpIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600 mb-2">
                  Drop files here or click to upload
                </p>
                <input
                  type="file"
                  multiple
                  accept=".jpg,.jpeg,.png,.gif,.pdf,.txt"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload" className="btn-secondary cursor-pointer">
                  Choose Files
                </label>
                <p className="text-xs text-gray-500 mt-2">
                  Supported: JPG, PNG, PDF, TXT (Max 5MB each, 5 files max)
                </p>
              </div>

              {/* File List */}
              {files.length > 0 && (
                <div className="mt-3 space-y-2">
                  <p className="text-sm font-medium text-gray-700">Selected Files:</p>
                  {files.map((file, index) => (
                    <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                      <span className="text-sm text-gray-700 truncate">
                        {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                      </span>
                      <button
                        type="button"
                        onClick={() => removeFile(index)}
                        className="p-1 text-red-600 hover:bg-red-50 rounded"
                      >
                        <XMarkIcon className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={handleBack}
                className="flex-1 btn-secondary"
                disabled={loading}
              >
                Back
              </button>
              <button
                type="submit"
                disabled={loading}
                className={`flex-1 btn-primary ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <Loading type="spinner" size="sm" text="" />
                    <span className="ml-2">
                      {editingComplaint ? 'Updating...' : 'Submitting...'}
                    </span>
                  </div>
                ) : (
                  editingComplaint ? 'Update Complaint' : 'Submit Complaint'
                )}
              </button>
            </div>
          </div>
        )}
      </form>

      {onCancel && (
        <div className="mt-4 text-center">
          <button
            onClick={onCancel}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
};

export default ComplaintForm;
