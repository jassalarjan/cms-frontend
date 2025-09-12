import React, { useState, useCallback } from 'react';
import {
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  LockClosedIcon,
  BriefcaseIcon
} from '@heroicons/react/24/outline';

// Memoized form input component to prevent focus issues
const FormInput = React.memo(({ 
  field, 
  label, 
  type = "text", 
  placeholder, 
  icon: Icon, 
  required = false,
  value,
  error,
  onChange
}) => {
  const handleChange = useCallback((e) => {
    onChange(field, e.target.value);
  }, [field, onChange]);

  return (
    <div className="mb-4">
      <label htmlFor={field} className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Icon className="h-5 w-5 text-gray-400" />
          </div>
        )}
        <input
          id={field}
          name={field}
          type={type}
          placeholder={placeholder}
          className={`input-field ${Icon ? 'pl-10' : ''} ${error ? 'border-red-500' : ''}`}
          value={value}
          onChange={handleChange}
          required={required}
        />
      </div>
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
});

FormInput.displayName = 'FormInput';

const UserForm = ({ onSubmit, initialData = {}, title = "Add User" }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'CUSTOMER',
    phone: '',
    address: '',
    password: '',
    ...initialData
  });

  const [errors, setErrors] = useState({});

  const handleFormChange = useCallback((field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear error when field is modified
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ""
      }));
    }
  }, [errors]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }
    
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }
    
    if (!initialData.user_id && !formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password && formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4">
      <FormInput
        field="name"
        label="Name"
        placeholder="Enter full name"
        icon={UserIcon}
        required
        value={formData.name}
        error={errors.name}
        onChange={handleFormChange}
      />

      <FormInput
        field="email"
        label="Email"
        type="email"
        placeholder="Enter email address"
        icon={EnvelopeIcon}
        required
        value={formData.email}
        error={errors.email}
        onChange={handleFormChange}
      />

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Role <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <BriefcaseIcon className="h-5 w-5 text-gray-400" />
          </div>
          <select
            name="role"
            value={formData.role}
            onChange={(e) => handleFormChange('role', e.target.value)}
            className="input-field pl-10"
            required
          >
            <option value="CUSTOMER">Customer</option>
            <option value="SUPPLIER">Supplier</option>
            <option value="ADMIN">Admin</option>
          </select>
        </div>
      </div>

      <FormInput
        field="phone"
        label="Phone"
        type="tel"
        placeholder="Enter phone number"
        icon={PhoneIcon}
        value={formData.phone}
        error={errors.phone}
        onChange={handleFormChange}
      />

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Address
        </label>
        <div className="relative">
          <div className="absolute top-3 left-0 pl-3 flex items-start pointer-events-none">
            <MapPinIcon className="h-5 w-5 text-gray-400" />
          </div>
          <textarea
            name="address"
            value={formData.address}
            onChange={(e) => handleFormChange('address', e.target.value)}
            className="input-field pl-10"
            rows={3}
            placeholder="Enter address"
          />
        </div>
      </div>

      {(!initialData.user_id || formData.password) && (
        <FormInput
          field="password"
          label="Password"
          type="password"
          placeholder={initialData.user_id ? "Leave blank to keep current password" : "Enter password"}
          icon={LockClosedIcon}
          required={!initialData.user_id}
          value={formData.password}
          error={errors.password}
          onChange={handleFormChange}
        />
      )}

      <div className="mt-4 flex justify-end space-x-2">
        <button
          type="submit"
          className="btn-primary"
        >
          {title}
        </button>
      </div>
    </form>
  );
};

export default UserForm;
