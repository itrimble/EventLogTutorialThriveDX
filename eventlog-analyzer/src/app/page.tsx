import React from 'react';
import TotalEventsWidget from '@/components/dashboard/TotalEventsWidget';
import CriticalAlertsWidget from '@/components/dashboard/CriticalAlertsWidget';
import RecentLogSourcesWidget from '@/components/dashboard/RecentLogSourcesWidget'; 
import SystemHealthWidget from '@/components/dashboard/SystemHealthWidget';
import LogSourceSelector from '@/components/dashboard/LogSourceSelector';
import ActiveLogSourcesWidget from '@/components/dashboard/ActiveLogSourcesWidget';

const DashboardPage: React.FC = () => {
  const topEventIdsContent = (
    <ul className="space-y-1">
      <li>4625 (Failed Logon): <span className="font-semibold">102</span></li>
      <li>4688 (Process Create): <span className="font-semibold">85</span></li>
      <li>1102 (Log Cleared): <span className="font-semibold">5</span></li>
    </ul>
  );

  const recentDetectionsContent = (
    <ul className="space-y-1 list-disc list-inside">
      <li>Logon from unusual IP (192.168.1.100)</li>
      <li>Attempt to clear audit log (DC01)</li>
      <li>Potential malware: suspicious.exe (WKSTN03)</li>
    </ul>
  );

  return (
    <div className="space-y-8 p-4 md:p-6"> {/* Added padding to the main container */}
      <h1 className="text-2xl md:text-3xl font-semibold text-gray-100 mb-6">Main Dashboard</h1>

      {/* Overview Widgets Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <TotalEventsWidget /> {/* Mock value: "15,789" from its own definition */}
        <CriticalAlertsWidget /> {/* Mock value: "23" from its own definition */}
        <ActiveLogSourcesWidget count="3/3" /> {/* Using the new specific widget */}
        <SystemHealthWidget /> {/* Mock value: "Normal" from its own definition */}
      </div>

      {/* Log Source Selector - Assuming it's best placed after overview and before more detailed cards */}
      <div className="mb-8">
        <LogSourceSelector />
      </div>

      {/* Summary Cards Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gray-700 p-4 md:p-6 rounded-lg shadow-lg">
          <h3 className="text-lg font-semibold text-gray-100 mb-3">High-Severity Events Today</h3>
          <p className="text-gray-300">5 new, 2 unresolved</p>
        </div>
        <div className="bg-gray-700 p-4 md:p-6 rounded-lg shadow-lg">
          <h3 className="text-lg font-semibold text-gray-100 mb-3">Top Event IDs (Last 24h)</h3>
          <div className="text-gray-300">{topEventIdsContent}</div>
        </div>
        <div className="bg-gray-700 p-4 md:p-6 rounded-lg shadow-lg">
          <h3 className="text-lg font-semibold text-gray-100 mb-3">Active Hosts Reporting</h3>
          <p className="text-gray-300">17 hosts</p>
        </div>
        <div className="bg-gray-700 p-4 md:p-6 rounded-lg shadow-lg">
          <h3 className="text-lg font-semibold text-gray-100 mb-3">Recent Detections</h3>
          <div className="text-gray-300">{recentDetectionsContent}</div>
        </div>
      </div>
      
      {/* Existing placeholders - can be kept or removed based on overall dashboard design */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        <RecentLogSourcesWidget /> {/* This lists sources, distinct from active count */}
        <div className="bg-gray-700 p-6 rounded-lg shadow-lg">
          <h3 className="text-xl font-semibold text-gray-100 mb-3">Event Trends (Placeholder)</h3>
          <p className="text-gray-300">Chart or detailed information will be here.</p>
          <div className="mt-4 h-48 bg-gray-600 rounded flex items-center justify-center">
            <p className="text-gray-400">Chart Placeholder</p>
          </div>
        </div>
      </div>
      
      <div className="mt-6 bg-gray-700 p-6 rounded-lg shadow-lg">
        <h3 className="text-xl font-semibold text-gray-100 mb-3">Activity Log (Placeholder)</h3>
        <ul className="space-y-2 text-gray-300">
          <li>User JohnDoe accessed Dashboard - 1 min ago</li>
          <li>System alert triggered: High CPU usage on Server01 - 5 mins ago</li>
          <li>New log source &apos;Firewall-East&apos; added - 15 mins ago</li>
          <li>User JaneSmith ran analysis report &apos;Security_Anomalies_Q2&apos; - 1 hour ago</li>
        </ul>
      </div>
    </div>
  );
};

export default DashboardPage;
