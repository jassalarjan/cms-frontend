import React, { useState, useCallback } from "react";
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
  QuestionMarkCircleIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import Loading from '../components/Loading';

// Form input component
const FormInput = React.memo(({ 
  field, 
  label, 
  type = "text", 
  placeholder, 
  icon: Icon, 
  required = false, 
  showToggle = false,
  value,
  error,
  onChange,
  onToggle,
  showPassword
}) => {
  const handleChange = useCallback((e) => {
    onChange(field, e.target.value);
  }, [field, onChange]);

  return (
    <div className="mb-4">
      <label htmlFor={field} className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Icon className="h-5 w-5 text-gray-400" />
          </div>
        )}
        <input
          id={field}
          name={field}
          type={type}
          placeholder={placeholder}
          className={`input-field ${Icon ? 'pl-10' : ''} ${error ? 'border-red-500' : ''}`}
          value={value}
          onChange={handleChange}
          required={required}
        />
      </div>
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
});

FormInput.displayName = 'FormInput';

// Main Register component
export default function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "",
    phone: "",
    address: ""
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [currentStep, setCurrentStep] = useState(1);

  const handleInputChange = useCallback((field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when field is modified
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ""
      }));
    }
  }, [errors]);

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
    
    if (!validateStep(currentStep)) {
      toast.error("Please fix the errors below");
      return;
    }
    
    setLoading(true);
    try {
      const { confirmPassword, ...submitData } = formData;
      await API.post("/auth/register", submitData);
      toast.success("Registration successful! Your account is pending approval.");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      console.error('Registration error:', err);
      const errorMessage = err.response?.data?.error || "Registration failed. Please try again.";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-800 p-12 flex-col justify-between overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full"></div>
          <div className="absolute top-1/3 right-20 w-24 h-24 bg-white rounded-full"></div>
          <div className="absolute bottom-20 left-1/3 w-40 h-40 bg-white rounded-full"></div>
        </div>

        {/* Logo & Brand */}
        <div className="relative z-10">
          <div className="flex items-center mb-6">
            <div className="w-16 mr-4 shadow-2xl">
              <img
                src="/logo.png"
                alt="CMS Logo"
                className="w-16 h-auto object-contain"
              />
            </div>
            <div>
              <h1 className="text-white text-2xl font-bold">Complaint Manager</h1>
              <p className="text-blue-100 text-sm">Professional Solution</p>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="relative z-10 space-y-6">
          <h2 className="text-white text-3xl font-bold leading-tight">
            Join Our<br/>
            <span className="text-yellow-300">Platform Today</span>
          </h2>
          <div className="space-y-4">
            <div className="flex items-center text-white">
              <div className="h-2 w-2 bg-yellow-300 rounded-full mr-3"></div>
              <span>Streamlined registration process</span>
            </div>
            <div className="flex items-center text-white">
              <div className="h-2 w-2 bg-yellow-300 rounded-full mr-3"></div>
              <span>Multi-role user management</span>
            </div>
            <div className="flex items-center text-white">
              <div className="h-2 w-2 bg-yellow-300 rounded-full mr-3"></div>
              <span>Secure account creation</span>
            </div>
          </div>
        </div>

        {/* Bottom Quote */}
        <div className="relative z-10">
          <blockquote className="text-white/80 italic">
            "Start your journey with efficient complaint management."
          </blockquote>
        </div>
      </div>

      {/* Right Side - Register Form */}
      <div className="flex-1 flex items-center justify-center bg-gray-50 p-8">
        <div className="w-full max-w-md space-y-8">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <div className="w-24 mx-auto mb-4 shadow-xl">
              <img
                src="/logo1.png"
                alt="CMS Logo"
                className="w-20 h-auto object-contain"
              />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Complaint Manager</h2>
          </div>

          {/* Welcome Header */}
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Create Account</h2>
            <p className="text-gray-600">Join our platform and get started</p>
          </div>

          {/* Register Form */}
          <div className="card animate-fade-in">
            <form className="space-y-6" onSubmit={handleSubmit}>
              {currentStep === 1 ? (
                <>
                  <FormInput
                    field="name"
                    label="Full Name"
                    placeholder="Enter your full name"
                    icon={UserIcon}
                    required
                    value={formData.name}
                    error={errors.name}
                    onChange={handleInputChange}
                  />

                  <FormInput
                    field="email"
                    label="Email"
                    type="email"
                    placeholder="Enter your email"
                    icon={EnvelopeIcon}
                    required
                    value={formData.email}
                    error={errors.email}
                    onChange={handleInputChange}
                  />

                  <FormInput
                    field="password"
                    label="Password"
                    type="password"
                    placeholder="Create a password"
                    icon={LockClosedIcon}
                    required
                    value={formData.password}
                    error={errors.password}
                    onChange={handleInputChange}
                  />

                  <FormInput
                    field="confirmPassword"
                    label="Confirm Password"
                    type="password"
                    placeholder="Confirm your password"
                    icon={LockClosedIcon}
                    required
                    value={formData.confirmPassword}
                    error={errors.confirmPassword}
                    onChange={handleInputChange}
                  />

                  <button
                    type="button"
                    onClick={handleNext}
                    className="w-full btn-primary h-12 text-base font-semibold shadow-lg hover:shadow-xl"
                  >
                    Next Step
                  </button>
                </>
              ) : (
                <>
                  <div className="mb-4">
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Select Your Role <span className="text-red-500">*</span>
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <button
                        type="button"
                        className={`p-3 sm:p-4 border rounded-lg flex flex-col items-center justify-center transition-all h-16 sm:h-20 ${
                          formData.role === 'CUSTOMER'
                            ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-md'
                            : 'border-gray-200 hover:border-blue-500 hover:bg-blue-50'
                        }`}
                        onClick={() => handleInputChange('role', 'CUSTOMER')}
                      >
                        <UserIcon className="h-5 w-5 sm:h-6 sm:w-6 mb-1 sm:mb-2" />
                        <span className="font-medium text-sm sm:text-base">System Integrator</span>
                      </button>
                      <button
                        type="button"
                        className={`p-3 sm:p-4 border rounded-lg flex flex-col items-center justify-center transition-all h-16 sm:h-20 ${
                          formData.role === 'SUPPLIER'
                            ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-md'
                            : 'border-gray-200 hover:border-blue-500 hover:bg-blue-50'
                        }`}
                        onClick={() => handleInputChange('role', 'SUPPLIER')}
                      >
                        <BriefcaseIcon className="h-5 w-5 sm:h-6 sm:w-6 mb-1 sm:mb-2" />
                        <span className="font-medium text-sm sm:text-base">Bank Official</span>
                      </button>
                    </div>
                    {errors.role && (
                      <p className="mt-2 text-sm text-red-600 flex items-center">
                        <span>{errors.role}</span>
                      </p>
                    )}
                  </div>

                  <FormInput
                    field="phone"
                    label="Phone Number"
                    placeholder="Enter your phone number"
                    icon={PhoneIcon}
                    value={formData.phone}
                    error={errors.phone}
                    onChange={handleInputChange}
                  />

                  <FormInput
                    field="address"
                    label="Address"
                    placeholder="Enter your address"
                    icon={MapPinIcon}
                    value={formData.address}
                    error={errors.address}
                    onChange={handleInputChange}
                  />

                  <div className="flex space-x-4">
                    <button
                      type="button"
                      onClick={handleBack}
                      className="flex-1 btn-secondary h-12"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      className="flex-1 btn-primary h-12 text-base font-semibold shadow-lg hover:shadow-xl"
                    >
                      Create Account
                    </button>
                  </div>
                </>
              )}
            </form>
          </div>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500 font-medium">Already have an account?</span>
            </div>
          </div>

          {/* Sign In Link */}
          <div className="text-center">
            <Link
              to="/login"
              className="inline-flex items-center justify-center w-full btn-secondary h-12 text-base font-semibold"
            >
              Sign In Instead
              <UserIcon className="ml-2 h-4 w-4" />
            </Link>
          </div>

          {/* Help Link */}
          <div className="text-center">
            <Link
              to="/user-guide"
              className="inline-flex items-center justify-center text-sm text-gray-600 hover:text-gray-800 font-medium transition-colors"
            >
              <QuestionMarkCircleIcon className="h-4 w-4 mr-1" />
              Need Help? View User Guide
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
