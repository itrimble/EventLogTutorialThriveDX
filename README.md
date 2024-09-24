Here’s the updated **README.md** with the **NPX** section added back, including all the previous details:

---

# Event Logging Best Practices App

This project helps cybersecurity students and analysts learn about Windows Event Logging, security monitoring, and query generation for SIEM platforms like Splunk, Sentinel, ELK, and Logstash. This guide provides instructions on how to set up the project on your local machine and how to integrate Cursor AI for faster query generation.

## Key Features

- **Search for Event IDs**: Enter an attack type (e.g., "privilege escalation") and retrieve relevant Event IDs.
- **SIEM Query Generation**: Automatically generate queries for SIEM platforms based on the Event IDs.
- **Real-time Data**: Get real-time data on queries and event logs.
- **Document Upload**: Upload custom PDFs or URLs to extend the app's learning model.

---

## Dependencies

To run this project, you’ll need the following tools:

1. **Node.js**: The platform to run JavaScript code.
   - [Learn More About Node.js](https://nodejs.org/)
2. **npm** and **npx**: Node.js package managers that are bundled with Node.js.
   - [Learn More About npm](https://www.npmjs.com/)
3. **Git**: Version control software to clone and manage the code repository.
   - [Learn More About Git](https://git-scm.com/)
4. **Vercel (Optional)**: Cloud platform for deploying the project (if you want to deploy it online).
   - [Learn More About Vercel](https://vercel.com/)
5. **Supabase**: For managing data storage and real-time updates.
   - [Learn More About Supabase](https://supabase.com/)
6. **Cursor AI (Optional)**: A tool to help automate code generation and speed up query response.
   - [Download Cursor AI](https://www.cursor.so/)
7. **Text Editor/IDE**: Use **Visual Studio Code** or **Sublime Text** for writing and editing code.
   - [Visual Studio Code](https://code.visualstudio.com/)
   - [Sublime Text](https://www.sublimetext.com/)

---

## Installation and Setup

### Step 1: Install Node.js

#### Mac:
1. Visit the [Node.js website](https://nodejs.org/) and download the **LTS (Long-Term Support)** version.
2. Open the downloaded `.pkg` file and follow the installation instructions.
3. Verify Node.js is installed by running the following command in the Terminal:
   ```bash
   node -v
   npm -v
   npx -v
   ```

#### Windows:
1. Go to the [Node.js website](https://nodejs.org/) and download the **LTS** version.
2. Run the installer and follow the instructions, ensuring that the option **"Automatically install tools for Node.js"** is checked.
3. Verify Node.js is installed by opening **Command Prompt** and running:
   ```bash
   node -v
   npm -v
   npx -v
   ```

---

## Step 2: Setting Up **npx** and Running an Example Project

**npx** allows you to run npm packages without installing them globally. We’ll use **npx** to set up an example project called **event-logging-app**.

### Create an Example Project

#### Mac and Windows:
1. Open **Terminal** (Mac) or **Command Prompt** (Windows).
2. Run the following command to create a new project using **npx**:
   ```bash
   npx create-next-app@latest event-logging-app
   ```
   This will prompt you to configure the project:
   - **TypeScript**: Yes/No (Select Yes if you prefer TypeScript).
   - **ESLint**: Yes (Helps maintain code quality).
   - **Tailwind CSS**: Yes (For styling).
   - **src directory**: Yes/No (Optional directory structure, choose as per your preference).
   - **import alias**: No (Optional for large-scale projects).

3. Once the project is created, navigate into the new folder:
   ```bash
   cd event-logging-app
   ```

4. Install the dependencies for the new project:
   ```bash
   npm install
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

6. Open your browser and go to `http://localhost:3000` to see your example **event-logging-app** running.

---

## Step 3: Clone the Repository

After installing Git, you can clone the app repository to your local machine.

#### Mac and Windows:
1. Open **Terminal** (Mac) or **Command Prompt** (Windows).
2. Run the following command to clone the repository:
   ```bash
   git clone https://github.com/yourusername/event-logging-app.git
   cd event-logging-app
   ```

---

## Step 4: Document Sources

The following sources are used to enhance the accuracy and efficiency of the **Event Logging Best Practices App**:

1. **Windows Event Log Documentation**:
   - Official documentation on Windows Event IDs.
   - [Microsoft Event Log Documentation](https://learn.microsoft.com/en-us/windows/security/threat-protection/auditing/basic-security-audit-events)

2. **MITRE ATT&CK Framework**:
   - Detailed tactics, techniques, and procedures (TTPs) mapped to event logs.
   - [MITRE ATT&CK Framework](https://attack.mitre.org/)

3. **SIEM Platform Documentation**:
   - Documentation for generating SIEM-specific queries for Splunk, Sentinel, ELK, and Logstash.
   - [Splunk Search Documentation](https://docs.splunk.com/Documentation/Splunk/latest/SearchTutorial/WelcometotheSearchTutorial)
   - [Microsoft Sentinel KQL Documentation](https://learn.microsoft.com/en-us/azure/sentinel/queries)
   - [ELK Documentation](https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl.html)
   - [Logstash Documentation](https://www.elastic.co/guide/en/logstash/current/index.html)

4. **NIST Cybersecurity Framework**:
   - Best practices for managing cybersecurity-related risks.
   - [NIST Cybersecurity Framework](https://www.nist.gov/cyberframework)

5. **Carnegie Mellon Insider Threat Resources**:
   - Guides and best practices for insider threat management.
   - [CERT Insider Threat Center](https://resources.sei.cmu.edu/library/asset-view.cfm?assetid=540644)

6. **National Vulnerability Database (NVD)**:
   - Repository of vulnerabilities and exposures.
   - [National Vulnerability Database (NVD)](https://nvd.nist.gov/)

7. **Sysmon Documentation**:
   - System Monitor logs critical security events.
   - [Sysmon Documentation](https://learn.microsoft.com/en-us/sysinternals/downloads/sysmon)

8. **Cursor AI**:
   - Enhances code automation and analysis, improving response time.
   - [Cursor AI Documentation](https://docs.cursor.so/)

---

## Step 5: Setting Up Cursor AI

Cursor AI can help automate and speed up query generation, making it easier to analyze logs and create search queries for different SIEM platforms.

### Getting Started with Cursor AI

1. **Download and Install Cursor AI**:
   - Visit the [Cursor AI download page](https://www.cursor.so/) and download the appropriate version for your OS.
   
2. **Set Up Cursor AI**:
   - After installation, follow the on-screen prompts to set up your workspace.
   - You can import your project’s data sources (such as the Windows Event Log documentation and MITRE ATT&CK Framework) into Cursor for quicker analysis.

3. **Configure Cursor for the App**:
   - Ensure you load the **Windows Event Log Documentation** and **MITRE ATT&CK Framework** into Cursor’s knowledge base so that it can respond accurately to queries.

4. **Use Cursor to Automate Query Generation**:
   - With Cursor integrated, you can input commands like “search for privilege escalation Event IDs,” and Cursor will return relevant Event IDs along with SIEM search queries.

---

## Step 6: Run the Development Server

Once everything is set up, you can start the development server to run the project locally.

#### Mac and Windows:
1. In the terminal (or command prompt), make sure you're in the project folder.
2. Run the following command:
   ```bash
   npm run dev
   ```

3. Open your browser and go to `http://localhost:3000` to see the app running.

---

## Deploying to Vercel (Optional)

If you'd like to deploy this app to the web, you can use **Vercel**. Here’s how:

1. Sign up at [Vercel](https://vercel.com/).
2. Connect your GitHub/GitLab/Bitbucket repository.
3. Import your **event-logging-app** repository.
4. Vercel will automatically deploy the app and give you a live URL.

Here’s the CLI-based section you can add to the **README.md** for deploying the **Event Logging Best Practices App** to **Vercel**:

---

## Deploying to Vercel (CLI Instructions)

Follow these steps to deploy the app to **Vercel** using the command-line interface (CLI):

### Prerequisites:
- Make sure you have [Vercel CLI](https://vercel.com/download) installed globally:
   ```bash
   npm install -g vercel
   ```
- Ensure you have a [Vercel account](https://vercel.com/signup) and are logged in:
   ```bash
   vercel login
   ```

### Steps to Deploy CLI:

1. **Navigate to Your Project Directory**:
   ```bash
   cd /path-to-your-project-directory
   ```

2. **Deploy the App with Vercel CLI**:
   Run the following command to start the deployment process:
   ```bash
   vercel
   ```

3. **Configure the Deployment**:
   You will be prompted with a few questions:
   - **Link to existing project?** (If it's your first time, choose "No").
   - **Project name**: Press Enter to accept the default (or customize it).
   - **Directory to deploy**: Press Enter to deploy the current directory.
   - **Configure as new project?**: Yes.
   - **Overwrite settings?**: No (if you're deploying for the first time).
   
4. **Environment Variables** (Optional):
   If your project requires environment variables (e.g., Supabase credentials), add them:
   ```bash
   vercel env add NEXT_PUBLIC_SUPABASE_URL
   vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
   ```
   You can manage all environment variables from your Vercel project dashboard.

5. **View the Live Deployment**:
   Once the deployment is complete, Vercel will provide a live URL where you can access the app.

6. **Production Deployment**:
   For a production deployment, run:
   ```bash
   vercel --prod
   ```

---

This section provides simple CLI instructions for deploying the app to Vercel. Let me know if any adjustments are needed!

---

## Troubleshooting

1. **npm not recognized**:
   - Ensure that Node.js is installed properly and added to your system’s PATH.
   
2. **Supabase connection issues**:
   - Verify your **Supabase URL** and **Anon Key** in `.env.local`.
   - Ensure your Supabase project is active and running.

3. **Vercel deployment issues**:
   - Ensure that your Git repository is correctly linked to Vercel.
   - Verify that environment variables are added correctly in the Vercel dashboard.

---

## Dependencies
## Dependencies Summary (continued)

- **Node.js**: Required to run JavaScript code and install npm packages.
   - [Learn More About Node.js](https://nodejs.org/)
- **npm**: Package manager for installing project dependencies.
   - [Learn More About npm](https://www.npmjs.com/)
- **npx**: Runs npm packages without installing them globally.
   - [Learn More About npx](https://www.npmjs.com/package/npx)
- **Git**: Version control to clone and manage the code.
   - [Learn More About Git](https://git-scm.com/)
- **Supabase**: Backend for handling real-time data and storage.
   - [Learn More About Supabase](https://supabase.com/)
- **React**: JavaScript library for building the user interface.
   - [Learn More About React](https://reactjs.org/)
- **Tailwind CSS**: CSS framework for styling the application.
   - [Learn More About Tailwind CSS](https://tailwindcss.com/)
- **Axios**: HTTP client for making API requests.
   - [Learn More About Axios](https://axios-http.com/)
- **ESLint**: Tool to maintain code quality and catch errors.
   - [Learn More About ESLint](https://eslint.org/)
- **Prettier**: Code formatter to ensure consistency.
   - [Learn More About Prettier](https://prettier.io/)
- **Vercel**: Platform for deploying web applications.
   - [Learn More About Vercel](https://vercel.com/)
- **Cursor AI**: AI-driven tool for speeding up query generation and automating tasks.
   - [Learn More About Cursor AI](https://www.cursor.so/)

---

## Useful Commands

- **Start the app**: 
  ```bash
  npm run dev
  ```
- **Install a new package**: 
  ```bash
  npm install package-name
  ```
- **Commit changes with Git**: 
  ```bash
  git add .
  git commit -m "Your message"
  git push origin main
  ```

---

## Need Help?

If you run into issues or have any questions, feel free to reach out by opening an issue in the repository or contacting:

**Ian Trimble**: [itrimble@gmail.com](mailto:itrimble@gmail.com)

Happy coding!

---

