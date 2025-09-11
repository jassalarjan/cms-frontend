import React, { useEffect, useState, useContext } from "react";
import API from "../api/axios";
import { AuthContext } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import Loading from "../components/Loading";

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
              <li key={c.id} className="p-3 mb-2 border rounded">
                <p><strong>Subject:</strong> {c.title}</p>
                <p><strong>Product:</strong> {c.product_name} ({c.product_model})</p>
                <p><strong>Status:</strong> {c.status}</p>
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
