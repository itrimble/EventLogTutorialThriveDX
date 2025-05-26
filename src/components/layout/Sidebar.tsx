"use client"; 

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation'; // Import usePathname
import { 
  ChevronLeftIcon, 
  ChevronRightIcon, 
  HomeIcon, 
  MagnifyingGlassIcon, 
  ChartBarIcon, 
  BellIcon, 
  CogIcon,
  CommandLineIcon, // Existing icon
  EyeIcon, // Existing icon for Visualizations
  DocumentTextIcon // New icon for Reporting
} from '@heroicons/react/24/outline';

const Sidebar: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname(); // Get current path

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const navItems = [
    { href: '/', label: 'Dashboard', icon: HomeIcon },
    { href: '/explorer', label: 'Explorer', icon: MagnifyingGlassIcon },
    { href: '/siem_queries', label: 'SIEM Queries', icon: CommandLineIcon }, 
    { href: '/visualizations', label: 'Visualizations', icon: EyeIcon }, 
    { href: '/reporting', label: 'Reporting', icon: DocumentTextIcon }, // New Reporting link
    { href: '/analysis', label: 'Analysis', icon: ChartBarIcon },
    { href: '/alerts', label: 'Alerts', icon: BellIcon },
    { href: '/settings', label: 'Settings', icon: CogIcon },
  ];

  return (
    <aside className={`bg-gray-700 text-white transition-all duration-300 ease-in-out ${isCollapsed ? 'w-20' : 'w-64'} h-screen flex flex-col`}>
      <div className="p-4 flex items-center justify-between">
        {!isCollapsed && <span className="font-semibold text-lg">Navigation</span>}
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500"
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? <ChevronRightIcon className="h-6 w-6" /> : <ChevronLeftIcon className="h-6 w-6" />}
        </button>
      </div>
      <nav className="flex-grow">
        <ul>
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <li key={item.label} className="mb-1 mx-2">
                <Link href={item.href} legacyBehavior>
                  <a 
                    className={`flex items-center p-3 rounded-md transition-colors duration-150 ease-in-out
                               ${isCollapsed ? 'justify-center' : ''}
                               ${isActive 
                                 ? 'bg-blue-600 text-white shadow-lg' 
                                 : 'text-gray-300 hover:bg-gray-600 hover:text-white'
                               }`}
                  >
                    <item.icon className={`h-6 w-6 ${!isCollapsed ? 'mr-3' : ''}`} />
                    {!isCollapsed && <span className="font-medium">{item.label}</span>}
                  </a>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      {!isCollapsed && (
        <div className="p-4 border-t border-gray-600">
          <p className="text-xs text-gray-400">EventLog Analyzer v0.1</p>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
