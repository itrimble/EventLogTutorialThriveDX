import React, { useEffect, useState } from 'react';

interface CloudAppRisk {
  app: string;
  dataSharingRisk: string;
  complianceRisk: string;
  accessControlRisk: string;
  overallRiskScore: number;
}

interface FileSharingExposureItem {
  fileId: string;
  fileName: string;
  app: string;
  currentExposure: string;
  recommendedAction: string;
  remediated: boolean;
  remediationDate?: string;
}

// The API returns CASBPolicyEnforcement as an array, with the last element being an object containing fileSharingExposure
// This is a bit unusual. We'll handle this structure.
interface CASBPolicy {
  policyName: string;
  app: string;
  actionsTaken: number;
  lastTriggered: string;
}

type CASBPolicyEnforcementDataItem = CASBPolicy | { fileSharingExposure: FileSharingExposureItem[] };


interface CASBData {
  cloudAppRiskMatrix: CloudAppRisk[];
  casbPolicyEnforcement: CASBPolicyEnforcementDataItem[];
}

const CASBDashboard: React.FC = () => {
  const [data, setData] = useState<CASBData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [policies, setPolicies] = useState<CASBPolicy[]>([]);
  const [fileExposure, setFileExposure] = useState<FileSharingExposureItem[]>([]);

  useEffect(() => {
    fetch('/api/dashboards/casb_integration')
      .then(res => {
        if (!res.ok) {
          throw new Error(`Failed to fetch data: ${res.status} ${res.statusText}`);
        }
        return res.json();
      })
      .then((fetchedData: CASBData) => {
        setData(fetchedData);
        // Separate policies from file exposure data
        const policyItems: CASBPolicy[] = [];
        let exposureItems: FileSharingExposureItem[] = [];

        if (fetchedData.casbPolicyEnforcement) {
          fetchedData.casbPolicyEnforcement.forEach(item => {
            if ('fileSharingExposure' in item) {
              exposureItems = item.fileSharingExposure;
            } else if ('policyName' in item) { // Type guard for CASBPolicy
              policyItems.push(item as CASBPolicy);
            }
          });
        }
        setPolicies(policyItems);
        setFileExposure(exposureItems);
      })
      .catch(err => {
        setError(err.message);
        console.error("Failed to fetch CASB integration data:", err);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-center p-8 text-gray-100">Loading CASB Integration data...</div>;
  if (error) return <div className="text-center p-8 text-red-500">Error: {error}</div>;
  if (!data) return <div className="text-center p-8 text-gray-100">No data available.</div>;

  const getRiskScoreClass = (score: number) => {
    if (score >= 7) return 'text-red-400 font-bold';
    if (score >= 4) return 'text-yellow-400 font-semibold';
    return 'text-green-400';
  };

  const getRiskLevelClass = (level: string) => {
    switch (level.toLowerCase()) {
      case 'critical': return 'text-red-500 font-bold';
      case 'high': return 'text-red-400 font-semibold';
      case 'medium': return 'text-yellow-400';
      case 'low': return 'text-green-400';
      default: return 'text-gray-300';
    }
  };


  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 p-4 md:p-6">
      {/* Cloud App Risk Matrix */}
      <div className="lg:col-span-2 bg-gray-800 p-4 md:p-6 rounded-lg shadow-xl">
        <h3 className="text-lg font-semibold text-gray-100 mb-4">Cloud App Risk Matrix</h3>
        <div className="overflow-x-auto">
          {data.cloudAppRiskMatrix && data.cloudAppRiskMatrix.length > 0 ? (
            <table className="w-full text-sm text-left text-gray-400">
              <thead className="text-xs text-gray-100 uppercase bg-gray-700">
                <tr>
                  <th scope="col" className="py-3 px-6">Application</th>
                  <th scope="col" className="py-3 px-6">Data Sharing Risk</th>
                  <th scope="col" className="py-3 px-6">Compliance Risk</th>
                  <th scope="col" className="py-3 px-6">Access Control Risk</th>
                  <th scope="col" className="py-3 px-6 text-center">Overall Risk Score</th>
                </tr>
              </thead>
              <tbody>
                {data.cloudAppRiskMatrix.map((app) => (
                  <tr key={app.app} className="bg-gray-800 border-b border-gray-700 hover:bg-gray-600">
                    <td className="py-4 px-6 font-medium text-gray-200 whitespace-nowrap">{app.app}</td>
                    <td className={`py-4 px-6 ${getRiskLevelClass(app.dataSharingRisk)}`}>{app.dataSharingRisk}</td>
                    <td className={`py-4 px-6 ${getRiskLevelClass(app.complianceRisk)}`}>{app.complianceRisk}</td>
                    <td className={`py-4 px-6 ${getRiskLevelClass(app.accessControlRisk)}`}>{app.accessControlRisk}</td>
                    <td className={`py-4 px-6 text-center ${getRiskScoreClass(app.overallRiskScore)}`}>{app.overallRiskScore}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-gray-400">No cloud app risk data available.</p>
          )}
        </div>
      </div>

      {/* CASB Policy Enforcement */}
      <div className="lg:col-span-1 bg-gray-800 p-4 md:p-6 rounded-lg shadow-xl">
        <h3 className="text-lg font-semibold text-gray-100 mb-4">CASB Policy Enforcement Actions</h3>
        <div className="overflow-y-auto max-h-96 space-y-3">
          {policies.length > 0 ? (
            policies.map((policy, index) => (
              <div key={index} className="p-3 bg-gray-700 rounded-md text-sm">
                <p className="font-semibold text-gray-200">{policy.policyName}</p>
                <p className="text-gray-300">App: {policy.app}</p>
                <p className="text-gray-300">Actions Taken: {policy.actionsTaken.toLocaleString()}</p>
                <p className="text-xs text-gray-500">Last Triggered: {new Date(policy.lastTriggered).toLocaleString()}</p>
              </div>
            ))
          ) : (
            <p className="text-gray-400">No CASB policy enforcement data available.</p>
          )}
        </div>
      </div>

      {/* File Sharing Exposure */}
      <div className="lg:col-span-1 bg-gray-800 p-4 md:p-6 rounded-lg shadow-xl">
        <h3 className="text-lg font-semibold text-gray-100 mb-4">File Sharing Exposure</h3>
        <div className="overflow-y-auto max-h-96 space-y-3">
          {fileExposure.length > 0 ? (
            fileExposure.map((file, index) => (
              <div key={file.fileId || index} className="p-3 bg-gray-700 rounded-md text-sm">
                <p className="font-semibold text-gray-200 truncate" title={file.fileName}>{file.fileName}</p>
                <p className="text-gray-300">App: {file.app}</p>
                <p className="text-gray-300">Exposure: <span className="font-semibold text-yellow-400">{file.currentExposure}</span></p>
                <p className="text-gray-300">Recommendation: {file.recommendedAction}</p>
                <p className={`font-semibold ${file.remediated ? 'text-green-400' : 'text-red-400'}`}>
                  Status: {file.remediated ? `Remediated (${file.remediationDate ? new Date(file.remediationDate).toLocaleDateString() : 'N/A'})` : 'Outstanding'}
                </p>
              </div>
            ))
          ) : (
            <p className="text-gray-400">No file sharing exposure data available.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default CASBDashboard;
