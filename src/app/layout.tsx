import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

const siteUrl = "https://moabdullahi.uk";

const siteTitle = "Mohamed Abdullahi | DevOps Engineer";

const siteDescription =
  "DevOps Engineer specialising in AWS, Kubernetes, Terraform, CI/CD and cloud infrastructure. Explore my projects, architecture decisions and technical write-ups.";

export const metadata: Metadata = {
  icons: {
    icon: "/icon.svg?v=2",
    shortcut: "/icon.svg?v=2",
  },
  metadataBase: new URL(siteUrl),

  title: {
    default: siteTitle,
    template: "%s | Mohamed Abdullahi",
  },

  description: siteDescription,

  alternates: {
    canonical: "/",
  },

  openGraph: {
    title: siteTitle,
    description: siteDescription,
    url: siteUrl,
    siteName: "Mohamed Abdullahi",
    type: "website",
    locale: "en_GB",
  },

  twitter: {
    card: "summary",
    title: siteTitle,
    description: siteDescription,
  },

  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en-GB"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}