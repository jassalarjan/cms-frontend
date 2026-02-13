import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeftIcon, ShieldCheckIcon, EyeIcon, LockClosedIcon, UserGroupIcon, DocumentTextIcon, PhoneIcon, EnvelopeIcon, MapPinIcon } from '@heroicons/react/24/outline';

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link
                to="/login"
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors"
              >
                <ArrowLeftIcon className="h-5 w-5" />
                <span>Back to Login</span>
              </Link>
              <div className="h-6 w-px bg-gray-300 dark:bg-gray-600"></div>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <ShieldCheckIcon className="h-5 w-5 text-white" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Privacy Policy</h1>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center">
              <LockClosedIcon className="h-10 w-10" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Your Privacy Matters
          </h1>
          <p className="text-xl text-blue-100 max-w-3xl mx-auto">
            We are committed to protecting your personal information and ensuring transparency in how we handle your data.
          </p>
          <div className="mt-8 text-sm text-blue-200">
            <strong>Last updated:</strong> {new Date().toLocaleDateString()}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 md:p-12">
          <div className="prose prose-lg dark:prose-invert max-w-none">

          {/* Quick Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-6 rounded-xl border border-blue-200 dark:border-blue-800">
              <div className="flex items-center mb-4">
                <EyeIcon className="h-8 w-8 text-blue-600 mr-3" />
                <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100">Data Collection</h3>
              </div>
              <p className="text-blue-800 dark:text-blue-200 text-sm">
                We only collect information necessary for providing our complaint management services.
              </p>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 p-6 rounded-xl border border-green-200 dark:border-green-800">
              <div className="flex items-center mb-4">
                <ShieldCheckIcon className="h-8 w-8 text-green-600 mr-3" />
                <h3 className="text-lg font-semibold text-green-900 dark:text-green-100">Security First</h3>
              </div>
              <p className="text-green-800 dark:text-green-200 text-sm">
                Your data is protected with industry-standard encryption and security measures.
              </p>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 p-6 rounded-xl border border-purple-200 dark:border-purple-800">
              <div className="flex items-center mb-4">
                <UserGroupIcon className="h-8 w-8 text-purple-600 mr-3" />
                <h3 className="text-lg font-semibold text-purple-900 dark:text-purple-100">Your Rights</h3>
              </div>
              <p className="text-purple-800 dark:text-purple-200 text-sm">
                You have full control over your data with rights to access, update, and delete your information.
              </p>
            </div>
          </div>

          <section className="mb-12">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mr-4">
                <DocumentTextIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                1. Introduction
              </h2>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-6 border-l-4 border-blue-500">
              <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed">
                Welcome to Soft-Chip Instrumentation's Complaint Management System (CMS). We are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform.
              </p>
            </div>
          </section>

          <section className="mb-12">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center mr-4">
                <EyeIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                2. Information We Collect
              </h2>
            </div>

            <div className="space-y-6">
              <div className="bg-white dark:bg-gray-700 rounded-lg p-6 border border-gray-200 dark:border-gray-600">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <UserGroupIcon className="h-5 w-5 mr-2 text-blue-600" />
                  Personal Information
                </h3>
                <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <span>Name, email address, and contact details</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <span>Account credentials (username and password)</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <span>Role and organizational information</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <span>Complaint details including personal data provided in submissions</span>
                  </li>
                </ul>
              </div>

              <div className="bg-white dark:bg-gray-700 rounded-lg p-6 border border-gray-200 dark:border-gray-600">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <ShieldCheckIcon className="h-5 w-5 mr-2 text-green-600" />
                  Usage Information
                </h3>
                <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <span>IP address and location data</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <span>Browser type and version</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <span>Pages visited and time spent on our platform</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <span>Device information</span>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          <section className="mb-12">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center mr-4">
                <ShieldCheckIcon className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                3. How We Use Your Information
              </h2>
            </div>

            <div className="bg-gradient-to-r from-orange-50 to-yellow-50 dark:from-orange-900/20 dark:to-yellow-900/20 rounded-xl p-6 border border-orange-200 dark:border-orange-800">
              <p className="text-gray-700 dark:text-gray-300 mb-6 text-lg">
                We use the collected information for the following purposes:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-blue-600 dark:text-blue-400 font-bold text-sm">1</span>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300">To provide and maintain our complaint management services</p>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-green-600 dark:text-green-400 font-bold text-sm">2</span>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300">To authenticate users and manage accounts</p>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-purple-600 dark:text-purple-400 font-bold text-sm">3</span>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300">To process and track complaints</p>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-indigo-600 dark:text-indigo-400 font-bold text-sm">4</span>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300">To communicate with you about your complaints and account</p>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-red-600 dark:text-red-400 font-bold text-sm">5</span>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300">To improve our services and develop new features</p>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-teal-100 dark:bg-teal-900/30 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-teal-600 dark:text-teal-400 font-bold text-sm">6</span>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300">To ensure security and prevent fraud</p>
                </div>

                <div className="flex items-start space-x-3 md:col-span-2">
                  <div className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-gray-600 dark:text-gray-400 font-bold text-sm">7</span>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300">To comply with legal obligations</p>
                </div>
              </div>
            </div>
          </section>

          <section className="mb-12">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center mr-4">
                <UserGroupIcon className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                4. Information Sharing and Disclosure
              </h2>
            </div>

            <div className="bg-white dark:bg-gray-700 rounded-xl p-6 border border-gray-200 dark:border-gray-600">
              <div className="flex items-start mb-6">
                <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                  <LockClosedIcon className="h-8 w-8 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">We Protect Your Data</h3>
                  <p className="text-gray-700 dark:text-gray-300 text-lg">
                    We do not sell, trade, or otherwise transfer your personal information to third parties except in the following circumstances:
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-red-50 dark:bg-red-900/10 p-4 rounded-lg border border-red-200 dark:border-red-800">
                  <div className="flex items-center mb-2">
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center mr-3">
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="font-medium text-red-900 dark:text-red-100">With your explicit consent</span>
                  </div>
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/10 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center mb-2">
                    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center mr-3">
                      <ShieldCheckIcon className="w-3 h-3 text-white" />
                    </div>
                    <span className="font-medium text-blue-900 dark:text-blue-100">To trusted service providers</span>
                  </div>
                  <p className="text-sm text-blue-800 dark:text-blue-200">Under strict confidentiality agreements</p>
                </div>

                <div className="bg-yellow-50 dark:bg-yellow-900/10 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
                  <div className="flex items-center mb-2">
                    <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center mr-3">
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="font-medium text-yellow-900 dark:text-yellow-100">When required by law</span>
                  </div>
                </div>

                <div className="bg-purple-50 dark:bg-purple-900/10 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
                  <div className="flex items-center mb-2">
                    <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center mr-3">
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <span className="font-medium text-purple-900 dark:text-purple-100">Business transfers</span>
                  </div>
                  <p className="text-sm text-purple-800 dark:text-purple-200">In case of mergers or acquisitions</p>
                </div>

                <div className="bg-green-50 dark:bg-green-900/10 p-4 rounded-lg border border-green-200 dark:border-green-800 md:col-span-2">
                  <div className="flex items-center mb-2">
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center mr-3">
                      <UserGroupIcon className="w-3 h-3 text-white" />
                    </div>
                    <span className="font-medium text-green-900 dark:text-green-100">To authorized personnel</span>
                  </div>
                  <p className="text-sm text-green-800 dark:text-green-200">For complaint resolution purposes only</p>
                </div>
              </div>
            </div>
          </section>

          <section className="mb-12">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-teal-100 dark:bg-teal-900/30 rounded-lg flex items-center justify-center mr-4">
                <LockClosedIcon className="h-6 w-6 text-teal-600 dark:text-teal-400" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                5. Data Security
              </h2>
            </div>

            <div className="bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-teal-900/20 dark:to-cyan-900/20 rounded-xl p-8 border border-teal-200 dark:border-teal-800">
              <div className="text-center mb-8">
                <div className="w-20 h-20 bg-teal-100 dark:bg-teal-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ShieldCheckIcon className="h-10 w-10 text-teal-600 dark:text-teal-400" />
                </div>
                <h3 className="text-2xl font-bold text-teal-900 dark:text-teal-100 mb-2">Your Data is Protected</h3>
                <p className="text-teal-800 dark:text-teal-200 text-lg">
                  We implement industry-standard security measures to protect your information
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-gray-700 p-6 rounded-lg border border-teal-200 dark:border-teal-700 text-center">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                    <LockClosedIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Encryption</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Data encrypted in transit and at rest</p>
                </div>

                <div className="bg-white dark:bg-gray-700 p-6 rounded-lg border border-teal-200 dark:border-teal-700 text-center">
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                    <UserGroupIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Authentication</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Secure authentication mechanisms</p>
                </div>

                <div className="bg-white dark:bg-gray-700 p-6 rounded-lg border border-teal-200 dark:border-teal-700 text-center">
                  <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                    <ShieldCheckIcon className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Regular Audits</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Security audits and updates</p>
                </div>

                <div className="bg-white dark:bg-gray-700 p-6 rounded-lg border border-teal-200 dark:border-teal-700 text-center">
                  <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                    <EyeIcon className="h-6 w-6 text-red-600 dark:text-red-400" />
                  </div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Access Control</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Role-based permissions</p>
                </div>

                <div className="bg-white dark:bg-gray-700 p-6 rounded-lg border border-teal-200 dark:border-teal-700 text-center">
                  <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="h-6 w-6 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Secure Storage</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Secure data storage practices</p>
                </div>

                <div className="bg-white dark:bg-gray-700 p-6 rounded-lg border border-teal-200 dark:border-teal-700 text-center md:col-span-2 lg:col-span-1">
                  <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="h-6 w-6 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Compliance</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Industry security standards</p>
                </div>
              </div>
            </div>
          </section>

          <section className="mb-12">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center mr-4">
                <svg className="h-6 w-6 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                6. Data Retention
              </h2>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-6 border-l-4 border-gray-400">
              <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed">
                We retain your personal information only as long as necessary for the purposes outlined in this Privacy Policy, unless a longer retention period is required by law. Complaint data may be retained for audit and compliance purposes.
              </p>
            </div>
          </section>

          <section className="mb-12">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-pink-100 dark:bg-pink-900/30 rounded-lg flex items-center justify-center mr-4">
                <svg className="h-6 w-6 text-pink-600 dark:text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                7. Your Rights
              </h2>
            </div>

            <div className="bg-gradient-to-r from-pink-50 to-rose-50 dark:from-pink-900/20 dark:to-rose-900/20 rounded-xl p-8 border border-pink-200 dark:border-pink-800">
              <p className="text-gray-700 dark:text-gray-300 mb-8 text-lg">
                Depending on your location, you may have the following rights regarding your personal information:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-gray-700 p-6 rounded-lg border border-pink-200 dark:border-pink-700">
                  <div className="flex items-center mb-3">
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mr-4">
                      <EyeIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Access</h3>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300">Right to access your personal data</p>
                </div>

                <div className="bg-white dark:bg-gray-700 p-6 rounded-lg border border-pink-200 dark:border-pink-700">
                  <div className="flex items-center mb-3">
                    <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mr-4">
                      <svg className="h-5 w-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Correction</h3>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300">Right to correct inaccurate data</p>
                </div>

                <div className="bg-white dark:bg-gray-700 p-6 rounded-lg border border-pink-200 dark:border-pink-700">
                  <div className="flex items-center mb-3">
                    <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mr-4">
                      <svg className="h-5 w-5 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Deletion</h3>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300">Right to delete your data (subject to legal requirements)</p>
                </div>

                <div className="bg-white dark:bg-gray-700 p-6 rounded-lg border border-pink-200 dark:border-pink-700">
                  <div className="flex items-center mb-3">
                    <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mr-4">
                      <svg className="h-5 w-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Portability</h3>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300">Right to data portability</p>
                </div>

                <div className="bg-white dark:bg-gray-700 p-6 rounded-lg border border-pink-200 dark:border-pink-700">
                  <div className="flex items-center mb-3">
                    <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center mr-4">
                      <svg className="h-5 w-5 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Objection</h3>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300">Right to object to processing</p>
                </div>

                <div className="bg-white dark:bg-gray-700 p-6 rounded-lg border border-pink-200 dark:border-pink-700">
                  <div className="flex items-center mb-3">
                    <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mr-4">
                      <svg className="h-5 w-5 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Restriction</h3>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300">Right to restrict processing</p>
                </div>
              </div>

              <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <p className="text-blue-800 dark:text-blue-200 text-center">
                  <strong>To exercise these rights, please contact us using the information provided below.</strong>
                </p>
              </div>
            </div>
          </section>

          <section className="mb-12">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 rounded-lg flex items-center justify-center mr-4">
                <svg className="h-6 w-6 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                8. Cookies and Tracking
              </h2>
            </div>

            <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-6 border border-amber-200 dark:border-amber-800">
              <p className="text-amber-800 dark:text-amber-200 text-lg leading-relaxed">
                Our platform may use cookies and similar technologies to enhance your experience, analyze usage patterns, and maintain session information. You can control cookie settings through your browser preferences.
              </p>
            </div>
          </section>

          <section className="mb-12">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-slate-100 dark:bg-slate-700 rounded-lg flex items-center justify-center mr-4">
                <svg className="h-6 w-6 text-slate-600 dark:text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
              </div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                9. Third-Party Services
              </h2>
            </div>

            <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-6 border-l-4 border-slate-400">
              <p className="text-slate-800 dark:text-slate-200 text-lg leading-relaxed">
                Our platform may integrate with third-party services. We are not responsible for the privacy practices of these external services. Please review their respective privacy policies.
              </p>
            </div>
          </section>

          <section className="mb-12">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-cyan-100 dark:bg-cyan-900/30 rounded-lg flex items-center justify-center mr-4">
                <svg className="h-6 w-6 text-cyan-600 dark:text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                10. Children's Privacy
              </h2>
            </div>

            <div className="bg-cyan-50 dark:bg-cyan-900/20 rounded-lg p-6 border border-cyan-200 dark:border-cyan-800">
              <p className="text-cyan-800 dark:text-cyan-200 text-lg leading-relaxed">
                Our services are not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13.
              </p>
            </div>
          </section>

          <section className="mb-12">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-violet-100 dark:bg-violet-900/30 rounded-lg flex items-center justify-center mr-4">
                <svg className="h-6 w-6 text-violet-600 dark:text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                11. Changes to This Privacy Policy
              </h2>
            </div>

            <div className="bg-violet-50 dark:bg-violet-900/20 rounded-lg p-6 border border-violet-200 dark:border-violet-800">
              <p className="text-violet-800 dark:text-violet-200 text-lg leading-relaxed">
                We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new policy on this page and updating the "Last updated" date.
              </p>
            </div>
          </section>

          <section className="mb-12">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center mr-4">
                <PhoneIcon className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                12. Contact Us
              </h2>
            </div>

            <div className="bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20 rounded-xl p-8 border border-indigo-200 dark:border-indigo-800">
              <p className="text-gray-700 dark:text-gray-300 mb-6 text-lg">
                If you have any questions about this Privacy Policy or our data practices, please contact us:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex items-center p-4 bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                  <EnvelopeIcon className="h-8 w-8 text-blue-600 mr-4" />
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">Email</p>
                    <p className="text-gray-600 dark:text-gray-300">softchipindia@gmail.com</p>
                  </div>
                </div>

                <div className="flex items-center p-4 bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                  <PhoneIcon className="h-8 w-8 text-green-600 mr-4" />
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">Phone</p>
                    <p className="text-gray-600 dark:text-gray-300">+91 (XXX) XXX-XXXX</p>
                  </div>
                </div>

                <div className="flex items-center p-4 bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                  <MapPinIcon className="h-8 w-8 text-red-600 mr-4" />
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">Website</p>
                    <p className="text-gray-600 dark:text-gray-300">https://www.softchip.org</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Footer */}
          <div className="mt-16 pt-8 border-t border-gray-200 dark:border-gray-700">
            <div className="text-center">
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                This Privacy Policy is effective as of {new Date().toLocaleDateString()} and will remain in effect except with respect to any changes in its provisions in the future.
              </p>
              <div className="flex justify-center space-x-6">
                <Link
                  to="/login"
                  className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium transition-colors"
                >
                  Back to Login
                </Link>
                <Link
                  to="/user-guide"
                  className="text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-300 font-medium transition-colors"
                >
                  User Guide
                </Link>
              </div>
            </div>
          </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;