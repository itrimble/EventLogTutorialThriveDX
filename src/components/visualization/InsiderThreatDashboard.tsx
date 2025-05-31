import React, { useEffect, useState } from 'react';

interface UserBehavior {
  user: string;
  action: string;
  riskScore: number;
}

interface DataAccess {
  userOrRole: string;
  resource: string;
  accessLevel: string;
}

interface Activity {
  timestamp: string;
  action: string;
  details?: string;
}

interface SessionTimeline {
  sessionId: string;
  user: string;
  startTime: string;
  endTime: string;
  activities: Activity[];
}

interface InsiderThreatData {
  userBehaviorHeatmap: UserBehavior[];
  dataAccessMatrix: DataAccess[];
  sessionTimelineViewer: SessionTimeline[];
}

const InsiderThreatDashboard: React.FC = () => {
  const [data, setData] = useState<InsiderThreatData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/dashboards/insider_threat')
      .then(res => {
        if (!res.ok) {
          throw new Error(`Failed to fetch data: ${res.status} ${res.statusText}`);
        }
        return res.json();
      })
      .then(fetchedData => {
        setData(fetchedData);
      })
      .catch(err => {
        setError(err.message);
        console.error("Failed to fetch insider threat data:", err);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-center p-8 text-gray-100">Loading Insider Threat data...</div>;
  if (error) return <div className="text-center p-8 text-red-500">Error: {error}</div>;
  if (!data) return <div className="text-center p-8 text-gray-100">No data available.</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 p-4 md:p-6">
      {/* User Behavior Heatmap Placeholder */}
      <div className="lg:col-span-3 bg-gray-800 p-4 md:p-6 rounded-lg shadow-xl">
        <h3 className="text-lg font-semibold text-gray-100 mb-4">User Behavior Heatmap (Placeholder)</h3>
        <div className="overflow-x-auto max-h-96">
          {data.userBehaviorHeatmap && data.userBehaviorHeatmap.length > 0 ? (
            <table className="w-full text-sm text-left text-gray-400">
              <thead className="text-xs text-gray-100 uppercase bg-gray-700">
                <tr>
                  <th scope="col" className="py-3 px-6">User</th>
                  <th scope="col" className="py-3 px-6">Action</th>
                  <th scope="col" className="py-3 px-6">Risk Score</th>
                </tr>
              </thead>
              <tbody>
                {data.userBehaviorHeatmap.map((item, index) => (
                  <tr key={index} className="bg-gray-800 border-b border-gray-700 hover:bg-gray-600">
                    <td className="py-4 px-6 font-medium text-gray-200 whitespace-nowrap">{item.user}</td>
                    <td className="py-4 px-6">{item.action}</td>
                    <td className="py-4 px-6 text-center">{item.riskScore}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-gray-400">No user behavior data available.</p>
          )}
        </div>
      </div>

      {/* Data Access Matrix Placeholder */}
      <div className="lg:col-span-3 bg-gray-800 p-4 md:p-6 rounded-lg shadow-xl">
        <h3 className="text-lg font-semibold text-gray-100 mb-4">Data Access Matrix (Placeholder)</h3>
        <div className="overflow-x-auto max-h-96">
          {data.dataAccessMatrix && data.dataAccessMatrix.length > 0 ? (
            <table className="w-full text-sm text-left text-gray-400">
              <thead className="text-xs text-gray-100 uppercase bg-gray-700">
                <tr>
                  <th scope="col" className="py-3 px-6">User/Role</th>
                  <th scope="col" className="py-3 px-6">Resource</th>
                  <th scope="col" className="py-3 px-6">Access Level</th>
                </tr>
              </thead>
              <tbody>
                {data.dataAccessMatrix.map((item, index) => (
                  <tr key={index} className="bg-gray-800 border-b border-gray-700 hover:bg-gray-600">
                    <td className="py-4 px-6 font-medium text-gray-200 whitespace-nowrap">{item.userOrRole}</td>
                    <td className="py-4 px-6">{item.resource}</td>
                    <td className="py-4 px-6">{item.accessLevel}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-gray-400">No data access matrix data available.</p>
          )}
        </div>
      </div>

      {/* Session Timeline Viewer Placeholder */}
      <div className="lg:col-span-3 bg-gray-800 p-4 md:p-6 rounded-lg shadow-xl">
        <h3 className="text-lg font-semibold text-gray-100 mb-4">Session Timeline Viewer (Placeholder)</h3>
        <div className="overflow-y-auto max-h-96 space-y-4">
          {data.sessionTimelineViewer && data.sessionTimelineViewer.length > 0 ? (
            data.sessionTimelineViewer.map((session) => (
              <div key={session.sessionId} className="p-3 bg-gray-700 rounded-md">
                <p className="font-semibold text-gray-200">Session: {session.sessionId} (User: {session.user})</p>
                <p className="text-xs text-gray-400">
                  {new Date(session.startTime).toLocaleString()} - {new Date(session.endTime).toLocaleString()}
                </p>
                <ul className="list-disc list-inside pl-2 mt-1 space-y-1 text-sm">
                  {session.activities.map((activity, actIndex) => (
                    <li key={actIndex} className="text-gray-300">
                      <span className="font-medium">{activity.action}</span> ({new Date(activity.timestamp).toLocaleTimeString()}): {activity.details || 'N/A'}
                    </li>
                  ))}
                </ul>
              </div>
            ))
          ) : (
            <p className="text-gray-400">No session timeline data available.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default InsiderThreatDashboard;
