import type { Metadata } from "next";
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import { Nunito, Encode_Sans } from 'next/font/google'
import "./globals.css";

export const metadata: Metadata = {
  title: "Talent Search",
  description: "AI-powered recruitment platform",
};

const nunito = Nunito({ subsets: ['latin'], variable: '--font-nunito' })
const encode = Encode_Sans({ subsets: ['latin'], variable: '--font-encode-sans' })

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${nunito.variable} ${encode.variable}`}>
      <body className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-800">
        {children}
      </body>
    </html>
  );
};