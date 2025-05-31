import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "EventLog Tutorial ThriveDX",
  description: "Learn Windows Event Log analysis and SIEM query generation for cybersecurity monitoring",
  keywords: "cybersecurity, event logs, SIEM, Windows security, MITRE ATT&CK, threat detection",
  authors: [{ name: "Ian Trimble" }],
  openGraph: {
    title: "EventLog Tutorial ThriveDX",
    description: "Master Windows Event Log analysis with hands-on SIEM query generation",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
