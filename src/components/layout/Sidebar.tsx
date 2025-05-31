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
  DocumentTextIcon, // New icon for Reporting
  LockClosedIcon,
  UserGroupIcon,
  ShieldCheckIcon,
  TruckIcon,
  CloudIcon
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
    // New specialized dashboard links:
    { href: '/visualizations', label: 'Auth & Access', icon: LockClosedIcon, isSubItem: true },
    { href: '/visualizations', label: 'Insider Threat', icon: UserGroupIcon, isSubItem: true },
    { href: '/visualizations', label: 'Malware Defense', icon: ShieldCheckIcon, isSubItem: true },
    { href: '/visualizations', label: 'Supply Chain Risk', icon: TruckIcon, isSubItem: true },
    { href: '/visualizations', label: 'CASB', icon: CloudIcon, isSubItem: true },
    { href: '/reporting', label: 'Reporting', icon: DocumentTextIcon },
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
          {navItems.map((item: any) => { // Added :any to item to allow isSubItem
            const isActive = pathname === item.href;
            // For sub-items, we want the main /visualizations link to appear active if any sub-item's href matches the current path,
            // but the sub-item itself should only be "active" if its specific label is the one being "viewed" (though href is the same).
            // However, since all hrefs are currently /visualizations, this specific highlighting for sub-items isn't directly possible yet
            // without changing hrefs or adding more state to manage active sub-tab.
            // For now, any /visualizations path will make "Visualizations" and all its sub-items appear active.

            // A more specific active check for the parent "Visualizations" link:
            const isParentActive = item.label === 'Visualizations' && pathname === '/visualizations';
            // A check to see if current path is /visualizations, for sub-items
            const isVisualizationPage = pathname === '/visualizations';

            let itemIsActive = isActive;
            if (item.isSubItem && isVisualizationPage && !isParentActive) {
              // If we are on /visualizations, and this is a sub-item,
              // we don't want it to show the main "active" state unless the parent also would.
              // This logic might need refinement when sub-items have unique HREFs.
              // For now, they will all highlight if path is /visualizations.
            }


            return (
              <li key={item.label} className="mb-1 mx-2">
                <Link href={item.href} legacyBehavior>
                  <a 
                    className={`flex items-center p-3 rounded-md transition-colors duration-150 ease-in-out
                               ${isCollapsed ? 'justify-center' : ''}
                               ${!isCollapsed && item.isSubItem ? 'pl-6' : ''} // Indent sub-items when not collapsed
                               ${(itemIsActive || (item.label === 'Visualizations' && isVisualizationPage))
                                 ? 'bg-blue-600 text-white shadow-lg' 
                                 : 'text-gray-300 hover:bg-gray-600 hover:text-white'
                               }`}
                  >
                    <item.icon className={`h-6 w-6 ${!isCollapsed ? 'mr-3' : ''} ${(itemIsActive || (item.label === 'Visualizations' && isVisualizationPage)) ? 'text-white' : 'text-gray-400 group-hover:text-gray-200'}`} />
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
