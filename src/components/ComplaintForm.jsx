import { useState, useContext, useEffect } from "react";
import API from "../api/axios";
import { AuthContext } from "../context/AuthContext";
import LocationSelector from "./LocationSelector";
import MediaUpload from "./MediaUpload";
import toast from 'react-hot-toast';

export default function ComplaintForm({ supplierId, onSuccess }) {
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
    zone_id: "",
    circle_id: "",
    branch_id: "",
    system_integrator_name: "",
    system_integrator_phone: "",
    system_integrator_email: "",
    system_integrator_company: "",
    client_name: user?.name || "",
    date_of_manufacture: getToday(),
  });
  
  const [zones, setZones] = useState([]);
  const [circles, setCircles] = useState([]);
  const [filteredCircles, setFilteredCircles] = useState([]);
  const [mediaFiles, setMediaFiles] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setForm(f => ({
      ...f,
      customer_id: user?.id || "",
      client_name: user?.name || "",
    }));

    // Fetch zones and circles
    const fetchLocations = async () => {
      try {
        const [zonesRes, circlesRes] = await Promise.all([
          API.get("/locations/zones"),
          API.get("/locations")
        ]);

        if (zonesRes.data.success) {
          setZones(zonesRes.data.data || []);
        } else {
          setZones([]);
        }

        if (circlesRes.data.success) {
          const circlesData = circlesRes.data.data.filter(loc => loc.type === 'CIRCLE');
          setCircles(circlesData || []);
        } else {
          setCircles([]);
        }
      } catch (err) {
        setZones([]);
        setCircles([]);
      }
    };
    fetchLocations();
  }, [user]);

  // Filter circles based on selected zone
  useEffect(() => {
    if (form.zone_id) {
      const filtered = circles.filter(circle => circle.parent_id === parseInt(form.zone_id));
      setFilteredCircles(filtered);
    } else {
      setFilteredCircles([]);
    }
  }, [form.zone_id, circles]);

  const [submittedComplaint, setSubmittedComplaint] = useState(null);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });

    // Reset circle selection when zone changes
    if (name === 'zone_id') {
      setForm(prev => ({ ...prev, circle_id: '' }));
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!user || !user.id) {
      toast.error("You must be logged in to submit a complaint.");
      return;
    }
    
    setSubmitting(true);
    const toastId = toast.loading('Submitting complaint...');
    
    const payload = {
      ...form,
      customer_id: parseInt(user.id, 10),
      zone_id: form.zone_id ? parseInt(form.zone_id, 10) : null,
      circle_id: form.circle_id ? parseInt(form.circle_id, 10) : null,
      location_id: form.circle_id ? parseInt(form.circle_id, 10) : parseInt(form.zone_id, 10),
      date_of_manufacture: form.date_of_manufacture,
    };
    try {
      // Step 1: Create the complaint
      const res = await API.post("/complaints", payload);
      const complaintData = res.data.data; // { id, complaint_id, ... }
      
      toast.loading('Complaint created! Uploading attachments...', { id: toastId });
      
      // Step 2: Upload media files if any
      if (mediaFiles && mediaFiles.length > 0) {
        console.log(`Uploading ${mediaFiles.length} media file(s)...`);
        const uploadPromises = mediaFiles.map(async (mediaFile) => {
          try {
            const formData = new FormData();
            formData.append('file', mediaFile.file);
            formData.append('resource_type', mediaFile.isVideo ? 'video' : 'image');
            formData.append('complaint_id', complaintData.id);
            
            const uploadRes = await API.post('/upload', formData, {
              headers: {
                'Content-Type': 'multipart/form-data',
              },
            });
            
            // Store attachment info in database
            if (uploadRes.data.success) {
              await API.post('/complaints/attachments', {
                complaint_id: complaintData.id,
                file_url: uploadRes.data.data.url,
                file_name: mediaFile.name,
                file_size: mediaFile.size,
                mime_type: mediaFile.type,
                public_id: uploadRes.data.data.public_id,
              });
            }
            
            return uploadRes.data;
          } catch (uploadErr) {
            console.error(`Failed to upload ${mediaFile.name}:`, uploadErr);
            return { success: false, error: uploadErr.message };
          }
        });
        
        const uploadResults = await Promise.all(uploadPromises);
        const successfulUploads = uploadResults.filter(r => r.success).length;
        const failedUploads = uploadResults.filter(r => !r.success).length;
        
        if (failedUploads > 0) {
          toast.success(`Complaint created! ${successfulUploads} file(s) uploaded, ${failedUploads} failed.`, { id: toastId });
        } else {
          toast.success(`Complaint created successfully with ${successfulUploads} attachment(s)!`, { id: toastId });
        }
      } else {
        toast.success('Complaint created successfully!', { id: toastId });
      }
      
      setSubmittedComplaint(complaintData);
      
      // Call success callback if provided
      if (onSuccess && typeof onSuccess === 'function') {
        onSuccess(complaintData);
      }
    } catch (err) {
      console.error("Error submitting complaint:", err);
      console.error("Response status:", err.response?.status);
      console.error("Response data:", err.response?.data);
      console.error("Full error details:", err.response?.data?.errors);
      console.error("Request payload sent:", payload);

      if (err.response?.status === 400 && err.response?.data?.errors) {
        // Validation errors - show specific field errors
        const errorMessages = Object.entries(err.response.data.errors)
          .map(([field, message]) => `${field}: ${message}`)
          .join("\n");
        toast.error(`Validation failed:\n${errorMessages}`, { id: toastId, duration: 5000 });
      } else if (err.response?.data?.message) {
        toast.error(`Server error: ${err.response.data.message}`, { id: toastId });
      } else {
        toast.error("Failed to submit complaint. Please try again.", { id: toastId });
      }
    } finally {
      setSubmitting(false);
    }
  }

  function copyToClipboard(text) {
    navigator.clipboard.writeText(text);
    alert("Complaint ID copied!");
  }
