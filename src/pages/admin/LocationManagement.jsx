import React, { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  message,
  Space,
  Popconfirm
} from 'antd';
import { EditOutlined, DeleteOutlined, UserOutlined } from '@ant-design/icons';
import api from '../api/axios';

const LocationManagement = () => {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingLocation, setEditingLocation] = useState(null);
  const [form] = Form.useForm();

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

  useEffect(() => {
    fetchLocations();
  }, []);

  const handleSubmit = async (values) => {
    try {
      if (editingLocation) {
        await api.put(`/locations/${editingLocation.id}`, values);
        message.success('Location updated successfully');
      } else {
        await api.post('/locations', values);
        message.success('Location created successfully');
      }
      setModalVisible(false);
      form.resetFields();
      fetchLocations();
    } catch (error) {
      message.error(error.response?.data?.message || 'Operation failed');
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/locations/${id}`);
      message.success('Location deleted successfully');
      fetchLocations();
    } catch (error) {
      message.error(error.response?.data?.message || 'Failed to delete location');
    }
  };

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Address',
      dataIndex: 'address',
      key: 'address',
    },
    {
      title: 'City',
      dataIndex: 'city',
      key: 'city',
    },
    {
      title: 'State',
      dataIndex: 'state',
      key: 'state',
    },
    {
      title: 'Country',
      dataIndex: 'country',
      key: 'country',
    },
    {
      title: 'Postal Code',
      dataIndex: 'postal_code',
      key: 'postal_code',
    },
    {
      title: 'Assigned Users',
      dataIndex: 'assigned_users',
      key: 'assigned_users',
    },
    {
      title: 'Total Complaints',
      dataIndex: 'total_complaints',
      key: 'total_complaints',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => {
              setEditingLocation(record);
              form.setFieldsValue(record);
              setModalVisible(true);
            }}
          />
          <Popconfirm
            title="Are you sure you want to delete this location?"
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button type="primary" danger icon={<DeleteOutlined />} />
          </Popconfirm>
          <Button 
            icon={<UserOutlined />}
            onClick={() => {
              // TODO: Show users assigned to this location
            }}
          />
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: '16px' }}>
        <Button
          type="primary"
          onClick={() => {
            setEditingLocation(null);
            form.resetFields();
            setModalVisible(true);
          }}
        >
          Add New Location
        </Button>
      </div>

      <Table
        loading={loading}
        columns={columns}
        dataSource={locations}
        rowKey="id"
      />

      <Modal
        title={editingLocation ? 'Edit Location' : 'Add New Location'}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          setEditingLocation(null);
          form.resetFields();
        }}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            name="name"
            label="Location Name"
            rules={[{ required: true, message: 'Please enter location name' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="address"
            label="Address"
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="city"
            label="City"
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="state"
            label="State"
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="country"
            label="Country"
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="postal_code"
            label="Postal Code"
          >
            <Input />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                {editingLocation ? 'Update' : 'Create'}
              </Button>
              <Button onClick={() => {
                setModalVisible(false);
                setEditingLocation(null);
                form.resetFields();
              }}>
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default LocationManagement;
