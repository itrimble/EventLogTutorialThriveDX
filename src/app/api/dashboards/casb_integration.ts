import { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const mockData = {
    cloudAppRiskMatrix: [
      // Rows: Cloud Apps, Columns: Risk Categories (e.g., Data Sharing, Compliance, Access Control)
      // Value: Risk Score (e.g., Low, Medium, High, or a numeric score)
      { app: 'Office 365', dataSharingRisk: 'Medium', complianceRisk: 'Low', accessControlRisk: 'Low', overallRiskScore: 4 },
      { app: 'Salesforce', dataSharingRisk: 'High', complianceRisk: 'Medium', accessControlRisk: 'Medium', overallRiskScore: 7 },
      { app: 'Dropbox', dataSharingRisk: 'High', complianceRisk: 'High', accessControlRisk: 'Medium', overallRiskScore: 8 },
      { app: 'Slack', dataSharingRisk: 'Medium', complianceRisk: 'Low', accessControlRisk: 'Low', overallRiskScore: 3 },
      { app: 'AWS S3 Buckets (Public)', dataSharingRisk: 'Critical', complianceRisk: 'High', accessControlRisk: 'High', overallRiskScore: 10 },
    ],
    casbPolicyEnforcement: [
      { policyName: 'Block Public Sharing of Sensitive Data', app: 'Office 365', actionsTaken: 150, lastTriggered: '2023-10-26T10:00:00Z' },
      { policyName: 'Enforce MFA for High-Risk Apps', app: 'Salesforce', actionsTaken: 80, lastTriggered: '2023-10-26T11:30:00Z' },
      { policyName: 'Alert on Large Data Downloads', app: 'Dropbox', actionsTaken: 25, lastTriggered: '2023-10-25T15:00:00Z' },
      { policyName: 'Restrict Access from Unmanaged Devices', app: 'All', actionsTaken: 200, lastTriggered: '2023-10-26T09:00:00Z' },
      {
        fileSharingExposure: [
          { fileId: 'doc_xyz789', fileName: 'Financials_Q4_Internal.xlsx', app: 'Office 365', currentExposure: 'Shared Externally (Link)', recommendedAction: 'Remove public link', remediated: false },
          { fileId: 'report_abc123', fileName: 'Customer_List_Full.csv', app: 'Dropbox', currentExposure: 'Public (No Auth)', recommendedAction: 'Restrict to internal users', remediated: true, remediationDate: '2023-10-25T12:00:00Z' },
          { fileId: 'presentation_def456', fileName: 'New_Product_Roadmap.pptx', app: 'Office 365', currentExposure: 'Shared with specific external users', recommendedAction: 'Review external users', remediated: false },
        ]
      }
    ],
  };
  res.status(200).json(mockData);
}
