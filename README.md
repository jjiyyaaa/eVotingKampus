# Decentralized Campus Voting System (Multi-Campus)

eVotingKampus adalah platform SaaS (Software as a Service) berbasis Web3 yang memungkinkan Badan Eksekutif Mahasiswa (BEM) dari universitas mana pun untuk membuat, mengelola, dan melaksanakan pemungutan suara mahasiswa secara transparan, jujur, dan anti-manipulasi menggunakan teknologi blockchain.

Platform ini di-deploy di jaringan **Ethereum Sepolia Testnet** dan menggunakan smart contract Solidity untuk mengunci kandidat serta mengamankan hak pilih mahasiswa secara terdesentralisasi.

---

## 🚀 Fitur Utama

- **Multi-Campus SaaS Platform**: Universitas mana pun dapat mendaftarkan pemilu mereka sendiri secara mandiri tanpa perlu men-deploy infrastruktur blockchain sendiri.
- **Blockchain-Backed Security**: Pilihan suara disimpan secara permanen di blockchain, mencegah manipulasi, perusakan kotak suara, atau double-voting (1 alamat wallet = 1 suara per ID Pemilu).
- **MetaMask Integration (Ethers.js v6)**: Integrasi dompet kripto MetaMask secara manual tanpa pustaka tambahan pihak ketiga. Fitur deteksi otomatis, auto-switch, dan penambahan jaringan Sepolia Testnet secara instan.
- **Real-Time Visual Charts**: Tampilan hasil perolehan suara secara dinamis menggunakan chart persentase interaktif yang langsung di-fetch dari smart contract.
- **Fallback Simulation Mode**: Memungkinkan pengguna melakukan uji coba fungsionalitas (buat pemilu, voting, hasil) di browser menggunakan mock data ketika dompet MetaMask tidak terhubung.

---

## 🛠️ Tech Stack

- **Frontend**: [Next.js](https://nextjs.org/) (App Router), [TypeScript](https://www.typescriptlang.org/), [Tailwind CSS](https://tailwindcss.com/)
- **Web3 Library**: [Ethers.js v6](https://docs.ethers.org/v6/) (Pure/Manual Implementation)
- **Smart Contract**: [Solidity](https://soliditylang.org/) (Target deploy: Ethereum Sepolia Testnet)
- **Icons**: [Lucide React](https://lucide.dev/)

---

## 📦 Struktur Folder Proyek

```text
decentralized-campus-voting/
├── contracts/
│   └── VotingKampus.sol       # Smart contract Solidity
├── src/
│   ├── app/
│   │   ├── create/
│   │   │   └── page.tsx       # Halaman Pembuatan Pemilu baru
│   │   ├── election/
│   │   │   └── [id]/
│   │   │       └── page.tsx   # Halaman Ruang Pemilu & Hasil Chart
│   │   ├── globals.css        # Desain visual global & glassmorphism
│   │   ├── layout.tsx         # Struktur layout global & provider wrapper
│   │   └── page.tsx           # Dashboard utama & statistik pemilu
│   ├── components/
│   │   └── Navbar.tsx         # Bar navigasi atas & tombol koneksi MetaMask
│   ├── context/
│   │   └── Web3Context.tsx    # Context provider untuk state Web3 global
│   ├── hooks/
│   │   └── useWeb3.ts         # Custom React Hook untuk handle wallet & jaringan
│   └── lib/
│       └── contract.ts        # Tempat ABI & konfigurasi alamat contract
└── package.json
```

---

## 💻 Cara Menjalankan Proyek secara Lokal

### 1. Prasyarat
Pastikan Anda sudah menginstal:
- [Node.js](https://nodejs.org/) (versi 18.x atau yang lebih baru)
- Ekstensi browser [MetaMask](https://metamask.io/)

### 2. Instalasi Dependensi
Buka terminal Anda di folder root proyek, lalu jalankan perintah:
```bash
npm install
```

### 3. Konfigurasi Kontrak Pintar (Smart Contract)
1. Deploy file smart contract `contracts/VotingKampus.sol` menggunakan Remix IDE, Hardhat, atau Foundry ke Sepolia Testnet.
2. Setelah berhasil dideploy, ambil **Contract Address** yang dihasilkan.
3. Buka file `src/lib/contract.ts` dan ganti alamat contract pada baris pertama:
   ```typescript
   export const CONTRACT_ADDRESS: string = "ALAMAT_KONTRAK_SEPOLIA_ANDA_DI_SINI";
   ```

### 4. Menjalankan Server Development
Jalankan perintah berikut untuk menjalankan server Next.js lokal:
```bash
npm run dev
```
Buka [http://localhost:3000](http://localhost:3000) di browser Anda untuk melihat aplikasi berjalan.
