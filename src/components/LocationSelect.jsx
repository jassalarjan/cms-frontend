import React, { useState, useEffect } from 'react';
import { Select, message } from 'antd';
import api from '../api/axios';

const LocationSelect = ({ userId, value, onChange, style }) => {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchLocations();
  }, []);

  const fetchLocations = async () => {
    try {
      setLoading(true);
      const response = await api.get('/locations');
      setLocations(response.data.data);
    } catch (error) {
      message.error('Failed to fetch locations');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = async (locationId) => {
    try {
      await api.put(`/users/${userId}/location`, { location_id: locationId });
      message.success('Location updated successfully');
      onChange?.(locationId);
    } catch (error) {
      message.error('Failed to update location');
    }
  };

  return (
    <Select
      style={style}
      value={value}
      onChange={handleChange}
      loading={loading}
      allowClear
      placeholder="Select a location"
    >
      {locations.map(location => (
        <Select.Option key={location.id} value={location.id}>
          {location.name}
        </Select.Option>
      ))}
    </Select>
  );
};

export default LocationSelect;
