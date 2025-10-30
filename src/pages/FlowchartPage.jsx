import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeftIcon, InformationCircleIcon } from "@heroicons/react/24/outline";
import Flowchart from "../components/Flowchart";

export default function FlowchartPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link
                to="/user-guide"
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeftIcon className="h-5 w-5" />
                <span>Back to User Guide</span>
              </Link>
              <div className="h-6 w-px bg-gray-300"></div>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <InformationCircleIcon className="h-5 w-5 text-white" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900">Workflow Flowchart</h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                to="/login"
                className="btn-primary"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <Flowchart />
        </div>

        {/* Additional Information */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-4">Understanding the Flow</h3>
            <div className="space-y-3 text-blue-800">
              <p>
                <strong>System Integrator Journey:</strong> Starts with complaint creation and ends with resolution tracking.
              </p>
              <p>
                <strong>Admin Role:</strong> Central to the process - reviews, assigns, and manages resolution.
              </p>
              <p>
                <strong>Bank Official Role:</strong> Location-based monitoring with read-only access to complaints.
              </p>
            </div>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-green-900 mb-4">Key Benefits</h3>
            <div className="space-y-3 text-green-800">
              <p>
                <strong>Streamlined Process:</strong> Clear workflow from creation to resolution.
              </p>
              <p>
                <strong>Role Clarity:</strong> Each user type has defined responsibilities and access levels.
              </p>
              <p>
                <strong>Efficient Management:</strong> Location-based assignment and monitoring system.
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="mt-8 text-center">
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/user-guide"
              className="btn-primary"
            >
              View Complete User Guide
            </Link>
            <Link
              to="/login"
              className="btn-secondary"
            >
              Access System
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}