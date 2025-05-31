import { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const mockData = {
    userBehaviorHeatmap: [
      // Rows: Users, Columns: Actions/Resources, Value: Risk Score or Frequency
      { user: 'Alice', action: 'Large File Download', riskScore: 8 },
      { user: 'Bob', action: 'Access Sensitive DB', riskScore: 9 },
      { user: 'Charlie', action: 'Login After Hours', riskScore: 6 },
      { user: 'Alice', action: 'Access Sensitive DB', riskScore: 7 },
      { user: 'Bob', action: 'Multiple Failed Logins', riskScore: 5 },
    ],
    dataAccessMatrix: [
      // Rows: Users/Roles, Columns: Data Silos/Resources, Value: Access Level (e.g., Read, Write, Admin)
      { userOrRole: 'Admin', resource: 'Financial DB', accessLevel: 'Admin' },
      { userOrRole: 'Analyst', resource: 'Financial DB', accessLevel: 'Read' },
      { userOrRole: 'User_X', resource: 'Customer PII', accessLevel: 'Write' },
      { userOrRole: 'ServiceAcct_Y', resource: 'Internal API', accessLevel: 'Read/Write' },
      { userOrRole: 'Admin', resource: 'Customer PII', accessLevel: 'Admin' },
    ],
    sessionTimelineViewer: [
      {
        sessionId: 'session_abc123',
        user: 'Alice',
        startTime: '2023-10-26T10:00:00Z',
        endTime: '2023-10-26T10:30:00Z',
        activities: [
          { timestamp: '2023-10-26T10:05:00Z', action: 'Logged In', details: 'From IP 192.168.1.10' },
          { timestamp: '2023-10-26T10:10:00Z', action: 'Accessed File', details: '/sensitive/report.docx' },
          { timestamp: '2023-10-26T10:15:00Z', action: 'Modified File', details: '/sensitive/report.docx' },
          { timestamp: '2023-10-26T10:25:00Z', action: 'Logged Out' },
        ],
      },
      {
        sessionId: 'session_def456',
        user: 'Bob',
        startTime: '2023-10-26T11:00:00Z',
        endTime: '2023-10-26T11:45:00Z',
        activities: [
          { timestamp: '2023-10-26T11:02:00Z', action: 'Logged In', details: 'From IP 10.0.0.52' },
          { timestamp: '2023-10-26T11:10:00Z', action: 'Queried Database', details: 'SELECT * FROM customers' },
          { timestamp: '2023-10-26T11:30:00Z', action: 'Exported Data', details: 'customer_data.csv' },
          { timestamp: '2023-10-26T11:40:00Z', action: 'Logged Out' },
        ],
      },
    ],
  };
  res.status(200).json(mockData);
}
