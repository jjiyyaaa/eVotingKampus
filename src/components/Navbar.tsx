'use client';

import React from 'react';
import Link from 'next/link';
import { useWeb3Context } from '@/context/Web3Context';
import { Wallet, AlertTriangle, LogOut, CheckCircle2, ChevronDown } from 'lucide-react';

export default function Navbar() {
  const { 
    account, 
    isConnected, 
    isCorrectNetwork, 
    connectWallet, 
    disconnectWallet, 
    switchNetwork,
    loading 
  } = useWeb3Context();

  const formatAddress = (addr: string) => {
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-white/5 bg-background/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2 font-bold text-xl tracking-tight text-white group">
              <div className="bg-gradient-to-tr from-violet-600 to-fuchsia-500 p-2 rounded-xl group-hover:scale-105 transition-transform duration-300">
                <CheckCircle2 className="w-5 h-5 text-white" />
              </div>
              <span className="bg-gradient-to-r from-white via-indigo-200 to-indigo-400 bg-clip-text text-transparent">
                eVoting<span className="text-violet-400">Kampus</span>
              </span>
            </Link>
            
            <div className="hidden md:flex items-center gap-6">
              <Link href="/" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">
                Dashboard
              </Link>
              <Link href="/create" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">
                Buat Pemilu
              </Link>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {isConnected && !isCorrectNetwork && (
              <button 
                onClick={switchNetwork}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500/20 transition-all duration-300 animate-pulse"
              >
                <AlertTriangle className="w-4 h-4" />
                Switch to Sepolia
              </button>
            )}

            {loading ? (
              <div className="h-10 w-36 rounded-xl bg-white/5 animate-pulse" />
            ) : isConnected ? (
              <div className="relative group">
                <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-300">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-sm font-mono text-gray-200">{formatAddress(account)}</span>
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                </button>
                
                <div className="absolute right-0 mt-2 w-48 rounded-xl glass p-1 shadow-2xl opacity-0 scale-95 pointer-events-none group-hover:opacity-100 group-hover:scale-100 group-hover:pointer-events-auto transition-all duration-200 origin-top-right">
                  <button 
                    onClick={disconnectWallet}
                    className="flex items-center gap-2 w-full px-3 py-2 text-sm text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Disconnect Wallet
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={connectWallet}
                className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-[0_0_20px_rgba(124,58,237,0.3)] hover:shadow-[0_0_25px_rgba(124,58,237,0.5)] transition-all duration-300 transform active:scale-[0.98]"
              >
                <Wallet className="w-4 h-4" />
                Connect Wallet
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
