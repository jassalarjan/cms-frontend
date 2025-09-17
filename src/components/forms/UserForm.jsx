import React, { useCallback, useEffect, useState } from 'react';
import {
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  LockClosedIcon,
  BriefcaseIcon
} from '@heroicons/react/24/outline';
import API from '../../api/axios';

// Memoized form input component to prevent focus issues
export const FormInput = React.memo(({ 
  field, 
  label, 
  type = "text", 
  placeholder, 
  icon: Icon, 
  required = false,
  value,
  error,
  onChange,
  disabled = false
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
          disabled={disabled}
        />
      </div>
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
});

FormInput.displayName = 'FormInput';

// Memoized form select component
export const FormSelect = React.memo(({
  field,
  label,
  icon: Icon,
  required = false,
  value,
  onChange,
  options,
  placeholder = "Select an option"
}) => {
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
        <select
          id={field}
          name={field}
          value={value || ''}
          onChange={(e) => onChange(field, e.target.value)}
          className={`input-field ${Icon ? 'pl-10' : ''}`}
          required={required}
        >
          <option value="">{placeholder}</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
});

FormSelect.displayName = 'FormSelect';

// Memoized user form component
export const UserForm = React.memo(({ 
  formData, 
  onFormChange, 
  isEdit = false 
}) => {
  const [locations, setLocations] = useState([]);

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const response = await API.get('/locations');
        setLocations(response.data.data);
      } catch (error) {
        console.error('Error fetching locations:', error);
      }
    };

    if (formData.role === 'SUPPLIER') {
      fetchLocations();
    }
  }, [formData.role]);

  const handleChange = useCallback((field, value) => {
    onFormChange(field, value);
  }, [onFormChange]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormInput
          field="name"
          label="Name"
          placeholder="Enter full name"
          icon={UserIcon}
          required
          value={formData.name}
          onChange={handleChange}
        />

        <FormInput
          field="email"
          label="Email"
          type="email"
          placeholder="Enter email address"
          icon={EnvelopeIcon}
          required
          value={formData.email}
          onChange={handleChange}
          disabled={isEdit}
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
              onChange={(e) => handleChange('role', e.target.value)}
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
          onChange={handleChange}
        />

        {formData.role === 'SUPPLIER' && (
          <div className="md:col-span-2">
            <FormSelect
              field="location_id"
              label="Location"
              icon={MapPinIcon}
              required
              value={formData.location_id}
              onChange={handleChange}
              options={locations.map(location => ({
                value: location.id,
                label: location.name
              }))}
              placeholder="Select a location"
            />
          </div>
        )}

        <div className="md:col-span-2">
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
              onChange={(e) => handleChange('address', e.target.value)}
              className="input-field pl-10"
              rows={3}
              placeholder="Enter address"
            />
          </div>
        </div>

        <div className="md:col-span-2">
          <FormInput
            field="password"
            label={isEdit ? "Password (leave blank to keep current)" : "Password"}
            type="password"
            placeholder={isEdit ? "Enter new password" : "Enter password"}
            icon={LockClosedIcon}
            required={!isEdit}
            value={formData.password}
            onChange={handleChange}
          />
        </div>
      </div>
    </div>
  );
});

UserForm.displayName = 'UserForm';
