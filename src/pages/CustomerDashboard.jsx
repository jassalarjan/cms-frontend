import React, { useEffect, useState, useContext } from "react";
import API from "../api/axios";
import { AuthContext } from "../context/AuthContext";
import Navbar from "../components/Navbar";

export default function CustomerDashboard() {
  const { user } = useContext(AuthContext);
  const [complaints, setComplaints] = useState([]);

  useEffect(() => {
    if (user) {
      API.get("/complaints-enhanced").then((res) => {
        // Filter complaints for this customer
        const filtered = res.data.filter(c => c.customer_id === user.user_id);
        setComplaints(filtered);
      });
    }
  }, [user]);

  return (
    <div>
      <Navbar />
      <div className="p-6">
        <h2 className="text-xl font-bold mb-4">My Complaints</h2>
      <ul>
        {complaints.map((c) => (
          <li key={c.complaint_id} className="p-3 mb-2 border rounded">
            <p><strong>Product:</strong> {c.product_name} ({c.product_model})</p>
            <p><strong>Status:</strong> {c.status}</p>
            <p><strong>Description:</strong> {c.description}</p>
          </li>
        ))}
      </ul>
      </div>
    </div>
  );
}
