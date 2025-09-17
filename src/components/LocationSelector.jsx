import React, { useState, useEffect } from 'react';
import API from '../../api/axios';
import toast from 'react-hot-toast';

export default function LocationSelector({ userId, currentLocationId, onAssign, userRole }) {
  const [locations, setLocations] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(currentLocationId);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLocations();
  }, []);

  const fetchLocations = async () => {
    try {
      const response = await API.get('/locations');
      if (response.data.success) {
        setLocations(response.data.data);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching locations:', error);
      toast.error('Failed to fetch locations');
      setLoading(false);
    }
  };

  const handleLocationChange = async (locationId) => {
    try {
      await API.post('/locations/assign', {
        userId,
        locationId: parseInt(locationId, 10)
      });
      setSelectedLocation(locationId);
      onAssign && onAssign(locationId);
      toast.success('Location assigned successfully');
    } catch (error) {
      console.error('Error assigning location:', error);
      toast.error('Failed to assign location');
    }
  };

  if (userRole !== 'SUPPLIER') {
    return null;
  }

  if (loading) {
    return <div>Loading locations...</div>;
  }

  return (
    <div className="flex items-center gap-2">
      <label className="text-sm font-medium text-gray-700">Location:</label>
      <select
        value={selectedLocation || ''}
        onChange={(e) => handleLocationChange(e.target.value)}
        className="border border-gray-300 rounded-md shadow-sm py-1 px-2 text-sm"
      >
        <option value="">Select location</option>
        {locations.map((location) => (
          <option key={location.id} value={location.id}>
            {location.name}
          </option>
        ))}
      </select>
    </div>
  );
}
