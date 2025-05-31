import { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const mockData = {
    totalLogins: { successful: 10500, failed: 320 },
    orphanedAccountCount: 15,
    authAttemptsOverTime: [
      { time: '2023-10-01T00:00:00Z', windows: 100, linux: 50, macos: 20 },
      { time: '2023-10-01T01:00:00Z', windows: 110, linux: 55, macos: 22 },
      { time: '2023-10-01T02:00:00Z', windows: 105, linux: 52, macos: 21 },
      { time: '2023-10-01T03:00:00Z', windows: 115, linux: 58, macos: 23 },
      { time: '2023-10-01T04:00:00Z', windows: 120, linux: 60, macos: 24 },
    ],
    successVsFailureRates: [
      { application: 'WebApp1', successful: 2500, failed: 50 },
      { application: 'MobileApp', successful: 3000, failed: 120 },
      { application: 'API Gateway', successful: 4000, failed: 100 },
      { application: 'InternalTool', successful: 1000, failed: 50 },
    ],
    loginAttemptsByCountry: [
      { country: 'USA', attempts: 5000 },
      { country: 'India', attempts: 2000 },
      { country: 'UK', attempts: 1500 },
      { country: 'Canada', attempts: 1000 },
      { country: 'Germany', attempts: 800 },
    ],
    topUsersFailedLogins: [
      { userId: 'user123', failedAttempts: 15 },
      { userId: 'user456', failedAttempts: 12 },
      { userId: 'user789', failedAttempts: 10 },
      { userId: 'user101', failedAttempts: 9 },
      { userId: 'user112', failedAttempts: 8 },
      { userId: 'user131', failedAttempts: 7 },
      { userId: 'user415', failedAttempts: 6 },
      { userId: 'user161', failedAttempts: 5 },
      { userId: 'user718', failedAttempts: 4 },
      { userId: 'user191', failedAttempts: 3 },
    ],
    peakAuthTimes: [
      // rows represent hours, columns represent days of the week (0=Sunday)
      // values represent number of auth attempts
      [10, 20, 30, 40, 50, 60, 70], // 00:00 - 01:00
      [15, 25, 35, 45, 55, 65, 75], // 01:00 - 02:00
      [20, 30, 40, 50, 60, 70, 80], // 02:00 - 03:00
      [25, 35, 45, 55, 65, 75, 85], // 03:00 - 04:00
      [30, 40, 50, 60, 70, 80, 90], // 04:00 - 05:00
      // ... more hours
    ],
  };
  res.status(200).json(mockData);
}
