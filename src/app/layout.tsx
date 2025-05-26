import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from '@/components/layout/Header'; // Adjusted path
import Sidebar from '@/components/layout/Sidebar'; // Adjusted path

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "EventLog Analyzer", // Updated title
  description: "Dashboard for analyzing event logs", // Updated description
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
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
      </body>
    </html>
  );
}
