# EventLog Tutorial ThriveDX

A comprehensive cybersecurity education platform for learning Windows Event Log analysis and SIEM query generation. This application helps cybersecurity students and analysts understand Windows Event IDs, their correlation to MITRE ATT&CK techniques, and how to generate targeted queries for major SIEM platforms.

## 🎯 Features

- **Event ID Search**: Search for Windows Event IDs by attack type or MITRE ATT&CK technique
- **MITRE ATT&CK Mapping**: Comprehensive correlation between Event IDs and MITRE tactics/techniques
- **Multi-Platform SIEM Query Generation**: Generate queries for:
  - Splunk Enterprise
  - Microsoft Sentinel (KQL)
  - ELK Stack (Elasticsearch DSL)
  - Logstash Filter Configuration
- **Interactive Learning**: Hands-on approach to cybersecurity monitoring education
- **Real-time Query Building**: Dynamic query generation with filtering capabilities
- **Educational Resources**: Curated links to essential cybersecurity documentation

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Git
- Modern web browser

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/itrimble/EventLogTutorialThriveDX.git
   cd EventLogTutorialThriveDX
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables** (optional)
   ```bash
   cp .env.local.example .env.local
   # Edit .env.local with your Supabase credentials if using backend features
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🏗️ Architecture

### Built With

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS 4, Radix UI components
- **Backend Ready**: Supabase integration prepared
- **Icons**: Lucide React
- **Development**: ESLint, Hot reloading

### Project Structure

```
src/
├── app/                    # Next.js app router
│   ├── layout.tsx         # Root layout with metadata
│   ├── page.tsx           # Main application page
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── EventSearch.tsx    # Event ID search interface
│   ├── EventCard.tsx      # Individual event display
│   └── SIEMQueryGenerator.tsx # SIEM query generation
├── data/                  # Static data and mappings
│   └── eventMappings.ts   # Event ID to MITRE ATT&CK mappings
└── lib/                   # Utility functions
    ├── utils.ts           # Common utilities
    └── supabase.ts        # Supabase client configuration
```

## 🎓 Educational Use Cases

### For Students
- Learn about Windows Event Log structure and significance
- Understand the relationship between events and attack techniques
- Practice creating SIEM queries for different platforms
- Explore MITRE ATT&CK framework integration

### For Instructors
- Demonstrate real-world cybersecurity monitoring concepts
- Provide hands-on experience with SIEM query languages
- Teach correlation between events and threat behaviors
- Show practical application of MITRE ATT&CK framework

### For Analysts
- Quick reference for Event ID to technique mapping
- Generate starter queries for investigation
- Understand event context and filtering options
- Cross-platform query syntax reference

## 📊 Event Coverage

The application includes comprehensive mappings for:

- **Authentication Events**: Logon/logoff activities (4624, 4625, 4648)
- **Process Execution**: Process creation and termination (4688, 4689)
- **Privilege Escalation**: Special privileges and group changes (4672, 4728, 4732)
- **Account Management**: User creation, modification (4720, 4722)
- **System Events**: Log clearing and system changes (1102, 104)
- **File Access**: Object access and file operations (4656, 4663)
- **Network Activity**: Share access and network logons (5140, 5145)
- **Scheduled Tasks**: Task creation and modification (4698, 4702)
- **PowerShell Activity**: Script execution logging (4103, 4104)
- **Security Tools**: Windows Defender events (1116, 1117)

## 🔧 Advanced Configuration

### Supabase Integration (Optional)

For persistent data and user management:

1. Create a Supabase project
2. Configure the database schema (SQL migrations in `/sql/`)
3. Update environment variables:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   ```

### Deployment

#### Vercel (Recommended)
```bash
npm install -g vercel
vercel
```

#### Docker
```bash
docker build -t eventlog-tutorial .
docker run -p 3000:3000 eventlog-tutorial
```

## 🤝 Contributing

Contributions are welcome! Please read our contributing guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Adding New Event Mappings

To add new Windows Event IDs:

1. Update `src/data/eventMappings.ts`
2. Follow the existing `EventMapping` interface
3. Include relevant MITRE ATT&CK technique mappings
4. Add appropriate test cases

## 📚 Educational Resources

- [Windows Event Log Documentation](https://learn.microsoft.com/en-us/windows/security/threat-protection/auditing/basic-security-audit-events)
- [MITRE ATT&CK Framework](https://attack.mitre.org/)
- [Splunk Search Documentation](https://docs.splunk.com/Documentation/Splunk/latest/SearchTutorial/)
- [Microsoft Sentinel KQL](https://learn.microsoft.com/en-us/azure/sentinel/queries)
- [ELK Stack Documentation](https://www.elastic.co/guide/)

## 🐛 Troubleshooting

### Common Issues

1. **npm install fails**: Ensure Node.js 18+ is installed
2. **Port 3000 in use**: Use `npm run dev -- --port 3001`
3. **Styling issues**: Clear browser cache and restart dev server
4. **Component errors**: Check console for detailed error messages

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Ian Trimble**
- Email: itrimble@gmail.com
- GitHub: [@itrimble](https://github.com/itrimble)
- Organization: Remnant Security Group

## 🙏 Acknowledgments

- ThriveDX for cybersecurity education excellence
- MITRE Corporation for the ATT&CK framework
- Microsoft for comprehensive Windows Event documentation
- The cybersecurity community for threat intelligence sharing

---

**Built for cybersecurity education and hands-on learning** 🛡️