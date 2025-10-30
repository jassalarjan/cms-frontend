import React, { useState } from "react";
import {
  UserGroupIcon,
  ClipboardDocumentListIcon,
  CogIcon,
  CheckCircleIcon,
  ArrowRightIcon,
  InformationCircleIcon
} from "@heroicons/react/24/outline";

export default function Flowchart() {
  const [selectedNode, setSelectedNode] = useState(null);

  const nodes = [
    {
      id: 'start',
      title: 'Complaint Created',
      description: 'System Integrator submits new complaint with details',
      role: 'customer',
      x: 50,
      y: 100,
      color: 'blue'
    },
    {
      id: 'admin-review',
      title: 'Admin Review',
      description: 'Administrator reviews and validates complaint',
      role: 'admin',
      x: 250,
      y: 100,
      color: 'purple'
    },
    {
      id: 'assignment',
      title: 'Assign to Supplier',
      description: 'Admin assigns to appropriate bank official based on location',
      role: 'admin',
      x: 450,
      y: 100,
      color: 'purple'
    },
    {
      id: 'supplier-monitoring',
      title: 'Supplier Monitoring',
      description: 'Bank Official tracks complaints in assigned locations (Read-only)',
      role: 'supplier',
      x: 650,
      y: 100,
      color: 'green'
    },
    {
      id: 'admin-resolution',
      title: 'Admin Resolution',
      description: 'Administrator handles complaint resolution and customer communication',
      role: 'admin',
      x: 450,
      y: 250,
      color: 'purple'
    },
    {
      id: 'customer-updates',
      title: 'Customer Updates',
      description: 'System Integrator receives updates and can track progress',
      role: 'customer',
      x: 250,
      y: 250,
      color: 'blue'
    },
    {
      id: 'closure',
      title: 'Complaint Closed',
      description: 'Complaint marked as resolved with satisfaction tracking',
      role: 'admin',
      x: 450,
      y: 400,
      color: 'green'
    }
  ];

  const connections = [
    { from: 'start', to: 'admin-review' },
    { from: 'admin-review', to: 'assignment' },
    { from: 'assignment', to: 'supplier-monitoring' },
    { from: 'assignment', to: 'admin-resolution' },
    { from: 'admin-resolution', to: 'customer-updates' },
    { from: 'customer-updates', to: 'closure' },
    { from: 'supplier-monitoring', to: 'closure' }
  ];

  const getRoleColor = (role) => {
    switch (role) {
      case 'customer': return 'bg-blue-100 border-blue-300 text-blue-800';
      case 'admin': return 'bg-purple-100 border-purple-300 text-purple-800';
      case 'supplier': return 'bg-green-100 border-green-300 text-green-800';
      default: return 'bg-gray-100 border-gray-300 text-gray-800';
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'customer': return <ClipboardDocumentListIcon className="h-5 w-5" />;
      case 'admin': return <CogIcon className="h-5 w-5" />;
      case 'supplier': return <UserGroupIcon className="h-5 w-5" />;
      default: return <InformationCircleIcon className="h-5 w-5" />;
    }
  };

  const getNodeStyle = (node) => {
    const baseStyle = "absolute transform -translate-x-1/2 -translate-y-1/2 p-4 rounded-lg border-2 shadow-lg cursor-pointer transition-all hover:scale-105";
    const roleStyle = getRoleColor(node.role);
    return `${baseStyle} ${roleStyle}`;
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Complaint Management Workflow</h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Interactive flowchart showing the complete complaint lifecycle from creation to resolution
        </p>
      </div>

      {/* Legend */}
      <div className="flex justify-center space-x-6 mb-8 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-blue-100 border border-blue-300 rounded"></div>
          <span className="text-sm font-medium text-blue-800">System Integrator</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-purple-100 border border-purple-300 rounded"></div>
          <span className="text-sm font-medium text-purple-800">Administrator</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-green-100 border border-green-300 rounded"></div>
          <span className="text-sm font-medium text-green-800">Bank Official</span>
        </div>
      </div>

      {/* Flowchart */}
      <div className="relative w-full h-96 bg-white border-2 border-gray-200 rounded-lg overflow-hidden">
        {/* SVG for connections */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 1 }}>
          {connections.map((conn, index) => {
            const fromNode = nodes.find(n => n.id === conn.from);
            const toNode = nodes.find(n => n.id === conn.to);

            if (!fromNode || !toNode) return null;

            const midX = (fromNode.x + toNode.x) / 2;
            const midY = (fromNode.y + toNode.y) / 2;

            return (
              <g key={index}>
                <line
                  x1={fromNode.x}
                  y1={fromNode.y}
                  x2={toNode.x}
                  y2={toNode.y}
                  stroke="#6B7280"
                  strokeWidth="2"
                  strokeDasharray="5,5"
                />
                <ArrowRightIcon
                  className="text-gray-500"
                  style={{
                    position: 'absolute',
                    left: `${midX - 12}px`,
                    top: `${midY - 6}px`,
                    width: '24px',
                    height: '24px'
                  }}
                />
              </g>
            );
          })}
        </svg>

        {/* Nodes */}
        {nodes.map((node) => (
          <div
            key={node.id}
            className={getNodeStyle(node)}
            style={{
              left: `${node.x}px`,
              top: `${node.y}px`,
              zIndex: 2,
              minWidth: '140px'
            }}
            onClick={() => setSelectedNode(selectedNode === node.id ? null : node.id)}
          >
            <div className="flex items-center space-x-2 mb-2">
              {getRoleIcon(node.role)}
              <h3 className="font-semibold text-sm">{node.title}</h3>
            </div>
            <p className="text-xs opacity-90">{node.description}</p>

            {/* Expanded details */}
            {selectedNode === node.id && (
              <div className="mt-3 pt-3 border-t border-current border-opacity-30">
                <div className="text-xs space-y-1">
                  <p><strong>Role:</strong> {node.role.charAt(0).toUpperCase() + node.role.slice(1)}</p>
                  <p><strong>Actions:</strong></p>
                  <ul className="list-disc list-inside ml-2">
                    {node.role === 'customer' && (
                      <>
                        <li>Create complaint</li>
                        <li>Track progress</li>
                        <li>Receive updates</li>
                      </>
                    )}
                    {node.role === 'admin' && (
                      <>
                        <li>Review complaints</li>
                        <li>Assign to suppliers</li>
                        <li>Manage resolution</li>
                      </>
                    )}
                    {node.role === 'supplier' && (
                      <>
                        <li>Monitor assigned locations</li>
                        <li>Generate reports</li>
                        <li>Track metrics (read-only)</li>
                      </>
                    )}
                  </ul>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Instructions */}
      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600">
          💡 Click on any node to see detailed information about that step
        </p>
      </div>

      {/* Workflow Summary */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <ClipboardDocumentListIcon className="h-5 w-5 text-blue-600" />
            <h3 className="font-semibold text-blue-900">System Integrator Journey</h3>
          </div>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>1. Submit complaint with details</li>
            <li>2. Track progress in real-time</li>
            <li>3. Receive resolution updates</li>
            <li>4. View complaint history</li>
          </ul>
        </div>

        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <CogIcon className="h-5 w-5 text-purple-600" />
            <h3 className="font-semibold text-purple-900">Admin Management</h3>
          </div>
          <ul className="text-sm text-purple-800 space-y-1">
            <li>1. Review new complaints</li>
            <li>2. Assign to appropriate suppliers</li>
            <li>3. Handle resolution process</li>
            <li>4. Generate system reports</li>
          </ul>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <UserGroupIcon className="h-5 w-5 text-green-600" />
            <h3 className="font-semibold text-green-900">Bank Official Monitoring</h3>
          </div>
          <ul className="text-sm text-green-800 space-y-1">
            <li>1. Monitor assigned locations</li>
            <li>2. Track complaint patterns</li>
            <li>3. Generate location reports</li>
            <li>4. Read-only access</li>
          </ul>
        </div>
      </div>
    </div>
  );
}