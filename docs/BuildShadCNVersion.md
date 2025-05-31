# BuildRequirements for **Event Logging Best Practices App** (Using Cursor AI and shadcn/ui)

## Overview

This project allows users to search for Windows Event IDs related to specific attack types (e.g., privilege escalation), generate SIEM queries (Splunk, Sentinel, ELK, Logstash), and manage logs in real-time. The app will be built using **Next.js**, **React**, **Tailwind CSS**, **shadcn/ui**, **Supabase**, and **Cursor AI** to automate and speed up development.

### Prerequisites
- **Cursor AI** must be installed and set up.
- Node.js, npm, and npx must be installed.
- Supabase account and project setup for real-time data management.
- **shadcn/ui** components installed for a modern and customizable UI.

---

## Components

The app is made up of several core components that handle different parts of the functionality.

### 1. **SearchBar Component** (using shadcn UI)
   - **Purpose**: This component will allow users to input queries such as "privilege escalation" or "failed logons."
   - **Inputs**: Attack types or specific event queries (free text).
   - **Output**: Relevant Windows Event IDs.
   - **Features**:
     - Auto-completion for known attack techniques (e.g., MITRE ATT&CK framework).
     - Suggestions for attack patterns as users type.
   - **UI**: Use **shadcn's Input and Button components** for styling.

### 2. **EventIDResults Component** (using shadcn UI)
   - **Purpose**: Displays the relevant Windows Event IDs based on the user’s input.
   - **Inputs**: Search query or attack type.
   - **Outputs**: Event IDs and descriptions (e.g., Event ID 4624: "An account was successfully logged on").
   - **Features**:
     - Event details fetched from Windows Event Log Documentation and MITRE ATT&CK Framework.
     - Links to learn more about specific Event IDs from Microsoft Docs.
   - **UI**: Use **shadcn Cards** to display Event ID results in a clean, responsive format.

### 3. **SIEMQueryGenerator Component** (using shadcn UI)
   - **Purpose**: This component generates SIEM queries (Splunk, Microsoft Sentinel, ELK, and Logstash) for the retrieved Event IDs.
   - **Inputs**: Event ID(s), selected SIEM platform.
   - **Outputs**: Platform-specific queries.
   - **Features**:
     - Dropdown to select SIEM platform.
     - Generate button that produces the SIEM query in the correct format.
   - **UI**: Use **shadcn Dropdown and Button** components to enhance the user experience.

### 4. **DocumentUpload Component** (using shadcn UI)
   - **Purpose**: Allows users to upload PDFs or links to documentation that the app can use to learn and provide enhanced results.
   - **Inputs**: PDF files or URLs.
   - **Features**:
     - File upload functionality with Supabase storage.
     - Real-time updates when a new document is uploaded.
   - **UI**: Use **shadcn File Input and Alert components** to display file upload status.

### 5. **RealTimeLogDisplay Component**
   - **Purpose**: Shows real-time updates to the logs, queries, and Event ID lookups as users interact with the app.
   - **Features**:
     - Integration with Supabase to store and display user queries and event logs.
     - Auto-refresh for new logs.
   - **UI**: Use **shadcn's Table and Toast components** for displaying logs in a structured format.

### 6. **Authentication (Optional)**
   - **Purpose**: If needed in the future, a component to manage user authentication for storing personal logs and queries.
   - **Features**:
     - User sign-in, log-in, and session management with Supabase (optional).
   - **UI**: Use **shadcn Modal and Form components** for handling authentication workflows.

---

## Pages

### 1. **Home Page (`/`)**
   - **Description**: The landing page of the app, where users can start searching for event IDs.
   - **Features**:
     - Search bar for entering queries.
     - Display of recent searches and popular attack techniques.
     - Link to documentation on how to use the app.
   - **UI**: Use **shadcn's Hero and Input components** to create a welcoming and interactive homepage.

### 2. **Event ID Lookup Page (`/search`)**
   - **Description**: Displays the Event IDs returned from the search query.
   - **Features**:
     - Search results for specific queries.
     - Information and descriptions of each Event ID.
     - Pagination or infinite scrolling for large result sets.
   - **UI**: Use **shadcn's Cards and Pagination components** for structured results display.

