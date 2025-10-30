import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  ChevronDownIcon,
  ChevronRightIcon,
  UserGroupIcon,
  CogIcon,
  ClipboardDocumentListIcon,
  QuestionMarkCircleIcon,
  HomeIcon,
  ArrowLeftIcon
} from "@heroicons/react/24/outline";

export default function UserGuide() {
  const [openSections, setOpenSections] = useState({
    overview: true,
    roles: true,
    workflows: false,
    setup: false,
    troubleshooting: false
  });

  const toggleSection = (section) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const SectionHeader = ({ id, title, icon: Icon, isOpen, onToggle }) => (
    <button
      onClick={() => onToggle(id)}
      className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
    >
      <div className="flex items-center space-x-3">
        <Icon className="h-6 w-6 text-blue-600" />
        <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
      </div>
      {isOpen ? (
        <ChevronDownIcon className="h-5 w-5 text-gray-500" />
      ) : (
        <ChevronRightIcon className="h-5 w-5 text-gray-500" />
      )}
    </button>
  );

  const SectionContent = ({ isOpen, children }) => (
    <div className={`mt-4 transition-all duration-300 ${isOpen ? 'block' : 'hidden'}`}>
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        {children}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link
                to="/"
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeftIcon className="h-5 w-5" />
                <span>Back to Login</span>
              </Link>
              <div className="h-6 w-px bg-gray-300"></div>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <ClipboardDocumentListIcon className="h-5 w-5 text-white" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900">User Guide</h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                to="/login"
                className="btn-primary"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="btn-secondary"
              >
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Complaint Management System
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Your comprehensive guide to using the Complaint Management System effectively.
            Learn about features, workflows, and best practices for optimal system usage.
          </p>
        </div>

        {/* Quick Navigation */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">Quick Navigation</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <a
              href="#overview"
              className="flex items-center space-x-2 text-blue-700 hover:text-blue-900 transition-colors"
            >
              <HomeIcon className="h-5 w-5" />
              <span>System Overview</span>
            </a>
            <a
              href="#roles"
              className="flex items-center space-x-2 text-blue-700 hover:text-blue-900 transition-colors"
            >
              <UserGroupIcon className="h-5 w-5" />
              <span>User Roles</span>
            </a>
            <a
              href="#workflows"
              className="flex items-center space-x-2 text-blue-700 hover:text-blue-900 transition-colors"
            >
              <CogIcon className="h-5 w-5" />
              <span>Workflows</span>
            </a>
          </div>
        </div>

        {/* Workflow Flowchart */}
        <div className="mb-12">
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-8">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Workflow Flowchart</h2>
              <p className="text-gray-600">Visual representation of the complete complaint management process</p>
            </div>
            <div className="flex justify-center">
              <img
                src="/workflow-flowchart.svg"
                alt="Complaint Management Workflow Flowchart"
                className="max-w-full h-auto border border-gray-200 rounded-lg shadow-sm"
              />
            </div>
            <div className="text-center mt-4">
              <p className="text-sm text-gray-600">
                Complete workflow from complaint creation to resolution with role-based responsibilities
              </p>
            </div>
          </div>
        </div>

        {/* Collapsible Sections */}
        <div className="space-y-6">
          {/* System Overview */}
          <section id="overview">
            <SectionHeader
              id="overview"
              title="System Overview"
              icon={HomeIcon}
              isOpen={openSections.overview}
              onToggle={toggleSection}
            />
            <SectionContent isOpen={openSections.overview}>
              <div className="prose max-w-none">
                <p className="text-gray-700 mb-4">
                  The Complaint Management System (CMS) is a comprehensive web-based application designed to streamline
                  the process of managing customer complaints, from initial reporting to final resolution.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-2">Key Features</h4>
                    <ul className="space-y-2 text-gray-700">
                      <li>• Multi-role Authentication</li>
                      <li>• Real-time complaint tracking</li>
                      <li>• Advanced analytics & reporting</li>
                      <li>• Location-based organization</li>
                      <li>• Session management</li>
                    </ul>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-2">Technology Stack</h4>
                    <ul className="space-y-2 text-gray-700">
                      <li>• Backend: Cloudflare Workers</li>
                      <li>• Frontend: React.js with Vite</li>
                      <li>• Database: SQLite (D1)</li>
                      <li>• Authentication: JWT-based</li>
                    </ul>
                  </div>
                </div>
              </div>
            </SectionContent>
          </section>

          {/* User Roles */}
          <section id="roles">
            <SectionHeader
              id="roles"
              title="User Roles and Permissions"
              icon={UserGroupIcon}
              isOpen={openSections.roles}
              onToggle={toggleSection}
            />
            <SectionContent isOpen={openSections.roles}>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="border border-blue-200 rounded-lg p-6 bg-blue-50">
                    <div className="flex items-center space-x-3 mb-4">
                      <UserGroupIcon className="h-8 w-8 text-blue-600" />
                      <h3 className="text-xl font-semibold text-blue-900">Administrator</h3>
                    </div>
                    <p className="text-blue-800 mb-4">Full system access with complete management capabilities</p>
                    <ul className="space-y-2 text-blue-700">
                      <li>• User account management</li>
                      <li>• Location management</li>
                      <li>• Complaint assignment</li>
                      <li>• System-wide analytics</li>
                    </ul>
                  </div>

                  <div className="border border-green-200 rounded-lg p-6 bg-green-50">
                    <div className="flex items-center space-x-3 mb-4">
                      <CogIcon className="h-8 w-8 text-green-600" />
                      <h3 className="text-xl font-semibold text-green-900">Bank Official</h3>
                    </div>
                    <p className="text-green-800 mb-4">Read-only access to complaints in assigned locations</p>
                    <ul className="space-y-2 text-green-700">
                      <li>• View complaints in assigned locations only</li>
                      <li>• Track complaint status and progress</li>
                      <li>• Download reports for assigned locations</li>
                      <li>• Monitor complaint metrics (read-only)</li>
                    </ul>
                  </div>

                  <div className="border border-purple-200 rounded-lg p-6 bg-purple-50">
                    <div className="flex items-center space-x-3 mb-4">
                      <ClipboardDocumentListIcon className="h-8 w-8 text-purple-600" />
                      <h3 className="text-xl font-semibold text-purple-900">System Integrator</h3>
                    </div>
                    <p className="text-purple-800 mb-4">Complaint creation and tracking capabilities</p>
                    <ul className="space-y-2 text-purple-700">
                      <li>• Create new complaints</li>
                      <li>• Track complaint status</li>
                      <li>• View complaint history</li>
                      <li>• Update profile information</li>
                    </ul>
                  </div>
                </div>
              </div>
            </SectionContent>
          </section>

          {/* Workflows */}
          <section id="workflows">
            <SectionHeader
              id="workflows"
              title="User Workflows"
              icon={CogIcon}
              isOpen={openSections.workflows}
              onToggle={toggleSection}
            />
            <SectionContent isOpen={openSections.workflows}>
              <div className="space-y-8">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">Complaint Lifecycle</h3>
                  <div className="space-y-4">
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold">1</div>
                      <div>
                        <h4 className="font-semibold text-gray-900">Complaint Creation</h4>
                        <p className="text-gray-700">System Integrator submits complaint with detailed information, location, and priority level</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0 w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-semibold">2</div>
                      <div>
                        <h4 className="font-semibold text-gray-900">Assignment Process</h4>
                        <p className="text-gray-700">Administrator reviews and assigns complaint to appropriate supplier based on location and expertise</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0 w-8 h-8 bg-yellow-600 text-white rounded-full flex items-center justify-center font-semibold">3</div>
                      <div>
                        <h4 className="font-semibold text-gray-900">Resolution Process</h4>
                        <p className="text-gray-700">Administrator assigns complaints to suppliers who can track progress and view reports for their assigned locations</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0 w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-semibold">4</div>
                      <div>
                        <h4 className="font-semibold text-gray-900">Closure and Feedback</h4>
                        <p className="text-gray-700">Complaint marked as resolved with satisfaction tracking and performance metrics recorded</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </SectionContent>
          </section>

          

          {/* Troubleshooting */}
          <section id="troubleshooting">
            <SectionHeader
              id="troubleshooting"
              title="Troubleshooting"
              icon={QuestionMarkCircleIcon}
              isOpen={openSections.troubleshooting}
              onToggle={toggleSection}
            />
            <SectionContent isOpen={openSections.troubleshooting}>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Common Issues</h4>
                    <div className="space-y-3">
                      <div className="border-l-4 border-red-500 pl-4">
                        <h5 className="font-medium text-red-900">Login Problems</h5>
                        <p className="text-red-700 text-sm">Check email verification status and contact administrator for password reset</p>
                      </div>
                      <div className="border-l-4 border-yellow-500 pl-4">
                        <h5 className="font-medium text-yellow-900">Form Submission Issues</h5>
                        <p className="text-yellow-700 text-sm">Ensure all required fields are completed and try refreshing the page</p>
                      </div>
                      <div className="border-l-4 border-blue-500 pl-4">
                        <h5 className="font-medium text-blue-900">Performance Issues</h5>
                        <p className="text-blue-700 text-sm">Check internet connection and try clearing browser cache</p>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Getting Help</h4>
                    <div className="space-y-3">
                      <div className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                        <div>
                          <p className="font-medium text-gray-900">Check this User Guide</p>
                          <p className="text-gray-700 text-sm">Most common questions are answered here</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                        <div>
                          <p className="font-medium text-gray-900">Contact Administrator</p>
                          <p className="text-gray-700 text-sm">For account-specific issues and technical support</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                        <div>
                          <p className="font-medium text-gray-900">Browser Console</p>
                          <p className="text-gray-700 text-sm">Technical users can check for JavaScript errors</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </SectionContent>
          </section>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Ready to Get Started?</h3>
            <p className="text-gray-700 mb-4">
              Join thousands of users who are already using our platform to streamline their complaint management process.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/register"
                className="btn-primary"
              >
                Create Account
              </Link>
              <Link
                to="/login"
                className="btn-secondary"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}