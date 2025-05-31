import React, { useEffect, useState, Suspense } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import ReactECharts from 'echarts-for-react';
import { ResponsiveHeatMap } from '@nivo/heatmap';
import 'echarts/lib/chart/map';
import 'echarts/map/js/world';


// Define an interface for the expected API response structure
interface GeoDataItem {
  name: string;
  value: [number, number]; // [successful, failed]
}

interface HeatmapDataItem {
  id: string; // Day of the week e.g., "Mon"
  data: Array<{ x: string; y: number }>; // x: hour e.g., "00:00", y: count
}

interface AuthData {
  totalLogins: { successful: number; failed: number };
  orphanedAccountCount: number;
  authAttemptsOverTime: Array<{ time: string; windows: number; linux: number; macos: number }>;
  successVsFailureRates: Array<{ application: string; successful: number; failed: number }>;
  loginAttemptsByCountry: Array<{ country: string; attempts: number }>;
  topUsersFailedLogins: Array<{ userId: string; failedAttempts: number }>;
  peakAuthTimes: number[][];
  loginAttemptsGeo: GeoDataItem[];
  peakAuthTimesHeatmap: HeatmapDataItem[];
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

      {/* Geo Map - taking full width of its own row */}
      <div className="lg:col-span-3 bg-gray-800 p-4 md:p-6 rounded-lg shadow-xl h-96 md:h-[500px]">
        <h3 className="text-lg font-semibold text-gray-100 mb-4">Login Attempts Geo Distribution</h3>
        {data.loginAttemptsGeo && data.loginAttemptsGeo.length > 0 ? (
          <ReactECharts
            option={{
              tooltip: {
                trigger: 'item',
                formatter: (params: any) => {
                  if (params.data && typeof params.data.originalSuccessful === 'number' && typeof params.data.originalFailed === 'number') {
                    return `${params.name}<br/>Successful: ${params.data.originalSuccessful.toLocaleString()}<br/>Failed: ${params.data.originalFailed.toLocaleString()}<br/>Total: ${params.value.toLocaleString()}`;
                  }
                  return `${params.name}: ${params.value != null ? params.value.toLocaleString() : 'N/A'} (Total Attempts)`;
                }
              },
              visualMap: {
                min: 0,
                max: data.loginAttemptsGeo.length > 0 ? data.loginAttemptsGeo.reduce((max, item) => Math.max(max, item.value[0] + item.value[1]), 0) : 0,
                left: 'left',
                top: 'bottom',
                text: ['High', 'Low'],
                calculable: true,
                inRange: {
                  color: ['#50A3BA', '#E08A7F', '#D94E5D'] // Example: light blue to red
                },
                textStyle: { color: '#fff' }
              },
              series: [
                {
                  name: 'Login Attempts',
                  type: 'map',
                  map: 'world',
                  roam: true,
                  emphasis: {
                    label: { show: true, color: '#fff' },
                    itemStyle: { areaColor: '#A9D0F5' }
                  },
                  itemStyle: {
                    areaColor: '#323c48',
                    borderColor: '#111'
                  },
                  data: data.loginAttemptsGeo.map(item => ({
                    name: item.name,
                    value: item.value[0] + item.value[1],
                    originalSuccessful: item.value[0],
                    originalFailed: item.value[1]
                  })),
                }
              ],
              backgroundColor: 'transparent',
            }}
            style={{ height: '100%', width: '100%' }}
            notMerge={true}
            lazyUpdate={true}
          />
        ) : (
          <p className="text-gray-400 text-center pt-10">No geo-map data available.</p>
        )}
      </div>

      {/* Middle Row: Charts (Line and Bar) */}
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
      {/* Heatmap - Spanning full width */}
      <div className="lg:col-span-3 bg-gray-800 p-4 md:p-6 rounded-lg shadow-xl h-96 md:h-[500px]">
        <h3 className="text-lg font-semibold text-gray-100 mb-4">Peak Authentication Times (Hour of Day vs. Day of Week)</h3>
        {data.peakAuthTimesHeatmap && data.peakAuthTimesHeatmap.length > 0 ? (
          <ResponsiveHeatMap
            data={data.peakAuthTimesHeatmap}
            indexBy="id" // Days of the week ('Mon', 'Tue', etc.)
            keys={data.peakAuthTimesHeatmap[0] && data.peakAuthTimesHeatmap[0].data ? data.peakAuthTimesHeatmap[0].data.map(d => d.x) : []} // Hours of the day ("00:00", "01:00", ...)
            margin={{ top: 70, right: 90, bottom: 60, left: 90 }} // Adjusted top margin
            axisTop={{
              tickSize: 5,
              tickPadding: 5,
              tickRotation: -55, // Steeper rotation for hour labels
              legend: 'Hour of Day',
              legendPosition: 'middle',
              legendOffset: -60, // Adjusted offset
            }}
            axisLeft={{
              tickSize: 5,
              tickPadding: 5,
              tickRotation: 0,
              legend: 'Day of Week',
              legendPosition: 'middle',
              legendOffset: -75,
            }}
            colors={{
              type: 'sequential',
              scheme: 'inferno', // Using a more vibrant scheme
            }}
            cellOpacity={0.9}
            cellBorderWidth={1}
            cellBorderColor={{ from: 'color', modifiers: [['darker', 0.5]] }}
            labelTextColor={{ from: 'color', modifiers: [['brighter', 3]] }} // Brighter label for dark cells
            enableGridX={false} // Optional: remove vertical grid lines
            enableGridY={true}  // Optional: keep horizontal grid lines
            hoverTarget="cell"
            legends={[
              {
                anchor: 'bottom',
                translateX: 0,
                translateY: 45, // Adjusted Y position
                length: 300,
                thickness: 12,
                direction: 'row',
                tickPosition: 'after',
                tickSize: 3,
                tickSpacing: 4,
                tickOverlap: false,
                tickFormat: '~r', // More robust integer formatting
                title: 'Auth Attempts',
                titleAlign: 'middle',
                titleOffset: -10, // Position title above legend ticks
              },
            ]}
            tooltip={({ cell }) => (
              <div className="p-2 bg-gray-900 text-white rounded shadow-lg border border-gray-700">
                <strong>{cell.serieId}</strong> at <strong>{cell.label || cell.xKey}</strong> {/* cell.label or cell.xKey for hour */}
                <br />
                Attempts: {typeof cell.value === 'number' ? cell.value.toLocaleString() : 'N/A'}
              </div>
            )}
            theme={{
              axis: {
                ticks: { text: { fill: '#e5e7eb' } },
                legend: { text: { fill: '#e5e7eb' } },
              },
              legends: {
                title: { text: { fill: '#e5e7eb' } },
                ticks: { text: { fill: '#e5e7eb' } },
              },
              tooltip: {
                container: {
                  background: '#333',
                  color: '#fff',
                },
              },
            }}
          />
        ) : (
          <p className="text-gray-400 text-center pt-10">No peak time heatmap data available.</p>
        )}
      </div>

      {/* Bottom Row: Table & Placeholders (remains the same) */}
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
