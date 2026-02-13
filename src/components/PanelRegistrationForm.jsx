import { useState, useContext, useEffect } from "react";
import API from "../api/axios";
import { AuthContext } from "../context/AuthContext";
import LocationSelector from "./LocationSelector";
import toast from 'react-hot-toast';

export default function PanelRegistrationForm({ onSuccess }) {
  const { user } = useContext(AuthContext);
  const getToday = () => new Date().toISOString().split("T")[0];
  
  const [form, setForm] = useState({
    // Product Information
    panel_type: "",
    panel_model: "",
    panel_capacity: "",
    serial_number: "",
    manufacturer: "",
    manufacturing_date: "",
    installation_date: getToday(),
    warranty_period: "",
    warranty_expiry: "",
    
    // Location
    zone_id: "",
    circle_id: "",
    branch_id: "",
    installation_address: "",
    installation_city: "",
    installation_state: "",
    installation_postal_code: "",
    
    // System Integrator
    integrator_name: "",
    integrator_company: "",
    integrator_phone: "",
    integrator_email: "",
    
    // Additional Details
    inverter_model: "",
    inverter_serial: "",
    battery_model: "",
    battery_serial: "",
    total_system_capacity: "",
    notes: ""
  });

  const [submittedRegistration, setSubmittedRegistration] = useState(null);
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!user || !user.id) {
      toast.error("You must be logged in to register a panel.");
      return;
    }

    setLoading(true);
    
    const payload = {
      ...form,
      zone_id: form.zone_id ? parseInt(form.zone_id, 10) : null,
      circle_id: form.circle_id ? parseInt(form.circle_id, 10) : null,
      branch_id: form.branch_id ? parseInt(form.branch_id, 10) : null,
      warranty_period: form.warranty_period ? parseInt(form.warranty_period, 10) : null,
    };

    try {
      const res = await API.post("/panels", payload);
      const registrationData = res.data.data;
      setSubmittedRegistration(registrationData);
      toast.success("Panel registered successfully!");
      
      if (onSuccess && typeof onSuccess === 'function') {
        onSuccess(registrationData);
      }
    } catch (err) {
      console.error("Error registering panel:", err);
      
      if (err.response?.status === 400 && err.response?.data?.errors) {
        const errorMessages = Object.entries(err.response.data.errors)
          .map(([field, message]) => `${field}: ${message}`)
          .join("\n");
        toast.error(`Validation failed:\n${errorMessages}`);
      } else if (err.response?.data?.message) {
        toast.error(`Server error: ${err.response.data.message}`);
      } else {
        toast.error("Failed to register panel. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  function copyToClipboard(text) {
    navigator.clipboard.writeText(text);
    toast.success("Registration ID copied!");
  }

  if (submittedRegistration) {
    return (
      <div className="max-w-2xl mx-auto p-8 bg-white dark:bg-gray-800 shadow-xl rounded-2xl border border-gray-100 dark:border-gray-700">
        <div className="text-center">
          <div className="mb-6">
            <div className="w-20 h-20 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Panel Registered Successfully! 
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Your panel has been registered in our system
            </p>
          </div>
          
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Registration ID:</p>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={submittedRegistration.registration_id}
                readOnly
                className="flex-1 border-2 border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 text-center font-mono text-lg font-bold bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
              <button
                type="button"
                onClick={() => copyToClipboard(submittedRegistration.registration_id)}
                className="bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </button>
            </div>
          </div>

          <button
            onClick={() => {
              setSubmittedRegistration(null);
              setForm({
                panel_type: "",
                panel_model: "",
                panel_capacity: "",
                serial_number: "",
                manufacturer: "",
                manufacturing_date: "",
                installation_date: getToday(),
                warranty_period: "",
                warranty_expiry: "",
                zone_id: "",
                circle_id: "",
                branch_id: "",
                installation_address: "",
                installation_city: "",
                installation_state: "",
                installation_postal_code: "",
                integrator_name: "",
                integrator_company: "",
                integrator_phone: "",
                integrator_email: "",
                inverter_model: "",
                inverter_serial: "",
                battery_model: "",
                battery_serial: "",
                total_system_capacity: "",
                notes: ""
              });
            }}
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-medium"
          >
            Register Another Panel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-8 bg-white dark:bg-gray-800 shadow-xl rounded-2xl border border-gray-100 dark:border-gray-700">
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Panel Registration</h2>
          <p className="text-gray-600 dark:text-gray-300">Register your solar panel system</p>
        </div>

        {/* Product Information */}
        <div className="bg-green-50 dark:bg-gray-700 rounded-xl p-6 border-2 border-dashed border-green-200 dark:border-gray-600">
          <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-6 flex items-center">
            <svg className="w-6 h-6 mr-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
            </svg>
            Panel Product Information
            <span className="text-sm font-normal text-red-500 ml-2">* Required</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">
                Panel Type <span className="text-red-500">*</span>
              </label>
              <input
                name="panel_type"
                placeholder="e.g., Monocrystalline, Polycrystalline"
                required
                value={form.panel_type}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">
                Panel Model <span className="text-red-500">*</span>
              </label>
              <input
                name="panel_model"
                placeholder="Enter panel model"
                required
                value={form.panel_model}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">
                Panel Capacity <span className="text-red-500">*</span>
              </label>
              <input
                name="panel_capacity"
                placeholder="e.g., 5 kW, 10 kW"
                required
                value={form.panel_capacity}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">
                Serial Number <span className="text-red-500">*</span>
              </label>
              <input
                name="serial_number"
                placeholder="Enter serial number"
                required
                value={form.serial_number}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">
                Manufacturer <span className="text-red-500">*</span>
              </label>
              <input
                name="manufacturer"
                placeholder="Enter manufacturer name"
                required
                value={form.manufacturer}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">
                Manufacturing Date
              </label>
              <input
                name="manufacturing_date"
                type="date"
                value={form.manufacturing_date}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">
                Installation Date
              </label>
              <input
                name="installation_date"
                type="date"
                value={form.installation_date}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">
                Warranty Period (months)
              </label>
              <input
                name="warranty_period"
                type="number"
                placeholder="e.g., 60, 120"
                value={form.warranty_period}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">
                Warranty Expiry Date
              </label>
              <input
                name="warranty_expiry"
                type="date"
                value={form.warranty_expiry}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">
                Total System Capacity
              </label>
              <input
                name="total_system_capacity"
                placeholder="e.g., 15 kW"
                value={form.total_system_capacity}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>
        </div>

        {/* Location Information */}
        <div className="bg-blue-50 dark:bg-gray-700 rounded-xl p-6 border-2 border-dashed border-blue-200 dark:border-gray-600">
          <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-6 flex items-center">
            <svg className="w-6 h-6 mr-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            </svg>
            Installation Location
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
            required={false}
            showLabel={false}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div>
              <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">
                Installation Address
              </label>
              <input
                name="installation_address"
                placeholder="Street address"
                value={form.installation_address}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">
                City
              </label>
              <input
                name="installation_city"
                placeholder="City"
                value={form.installation_city}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">
                State
              </label>
              <input
                name="installation_state"
                placeholder="State"
                value={form.installation_state}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">
                Postal Code
              </label>
              <input
                name="installation_postal_code"
                placeholder="Postal code"
                value={form.installation_postal_code}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>
        </div>

        {/* System Integrator Information */}
        <div className="bg-purple-50 dark:bg-gray-700 rounded-xl p-6 border-2 border-dashed border-purple-200 dark:border-gray-600">
          <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-6 flex items-center">
            <svg className="w-6 h-6 mr-3 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            System Integrator (Installer)
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">
                Integrator Name
              </label>
              <input
                name="integrator_name"
                placeholder="Full name"
                value={form.integrator_name}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">
                Company Name
              </label>
              <input
                name="integrator_company"
                placeholder="Company name"
                value={form.integrator_company}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">
                Phone Number
              </label>
              <input
                name="integrator_phone"
                placeholder="+1 (555) 123-4567"
                value={form.integrator_phone}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">
                Email Address
              </label>
              <input
                name="integrator_email"
                type="email"
                placeholder="email@company.com"
                value={form.integrator_email}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>
        </div>

        {/* Additional Equipment */}
        <div className="bg-yellow-50 dark:bg-gray-700 rounded-xl p-6 border-2 border-dashed border-yellow-200 dark:border-gray-600">
          <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-6 flex items-center">
            <svg className="w-6 h-6 mr-3 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Additional Equipment (Optional)
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">
                Inverter Model
              </label>
              <input
                name="inverter_model"
                placeholder="Inverter model"
                value={form.inverter_model}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">
                Inverter Serial Number
              </label>
              <input
                name="inverter_serial"
                placeholder="Serial number"
                value={form.inverter_serial}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">
                Battery Model
              </label>
              <input
                name="battery_model"
                placeholder="Battery model"
                value={form.battery_model}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">
                Battery Serial Number
              </label>
              <input
                name="battery_serial"
                placeholder="Serial number"
                value={form.battery_serial}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>

          <div className="mt-6">
            <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">
              Additional Notes
            </label>
            <textarea
              name="notes"
              rows={4}
              placeholder="Any additional information about the installation..."
              value={form.notes}
              onChange={handleChange}
              className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
            />
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-green-600 to-blue-600 text-white py-4 px-6 rounded-xl hover:from-green-700 hover:to-blue-700 transform hover:scale-105 transition-all duration-200 font-semibold text-lg shadow-lg hover:shadow-xl flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-6 w-6 mr-3" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                </svg>
                Registering...
              </>
            ) : (
              <>
                <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Register Panel
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
