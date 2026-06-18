'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useWeb3Context } from '@/context/Web3Context';
import { ethers } from 'ethers';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '@/lib/contract';
import { Plus, Trash2, Landmark, CheckSquare, PlusCircle, ArrowLeft, Loader2, CheckCircle2, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

export default function CreateElection() {
  const router = useRouter();
  const { isConnected, isCorrectNetwork, signer, switchNetwork } = useWeb3Context();

  const [campusName, setCampusName] = useState('');
  const [electionName, setElectionName] = useState('');
  const [candidates, setCandidates] = useState<string[]>(['', '']); // min 2 candidates

  const [txLoading, setTxLoading] = useState(false);
  const [txHash, setTxHash] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleCandidateChange = (index: number, value: string) => {
    const updated = [...candidates];
    updated[index] = value;
    setCandidates(updated);
  };

  const addCandidateField = () => {
    setCandidates([...candidates, '']);
  };

  const removeCandidateField = (index: number) => {
    if (candidates.length <= 2) return;
    setCandidates(candidates.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    // Input Validation
    if (!campusName.trim()) {
      setErrorMsg('Nama Kampus tidak boleh kosong.');
      return;
    }
    if (!electionName.trim()) {
      setErrorMsg('Nama Pemilu tidak boleh kosong.');
      return;
    }

    const validCandidates = candidates.filter(c => c.trim() !== '');
    if (validCandidates.length < 2) {
      setErrorMsg('Daftar kandidat minimal harus berjumlah 2 orang.');
      return;
    }

    // Checking Wallet Connection for Blockchain Execution
    if (!isConnected || !signer) {
      triggerSimulation(validCandidates);
      return;
    }

    if (!isCorrectNetwork) {
      setErrorMsg('Anda harus memindahkan jaringan MetaMask ke Sepolia Testnet.');
      await switchNetwork();
      return;
    }

    try {
      setTxLoading(true);

      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

      // Mengirimkan data pemilu baru ke smart contract
      const tx = await contract.createElection(campusName, electionName, validCandidates);
      setTxHash(tx.hash);

      // Menunggu transaksi masuk block (mining)
      await tx.wait();

      setSuccessMsg('Transaksi berhasil! Pemilu terdaftar secara permanen di blockchain.');
      setTimeout(() => {
        router.push('/');
      }, 2500);
    } catch (err: any) {
      console.error('Error saat pendaftaran pemilu:', err);
      // Fallback jika contract address adalah dummy placeholder
      if (CONTRACT_ADDRESS === "0x67270580252C4913f9DE092638D6F6D863060310" || err.message?.includes('call revert exception')) {
        triggerSimulation(validCandidates);
      } else {
        setErrorMsg(err.reason || err.message || 'Transaksi dibatalkan atau terjadi kesalahan jaringan.');
      }
    } finally {
      setTxLoading(false);
    }
  };

  // Simulates transaction flow when MetaMask isn't configured or contract is placeholder
  const triggerSimulation = (validCands: string[]) => {
    setTxLoading(true);
    setTimeout(() => {
      setTxLoading(false);
      setSuccessMsg(`[Simulasi Sukses] Pemilu "${electionName}" berhasil didaftarkan ke database lokal!`);

      // Simpan data di sessionStorage sementara agar muncul di detail room untuk uji coba langsung
      const customId = Date.now();
      const newElectionData = {
        id: customId,
        campusName,
        electionName,
        isActive: true,
        candidates: validCands.map((name, index) => ({
          id: index,
          name,
          voteCount: 0
        }))
      };

      const stored = sessionStorage.getItem('custom_elections');
      const customElections = stored ? JSON.parse(stored) : [];
      customElections.push(newElectionData);
      sessionStorage.setItem('custom_elections', JSON.stringify(customElections));

      setTimeout(() => {
        router.push('/');
      }, 2000);
    }, 1800);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Header Back Button */}
      <div className="flex items-center gap-4">
        <Link
          href="/"
          className="flex items-center justify-center w-10 h-10 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 text-gray-300 transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white">Buat Pemilu Baru</h1>
          <p className="text-xs text-gray-400">Daftarkan pemilu mahasiswa dan kunci kandidat paslon di blockchain</p>
        </div>
      </div>

      <div className="glass rounded-2xl p-6 md:p-8 border border-white/10 shadow-2xl relative">

        {/* State Banner */}
        {txLoading && (
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-30 flex flex-col items-center justify-center rounded-2xl space-y-4">
            <Loader2 className="w-12 h-12 text-violet-500 animate-spin" />
            <p className="text-white font-semibold">Mengirimkan Transaksi ke Blockchain...</p>
            {txHash && (
              <p className="text-xs font-mono text-gray-400">
                Tx Hash: <span className="text-indigo-400">{txHash.substring(0, 16)}...</span>
              </p>
            )}
            <p className="text-xs text-gray-500 animate-pulse">Mohon tunggu hingga transaksi masuk blok (mined)...</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Campus Name Input */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-300 flex items-center gap-2">
              <Landmark className="w-4 h-4 text-violet-400" />
              Nama Kampus / Universitas
            </label>
            <input
              type="text"
              placeholder="Contoh: Universitas Indonesia"
              value={campusName}
              onChange={(e) => setCampusName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 placeholder-gray-500 transition-all"
            />
          </div>

          {/* Election Title Input */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-300 flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-violet-400" />
              Nama / Judul Pemilu
            </label>
            <input
              type="text"
              placeholder="Contoh: Pemilihan Raya Ketua BEM UI 2026"
              value={electionName}
              onChange={(e) => setElectionName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 placeholder-gray-500 transition-all"
            />
          </div>

          {/* Candidates Lists */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-t border-white/5 pt-4">
              <label className="text-sm font-semibold text-gray-300 flex items-center gap-2">
                <PlusCircle className="w-4 h-4 text-violet-400" />
                Daftar Kandidat (Pasangan Calon)
              </label>
              <button
                type="button"
                onClick={addCandidateField}
                className="flex items-center gap-1 text-xs font-bold text-violet-400 hover:text-violet-300 bg-violet-500/10 px-3 py-1.5 rounded-lg border border-violet-500/10 hover:border-violet-500/30 transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                Tambah Paslon
              </button>
            </div>

            <p className="text-xs text-gray-500">
              * Kandidat terkunci permanen setelah pemilu didaftarkan ke blockchain (tidak dapat diedit/ditambah).
            </p>

            <div className="space-y-3">
              {candidates.map((candidate, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-white/5 border border-white/10 text-xs font-bold font-mono text-gray-400">
                    {String(index + 1).padStart(2, '0')}
                  </div>
                  <input
                    type="text"
                    placeholder={`Nama Kandidat Pasangan Calon ${index + 1}`}
                    value={candidate}
                    onChange={(e) => handleCandidateChange(index, e.target.value)}
                    className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 placeholder-gray-500 transition-all"
                  />
                  {candidates.length > 2 && (
                    <button
                      type="button"
                      onClick={() => removeCandidateField(index)}
                      className="p-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Messages */}
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

          {/* Form Action Buttons */}
          <div className="flex items-center gap-4 border-t border-white/5 pt-6">
            <button
              type="submit"
              className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-lg shadow-violet-600/30 hover:scale-[1.01] active:scale-[0.99] transition-all duration-300"
            >
              Mulai Pendaftaran Pemilu
            </button>
            <Link
              href="/"
              className="px-6 py-3.5 rounded-xl font-bold bg-white/5 border border-white/10 hover:bg-white/10 text-gray-300 text-center transition-all text-sm"
            >
              Batal
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
