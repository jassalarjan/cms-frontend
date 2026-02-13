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
          className={`w-full px-4 py-3 ${Icon ? 'pl-12' : 'pl-4'} border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 bg-white text-gray-900 placeholder-gray-400 ${error ? 'border-red-500' : ''}`}
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
          className={`w-full px-4 py-3 ${Icon ? 'pl-12' : 'pl-4'} border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 bg-white text-gray-900`}
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
  const [zones, setZones] = useState([]);
  const [circles, setCircles] = useState([]);
  const [branches, setBranches] = useState([]);
  
  // For cascading dropdowns
  const [selectedZoneForFilter, setSelectedZoneForFilter] = useState('');
  const [selectedCircleForFilter, setSelectedCircleForFilter] = useState('');

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const [allLocsResponse, zonesResponse] = await Promise.all([
          API.get('/locations'),
          API.get('/locations/zones')
        ]);
        
        const allLocations = allLocsResponse.data.data;
        setLocations(allLocations);
        setZones(zonesResponse.data.data);
        
        // Group by type
        setCircles(allLocations.filter(loc => loc.type === 'CIRCLE'));
        setBranches(allLocations.filter(loc => loc.type === 'BRANCH'));
      } catch (error) {
        console.error('Error fetching locations:', error);
      }
    };

    if (formData.role === 'SUPPLIER') {
      fetchLocations();
    }
  }, [formData.role]);

  // Get filtered circles based on selected zone
  const getFilteredCircles = () => {
    if (!selectedZoneForFilter) return circles;
    return circles.filter(c => c.parent_id === parseInt(selectedZoneForFilter));
  };

  // Get filtered branches based on selected circle
  const getFilteredBranches = () => {
    if (!selectedCircleForFilter) return branches;
    return branches.filter(b => b.parent_id === parseInt(selectedCircleForFilter));
  };

  // Toggle location selection
  const toggleLocation = (locationId) => {
    const currentIds = formData.location_ids || [];
    if (currentIds.includes(locationId)) {
      handleChange('location_ids', currentIds.filter(id => id !== locationId));
    } else {
      handleChange('location_ids', [...currentIds, locationId]);
    }
  };

  const handleChange = useCallback((field, value) => {
    onFormChange(field, value);
  }, [onFormChange]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormInput
          field="name"
          label="Full Name"
          placeholder="Enter full name..."
          icon={UserIcon}
          required
          value={formData.name}
          onChange={handleChange}
        />

        <FormInput
          field="email"
          label="Email Address"
          type="email"
          placeholder="Enter email address..."
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
              className="w-full px-4 py-3 pl-12 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 bg-white text-gray-900"
              required
            >
              <option value="CUSTOMER">System Integrator</option>
              <option value="SUPPLIER">Bank Official</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>
        </div>

        <FormInput
          field="phone"
          label="Phone Number"
          type="tel"
          placeholder="Enter phone number..."
          icon={PhoneIcon}
          value={formData.phone}
          onChange={handleChange}
        />

        {formData.role === 'SUPPLIER' && (
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Locations <span className="text-red-500">*</span>
            </label>

            {/* Selected Locations Display */}
            {formData.location_ids && formData.location_ids.length > 0 && (
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">Selected Locations:</p>
                <div className="flex flex-wrap gap-2">
                  {formData.location_ids.map(locationId => {
                    const location = locations.find(loc => loc.id === locationId);
                    const typeColors = {
                      'ZONE': 'bg-purple-100 text-purple-800 border-purple-200',
                      'CIRCLE': 'bg-green-100 text-green-800 border-green-200',
                      'BRANCH': 'bg-blue-100 text-blue-800 border-blue-200'
                    };
                    return (
                      <span
                        key={locationId}
                        className={`inline-flex items-center px-3 py-1 rounded-full text-sm border ${typeColors[location?.type] || 'bg-gray-100 text-gray-800 border-gray-200'}`}
                      >
                        <MapPinIcon className="h-3 w-3 mr-1" />
                        {location?.name || `Location ${locationId}`}
                        <span className="ml-1 text-xs opacity-75">({location?.type})</span>
                        <button
                          type="button"
                          onClick={() => toggleLocation(locationId)}
                          className="ml-2 hover:opacity-75 focus:outline-none"
                        >
                          ×
                        </button>
                      </span>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Location Selection by Type */}
            <div className="border border-gray-200 rounded-lg p-4 space-y-6">
              
              {/* Zones Section */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-semibold text-purple-700 flex items-center">
                    <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                    Zones
                  </h4>
                  <span className="text-xs text-gray-500">
                    {zones.filter(z => formData.location_ids?.includes(z.id)).length} selected
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-40 overflow-y-auto">
                  {zones.map(zone => {
                    const isSelected = formData.location_ids?.includes(zone.id);
                    return (
                      <label
                        key={zone.id}
                        className={`flex items-center p-2 rounded-lg border cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-purple-50 border-purple-300'
                            : 'bg-white border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleLocation(zone.id)}
                          className="h-4 w-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                        />
                        <span className="ml-2 text-sm">{zone.name}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Circles Section */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-semibold text-green-700 flex items-center">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                    Circles
                  </h4>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">
                      {circles.filter(c => formData.location_ids?.includes(c.id)).length} selected
                    </span>
                    <select
                      value={selectedZoneForFilter}
                      onChange={(e) => setSelectedZoneForFilter(e.target.value)}
                      className="text-xs px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-green-500"
                    >
                      <option value="">All Circles</option>
                      {zones.map(zone => (
                        <option key={zone.id} value={zone.id}>Filter by: {zone.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-40 overflow-y-auto">
                  {getFilteredCircles().map(circle => {
                    const isSelected = formData.location_ids?.includes(circle.id);
                    const parentZone = zones.find(z => z.id === circle.parent_id);
                    return (
                      <label
                        key={circle.id}
                        className={`flex items-center p-2 rounded-lg border cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-green-50 border-green-300'
                            : 'bg-white border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleLocation(circle.id)}
                          className="h-4 w-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                        />
                        <div className="ml-2 flex-1">
                          <span className="text-sm">{circle.name}</span>
                          {parentZone && (
                            <span className="text-xs text-gray-500 ml-1">({parentZone.name})</span>
                          )}
                        </div>
                      </label>
                    );
                  })}
                  {getFilteredCircles().length === 0 && (
                    <p className="text-xs text-gray-500 col-span-2 text-center py-2">
                      No circles found
                    </p>
                  )}
                </div>
              </div>

              {/* Branches Section */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-semibold text-blue-700 flex items-center">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                    Branches
                  </h4>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">
                      {branches.filter(b => formData.location_ids?.includes(b.id)).length} selected
                    </span>
                    <select
                      value={selectedCircleForFilter}
                      onChange={(e) => setSelectedCircleForFilter(e.target.value)}
                      className="text-xs px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="">All Branches</option>
                      {getFilteredCircles().map(circle => (
                        <option key={circle.id} value={circle.id}>Filter by: {circle.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-40 overflow-y-auto">
                  {getFilteredBranches().map(branch => {
                    const isSelected = formData.location_ids?.includes(branch.id);
                    const parentCircle = circles.find(c => c.id === branch.parent_id);
                    return (
                      <label
                        key={branch.id}
                        className={`flex items-center p-2 rounded-lg border cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-blue-50 border-blue-300'
                            : 'bg-white border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleLocation(branch.id)}
                          className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <div className="ml-2 flex-1">
                          <span className="text-sm">{branch.name}</span>
                          {parentCircle && (
                            <span className="text-xs text-gray-500 ml-1">({parentCircle.name})</span>
                          )}
                        </div>
                      </label>
                    );
                  })}
                  {getFilteredBranches().length === 0 && (
                    <p className="text-xs text-gray-500 col-span-2 text-center py-2">
                      No branches found
                    </p>
                  )}
                </div>
              </div>

            </div>

            {(!formData.location_ids || formData.location_ids.length === 0) && (
              <p className="mt-2 text-sm text-red-600">
                At least one location must be selected for bank officials
              </p>
            )}
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
              className="w-full px-4 py-3 pl-12 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 bg-white text-gray-900 placeholder-gray-400 resize-none"
              rows={3}
              placeholder="Enter full address..."
            />
          </div>
        </div>

        <div className="md:col-span-2">
          <FormInput
            field="password"
            label={isEdit ? "Password (leave blank to keep current)" : "Password"}
            type="password"
            placeholder={isEdit ? "Enter new password..." : "Enter password..."}
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
