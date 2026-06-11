'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useWeb3Context } from '@/context/Web3Context';
import { ethers } from 'ethers';
import { CONTRACT_ADDRESS, CONTRACT_ABI, SEPOLIA_RPC_URL } from '@/lib/contract';
import { Vote, PlusCircle, Landmark, CheckCircle, AlertCircle, ArrowRight, Loader2, Award } from 'lucide-react';

interface Candidate {
  id: number;
  name: string;
  voteCount: number;
}

interface Election {
  id: number;
  campusName: string;
  electionName: string;
  isActive: boolean;
  candidates: Candidate[];
}

const MOCK_ELECTIONS: Election[] = [
  {
    id: 0,
    campusName: "Universitas Indonesia",
    electionName: "Pemilihan Raya Ketua & Wakil Ketua BEM UI 2026",
    isActive: true,
    candidates: [
      { id: 0, name: "01: Budi & Perkasa", voteCount: 142 },
      { id: 1, name: "02: Siti & Rahma", voteCount: 168 }
    ]
  },
  {
    id: 1,
    campusName: "Institut Teknologi Bandung",
    electionName: "Pemilu Presiden Kabinet KM ITB 2026",
    isActive: true,
    candidates: [
      { id: 0, name: "01: Ganesha Muda", voteCount: 95 },
      { id: 1, name: "02: Ganesha Harmoni", voteCount: 120 }
    ]
  },
  {
    id: 2,
    campusName: "Universitas Gadjah Mada",
    electionName: "Pemilihan Umum Mahasiswa (PUM) UGM 2026",
    isActive: true,
    candidates: [
      { id: 0, name: "01: UGM Bersatu", voteCount: 340 },
      { id: 1, name: "02: UGM Berintegritas", voteCount: 312 }
    ]
  }
];

