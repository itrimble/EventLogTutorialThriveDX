# Event Log Tutorial - ThriveDX

A comprehensive Windows Event Log analysis platform built with Next.js 15, designed for cybersecurity education and training.

## 🎯 Overview

This application provides a modern, interactive interface for exploring and analyzing Windows Event Logs. It features a dashboard-style layout with multiple components for log exploration, visualization, reporting, and security monitoring.

## 🚀 Features

- **📊 Dashboard**: Overview of system health, critical alerts, and event summaries
- **🔍 Event Explorer**: Interactive table for browsing and searching event logs
- **📈 Visualizations**: Charts and graphs for log data analysis
- **📋 Reporting**: Generate and schedule reports
- **⚙️ Settings**: Configure log sources and system preferences
- **🚨 Alerts**: Monitor and manage critical security events

## 🛠️ Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Heroicons
- **Charts**: Recharts
- **Build**: Turbopack (development)

## 📦 Installation & Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/itrimble/EventLogTutorialThriveDX.git
   cd EventLogTutorialThriveDX/eventlog-analyzer
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Run development server**:
   ```bash
   npm run dev
   ```

4. **Open browser**:
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🏗️ Build & Deploy

### Local Build
```bash
npm run build
npm start
```

### Vercel Deployment
This project is configured for automatic deployment on Vercel:

1. Connect your GitHub repository to Vercel
2. Vercel will automatically detect Next.js and configure build settings
3. Each push to `main` triggers a new deployment

**Build Configuration**:
- Build command: `npm run build`
- Install command: `npm install`
- Node.js version: 18.x or later

## 📁 Project Structure

```
eventlog-analyzer/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── page.tsx           # Dashboard (home page)
│   │   ├── explorer/          # Event log browser
│   │   ├── visualizations/    # Charts and graphs
│   │   ├── reporting/         # Report generation
│   │   ├── settings/          # Configuration
│   │   └── alerts/            # Alert management
│   ├── components/            # Reusable React components
│   │   ├── dashboard/         # Dashboard widgets
│   │   ├── explorer/          # Event table components
│   │   ├── layout/            # Navigation and layout
│   │   ├── reporting/         # Report components
│   │   ├── settings/          # Settings forms
│   │   └── visualization/     # Chart components
│   └── lib/
│       └── data/              # Mock data and configurations
├── public/                    # Static assets
└── package.json              # Dependencies and scripts
```

## 📋 Dependencies

### Core Dependencies
- **next**: 15.3.2 - React framework
- **react**: ^19.0.0 - UI library
- **react-dom**: ^19.0.0 - React DOM renderer
- **recharts**: ^2.15.3 - Charting library
- **@heroicons/react**: ^2.0.18 - Icon components

### Development Dependencies
- **typescript**: ^5 - Type checking
- **tailwindcss**: ^4 - CSS framework
- **eslint**: ^9 - Code linting
- **@types/node**: ^20 - Node.js types
- **@types/react**: ^19 - React types

## 🔧 Configuration

### Build Settings
The project includes optimized build settings:
- ESLint warnings don't fail builds (configurable)
- TypeScript errors don't fail builds (configurable)
- Optimized for production deployment

### Environment Variables
No environment variables required for basic functionality. All data is currently mock data for demonstration purposes.

## 🐛 Troubleshooting

### Common Build Issues

1. **Missing @heroicons/react**: 
   ```bash
   npm install @heroicons/react
   ```

2. **Path resolution issues**:
   - Ensure `src/lib/data/` directory exists
   - Verify JSON data files are in correct location

3. **Build warnings**:
   - ESLint and TypeScript errors are configured to not fail builds
   - Review `next.config.ts` for build settings

### Development Issues

1. **Port already in use**:
   ```bash
   npm run dev -- -p 3001
   ```

2. **Cache issues**:
   ```bash
   rm -rf .next
   npm run dev
   ```

## 📚 Learning Resources

This project is designed for educational purposes in cybersecurity training:

- **Windows Event Log Analysis**: Understanding event IDs, log sources, and security implications
- **SIEM Concepts**: Log aggregation, correlation, and alerting
- **Incident Response**: Using logs for security investigations
- **Threat Hunting**: Proactive security monitoring techniques

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/new-feature`)
3. Commit changes (`git commit -am 'Add new feature'`)
4. Push to branch (`git push origin feature/new-feature`)
5. Create a Pull Request

## 📄 License

This project is intended for educational use in cybersecurity training programs.

## 🔗 Related Resources

- [Windows Event Log Documentation](https://docs.microsoft.com/en-us/windows/win32/eventlog/event-logging)
- [MITRE ATT&CK Framework](https://attack.mitre.org/)
- [Next.js Documentation](https://nextjs.org/docs)
- [ThriveDX Cybersecurity Training](https://thrivedx.com/)
