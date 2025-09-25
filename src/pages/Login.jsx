import React, { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { EyeIcon, EyeSlashIcon, UserIcon, LockClosedIcon, ExclamationCircleIcon } from "@heroicons/react/24/outline";
import toast from "react-hot-toast";

export default function Login() {
  const { login } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }
    
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error("Please fix the errors below");
      return;
    }
    
    setLoading(true);
    try {
      await login(formData.email, formData.password);
      toast.success("Login successful!");
      navigate("/"); // redirect to dashboard
    } catch (err) {
      console.error("Login error:", err);
      const errorMessage = err.response?.data?.message || err.response?.data?.error || "Login failed. Please try again.";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

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
            Streamline Your<br/>
            <span className="text-yellow-300">Complaint Management</span>
          </h2>
          <div className="space-y-4">
            <div className="flex items-center text-white">
              <div className="h-2 w-2 bg-yellow-300 rounded-full mr-3"></div>
              <span>Real-time complaint tracking</span>
            </div>
            <div className="flex items-center text-white">
              <div className="h-2 w-2 bg-yellow-300 rounded-full mr-3"></div>
              <span>Advanced analytics & reporting</span>
            </div>
            <div className="flex items-center text-white">
              <div className="h-2 w-2 bg-yellow-300 rounded-full mr-3"></div>
              <span>Multi-role user management</span>
            </div>
          </div>
        </div>
        
        {/* Bottom Quote */}
        <div className="relative z-10">
          <blockquote className="text-white/80 italic">
            "Excellence in customer service through efficient complaint resolution."
          </blockquote>
        </div>
      </div>
      
      {/* Right Side - Login Form */}
      <div className="flex-1 flex items-center justify-center bg-gray-50 p-8">
        <div className="w-full max-w-md space-y-8">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <div className="w-20 mx-auto mb-4 shadow-xl">
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
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back!</h2>
            <p className="text-gray-600">Please sign in to access your dashboard</p>
          </div>

          {/* Login Form */}
          <div className="card animate-fade-in">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <UserIcon className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    placeholder="Enter your email address"
                    className={`input-field pl-12 h-12 ${
                      errors.email ? 'input-error' : 'focus-ring'
                    }`}
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                  />
                  {errors.email && (
                    <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
                      <ExclamationCircleIcon className="h-5 w-5 text-red-500" />
                    </div>
                  )}
                </div>
                {errors.email && (
                  <p className="mt-2 text-sm text-red-600 flex items-center animate-fade-in">
                    <ExclamationCircleIcon className="h-4 w-4 mr-2" />
                    {errors.email}
                  </p>
                )}
              </div>

              {/* Password Field */}
              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <LockClosedIcon className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                  </div>
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    className={`input-field pl-12 pr-12 h-12 ${
                      errors.password ? 'input-error' : 'focus-ring'
                    }`}
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-4 flex items-center transition-colors hover:bg-gray-50 rounded-r"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeSlashIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    ) : (
                      <EyeIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-2 text-sm text-red-600 flex items-center animate-fade-in">
                    <ExclamationCircleIcon className="h-4 w-4 mr-2" />
                    {errors.password}
                  </p>
                )}
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between">
                <label className="flex items-center">
                  <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 focus:ring-2" />
                  <span className="ml-2 text-sm text-gray-600">Remember me</span>
                </label>
                <a href="#" className="text-sm text-blue-600 hover:text-blue-500 font-medium transition-colors">
                  Forgot password?
                </a>
              </div>

              {/* Login Button */}
              <button
                type="submit"
                disabled={loading}
                className={`w-full btn-primary h-12 text-base font-semibold shadow-lg ${
                  loading ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-xl'
                }`}
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin h-5 w-5 mr-3 border-2 border-white border-t-transparent rounded-full"></div>
                    Signing you in...
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <span>Sign In</span>
                    <svg className="ml-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500 font-medium">New to our platform?</span>
              </div>
            </div>

            {/* Sign Up Link */}
            <div className="text-center">
              <Link 
                to="/register" 
                className="inline-flex items-center justify-center w-full btn-secondary h-12 text-base font-semibold"
              >
                Create an Account
                <UserIcon className="ml-2 h-4 w-4" />
              </Link>
            </div>
          </div>

          {/* Demo Credentials */}
          
          
         
        </div>
      </div>
    </div>
  );
}
