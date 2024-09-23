

# BuildRequirements for **Event Logging Best Practices App** (Using Cursor AI and shadcn/ui)

## Overview

This project helps users search for Windows Event IDs related to specific attack types (e.g., privilege escalation), generate SIEM queries (Splunk, Sentinel, ELK, Logstash), and manage logs in real-time. It will feature a fun, modern UI with **Dark Mode**, powered by **shadcn/ui** and **Cursor AI** to speed up development.

---

## Cursor AI Rules and Structure

To keep the project organized and enjoyable to work on, we’ve established the following rules for Cursor AI:

1. **Component Structure**:
   - **All new components** should be placed in the `/components` directory.
   - Components should follow the naming convention: `example-component.tsx`.
   - Components should be modular, reusable, and simple.

2. **Page Structure**:
   - **All new pages** should be placed in the `/app` directory.
   - Follow Next.js’s file-based routing for automatic route creation.
   - Pages should be named descriptively based on their content (e.g., `/app/search.tsx` for the search page).

3. **Dark Mode Support**:
   - Implement a **Dark Mode** toggle across the entire app.
   - Dark Mode styles should be automatically detected based on system preferences and should also have a manual toggle.
   - **shadcn/ui** components should use Dark Mode variants where applicable.

4. **Styling**:
   - Use **shadcn/ui** for a fun, clean, and modern look.
   - Ensure that all components are responsive, providing a seamless experience across devices.
   - Add **transitions** and **animations** where possible (e.g., button hover effects, smooth page transitions).

5. **User Experience (UX)**:
   - Make the UI intuitive and enjoyable to use.
   - Use icons, tooltips, and modals to guide users through their actions.
   - Keep form inputs, buttons, and interactions engaging (e.g., interactive buttons with clear actions).
   - Use **tailwind transitions** for a polished, smooth experience.

6. **Error Handling**:
   - Display user-friendly error messages if something goes wrong (e.g., data loading failure).
   - Use **shadcn/ui's Alert and Toast components** to notify users in a fun and non-intrusive way.

---

## Components

### 1. **SearchBar Component** (using shadcn UI)
   - **Purpose**: Allows users to input queries such as "privilege escalation" or "failed logons."
   - **Features**:
     - Auto-completion for attack techniques.
     - Dark Mode support.
     - Fun, interactive UI using **shadcn's Input and Button components**.

### 2. **EventIDResults Component** (using shadcn UI)
   - **Purpose**: Displays relevant Windows Event IDs based on the user’s input.
   - **Features**:
     - Cards with event details.
     - Dark Mode variants.
     - Fun animations using **shadcn Cards**.

### 3. **SIEMQueryGenerator Component** (using shadcn UI)
   - **Purpose**: Generates SIEM queries for the selected Event IDs.
   - **Features**:
     - Dropdowns for SIEM platform selection.
     - Button for query generation.
     - Dark Mode-friendly dropdowns and buttons.

### 4. **DocumentUpload Component** (using shadcn UI)
   - **Purpose**: Allows users to upload PDFs or links to enhance the app’s learning model.
   - **Features**:
     - File input with **drag and drop**.
     - Alerts for upload success or failure.
     - Dark Mode and transitions.

### 5. **RealTimeLogDisplay Component** (using shadcn UI)
   - **Purpose**: Displays real-time logs with automatic refreshes.
   - **Features**:
     - Tables styled with **shadcn**.
     - Dark Mode support for logs.
     - Fun UI animations (e.g., smooth table updates).

### 6. **Authentication (Optional)**
   - **Purpose**: If needed, manage user authentication for storing personal logs and queries.
   - **Features**:
     - Sign-in modal with **shadcn**.
     - Dark Mode-friendly UI elements.

---

## Pages

### 1. **Home Page (`/`)**
   - **Description**: Landing page for starting searches.
   - **Features**:
     - Search bar for entering queries.
     - Interactive buttons and tooltips.
     - Dark Mode support.
     - Fun **hero section** using **shadcn** for welcoming users.

### 2. **Event ID Lookup Page (`/search`)**
   - **Description**: Displays Event IDs returned from searches.
   - **Features**:
     - Dark Mode-compatible results page.
     - Cards for each Event ID.
     - Smooth transitions for displaying results.

### 3. **SIEM Query Generation Page (`/queries`)**
   - **Description**: Generates SIEM queries based on selected Event IDs.
   - **Features**:
     - Dropdowns and buttons for platform selection and query generation.
     - Fun UI effects on query generation.

### 4. **Upload Page (`/upload`)**
   - **Description**: Allows users to upload PDFs or links.
   - **Features**:
     - Dark Mode-friendly file input.
     - Alerts for success or failure of uploads.

### 5. **Real-Time Logs Page (`/logs`)**
   - **Description**: Displays real-time logs.
   - **Features**:
     - Fun, interactive log table.
     - Dark Mode support.
     - Auto-refreshing logs.

---

## Features

### 1. **Dark Mode Toggle**
   - **Description**: Users can toggle between light and dark themes, with system preference detection.
   - **Implementation**: Use **shadcn**'s Dark Mode capabilities and Tailwind CSS’s dark mode classes.

