# Event Logging Best Practices App

This project helps cybersecurity students and analysts learn about Windows Event Logging, security monitoring, and query generation for SIEM platforms like Splunk, Sentinel, ELK, and Logstash. This guide provides instructions on how to set up the project on your local machine.

## Key Features

- **Search for Event IDs**: Enter an attack type (e.g., "privilege escalation") and retrieve relevant Event IDs.
- **SIEM Query Generation**: Automatically generate queries for SIEM platforms based on the Event IDs.
- **Real-time Data**: Get real-time data on queries and event logs.
- **Document Upload**: Upload custom PDFs or URLs to extend the app's learning model.

---

## Dependencies

To run this project, you’ll need the following tools:

1. **Node.js**: The platform to run JavaScript code.
   - Comes with **npm** and **npx**, package managers to install and run JavaScript packages.
2. **Git**: Version control software to clone and manage the code repository.
3. **Vercel (Optional)**: Cloud platform for deploying the project (if you want to deploy it online).
4. **Supabase**: You will need to create a project in Supabase to handle data storage and real-time updates (details below).
5. **Text Editor/IDE**: Use **Visual Studio Code** or **Sublime Text** for writing and editing code.

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
   You should see the version numbers of Node.js, npm, and npx.

#### Windows:
1. Go to the [Node.js website](https://nodejs.org/) and download the **LTS** version.
2. Run the installer and follow the instructions, ensuring that the option **"Automatically install tools for Node.js"** is checked.
3. Verify Node.js is installed by opening **Command Prompt** and running:
   ```bash
   node -v
   npm -v
   npx -v
   ```

### Step 2: Install Git

#### Mac:
1. Open the **Terminal** and run the following command:
   ```bash
   git --version
   ```
   If Git is not installed, the terminal will prompt you to install it. Follow the prompts.

#### Windows:
1. Download Git from the [official website](https://git-scm.com/).
2. Run the installer, accepting the default settings.
3. Verify Git is installed by running the following command in **Command Prompt**:
   ```bash
   git --version
   ```

### Step 3: Clone the Repository

After installing Git, you can clone the app repository to your local machine.

#### Mac and Windows:
1. Open **Terminal** (Mac) or **Command Prompt** (Windows).
2. Run the following command to clone the repository:
   ```bash
   git clone https://github.com/yourusername/event-logging-app.git
   cd event-logging-app
   ```

### Step 4: Install Project Dependencies

The project uses several npm packages to work. To install them:

#### Mac and Windows:
1. Navigate to the project folder (`event-logging-app`).
2. Run the following command to install the necessary dependencies:
   ```bash
   npm install
   ```

This will install packages like **React**, **Tailwind CSS**, and **Supabase**.

### Step 5: Set Up Supabase

You'll need Supabase to handle data storage and real-time updates. Follow these steps:

1. Sign up at [Supabase](https://supabase.com/).
2. Create a new project in Supabase.
3. In the project settings, get the **API URL** and **Anon Key**.
4. Create a file named `.env.local` in the root of your project and add the following:
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

### Step 6: Run the Development Server

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

## Dependencies Summary

- **Node.js**: Required to run JavaScript code and install npm packages.
- **npm**: Package manager for installing project dependencies.
- **npx**: Runs npm packages without installing them globally.
- **Git**: Version control to clone and manage the code.
- **Supabase**: Backend for handling real-time data and storage.
- **React**: JavaScript library for building the user interface.
- **Tailwind CSS**: CSS framework for styling the application.
- **Axios**: HTTP client for making API requests.
- **ESLint**: Tool to maintain code quality.
- **Prettier**: Code formatter to ensure consistency.

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

If you run into issues or have any questions, feel free to reach out by opening an issue in the repository or contacting `Ian Trimble itrimble@gmail.com`.

Happy coding!

---

Let me know if you need any further adjustments or more details on any step!
