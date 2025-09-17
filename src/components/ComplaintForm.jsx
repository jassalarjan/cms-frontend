import { useState, useContext, useEffect } from "react";
import API from "../api/axios";
import { AuthContext } from "../context/AuthContext";

export default function ComplaintForm({ supplierId }) {
  const { user } = useContext(AuthContext);
  const getToday = () => new Date().toISOString().split("T")[0];
  const [form, setForm] = useState({
    title: "",
    description: "",
    product_name: "",
    product_model: "",
    manufacturing_year: "",
    warranty_handler: "",
    category: "PRODUCT_DEFECT",
    priority: "MEDIUM",
    customer_id: user?.id || "",
    location_id: "",
    client_name: user?.name || "",
    date_of_manufacture: getToday(),
  });
  
  const [locations, setLocations] = useState([]);

  useEffect(() => {
    setForm(f => ({
      ...f,
      customer_id: user?.id || "",
      client_name: user?.name || "",
    }));
    
    // Fetch locations
    const fetchLocations = async () => {
      try {
        const res = await API.get("/locations");
        if (res.data.success) {
          setLocations(res.data.data || []);
        } else {
          setLocations([]);
        }
      } catch (err) {
        console.error("Error fetching locations:", err);
        setLocations([]);
      }
    };
    fetchLocations();
  }, [user]);

  const [submittedComplaint, setSubmittedComplaint] = useState(null);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!user || !user.id) {
      alert("You must be logged in to submit a complaint.");
      return;
    }
    const payload = {
      ...form,
      customer_id: parseInt(user.id, 10),
      location_id: parseInt(form.location_id, 10),
      date_of_manufacture: form.date_of_manufacture || getToday(),
    };
    try {
      const res = await API.post("/complaints", payload);
      setSubmittedComplaint(res.data.data); // { id, complaint_id, ... }
    } catch (err) {
      console.error("Error submitting complaint:", err);
      if (err.response?.data?.errors) {
        alert(Object.values(err.response.data.errors).join("\n"));
      }
    }
  }

  function copyToClipboard(text) {
    navigator.clipboard.writeText(text);
    alert("Complaint ID copied!");
  }

  return (
    <div className="max-w-lg mx-auto p-6 bg-white shadow rounded">
      {!submittedComplaint ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <h2 className="text-xl font-bold mb-4">Submit Complaint</h2>

          <input
            name="title"
            placeholder="Complaint Title"
            required
            value={form.title}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
          />

          <textarea
            name="description"
            placeholder="Description"
            required
            value={form.description}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
          />

          <select
            name="location_id"
            value={form.location_id}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
            required
          >
            <option value="">Select Location</option>
            {locations.map((location) => (
              <option key={location.id} value={location.id}>
                {location.name}
              </option>
            ))}
          </select>

          <input
            name="product_name"
            placeholder="Product Name"
            value={form.product_name}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
          />

          <input
            name="product_model"
            placeholder="Product Model"
            value={form.product_model}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
          />

          <input
            name="manufacturing_year"
            type="number"
            placeholder="Manufacturing Year"
            value={form.manufacturing_year}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
          />

          <input
            name="warranty_handler"
            placeholder="Warranty Handler"
            value={form.warranty_handler}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
          />

          <select
            name="category"
            value={form.category}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
          >
            <option value="PRODUCT_DEFECT">Product Defect</option>
            <option value="SERVICE_ISSUE">Service Issue</option>
            <option value="DELIVERY_PROBLEM">Delivery Problem</option>
            <option value="WARRANTY_CLAIM">Warranty Claim</option>
            <option value="BILLING_DISPUTE">Billing Dispute</option>
            <option value="OTHER">Other</option>
          </select>

          <select
            name="priority"
            value={form.priority}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
          >
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
            <option value="CRITICAL">Critical</option>
          </select>
          
          {/* Client name is derived from user, no input needed */}

          <input
            name="date_of_manufacture"
            type="date"
            placeholder="Date of Manufacture"
            required
            value={form.date_of_manufacture}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
          />

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
          >
            Submit Complaint
          </button>
        </form>
      ) : (
        <div className="text-center">
          <h3 className="text-lg font-bold mb-2">
            Complaint Submitted Successfully ✅
          </h3>
          <p className="mb-2">Complaint ID:</p>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={submittedComplaint.complaint_id}
              readOnly
              className="flex-1 border rounded px-3 py-2"
            />
            <button
              type="button"
              onClick={() => copyToClipboard(submittedComplaint.complaint_id)}
              className="bg-gray-600 text-white px-3 py-2 rounded hover:bg-gray-700"
            >
              Copy
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