### 2. **Fun and Interactive UI**
   - **Description**: Every page and component should be visually engaging, with animations, hover effects, and smooth transitions.
   - **Implementation**: Utilize **shadcn's interactive components** (e.g., buttons, tooltips, modals) and **Tailwind CSS transitions**.

### 3. **Search and Lookup**
   - **Description**: Users can search for Windows Event IDs related to specific attack types.
   - **Implementation**: Use `SearchBar` and `EventIDResults` components, styled with **shadcn**, for search functionality.

### 4. **SIEM Query Generation**
   - **Description**: Automatically generate search queries for SIEM platforms based on the returned Event IDs.
   - **Implementation**: Integrate `SIEMQueryGenerator` with **shadcn** UI components for dropdowns and query buttons.

### 5. **Document Upload**
   - **Description**: Users can upload documents (PDFs or URLs) to extend the app’s knowledge.
   - **Implementation**: Use **Supabase** for storage and **shadcn** UI components for file input.

### 6. **Real-Time Logs**
   - **Description**: Logs of recent queries and events are displayed in real-time.
   - **Implementation**: Use **Supabase** for storing and updating logs, and **shadcn** UI for smooth, fun table displays.

---

## Technical Specifications

### Front-End:
- **Framework**: Next.js (React framework for server-side rendering)
- **Styling**: Tailwind CSS for utility-first CSS styling, enhanced with **shadcn/ui** for modern, customizable UI components
- **JavaScript**: TypeScript for type safety (optional but recommended)
- **Dark Mode**: Full support with automatic system detection and manual toggle.

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
   - Automate the mapping of queries to Event IDs and generate relevant SIEM queries.

3. **Generate Components**:
   - Use Cursor AI to scaffold components (e.g., `SearchBar`, `EventIDResults`, `SIEMQueryGenerator`).
   - Ensure components are placed in `/components` and follow the `example-component.tsx` naming convention.

4. **Optimize Code**:
   - Let Cursor AI help optimize the front-end logic for rendering search results and handling user input efficiently.

5. **Enable## Steps to Build in Cursor AI (continued)

5. **Enable Dark Mode**:
   - Use **Cursor AI** to automate the addition of **Dark Mode** support across all components.
   - Ensure Tailwind CSS’s **dark mode classes** are applied correctly, and **shadcn/ui** components are configured to switch between light and dark themes.
   - Implement a **toggle** for users to manually switch between Dark Mode and Light Mode, in addition to detecting system preferences.

6. **Deploy with Vercel**:
   - After the app is built and tested, deploy it to **Vercel** using either the **Vercel CLI** or directly from the **Vercel Dashboard**.
   - Configure **Vercel** to handle environment variables, especially for connecting to **Supabase**.

7. **Refine the UI**:
   - Use Cursor AI to fine-tune and improve the user experience (UX).
   - Focus on interactivity by adding **transitions**, **animations**, and hover effects to buttons, inputs, and results, making the app engaging and user-friendly.
   - Test the UI in both **Light** and **Dark** modes to ensure visual consistency and accessibility.

8. **Test and Finalize**:
   - Use Cursor AI to automate some of the testing processes.
   - Write test cases to ensure that searches, SIEM query generation, document uploads, and real-time logs function as expected.
   - Validate all user-facing components for responsiveness, accessibility (especially in Dark Mode), and overall performance.

---

## Fun and Engaging UI Features

### 1. **Smooth Transitions**:
   - All interactions (search, button clicks, page navigation) should have smooth transitions.
   - Use Tailwind’s **transition** utilities and **shadcn/ui’s** animations to add an extra layer of polish.

### 2. **Hover Effects**:
   - Buttons, links, and interactive elements should have clear hover effects.
   - Tailwind’s **hover utilities** combined with **shadcn’s interactive components** will make the app more responsive and fun to use.

### 3. **Tooltips and Modals**:
   - Use **tooltips** and **modals** from **shadcn/ui** to provide helpful information and guide the user through the app.
   - For example, when generating SIEM queries, show a tooltip that explains what each query does.

### 4. **Interactive Dark Mode Toggle**:
   - The Dark Mode toggle should be visually prominent and easy to use, with a smooth transition when switching modes.
   - Include a fun animation when toggling between Light and Dark modes.

### 5. **Real-time Feedback**:
   - Use **shadcn/ui’s Toast and Alert components** to show real-time feedback on user actions, such as successful document uploads or errors during search queries.
   - Ensure that these alerts are non-intrusive but visible, enhancing the overall user experience.

---

## Technical Specifications

### Front-End:
- **Framework**: Next.js (React framework for server-side rendering)
- **Styling**: Tailwind CSS for utility-first CSS styling, enhanced with **shadcn/ui** for modern, customizable UI components
- **JavaScript**: TypeScript for type safety (optional but recommended)
- **Dark Mode**: Full support with automatic system detection and manual toggle, using Tailwind’s dark mode utilities and **shadcn/ui** components.

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

## Contact Information

For any questions or assistance in setting up the app, please contact:

**Ian Trimble**: [itrimble@gmail.com](mailto:itrimble@gmail.com)

---
