import React, { useState } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import {
  HomeIcon,
  ExclamationTriangleIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  Bars3Icon,
  XMarkIcon,
  BellIcon,
  ShoppingBagIcon,
  UserIcon
} from '@heroicons/react/24/outline';

const SupplierLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const navigation = [
    { name: 'Dashboard', href: '/supplier', icon: HomeIcon },
    { name: 'My Products', href: '/supplier/products', icon: ShoppingBagIcon },
    { name: 'Complaints', href: '/supplier/complaints', icon: ExclamationTriangleIcon },
    { name: 'Analytics', href: '/supplier/analytics', icon: ChartBarIcon },
    { name: 'Notifications', href: '/supplier/notifications', icon: BellIcon },
    { name: 'Profile', href: '/supplier/profile', icon: UserIcon },
    { name: 'Settings', href: '/supplier/settings', icon: Cog6ToothIcon },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="flex h-screen pt-16">
        {/* Mobile sidebar */}
        <div className={`fixed inset-0 flex z-40 lg:hidden ${sidebarOpen ? '' : 'pointer-events-none'}`}>
          <div
            className={`fixed inset-0 bg-gray-600 bg-opacity-75 transition-opacity ${
              sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
            onClick={() => setSidebarOpen(false)}
          />
          <div
            className={`relative flex-1 flex flex-col max-w-xs w-full bg-white transition-transform ${
              sidebarOpen ? 'translate-x-0' : '-translate-x-full'
            }`}
          >
            <div className="absolute top-0 right-0 -mr-12 pt-2">
              <button
                type="button"
                className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                onClick={() => setSidebarOpen(false)}
              >
                <XMarkIcon className="h-6 w-6 text-white" />
              </button>
            </div>
            <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
              <div className="px-4">
                <h2 className="text-lg font-semibold text-gray-900">Supplier Portal</h2>
              </div>
              <nav className="mt-8 px-4">
                <div className="space-y-1">
                  {navigation.map((item) => (
                    <NavLink
                      key={item.name}
                      to={item.href}
                      className={({ isActive }) =>
                        `group flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-colors ${
                          isActive
                            ? 'bg-green-100 text-green-700 border-r-2 border-green-500'
                            : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                        }`
                      }
                    >
                      <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
                      {item.name}
                    </NavLink>
                  ))}
                </div>
              </nav>
            </div>
          </div>
        </div>

        {/* Desktop sidebar */}
        <div className="hidden lg:flex lg:flex-shrink-0">
          <div className="flex flex-col w-72 border-r border-gray-200 bg-white">
            <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
              <div className="px-6 pb-4 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-900">Supplier Portal</h2>
                <p className="text-sm text-gray-600 mt-1">Manage your products and complaints</p>
              </div>
              <nav className="mt-6 px-6">
                <div className="space-y-2">
                  {navigation.map((item) => (
                    <NavLink
                      key={item.name}
                      to={item.href}
                      className={({ isActive }) =>
                        `group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                          isActive
                            ? 'bg-green-50 text-green-700 border-l-4 border-green-500 shadow-sm'
                            : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900 hover:shadow-sm'
                        }`
                      }
                    >
                      <item.icon 
                        className={`mr-4 h-5 w-5 flex-shrink-0 transition-colors ${
                          location.pathname === item.href ? 'text-green-500' : 'text-gray-400'
                        }`} 
                      />
                      {item.name}
                    </NavLink>
                  ))}
                </div>
              </nav>

              {/* Quick Stats */}
              <div className="mt-8 px-6">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                  Quick Stats
                </h3>
                <div className="space-y-3">
                  <div className="bg-green-50 p-3 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">Active Products</span>
                      <span className="text-sm font-semibold text-green-600">12</span>
                    </div>
                  </div>
                  <div className="bg-orange-50 p-3 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">Open Complaints</span>
                      <span className="text-sm font-semibold text-orange-600">3</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile menu button */}
        <div className="lg:hidden fixed top-20 left-4 z-10">
          <button
            type="button"
            className="bg-white p-2 rounded-md text-gray-500 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-green-500 shadow-lg"
            onClick={() => setSidebarOpen(true)}
          >
            <Bars3Icon className="h-6 w-6" />
          </button>
        </div>

        {/* Main content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 px-6 py-8">
            <div className="max-w-7xl mx-auto">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default SupplierLayout;
