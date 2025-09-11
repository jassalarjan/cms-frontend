import { useState, useContext, useEffect } from "react";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import API from "../api/axios";
import { AuthContext } from "../context/AuthContext";

// Memoized InputField component to prevent re-renders
const InputField = React.memo(({
  field,
  label,
  type = "text",
  placeholder,
  required = false,
  as = "input",
  options = [],
  value,
  error,
  onChange,
}) => {
  // Create a stable onChange handler
  const handleChange = React.useCallback((e) => {
    onChange(field, e.target.value);
  }, [field, onChange]);

  return (
    <div className="mb-4">
      <label
        htmlFor={field}
        className="block text-sm font-medium text-gray-700 mb-1"
      >
        {label} {required && <span className="text-red-500">*</span>}
      </label>

      {as === "textarea" ? (
        <textarea
          id={field}
          placeholder={placeholder}
          className={`input-field resize-none ${
            error ? "border-red-500 focus:ring-red-500" : ""
          }`}
          rows={4}
          value={value}
          onChange={handleChange}
          required={required}
        />
      ) : as === "select" ? (
        <select
          id={field}
          className={`input-field ${
            error ? "border-red-500 focus:ring-red-500" : ""
          }`}
          value={value}
          onChange={handleChange}
          required={required}
        >
          <option value="">Select an option</option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      ) : (
        <input
          id={field}
          type={type}
          placeholder={placeholder}
          className={`input-field ${
            error ? "border-red-500 focus:ring-red-500" : ""
          }`}
          value={value}
          onChange={handleChange}
          required={required}
        />
      )}

      {error && (
        <p className="mt-1 text-sm text-red-600 flex items-center">
          <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
          {error}
        </p>
      )}
    </div>
  );
});

export default function ComplaintForm() {
  const { user } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    title: "",
    product_name: "",
    product_model: "",
    description: "",
    category: "",
    priority: "",
    manufacturing_year: "",
    warranty_handler: "",
    date_of_manufacture: "",
    warranty_status: "N/A",
    customer_id: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Memoize the form change handler
  const handleFormChange = React.useCallback((field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        customer_id: user.id,
      }));
    }
  }, [user]);

  if (!user) {
    return (
      <div className="p-4 text-center text-gray-500">
        Please log in to submit a complaint.
      </div>
    );
  }

  const categories = [
    { value: "PRODUCT_DEFECT", label: "Product Defect" },
    { value: "SERVICE_ISSUE", label: "Service Issue" },
    { value: "DELIVERY_PROBLEM", label: "Delivery Problem" },
    { value: "WARRANTY_CLAIM", label: "Warranty Claim" },
    { value: "BILLING_DISPUTE", label: "Billing Dispute" },
    { value: "OTHER", label: "Other" },
  ];

  const priorities = [
    { value: "LOW", label: "Low" },
    { value: "MEDIUM", label: "Medium" },
    { value: "HIGH", label: "High" },
    { value: "CRITICAL", label: "Critical" },
  ];

  const warrantyOptions = [
    { value: "VALID", label: "Valid" },
    { value: "EXPIRED", label: "Expired" },
    { value: "N/A", label: "N/A" },
  ];

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title || formData.title.trim().length < 5) newErrors.title = "Title must be at least 5 characters";
    if (!formData.description || formData.description.trim().length < 10) newErrors.description = "Description must be at least 10 characters";
    if (!formData.product_name) newErrors.product_name = "Product name is required";
    if (!formData.category) newErrors.category = "Category is required";
    if (!formData.date_of_manufacture) newErrors.date_of_manufacture = "Date of manufacture is required";
    else {
      const date = new Date(formData.date_of_manufacture);
      if (isNaN(date.getTime()) || date > new Date()) {
        newErrors.date_of_manufacture = "Invalid date of manufacture (must be past date)";
      }
    }
    if (!["VALID", "EXPIRED", "N/A"].includes(formData.warranty_status)) newErrors.warranty_status = "Invalid warranty status";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setLoading(true);

      // Map formData to backend expectations
      const submitData = {
        title: formData.title,
        description: formData.description,
        customer_id: formData.customer_id,
        product_name: formData.product_name,
        product_model: formData.product_model,
        category: formData.category,
        priority: formData.priority,
        manufacturing_year: formData.manufacturing_year,
        warranty_handler: formData.warranty_handler,
        date_of_manufacture: formData.date_of_manufacture,
        warranty_status: formData.warranty_status,
      };

      const response = await API.post("/complaints", submitData);

      console.log("✅ Complaint submitted:", response.data);
      alert("Complaint submitted successfully!");

      // Reset form
      setFormData({
        title: "",
        product_name: "",
        product_model: "",
        description: "",
        category: "",
        priority: "",
        manufacturing_year: "",
        warranty_handler: "",
        date_of_manufacture: "",
        warranty_status: "N/A",
        customer_id: user.id,
      });
      setErrors({});
    } catch (error) {
      console.error("❌ Error submitting complaint:", error);
      alert(error.response?.data?.message || "Failed to submit complaint");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <InputField
        field="title"
        label="Complaint Title"
        placeholder="Brief title for the complaint (e.g., 'Defective Product X')"
        required
        value={formData.title}
        error={errors.title}
        onChange={handleInputChange}
      />

      <InputField
        field="product_name"
        label="Product Name"
        placeholder="Enter product name"
        required
        value={formData.product_name}
        error={errors.product_name}
        onChange={handleInputChange}
      />

      <InputField
        field="product_model"
        label="Product Model"
        placeholder="Enter product model (if applicable)"
        value={formData.product_model}
        error={errors.product_model}
        onChange={handleInputChange}
      />

      <InputField
        field="description"
        label="Description"
        as="textarea"
        placeholder="Describe the issue in detail"
        required
        value={formData.description}
        error={errors.description}
        onChange={handleInputChange}
      />

      <InputField
        field="category"
        label="Category"
        as="select"
        required
        value={formData.category}
        error={errors.category}
        onChange={handleInputChange}
        options={categories}
      />

      <InputField
        field="priority"
        label="Priority"
        as="select"
        value={formData.priority}
        error={errors.priority}
        onChange={handleInputChange}
        options={priorities}
      />

      <InputField
        field="manufacturing_year"
        label="Manufacturing Year"
        type="number"
        placeholder="Enter manufacturing year"
        value={formData.manufacturing_year}
        error={errors.manufacturing_year}
        onChange={handleInputChange}
      />

      <InputField
        field="warranty_handler"
        label="Warranty Handler"
        placeholder="Enter warranty handler (e.g., manufacturer name)"
        value={formData.warranty_handler}
        error={errors.warranty_handler}
        onChange={handleInputChange}
      />

      <InputField
        field="date_of_manufacture"
        label="Date of Manufacture"
        type="date"
        required
        value={formData.date_of_manufacture}
        error={errors.date_of_manufacture}
        onChange={handleInputChange}
      />

      <InputField
        field="warranty_status"
        label="Warranty Status"
        as="select"
        value={formData.warranty_status}
        error={errors.warranty_status}
        onChange={handleInputChange}
        options={warrantyOptions}
      />

      <button
        type="submit"
        disabled={loading}
        className={`btn-primary w-full py-2 px-4 rounded-md ${
          loading ? "opacity-50 cursor-not-allowed" : ""
        }`}
      >
        {loading ? "Submitting..." : "Submit Complaint"}
      </button>
    </form>
  );
}