### 3. **SIEM Query Generation Page (`/queries`)**
   - **Description**: Generates SIEM queries based on selected Event IDs and platforms.
   - **Features**:
     - Dropdown to choose SIEM platform.
     - Display of generated queries for each platform (e.g., Splunk, Sentinel).
     - Ability to copy queries to clipboard or export them as a file.
   - **UI**: Use **shadcn's Dropdown and Button components** for SIEM query selection and export features.

### 4. **Upload Page (`/upload`)**
   - **Description**: Users can upload documents to enhance the app's knowledge base.
   - **Features**:
     - File input for PDFs and link inputs for URLs.
     - Upload button to send documents to Supabase storage.
     - List of previously uploaded documents.
   - **UI**: Use **shadcn's File Input, List, and Alert components** for a seamless document upload experience.

### 5. **Real-Time Logs Page (`/logs`)**
   - **Description**: Displays real-time logs and event IDs that users have recently searched for.
   - **Features**:
     - Real-time updates powered by Supabase.
     - Searchable log history.
     - Downloadable log reports.
   - **UI**: Use **shadcn's Table and Search components** for easy navigation through logs.

---

## Features

### 1. **Search and Lookup**
   - **Description**: Users can search for Windows Event IDs related to specific attack types, with results pulled from Windows Event Log Documentation.
   - **Implementation**: Use the `SearchBar` and `EventIDResults` components, styled with **shadcn**, to handle search queries and display event information.

### 2. **SIEM Query Generation**
   - **Description**: Automatically generate search queries for SIEM platforms based on the returned Event IDs.
   - **Implementation**: Integrate the `SIEMQueryGenerator` component with **shadcn**'s dropdown and button functionality for platform selection.

### 3. **Document Upload**
   - **Description**: Users can upload documents (PDFs or URLs) to extend the app’s knowledge.
   - **Implementation**: Use **Supabase**’s storage API and **shadcn**'s File Input and Alert components to handle document uploads and retrieval.

### 4. **Real-time Logs**
   - **Description**: Logs of recent queries and events will be displayed in real-time on the **Real-Time Logs** page.
   - **Implementation**: Use **Supabase** for storing and updating logs, and **shadcn**'s Table and Toast components for displaying real-time updates.

### 5. **No Authentication Required (Optional)**
   - **Description**: The app will be freely available without requiring user sign-in. However, user authentication can be added if needed in future versions.
   - **Implementation**: Optional integration with Supabase for user authentication.

---

## Technical Specifications

### Front-End:
- **Framework**: Next.js (React framework for server-side rendering)
- **Styling**: Tailwind CSS for utility-first CSS styling, enhanced with **shadcn/ui** for modern, customizable UI components
- **JavaScript**: TypeScript for type safety (optional but recommended)

### Back-End:
- **Database**: Supabase (PostgreSQL with real-time capabilities)
- **Hosting**: Vercel for seamless deployment and hosting of the app

### External Libraries:
- **Axios**: For making HTTP requests to external APIs
- **React Query**: For managing and caching server data (optional)
- **ESLint** and **Prettier**: For code linting and formatting
- **shadcn/ui**: For modern and customizable UI components
   - [Learn More About shadcn/ui](https://shadcn.dev/)

### Integrations:
- **Supabase**: For real-time logs, data storage, and file uploads
- **MITRE ATT&CK**: For mapping attack techniques to event logs
- **Cursor AI**: For automating query generation and learning from uploaded documents

---

## Steps to Build in Cursor AI

1. **Load Project Data Sources**:
   - Import the **Windows Event Log Documentation** and **MITRE ATT&CK** Framework into Cursor AI's knowledge base.
   - Load **Supabase** APIs for real-time logs and document upload integration.

2. **Automate Search Queries**:
   - Use Cursor to generate search queries based on user input, such as "privilege escalation."
   - Automate the mapping of queries to Event
