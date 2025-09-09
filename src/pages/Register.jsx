import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../api/axios";
import {
  UserPlusIcon,
  UserIcon,
  EnvelopeIcon,
  LockClosedIcon,
  PhoneIcon,
  MapPinIcon,
  BriefcaseIcon,
  EyeIcon,
  EyeSlashIcon,
  ExclamationCircleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import Loading from '../components/Loading';

export default function Register() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "",
    phone: "",
    address: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [currentStep, setCurrentStep] = useState(1);
  const navigate = useNavigate();

  const validateStep = (step) => {
    const newErrors = {};
    
    if (step === 1) {
      if (!formData.name.trim()) newErrors.name = "Name is required";
      if (!formData.email.trim()) {
        newErrors.email = "Email is required";
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = "Please enter a valid email";
      }
      if (!formData.password) {
        newErrors.password = "Password is required";
      } else if (formData.password.length < 6) {
        newErrors.password = "Password must be at least 6 characters";
      }
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = "Passwords don't match";
      }
    }
    
    if (step === 2) {
      if (!formData.role) newErrors.role = "Please select a role";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(2);
    } else {
      toast.error("Please fix the errors below");
    }
  };

  const handleBack = () => {
    setCurrentStep(1);
    setErrors({});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateStep(2)) {
      toast.error("Please fix the errors below");
      return;
    }
    
    setLoading(true);
    try {
      const { confirmPassword, ...submitData } = formData;
      await API.post("/auth/register", submitData);
      toast.success("Registration submitted successfully! Please wait for admin approval.");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      console.error('Registration error:', err);
      const errorMessage = err.response?.data?.error || "Registration failed. Please try again.";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const InputField = ({ field, label, type = "text", placeholder, icon: Icon, required = false, showToggle = false }) => {
    const isPassword = type === 'password';
    const showPasswordValue = field === 'password' ? showPassword : showConfirmPassword;
    const togglePassword = field === 'password' ? setShowPassword : setShowConfirmPassword;
    
    return (
      <div className="mb-4">
        <label htmlFor={field} className="block text-sm font-medium text-gray-700 mb-1">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Icon className="h-5 w-5 text-gray-400" />
          </div>
          <input
            id={field}
            type={isPassword ? (showPasswordValue ? 'text' : 'password') : type}
            placeholder={placeholder}
            className={`input-field pl-10 ${showToggle ? 'pr-10' : ''} ${
              errors[field] ? 'border-red-500 focus:ring-red-500' : ''
            }`}
            value={formData[field]}
            onChange={(e) => handleInputChange(field, e.target.value)}
            required={required}
          />
          {showToggle && (
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
              onClick={() => togglePassword(!showPasswordValue)}
            >
              {showPasswordValue ? (
                <EyeSlashIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
              ) : (
                <EyeIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
              )}
            </button>
          )}
          {errors[field] && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <ExclamationCircleIcon className="h-5 w-5 text-red-500" />
            </div>
          )}
        </div>
        {errors[field] && (
          <p className="mt-1 text-sm text-red-600 flex items-center">
            <ExclamationCircleIcon className="h-4 w-4 mr-1" />
            {errors[field]}
          </p>
        )}
      </div>
    );
  };

  const SelectField = ({ field, label, options, required = false }) => (
    <div className="mb-4">
      <label htmlFor={field} className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <BriefcaseIcon className="h-5 w-5 text-gray-400" />
        </div>
        <select
          id={field}
          className={`input-field pl-10 ${
            errors[field] ? 'border-red-500 focus:ring-red-500' : ''
          }`}
          value={formData[field]}
          onChange={(e) => handleInputChange(field, e.target.value)}
          required={required}
        >
          <option value="">Select {label}</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {errors[field] && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <ExclamationCircleIcon className="h-5 w-5 text-red-500" />
          </div>
        )}
      </div>
      {errors[field] && (
        <p className="mt-1 text-sm text-red-600 flex items-center">
          <ExclamationCircleIcon className="h-4 w-4 mr-1" />
          {errors[field]}
        </p>
      )}
    </div>
  );

  const TextareaField = ({ field, label, placeholder }) => (
    <div className="mb-4">
      <label htmlFor={field} className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <div className="relative">
        <div className="absolute top-3 left-3 pointer-events-none">
          <MapPinIcon className="h-5 w-5 text-gray-400" />
        </div>
        <textarea
          id={field}
          rows={3}
          placeholder={placeholder}
          className="input-field pl-10 resize-none"
          value={formData[field]}
          onChange={(e) => handleInputChange(field, e.target.value)}
        />
      </div>
    </div>
  );

  const roleOptions = [
    { value: 'SUPPLIER', label: 'Supplier - I provide products/services' },
    { value: 'CUSTOMER', label: 'Customer - I purchase products/services' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-blue-600 rounded-full flex items-center justify-center mb-4">
            <UserPlusIcon className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Create Account</h2>
          <p className="text-sm text-gray-600">Join our complaint management system</p>
        </div>

        {/* Progress Indicator */}
        <div className="flex items-center justify-center space-x-4 mb-8">
          <div className={`flex items-center ${
            currentStep >= 1 ? 'text-blue-600' : 'text-gray-400'
          }`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
              currentStep >= 1 ? 'border-blue-600 bg-blue-600 text-white' : 'border-gray-300'
            }`}>
              {currentStep > 1 ? (
                <CheckCircleIcon className="h-5 w-5" />
              ) : (
                '1'
              )}
            </div>
            <span className="ml-2 text-sm font-medium">Account Info</span>
          </div>
          <div className={`w-16 h-0.5 ${
            currentStep >= 2 ? 'bg-blue-600' : 'bg-gray-300'
          }`}></div>
          <div className={`flex items-center ${
            currentStep >= 2 ? 'text-blue-600' : 'text-gray-400'
          }`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
              currentStep >= 2 ? 'border-blue-600 bg-blue-600 text-white' : 'border-gray-300'
            }`}>
              2
            </div>
            <span className="ml-2 text-sm font-medium">Role & Details</span>
          </div>
        </div>

        {/* Registration Form */}
        <div className="card animate-fade-in">
          <form onSubmit={currentStep === 1 ? (e) => { e.preventDefault(); handleNext(); } : handleSubmit} className="space-y-6">
            {currentStep === 1 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Information</h3>
                
                <InputField
                  field="name"
                  label="Full Name"
                  placeholder="Enter your full name"
                  icon={UserIcon}
                  required
                />
                
                <InputField
                  field="email"
                  label="Email Address"
                  type="email"
                  placeholder="Enter your email address"
                  icon={EnvelopeIcon}
                  required
                />
                
                <InputField
                  field="password"
                  label="Password"
                  type="password"
                  placeholder="Create a strong password"
                  icon={LockClosedIcon}
                  required
                  showToggle
                />
                
                <InputField
                  field="confirmPassword"
                  label="Confirm Password"
                  type="password"
                  placeholder="Confirm your password"
                  icon={LockClosedIcon}
                  required
                  showToggle
                />

                <div className="pt-4">
                  <button
                    type="submit"
                    className="w-full btn-primary"
                  >
                    Next Step
                  </button>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Role & Additional Details</h3>
                
                <SelectField
                  field="role"
                  label="Your Role"
                  options={roleOptions}
                  required
                />
                
                <InputField
                  field="phone"
                  label="Phone Number"
                  type="tel"
                  placeholder="Enter your phone number (optional)"
                  icon={PhoneIcon}
                />
                
                <TextareaField
                  field="address"
                  label="Address"
                  placeholder="Enter your address (optional)"
                />

                <div className="pt-4 space-y-3">
                  <button
                    type="submit"
                    disabled={loading}
                    className={`w-full btn-primary ${
                      loading ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    {loading ? (
                      <div className="flex items-center justify-center">
                        <Loading type="spinner" size="sm" text="" />
                        <span className="ml-2">Creating Account...</span>
                      </div>
                    ) : (
                      'Create Account'
                    )}
                  </button>
                  
                  <button
                    type="button"
                    onClick={handleBack}
                    className="w-full btn-secondary"
                    disabled={loading}
                  >
                    Back
                  </button>
                </div>
              </div>
            )}
          </form>

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="text-blue-600 hover:text-blue-500 font-medium transition-colors">
                Sign in here
              </Link>
            </p>
          </div>
        </div>

        {/* Info Card */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 animate-slide-in">
          <div className="flex items-start">
            <ExclamationCircleIcon className="h-5 w-5 text-amber-600 mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-medium text-amber-800 mb-1">Account Approval Required</h3>
              <p className="text-xs text-amber-700">
                Your account will be reviewed by an administrator before activation. You'll receive an email notification once approved.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
