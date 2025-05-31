import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
<<<<<<< HEAD
=======
import Header from '@/components/layout/Header'; // Adjusted path
import Sidebar from '@/components/layout/Sidebar'; // Adjusted path
>>>>>>> add-claude-github-actions-1748383502583

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
<<<<<<< HEAD
  title: "EventLog Tutorial ThriveDX",
  description: "Learn Windows Event Log analysis and SIEM query generation for cybersecurity monitoring",
  keywords: "cybersecurity, event logs, SIEM, Windows security, MITRE ATT&CK, threat detection",
  authors: [{ name: "Ian Trimble" }],
  openGraph: {
    title: "EventLog Tutorial ThriveDX",
    description: "Master Windows Event Log analysis with hands-on SIEM query generation",
    type: "website",
  },
=======
  title: "EventLog Analyzer", // Updated title
  description: "Dashboard for analyzing event logs", // Updated description
>>>>>>> add-claude-github-actions-1748383502583
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
<<<<<<< HEAD
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
=======
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-900 text-gray-100`} // Dark theme base
      >
        <div className="flex h-screen overflow-hidden">
          <Sidebar />
          <div className="flex-1 flex flex-col overflow-y-auto">
            <Header />
            <main className="flex-1 p-6 bg-gray-800"> {/* Main content bg slightly lighter */}
              {children}
            </main>
          </div>
        </div>
>>>>>>> add-claude-github-actions-1748383502583
      </body>
    </html>
  );
}
