import React, { useEffect, useState } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Define an interface for the expected API response structure
interface AuthData {
  totalLogins: { successful: number; failed: number };
  orphanedAccountCount: number;
  authAttemptsOverTime: Array<{ time: string; windows: number; linux: number; macos: number }>;
  successVsFailureRates: Array<{ application: string; successful: number; failed: number }>;
  loginAttemptsByCountry: Array<{ country: string; attempts: number }>; // Changed from 'count' to 'attempts'
  topUsersFailedLogins: Array<{ userId: string; failedAttempts: number }>; // Changed from 'user' and 'attempts'
  peakAuthTimes: number[][]; // Adjusted to match API: array of arrays of numbers
}

const AuthenticationDashboard: React.FC = () => {
  const [data, setData] = useState<AuthData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/dashboards/authentication')
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
        console.error("Failed to fetch authentication data:", err);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-center p-8 text-gray-100">Loading authentication data...</div>;
  if (error) return <div className="text-center p-8 text-red-500">Error: {error}</div>;
  if (!data) return <div className="text-center p-8 text-gray-100">No data available.</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 p-4 md:p-6">
      {/* Top Row: Metric Cards & Geo-Map Placeholder */}
      <div className="lg:col-span-1 bg-gray-800 p-4 md:p-6 rounded-lg shadow-xl">
        <h3 className="text-lg font-semibold text-gray-100 mb-2">Total Logins</h3>
        <p className="text-3xl font-bold text-blue-400">{data.totalLogins.successful.toLocaleString()}</p>
        <p className="text-sm text-gray-400 mb-2">Successful</p>
        <p className="text-3xl font-bold text-red-400">{data.totalLogins.failed.toLocaleString()}</p>
        <p className="text-sm text-gray-400">Failed</p>
      </div>

      <div className="lg:col-span-1 bg-gray-800 p-4 md:p-6 rounded-lg shadow-xl">
        <h3 className="text-lg font-semibold text-gray-100 mb-2">Orphaned Accounts</h3>
        <p className="text-4xl font-bold text-yellow-400">{data.orphanedAccountCount}</p>
      </div>

      <div className="lg:col-span-1 bg-gray-800 p-4 md:p-6 rounded-lg shadow-xl">
        <h3 className="text-lg font-semibold text-gray-100 mb-2">MFA Adoption (Placeholder)</h3>
        <p className="text-4xl font-bold text-gray-500">N/A</p>
        <p className="text-sm text-gray-400">Data to be integrated</p>
      </div>

      <div className="lg:col-span-3 bg-gray-800 p-4 md:p-6 rounded-lg shadow-xl"> {/* Geo-Map Placeholder taking full width of its own row */}
        <h3 className="text-lg font-semibold text-gray-100 mb-2">Login Attempts by Country (Placeholder)</h3>
        <div className="overflow-auto max-h-40 text-sm text-gray-300">
          {data.loginAttemptsByCountry.length > 0 ? (
            data.loginAttemptsByCountry.map(c => (
              <span key={c.country} className="mr-4">{c.country}: {c.attempts.toLocaleString()}</span>
            ))
          ) : (
            <p>No country data available.</p>
          )}
        </div>
      </div>

      {/* Middle Row: Charts */}
      <div className="lg:col-span-2 bg-gray-800 p-4 md:p-6 rounded-lg shadow-xl h-96">
        <h3 className="text-lg font-semibold text-gray-100 mb-4">Authentication Attempts Over Time</h3>
        <ResponsiveContainer width="100%" height="85%">
          <LineChart data={data.authAttemptsOverTime}>
            <CartesianGrid strokeDasharray="3 3" stroke="#4b5563" />
            <XAxis dataKey="time" stroke="#9ca3af" tickFormatter={(timeStr) => new Date(timeStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} />
            <YAxis stroke="#9ca3af" />
            <Tooltip
              contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #4b5563', borderRadius: '0.5rem' }}
              labelStyle={{ color: '#e5e7eb', fontWeight: 'bold' }}
              itemStyle={{ color: '#d1d5db' }}
            />
            <Legend wrapperStyle={{ color: '#e5e7eb' }} />
            <Line type="monotone" dataKey="windows" stroke="#3b82f6" name="Windows" dot={false} />
            <Line type="monotone" dataKey="linux" stroke="#22c55e" name="Linux" dot={false} />
            <Line type="monotone" dataKey="macos" stroke="#f59e0b" name="macOS" dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="lg:col-span-1 bg-gray-800 p-4 md:p-6 rounded-lg shadow-xl h-96">
        <h3 className="text-lg font-semibold text-gray-100 mb-4">Success vs. Failure by Application</h3>
         <ResponsiveContainer width="100%" height="85%">
          <BarChart data={data.successVsFailureRates}>
            <CartesianGrid strokeDasharray="3 3" stroke="#4b5563" />
            <XAxis dataKey="application" stroke="#9ca3af" />
            <YAxis stroke="#9ca3af" />
            <Tooltip
              contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #4b5563', borderRadius: '0.5rem' }}
              labelStyle={{ color: '#e5e7eb', fontWeight: 'bold' }}
              itemStyle={{ color: '#d1d5db' }}
            />
            <Legend wrapperStyle={{ color: '#e5e7eb' }} />
            <Bar dataKey="successful" stackId="a" fill="#22c55e" name="Successful" />
            <Bar dataKey="failed" stackId="a" fill="#ef4444" name="Failed" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Heatmap Placeholder - Spanning full width */}
      <div className="lg:col-span-3 bg-gray-800 p-4 md:p-6 rounded-lg shadow-xl">
        <h3 className="text-lg font-semibold text-gray-100 mb-2">Peak Authentication Times (Raw Data Placeholder)</h3>
        <div className="overflow-x-auto text-xs text-gray-400 max-h-48">
          <p className="mb-1 text-sm text-gray-300">Activity heatmap (Hour of Day vs. Day of Week)</p>
          {data.peakAuthTimes.length > 0 ? (
            data.peakAuthTimes.map((row, rowIndex) => (
              <div key={rowIndex} className="flex">
                <span className="w-12 font-semibold">{rowIndex.toString().padStart(2, '0')}:00 </span>
                {row.map((val, colIndex) => (
                  <span key={colIndex} className="w-8 text-center" title={`Day ${colIndex + 1}, Hour ${rowIndex}: ${val} attempts`}>{val}</span>
                ))}
              </div>
            ))
          ) : (
            <p>No peak time data available.</p>
          )}
        </div>
      </div>

      {/* Bottom Row: Table & Placeholders */}
      <div className="lg:col-span-3 bg-gray-800 p-4 md:p-6 rounded-lg shadow-xl">
        <h3 className="text-lg font-semibold text-gray-100 mb-4">Top 10 Users with Failed Logins</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-400">
            <thead className="text-xs text-gray-100 uppercase bg-gray-700">
              <tr>
                <th scope="col" className="py-3 px-6">User ID</th>
                <th scope="col" className="py-3 px-6">Failed Attempts</th>
              </tr>
            </thead>
            <tbody>
              {data.topUsersFailedLogins.length > 0 ? (
                data.topUsersFailedLogins.map((userLogin, index) => (
                  <tr key={index} className="bg-gray-800 border-b border-gray-700 hover:bg-gray-600">
                    <td className="py-4 px-6 font-medium text-gray-200 whitespace-nowrap">{userLogin.userId}</td>
                    <td className="py-4 px-6 text-center">{userLogin.failedAttempts}</td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan={2} className="text-center py-4">No data on users with failed logins.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

       <div className="lg:col-span-3 bg-gray-800 p-4 md:p-6 rounded-lg shadow-xl">
        <h3 className="text-lg font-semibold text-gray-100 mb-2">Privileged Access & RBAC (Placeholder)</h3>
        <p className="text-gray-400">Detailed privileged access alerts and RBAC status will be shown here.</p>
      </div>

    </div>
  );
};

export default AuthenticationDashboard;
