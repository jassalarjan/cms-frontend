import React, { useEffect, useState, useContext } from "react";
import API from "../api/axios";
import { AuthContext } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import Loading from "../components/Loading";

const getStatusClass = (status) => {
  switch (status?.toLowerCase()) {
    case 'open':
      return 'status-open';
    case 'in-progress':
    case 'in progress':
      return 'status-in-progress';
    case 'resolved':
      return 'status-resolved';
    case 'closed':
      return 'status-closed';
    case 'pending':
      return 'status-pending';
    default:
      return 'status-pending';
  }
};

export default function CustomerDashboard() {
  const { user } = useContext(AuthContext);
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user) {
      const fetchComplaints = async () => {
        setLoading(true);
        setError(null);
        try {
          const res = await API.get("/complaints/me/list");
          setComplaints(res.data);
        } catch (err) {
          console.error("Error fetching complaints:", err);
          setError("Failed to load complaints. Please try again.");
        } finally {
          setLoading(false);
        }
      };
      fetchComplaints();
    }
  }, [user]);

  if (loading) {
    return (
      <div>
        <Navbar />
        <div className="p-6">
          <Loading />
        </div>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <div className="p-6">
        <h2 className="text-xl font-bold mb-4">My Complaints</h2>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        {complaints.length === 0 ? (
          <p>No complaints found.</p>
        ) : (
          <ul>
            {complaints.map((c) => (
              <li key={c.id} className="p-3 mb-2 border rounded bg-white dark:bg-gray-800">
                <p><strong>Subject:</strong> {c.title}</p>
                <p><strong>Product:</strong> {c.product_name} ({c.product_model})</p>
                <p><strong>Status:</strong> <span className={`status-badge ${getStatusClass(c.status)}`}>{c.status}</span></p>
                <p><strong>Description:</strong> {c.description}</p>
                <p><strong>Priority:</strong> {c.priority}</p>
                <p><strong>Created:</strong> {new Date(c.created_at).toLocaleDateString()}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