export default function Dashboard() {
  const { isConnected, connectWallet } = useWeb3Context();
  const [elections, setElections] = useState<Election[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUsingMock, setIsUsingMock] = useState(false);

  useEffect(() => {
    const fetchElections = async () => {
      try {
        setLoading(true);
        // Validasi format address sebelum inisialisasi RPC
        if (
          !CONTRACT_ADDRESS ||
          CONTRACT_ADDRESS === "0x0000000000000000000000000000000000000000" ||
          !CONTRACT_ADDRESS.startsWith("0x") ||
          CONTRACT_ADDRESS.length !== 42
        ) {
          throw new Error("Address contract belum dikonfigurasi.");
        }

        const provider = new ethers.JsonRpcProvider(SEPOLIA_RPC_URL);
        const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
        
        const count = await contract.electionCount();
        const electionCount = Number(count);
        
        const fetchedElections: Election[] = [];
        for (let i = 0; i < electionCount; i++) {
          const rawElection = await contract.getElection(i);
          const rawCandidates = await contract.getCandidates(i);
          
          const candidates: Candidate[] = rawCandidates.map((c: any) => ({
            id: Number(c.id),
            name: c.name,
            voteCount: Number(c.voteCount)
          }));

          fetchedElections.push({
            id: Number(rawElection.id),
            campusName: rawElection.campusName,
            electionName: rawElection.electionName,
            isActive: rawElection.isActive,
            candidates: candidates
          });
        }
        
        setElections(fetchedElections);
        setIsUsingMock(false);
      } catch (err) {
        console.warn("Menggunakan data fallback karena kontrak belum dideploy:", err);
        setElections(MOCK_ELECTIONS);
        setIsUsingMock(true);
      } finally {
        setLoading(false);
      }
    };

    fetchElections();
  }, []);

  // Stats calculation
  const totalElections = elections.length;
  const uniqueCampuses = new Set(elections.map(e => e.campusName)).size;
  const totalVotes = elections.reduce(
    (sum, e) => sum + e.candidates.reduce((cSum, c) => cSum + c.voteCount, 0), 
    0
  );

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="relative glass rounded-3xl p-8 md:p-12 overflow-hidden border border-white/10 shadow-[0_20px_50px_rgba(124,58,237,0.1)]">
        <div className="absolute top-0 right-0 -mt-16 -mr-16 w-96 h-96 rounded-full bg-violet-600/10 blur-3xl" />
        <div className="absolute bottom-0 left-0 -mb-16 -ml-16 w-96 h-96 rounded-full bg-fuchsia-600/10 blur-3xl" />
        
        <div className="relative z-10 max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-violet-500/10 text-violet-300 border border-violet-500/20">
            <Award className="w-4 h-4" />
            Platform SaaS eVoting Web3 Pertama di Kampus Anda
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight leading-tight bg-gradient-to-r from-white via-indigo-100 to-indigo-300 bg-clip-text text-transparent">
            Desentralisasi Pemilu Mahasiswa, Amankan Demokrasi Kampus.
          </h1>
          <p className="text-base md:text-lg text-gray-300 max-w-2xl leading-relaxed">
            eVoting Kampus menggunakan blockchain Ethereum Sepolia untuk memastikan hak pilih Anda terlindungi dari manipulasi suara secara permanen, aman, transparan, dan anti-cetak ulang kertas suara.
          </p>
          
          <div className="flex flex-wrap items-center gap-4 pt-4">
            <Link 
              href="/create"
              className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-lg shadow-violet-600/30 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
            >
              <PlusCircle className="w-5 h-5" />
              Buat Pemilu Baru
            </Link>
            
            {!isConnected && (
              <button 
                onClick={connectWallet}
                className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300"
              >
                Hubungkan Wallet
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Mock Data Alert Banner */}
      {isUsingMock && (
        <div className="flex items-start gap-4 p-5 rounded-2xl bg-violet-950/20 border border-violet-500/20 glass text-sm">
          <AlertCircle className="w-5 h-5 text-violet-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="font-semibold text-violet-200">Mode Uji Coba (Mock Data Aktif)</h4>
            <p className="text-gray-400">
              Aplikasi saat ini menampilkan data simulasi lokal. Untuk menggunakan data real-time, silakan deploy smart contract <code className="text-indigo-300 px-1 py-0.5 rounded bg-white/5 font-mono">contracts/VotingKampus.sol</code> ke Sepolia Testnet, lalu perbarui variabel <code className="text-indigo-300 px-1 py-0.5 rounded bg-white/5 font-mono">CONTRACT_ADDRESS</code> pada <code className="text-indigo-300 px-1 py-0.5 rounded bg-white/5 font-mono">src/lib/contract.ts</code>.
            </p>
          </div>
        </div>
      )}

      {/* Statistics Counter */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass rounded-2xl p-6 flex items-center justify-between group glass-hover">
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-400">Total Kampus Terdaftar</p>
            <h3 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              {loading ? "-" : uniqueCampuses}
            </h3>
          </div>
          <div className="bg-violet-500/10 p-4 rounded-xl text-violet-400">
            <Landmark className="w-6 h-6" />
          </div>
        </div>

        <div className="glass rounded-2xl p-6 flex items-center justify-between group glass-hover">
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-400">Total Pemilu Aktif</p>
            <h3 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              {loading ? "-" : totalElections}
            </h3>
          </div>
          <div className="bg-fuchsia-500/10 p-4 rounded-xl text-fuchsia-400">
            <CheckCircle className="w-6 h-6" />
          </div>
        </div>

        <div className="glass rounded-2xl p-6 flex items-center justify-between group glass-hover">
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-400">Total Hak Suara Digunakan</p>
            <h3 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              {loading ? "-" : totalVotes.toLocaleString('id-ID')}
            </h3>
          </div>
          <div className="bg-indigo-500/10 p-4 rounded-xl text-indigo-400">
            <Vote className="w-6 h-6" />
          </div>
        </div>
      </section>

      {/* Active Elections Grid */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white tracking-tight">Pemilu Aktif Saat Ini</h2>
          {isUsingMock && (
            <span className="text-xs px-2.5 py-1 rounded-full bg-violet-500/10 text-violet-400 border border-violet-500/20">
              Simulasi
            </span>
          )}
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <Loader2 className="w-8 h-8 text-violet-500 animate-spin" />
            <p className="text-gray-400 text-sm">Menghubungkan ke blockchain...</p>
          </div>
        ) : elections.length === 0 ? (
          <div className="glass rounded-2xl p-12 text-center space-y-4">
            <Landmark className="w-12 h-12 text-gray-600 mx-auto" />
            <h3 className="text-lg font-bold text-white">Belum Ada Pemilu Terdaftar</h3>
            <p className="text-gray-400 max-w-md mx-auto text-sm">
              Jadilah pionir kampus Anda dengan membuat pemilu mahasiswa pertama yang terdesentralisasi.
            </p>
            <Link 
              href="/create"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold bg-white/5 border border-white/10 hover:bg-white/10 text-white transition-all"
            >
              Buat Pemilu Pertama
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {elections.map((election) => (
              <div 
                key={election.id} 
                className="glass rounded-2xl p-6 flex flex-col justify-between group glass-hover border border-white/5 shadow-lg"
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2 text-violet-400 bg-violet-500/5 px-2.5 py-1 rounded-lg text-xs font-semibold border border-violet-500/10">
                      <Landmark className="w-3.5 h-3.5" />
                      {election.campusName}
                    </div>
                    {election.isActive ? (
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                        AKTIF
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/5 text-gray-500 border border-white/5">
                        SELESAI
                      </span>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <h3 className="font-bold text-lg text-white leading-snug group-hover:text-violet-300 transition-colors">
                      {election.electionName}
                    </h3>
                    <p className="text-xs text-gray-500">Election ID: #{election.id}</p>
                  </div>

                  {/* Candidates count */}
                  <div className="pt-2 border-t border-white/5">
                    <p className="text-xs font-medium text-gray-400 mb-2">Daftar Kandidat Paslon:</p>
                    <ul className="space-y-1">
                      {election.candidates.map((cand) => (
                        <li key={cand.id} className="text-xs text-gray-300 flex items-center justify-between">
                          <span className="truncate max-w-[200px]">{cand.name}</span>
                          <span className="text-gray-500 font-mono">{cand.voteCount} suara</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="pt-6">
                  <Link 
                    href={`/election/${election.id}`}
                    className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl font-bold bg-white/5 border border-white/10 hover:bg-violet-600 hover:border-violet-600 hover:text-white transition-all duration-300 text-sm text-gray-300"
                  >
                    Masuk Ruang Voting
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
