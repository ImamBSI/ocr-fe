import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import {
  Menu,
  X,
  Upload,
  Users,
  TrendingUp,
  Briefcase,
  Home,
  ExternalLink,
} from 'lucide-react';
import { useUIStore } from '../store';
import { useJobRequirements, useSystem } from '../hooks';

export const Layout: React.FC = () => {
  const {
    sidebarOpen,
    currentTab,
    setSidebarOpen,
    setCurrentTab,
  } = useUIStore();
  const { fetchJobs } = useJobRequirements();
  const { healthCheck } = useSystem();

  // Check health on mount
  useEffect(() => {
    const checkHealth = async () => {
      try {
        await healthCheck();
        console.log('Backend is healthy');
      } catch (error) {
        console.error('Backend health check failed:', error);
      }
    };

    checkHealth();
    // Fetch jobs on mount
    fetchJobs();
  }, []);

  const menuItems = [
    {
      id: 'upload',
      label: 'Upload CV',
      icon: Upload,
    },
    {
      id: 'candidates',
      label: 'Candidates',
      icon: Users,
    },
    {
      id: 'ranking',
      label: 'Ranking',
      icon: TrendingUp,
    },
    {
      id: 'jobs',
      label: 'Job Requirements',
      icon: Briefcase,
    },
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div
        className={`${
          sidebarOpen ? 'w-64' : 'w-20'
        } bg-white border-r border-gray-200 transition-all duration-300 flex flex-col`}
      >
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
          {sidebarOpen && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">OCR</span>
              </div>
              <span className="font-bold text-gray-900">RecruitHub</span>
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            {sidebarOpen ? (
              <X className="w-5 h-5 text-gray-600" />
            ) : (
              <Menu className="w-5 h-5 text-gray-600" />
            )}
          </button>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 py-4 px-2 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setCurrentTab(item.id as any)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-blue-100 text-blue-600'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Icon className="w-5 h-5 shrink-0" />
                {sidebarOpen && <span className="text-sm font-medium">{item.label}</span>}
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="border-t border-gray-200 p-2">
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ExternalLink className="w-5 h-5" />
            {sidebarOpen && <span className="text-xs">GitHub</span>}
          </a>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <div className="h-16 bg-white border-b border-gray-200 flex items-center px-6">
          <div className="flex items-center gap-2">
            <Home className="w-5 h-5 text-gray-400" />
            <span className="text-sm text-gray-500">
              {menuItems.find((item) => item.id === currentTab)?.label}
            </span>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-auto">
          <div className="p-6">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Layout;