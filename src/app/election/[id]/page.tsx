'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useWeb3Context } from '@/context/Web3Context';
import { ethers } from 'ethers';
import { CONTRACT_ADDRESS, CONTRACT_ABI, SEPOLIA_RPC_URL } from '@/lib/contract';
import { Landmark, ArrowLeft, Loader2, Award, User, Vote, CheckCircle2, AlertTriangle, ShieldCheck, BarChart3 } from 'lucide-react';
import Link from 'next/link';

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

export default function ElectionRoom() {
  const params = useParams();
  const router = useRouter();
  const electionIdStr = params.id as string;
  const electionId = Number(electionIdStr);

  const { isConnected, isCorrectNetwork, signer, account, switchNetwork } = useWeb3Context();

  const [election, setElection] = useState<Election | null>(null);
  const [loading, setLoading] = useState(true);
  const [userHasVoted, setUserHasVoted] = useState(false);
  const [voteLoading, setVoteLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isSimulation, setIsSimulation] = useState(false);

  const fetchElectionDetails = useCallback(async () => {
    try {
      setLoading(true);
      setErrorMsg('');

      // 1. Cek apakah ada data custom dari sessionStorage (hasil inisialisasi lokal)
      const stored = sessionStorage.getItem('custom_elections');
      const customElections: Election[] = stored ? JSON.parse(stored) : [];
      const customFound = customElections.find(e => e.id === electionId);

      if (customFound) {
        setElection(customFound);
        setIsSimulation(true);
        // Cek status vote simulasi
        const mockedVotes = sessionStorage.getItem(`mock_voted_${electionId}_${account || 'anon'}`);
        setUserHasVoted(!!mockedVotes);
        setLoading(false);
        return;
      }

      // 2. Cek apakah ini ID fallback demo (0, 1, 2)
      if (
        (electionId === 0 || electionId === 1 || electionId === 2) &&
        (CONTRACT_ADDRESS === "0x67270580252C4913f9DE092638D6F6D863060310" || CONTRACT_ADDRESS === "0x67270580252C4913f9DE092638D6F6D863060310")
      ) {
        const mockElectionsList = [
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
        const found = mockElectionsList.find(e => e.id === electionId);
        if (found) {
          const adjusted = sessionStorage.getItem(`mock_election_${electionId}`);
          if (adjusted) {
            setElection(JSON.parse(adjusted));
          } else {
            setElection(found);
          }
          setIsSimulation(true);
          const mockedVotes = sessionStorage.getItem(`mock_voted_${electionId}_${account || 'anon'}`);
          setUserHasVoted(!!mockedVotes);
          setLoading(false);
          return;
        }
      }

      // 3. Ambil data asli dari Blockchain Sepolia
      const provider = new ethers.JsonRpcProvider(SEPOLIA_RPC_URL);
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);

      const rawElection = await contract.getElection(electionId);
      const rawCandidates = await contract.getCandidates(electionId);

      const candidates: Candidate[] = rawCandidates.map((c: any) => ({
        id: Number(c.id),
        name: c.name,
        voteCount: Number(c.voteCount)
      }));

      setElection({
        id: Number(rawElection.id),
        campusName: rawElection.campusName,
        electionName: rawElection.electionName,
        isActive: rawElection.isActive,
        candidates
      });

      // Cek apakah user sudah memberikan suaranya
      if (isConnected && account) {
        const voted = await contract.hasVoted(electionId, account);
        setUserHasVoted(voted);
      }
    } catch (err) {
      console.error('Gagal mengambil detail dari contract:', err);
      setErrorMsg('Gagal memuat detail pemilu dari blockchain Sepolia.');
    } finally {
      setLoading(false);
    }
  }, [electionId, account, isConnected]);

  useEffect(() => {
    fetchElectionDetails();
  }, [fetchElectionDetails]);

  const castVote = async (candidateId: number) => {
    setErrorMsg('');
    setSuccessMsg('');

    if (userHasVoted) {
      setErrorMsg('Anda sudah menggunakan hak pilih Anda di pemilu ini.');
      return;
    }

    // Aksi Vote Simulasi Lokal
    if (isSimulation) {
      setVoteLoading(true);
      setTimeout(() => {
        setVoteLoading(false);
        if (election) {
          const updatedCandidates = election.candidates.map(c => {
            if (c.id === candidateId) {
              return { ...c, voteCount: c.voteCount + 1 };
            }
            return c;
          });
          const updatedElection = { ...election, candidates: updatedCandidates };
          setElection(updatedElection);

          // Simpan ke session storage
          if (electionId === 0 || electionId === 1 || electionId === 2) {
            sessionStorage.setItem(`mock_election_${electionId}`, JSON.stringify(updatedElection));
          } else {
            const stored = sessionStorage.getItem('custom_elections');
            const customElections: Election[] = stored ? JSON.parse(stored) : [];
            const index = customElections.findIndex(e => e.id === electionId);
            if (index !== -1) {
              customElections[index] = updatedElection;
              sessionStorage.setItem('custom_elections', JSON.stringify(customElections));
            }
          }

          sessionStorage.setItem(`mock_voted_${electionId}_${account || 'anon'}`, 'true');
          setUserHasVoted(true);
          setSuccessMsg('Simulasi vote berhasil! Pilihan suara Anda dicatat di browser.');
        }
      }, 1200);
      return;
    }

    // Aksi Vote Real-time Blockchain Sepolia
    if (!isConnected || !signer) {
      setErrorMsg('Silakan hubungkan wallet MetaMask Anda terlebih dahulu.');
      return;
    }

    if (!isCorrectNetwork) {
      setErrorMsg('Silakan ubah jaringan ke Sepolia Testnet.');
      await switchNetwork();
      return;
    }

    try {
      setVoteLoading(true);
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

      const tx = await contract.giveVote(electionId, candidateId);

      // Menunggu transaksi masuk blok
      await tx.wait();

      setSuccessMsg('Vote berhasil diverifikasi dan direkam ke blockchain!');
      setUserHasVoted(true);

      // Refresh data pemilu terbaru
      await fetchElectionDetails();
    } catch (err: any) {
      console.error('Error saat memberikan suara:', err);
      setErrorMsg(err.reason || err.message || 'Transaksi dibatalkan.');
    } finally {
      setVoteLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-4">
        <Loader2 className="w-12 h-12 text-violet-500 animate-spin" />
        <p className="text-gray-400">Memuat data ruang pemilu...</p>
      </div>
    );
  }

  if (!election) {
    return (
      <div className="glass rounded-3xl p-12 text-center space-y-6">
        <AlertTriangle className="w-16 h-16 text-amber-500 mx-auto" />
        <h2 className="text-2xl font-bold text-white">Pemilu Tidak Ditemukan</h2>
        <p className="text-gray-400 max-w-md mx-auto">
          ID Pemilu yang Anda cari tidak tersedia di blockchain maupun simulasi lokal.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali ke Dashboard
        </Link>
      </div>
    );
  }

  // Calculate vote statistics
  const totalVotes = election.candidates.reduce((sum, c) => sum + c.voteCount, 0);

  return (
    <div className="space-y-8">
      {/* Detail Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/5 pb-6">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="flex items-center justify-center w-10 h-10 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 text-gray-300 transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2 text-violet-400 text-xs font-semibold">
              <Landmark className="w-3.5 h-3.5" />
              {election.campusName}
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white mt-1">{election.electionName}</h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {isSimulation && (
            <span className="text-xs px-3 py-1.5 rounded-xl bg-violet-500/10 text-violet-400 border border-violet-500/20 font-semibold">
              Mode Simulasi
            </span>
          )}
          {election.isActive ? (
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Pemilu Berjalan
            </span>
          ) : (
            <span className="px-3 py-1.5 rounded-xl text-xs font-bold bg-white/5 text-gray-500 border border-white/5">
              Pemilu Selesai
            </span>
          )}
        </div>
      </div>

      {/* Main Grid: Left side candidates voting room, Right side real-time results chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* Candidates Selection (8 columns) */}
        <section className="lg:col-span-7 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Vote className="w-5 h-5 text-violet-400" />
              Pilih Calon Pemimpin Anda
            </h2>
            {userHasVoted && (
              <span className="flex items-center gap-1 text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                <ShieldCheck className="w-3.5 h-3.5" />
                Sudah Memilih
              </span>
            )}
          </div>

          {voteLoading && (
            <div className="p-4 rounded-xl bg-violet-600/10 border border-violet-500/20 text-xs text-violet-300 flex items-center gap-2.5 animate-pulse">
              <Loader2 className="w-4 h-4 animate-spin text-violet-400" />
              <span>Memproses suara pilihan Anda... Harap verifikasi dan tunggu transaksi MetaMask Anda hingga mined.</span>
            </div>
          )}

          {errorMsg && (
            <div className="flex items-start gap-2.5 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-400">
              <AlertTriangle className="w-4.5 h-4.5 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="flex items-start gap-2.5 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400">
              <CheckCircle2 className="w-4.5 h-4.5 shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          <div className="grid grid-cols-1 gap-6">
            {election.candidates.map((cand) => (
              <div
                key={cand.id}
                className={`glass rounded-2xl p-6 border relative overflow-hidden flex flex-col justify-between md:flex-row md:items-center gap-4 transition-all duration-300 ${userHasVoted
                    ? 'border-white/5 opacity-80'
                    : 'border-white/10 hover:border-violet-500/30 shadow-lg hover:shadow-violet-600/5 hover:-translate-y-0.5'
                  }`}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center text-lg font-bold text-white shadow-md">
                    {cand.id + 1}
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-lg">{cand.name}</h3>
                    <p className="text-xs text-gray-500 flex items-center gap-1.5 mt-0.5">
                      <User className="w-3 h-3 text-gray-400" />
                      Kandidat Paslon #{cand.id}
                    </p>
                  </div>
                </div>

                <div>
                  {userHasVoted ? (
                    <button
                      disabled
                      className="w-full md:w-auto px-5 py-2.5 rounded-xl font-bold bg-white/5 border border-white/5 text-gray-500 text-sm cursor-not-allowed"
                    >
                      Hak Suara Digunakan
                    </button>
                  ) : (
                    <button
                      onClick={() => castVote(cand.id)}
                      disabled={voteLoading}
                      className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl font-bold bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-lg shadow-violet-600/25 transition-all duration-300 disabled:opacity-50 transform active:scale-95"
                    >
                      <Vote className="w-4 h-4" />
                      Vote Paslon
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Real-time Charts & Statistics (5 columns) */}
        <section className="lg:col-span-5 space-y-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-violet-400" />
            Hasil Perolehan Suara
          </h2>

          <div className="glass rounded-2xl p-6 border border-white/10 space-y-6 shadow-2xl">
            <div className="space-y-1">
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Total Suara Masuk</p>
              <h3 className="text-4xl font-extrabold bg-gradient-to-r from-white via-indigo-100 to-indigo-300 bg-clip-text text-transparent">
                {totalVotes.toLocaleString('id-ID')} Suara
              </h3>
              <p className="text-[10px] text-gray-500">
                Data terverifikasi secara real-time dari kontrak pintar blockchain.
              </p>
            </div>

            {/* Scorecard Bars */}
            <div className="space-y-4 pt-4 border-t border-white/5">
              {election.candidates.map((cand) => {
                const percentage = totalVotes > 0 ? (cand.voteCount / totalVotes) * 100 : 0;
                return (
                  <div key={cand.id} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-semibold text-gray-300 truncate max-w-[200px]">
                        No. {cand.id + 1} - {cand.name}
                      </span>
                      <span className="font-mono font-bold text-white">
                        {percentage.toFixed(1)}% <span className="text-gray-500 text-xs font-normal">({cand.voteCount})</span>
                      </span>
                    </div>
                    {/* Visual Progress Bar */}
                    <div className="w-full h-3 rounded-full bg-white/5 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-violet-600 to-fuchsia-500 rounded-full transition-all duration-1000 ease-out"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Verification Tag */}
            <div className="pt-2 flex items-center gap-2 text-xs text-gray-400 bg-white/5 p-3.5 rounded-xl border border-white/5">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>
                Setiap transaksi suara dijamin kriptografi dan terekam di buku besar terdistribusi Ethereum.
              </span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
