import React, { useState, useEffect } from "react";
import API from "../api/axios";
import Navbar from "../components/Navbar";

export default function SupplierDashboard() {
  const [form, setForm] = useState({
    customer_id: "",
    product_name: "",
    product_model: "",
    manufacturing_year: "",
    warranty_handler: "",
    description: "",
  });
  const [complaints, setComplaints] = useState([]);
  const [customers, setCustomers] = useState([]);

  useEffect(() => {
    fetchComplaints();
    fetchCustomers();
  }, []);

  const fetchComplaints = async () => {
    try {
      const res = await API.get("/complaints-enhanced");
      setComplaints(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchCustomers = async () => {
    try {
      const res = await API.get("/admin/users");
      setCustomers(res.data.filter(u => u.role === "CUSTOMER"));
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post("/complaints-enhanced", form);
      alert("Complaint created");
      setForm({
        customer_id: "",
        product_name: "",
        product_model: "",
        manufacturing_year: "",
        warranty_handler: "",
        description: "",
      });
      fetchComplaints();
    } catch (err) {
      alert("Failed to create complaint");
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await API.patch(`/complaints-enhanced/${id}/status`, { status });
      fetchComplaints();
    } catch (err) {
      alert("Failed to update status");
    }
  };

  return (
    <div>
      <Navbar />
      <div className="p-6">
        <h2 className="text-xl font-bold mb-4">Supplier Dashboard</h2>

      {/* Create Complaint Form */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-2">Create Complaint</h3>
        <form onSubmit={handleSubmit} className="space-y-3">
          <select
            className="border p-2 w-full rounded"
            value={form.customer_id}
            onChange={(e) => setForm({ ...form, customer_id: e.target.value })}
            required
          >
            <option value="">Select Customer</option>
            {customers.map((c) => (
              <option key={c.user_id} value={c.user_id}>
                {c.name} ({c.email})
              </option>
            ))}
          </select>
          <input
            type="text"
            placeholder="Product Name"
            className="border p-2 w-full rounded"
            value={form.product_name}
            onChange={(e) => setForm({ ...form, product_name: e.target.value })}
            required
          />
          <input
            type="text"
            placeholder="Product Model"
            className="border p-2 w-full rounded"
            value={form.product_model}
            onChange={(e) => setForm({ ...form, product_model: e.target.value })}
          />
          <input
            type="number"
            placeholder="Manufacturing Year"
            className="border p-2 w-full rounded"
            value={form.manufacturing_year}
            onChange={(e) => setForm({ ...form, manufacturing_year: e.target.value })}
          />
          <input
            type="text"
            placeholder="Warranty Handler"
            className="border p-2 w-full rounded"
            value={form.warranty_handler}
            onChange={(e) => setForm({ ...form, warranty_handler: e.target.value })}
          />
          <textarea
            placeholder="Description"
            className="border p-2 w-full rounded"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            required
          />
          <button className="bg-green-600 text-white px-4 py-2 rounded">Submit</button>
        </form>
      </div>

      {/* Complaints List */}
      <div>
        <h3 className="text-lg font-semibold mb-2">My Complaints</h3>
        <ul className="space-y-2">
          {complaints.map((c) => (
            <li key={c.complaint_id} className="p-4 border rounded">
              <p><strong>Product:</strong> {c.product_name} ({c.product_model})</p>
              <p><strong>Status:</strong> {c.status}</p>
              <p><strong>Description:</strong> {c.description}</p>
              <div className="mt-2">
                <select
                  className="border p-1 rounded mr-2"
                  onChange={(e) => updateStatus(c.complaint_id, e.target.value)}
                  value={c.status}
                >
                  <option value="OPEN">Open</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="RESOLVED">Resolved</option>
                  <option value="CLOSED">Closed</option>
                </select>
                <button
                  className="bg-blue-500 text-white px-2 py-1 rounded"
                  onClick={() => updateStatus(c.complaint_id, c.status)}
                >
                  Update Status
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
      </div>
    </div>
  );
}