return (
  <div className="max-w-4xl mx-auto p-8 bg-white dark:bg-gray-800 shadow-xl rounded-2xl border border-gray-100 dark:border-gray-700">
    {!submittedComplaint ? (
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Submit Complaint</h2>
          <p className="text-gray-600 dark:text-gray-300">Please provide detailed information about your complaint</p>
        </div>

        {/* Basic Information Section */}
        <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6 border-2 border-dashed border-gray-200 dark:border-gray-600">
          <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-6 flex items-center">
            <svg className="w-6 h-6 mr-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Basic Information
          </h3>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">
                Complaint Title <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  name="title"
                  placeholder="Brief description of the issue..."
                  required
                  value={form.title}
                  onChange={handleChange}
                  className="w-full px-4 py-3 pl-12 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                />
                <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                  <svg className="w-5 h-5 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                  </svg>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">
                Detailed Description <span className="text-red-500">*</span>
              </label>
              <textarea
                name="description"
                placeholder="Please provide a detailed description of the issue, including when it occurred, what you were doing, and any error messages..."
                required
                value={form.description}
                onChange={handleChange}
                rows={4}
                className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 resize-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">
                  Category <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    name="category"
                    value={form.category}
                    onChange={handleChange}
                    className="w-full px-4 py-3 pl-12 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="PRODUCT_DEFECT">🏭 Product Defect</option>
                    <option value="SERVICE_ISSUE">🔧 Service Issue</option>
                    <option value="DELIVERY_PROBLEM">🚚 Delivery Problem</option>
                    <option value="WARRANTY_CLAIM">🛡️ Warranty Claim</option>
                    <option value="BILLING_DISPUTE">💰 Billing Dispute</option>
                    <option value="OTHER">❓ Other</option>
                  </select>
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                    <svg className="w-5 h-5 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">
                  Priority Level <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    name="priority"
                    value={form.priority}
                    onChange={handleChange}
                    className="w-full px-4 py-3 pl-12 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="LOW">🟢 Low</option>
                    <option value="MEDIUM">🟡 Medium</option>
                    <option value="HIGH">🟠 High</option>
                    <option value="CRITICAL">🔴 Critical</option>
                  </select>
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                    <svg className="w-5 h-5 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Location Information Section */}
        <div className="bg-blue-50 dark:bg-gray-700 rounded-xl p-6 border-2 border-dashed border-blue-200 dark:border-gray-600">
          <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-6 flex items-center">
            <svg className="w-6 h-6 mr-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Location Information
            <span className="text-sm font-normal text-red-500 ml-2">* (Zone required)</span>
          </h3>

          <LocationSelector
            value={{
              zone_id: form.zone_id,
              circle_id: form.circle_id,
              branch_id: form.branch_id
            }}
            onChange={(locations) => {
              setForm({ ...form, ...locations });
            }}
            required={true}
            showLabel={false}
          />
        </div>

        {/* Product Information Section */}
        <div className="bg-green-50 dark:bg-gray-700 rounded-xl p-6 border-2 border-dashed border-green-200 dark:border-gray-600">
          <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-6 flex items-center">
            <svg className="w-6 h-6 mr-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            Product Information
            <span className="text-sm font-normal text-red-500 ml-2">* (All fields required)</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">
                Product Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  name="product_name"
                  placeholder="Enter product name..."
                  value={form.product_name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 pl-12 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                />
                <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                  <svg className="w-5 h-5 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">
                Product Model <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  name="product_model"
                  placeholder="Enter product model..."
                  value={form.product_model}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 pl-12 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                />
                <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                  <svg className="w-5 h-5 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">
                Manufacturing Year <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  name="manufacturing_year"
                  type="number"
                  placeholder="e.g., 2023"
                  value={form.manufacturing_year}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 pl-12 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-200 bg-white text-gray-900 placeholder-gray-400"
                />
                <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">
                Warranty Handler <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  name="warranty_handler"
                  placeholder="Warranty provider name..."
                  value={form.warranty_handler}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 pl-12 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-200 bg-white text-gray-900 placeholder-gray-400"
                />
                <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <label className="block text-sm font-semibold text-gray-800 mb-2">
              Date of Manufacture <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                name="date_of_manufacture"
                type="date"
                required
                value={form.date_of_manufacture}
                onChange={handleChange}
                className="w-full px-4 py-3 pl-12 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-200 bg-white text-gray-900"
              />
              <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* System Integrator Information Section */}
        <div className="bg-purple-50 dark:bg-gray-700 rounded-xl p-6 border-2 border-dashed border-purple-200 dark:border-gray-600">
          <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-6 flex items-center">
            <svg className="w-6 h-6 mr-3 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            System Integrator Information
            <span className="text-sm font-normal text-red-500 ml-2">* (All fields required)</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">
                Full Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  name="system_integrator_name"
                  placeholder="Enter full name..."
                  value={form.system_integrator_name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 pl-12 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                />
                <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                  <svg className="w-5 h-5 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  name="system_integrator_phone"
                  placeholder="+1 (555) 123-4567"
                  value={form.system_integrator_phone}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 pl-12 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                />
                <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                  <svg className="w-5 h-5 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">
                Email Address <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  name="system_integrator_email"
                  type="email"
                  placeholder="integrator@company.com"
                  value={form.system_integrator_email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 pl-12 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                />
                <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                  <svg className="w-5 h-5 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">
                Company Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  name="system_integrator_company"
                  placeholder="Company name..."
                  value={form.system_integrator_company}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 pl-12 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                />
                <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                  <svg className="w-5 h-5 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Media Upload Section */}
        <div className="bg-orange-50 dark:bg-gray-700 rounded-xl p-6 border-2 border-dashed border-orange-200 dark:border-gray-600">
          <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-6 flex items-center">
            <svg className="w-6 h-6 mr-3 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Upload Images & Videos
            <span className="text-sm font-normal text-gray-500 dark:text-gray-400 ml-2">(Optional)</span>
          </h3>

          <MediaUpload
            onFilesChange={(files) => setMediaFiles(files)}
            maxFiles={10}
            maxImageSize={10 * 1024 * 1024}
            maxVideoSize={100 * 1024 * 1024}
            multiple={true}
          />
        </div>

        {/* Submit Button */}
        <div className="pt-6 border-t border-gray-200">
          <button
            type="submit"
            disabled={submitting}
            className={`w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 px-6 rounded-xl hover:from-blue-700 hover:to-blue-800 transform hover:scale-105 transition-all duration-200 font-semibold text-lg shadow-lg hover:shadow-xl flex items-center justify-center ${submitting ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {submitting ? (
              <>
                <svg className="animate-spin h-6 w-6 mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Submitting...
              </>
            ) : (
              <>
                <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
                Submit Complaint
              </>
            )}
          </button>
        </div>
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
