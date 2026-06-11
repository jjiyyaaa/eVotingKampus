import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Web3Provider } from "@/context/Web3Context";
import Navbar from "@/components/Navbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Decentralized Campus Voting System (Multi-Campus)",
  description: "Platform SaaS Pemilu Mahasiswa berbasis Web3 dan Blockchain Sepolia Testnet.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <Web3Provider>
          <Navbar />
          <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </main>
          <footer className="border-t border-white/5 py-8 text-center text-sm text-gray-500 glass mt-12">
            <div className="max-w-7xl mx-auto px-4">
              <p>© 2026 eVoting Kampus. Platform SaaS Pemilu Mahasiswa Berbasis Web3. Keamanan & Transparansi Terjamin.</p>
            </div>
          </footer>
        </Web3Provider>
      </body>
    </html>
  );
}

