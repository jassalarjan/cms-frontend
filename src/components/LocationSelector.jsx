import React, { useState, useEffect } from 'react';
import API from '../api/axios';
import toast from 'react-hot-toast';

export default function LocationSelector({ 
  value = {}, 
  onChange, 
  required = false,
  showLabel = true 
}) {
  const [zones, setZones] = useState([]);
  const [circles, setCircles] = useState([]);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedZone, setSelectedZone] = useState(value.zone_id || '');
  const [selectedCircle, setSelectedCircle] = useState(value.circle_id || '');
  const [selectedBranch, setSelectedBranch] = useState(value.branch_id || '');

  useEffect(() => {
    fetchZones();
  }, []);

  useEffect(() => {
    if (value.zone_id !== selectedZone) {
      setSelectedZone(value.zone_id || '');
    }
    if (value.circle_id !== selectedCircle) {
      setSelectedCircle(value.circle_id || '');
    }
    if (value.branch_id !== selectedBranch) {
      setSelectedBranch(value.branch_id || '');
    }
  }, [value]);

  const fetchZones = async () => {
    try {
      const response = await API.get('/locations/zones');
      if (response.data.success) {
        setZones(response.data.data || []);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching zones:', error);
      toast.error('Failed to fetch zones');
      setLoading(false);
    }
  };

  const fetchCircles = async (zoneId) => {
    try {
      const response = await API.get(`/locations/zones/${zoneId}/circles`);
      if (response.data.success) {
        setCircles(response.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching circles:', error);
      toast.error('Failed to fetch circles');
    }
  };

  const fetchBranches = async (circleId) => {
    try {
      const response = await API.get(`/locations/circles/${circleId}/branches`);
      if (response.data.success) {
        setBranches(response.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching branches:', error);
      toast.error('Failed to fetch branches');
    }
  };

  const handleZoneChange = (e) => {
    const zoneId = e.target.value;
    setSelectedZone(zoneId);
    setSelectedCircle('');
    setSelectedBranch('');
    setCircles([]);
    setBranches([]);

    if (zoneId) {
      fetchCircles(zoneId);
    }

    if (onChange) {
      onChange({
        zone_id: zoneId ? parseInt(zoneId) : null,
        circle_id: null,
        branch_id: null
      });
    }
  };

  const handleCircleChange = (e) => {
    const circleId = e.target.value;
    setSelectedCircle(circleId);
    setSelectedBranch('');
    setBranches([]);

    if (circleId) {
      fetchBranches(circleId);
    }

    if (onChange) {
      onChange({
        zone_id: selectedZone ? parseInt(selectedZone) : null,
        circle_id: circleId ? parseInt(circleId) : null,
        branch_id: null
      });
    }
  };

  const handleBranchChange = (e) => {
    const branchId = e.target.value;
    setSelectedBranch(branchId);

    if (onChange) {
      onChange({
        zone_id: selectedZone ? parseInt(selectedZone) : null,
        circle_id: selectedCircle ? parseInt(selectedCircle) : null,
        branch_id: branchId ? parseInt(branchId) : null
      });
    }
  };

  if (loading) {
    return <div className="text-sm text-gray-500">Loading locations...</div>;
  }

  return (
    <div className="space-y-4">
      {showLabel && (
        <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">
          Location {required && <span className="text-red-500">*</span>}
        </label>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Zone Selection */}
        <div>
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
            Zone {required && <span className="text-red-500">*</span>}
          </label>
          <select
            value={selectedZone}
            onChange={handleZoneChange}
            required={required}
            className="w-full px-3 py-2 border-2 border-gray-200 dark:border-gray-600 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="">Select Zone</option>
            {zones.map((zone) => (
              <option key={zone.id} value={zone.id}>
                {zone.name}
              </option>
            ))}
          </select>
        </div>

        {/* Circle Selection */}
        <div>
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
            Circle {required && selectedZone && <span className="text-red-500">*</span>}
          </label>
          <select
            value={selectedCircle}
            onChange={handleCircleChange}
            disabled={!selectedZone}
            required={required && selectedZone}
            className="w-full px-3 py-2 border-2 border-gray-200 dark:border-gray-600 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:bg-gray-100 disabled:cursor-not-allowed"
          >
            <option value="">Select Circle</option>
            {circles.map((circle) => (
              <option key={circle.id} value={circle.id}>
                {circle.name}
              </option>
            ))}
          </select>
        </div>

        {/* Branch Selection */}
        <div>
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
            Branch
          </label>
          <select
            value={selectedBranch}
            onChange={handleBranchChange}
            disabled={!selectedCircle}
            className="w-full px-3 py-2 border-2 border-gray-200 dark:border-gray-600 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:bg-gray-100 disabled:cursor-not-allowed"
          >
            <option value="">Select Branch (Optional)</option>
            {branches.map((branch) => (
              <option key={branch.id} value={branch.id}>
                {branch.name}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}