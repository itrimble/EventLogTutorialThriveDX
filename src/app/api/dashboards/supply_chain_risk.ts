import { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const mockData = {
    vendorAssessmentStatus: [
      { vendor: 'VendorA', service: 'Payment Gateway', sbomValidated: true, cvssScore: 7.5, lastAssessment: '2023-09-15' },
      { vendor: 'VendorB', service: 'Analytics SDK', sbomValidated: false, cvssScore: 9.2, lastAssessment: '2023-08-20' },
      { vendor: 'VendorC', service: 'Cloud Storage', sbomValidated: true, cvssScore: 5.0, lastAssessment: '2023-10-01' },
      { vendor: 'VendorD', service: 'Auth Library', sbomValidated: false, cvssScore: 8.1, lastAssessment: '2023-07-10' },
    ],
    buildPipelineSecurityAlerts: [
      { timestamp: '2023-10-26T10:00:00Z', pipeline: 'WebApp CI/CD', alertType: 'Unapproved Dependency', dependencyName: 'left-pad@1.3.0', severity: 'High' },
      { timestamp: '2023-10-26T11:15:00Z', pipeline: 'MobileApp Build', alertType: 'CI/CD Integrity Failure', details: 'Tampered build script detected', severity: 'Critical' },
      { timestamp: '2023-10-26T12:30:00Z', pipeline: 'API Gateway Deploy', alertType: 'Vulnerable Component', component: 'log4j:2.14.1', severity: 'High' },
    ],
    complianceMappingStatus: [
      { standard: 'SLSA', requirement: 'Source Verification', status: 'Achieved', gaps: 0 },
      { standard: 'SLSA', requirement: 'Build Integrity', status: 'Partial', gaps: 2 },
      { standard: 'NIST SSDF', requirement: 'Protect Software', status: 'Achieved', gaps: 0 },
      { standard: 'NIST SSDF', requirement: 'Produce Well-Secured Software', status: 'In Progress', gaps: 5 },
      { standard: 'ISO 27001', requirement: 'A.14.2.1 Secure development policy', status: 'Achieved', gaps: 0 },
    ],
  };
  res.status(200).json(mockData);
}
