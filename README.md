# Decentralized Campus Voting System (Multi-Campus)

eVotingKampus is a Web3-based SaaS (Software as a Service) platform that enables any university's Student Executive Board (BEM) to create, manage, and execute student ballots in a transparent, fair, and anti-manipulation manner using blockchain technology.

The platform is deployed on the Ethereum Sepolia Testnet and uses Solidity smart contracts to lock in candidates and secure student voting rights in a decentralized manner.

---

## 🚀 Key Features

- **Multi-Campus SaaS Platform**: Any university can register their own elections independently without needing to deploy its own blockchain infrastructure.
- **Blockchain-Backed Security**: Vote selections are permanently stored on the blockchain, preventing manipulation, ballot tampering, or double-voting (1 wallet address = 1 vote per Election ID).
- **MetaMask Integration (Ethers.js v6)**: Manually integrate the MetaMask crypto wallet without additional third-party libraries. Features auto-detection, auto-switching, and instant Sepolia Testnet network addition.
- **Real-Time Visual Charts**: Dynamically display vote results using interactive percentage charts fetched directly from smart contracts.
- **Fallback Simulation Mode**: Allows users to test functionality (election creation, voting, results) in a browser using mock data when a MetaMask wallet is not connected.

---

## 🛠️ Tech Stack

- **Frontend**: [Next.js](https://nextjs.org/) (App Router), [TypeScript](https://www.typescriptlang.org/), [Tailwind CSS](https://tailwindcss.com/)
- **Web3 Library**: [Ethers.js v6](https://docs.ethers.org/v6/) (Pure/Manual Implementation)
- **Smart Contract**: [Solidity](https://soliditylang.org/) (Target deploy: Ethereum Sepolia Testnet)
- **Icons**: [Lucide React](https://lucide.dev/)

---

## 📦 Project Folder Structure

```text
decentralized-campus-voting/
├── contracts/
│   └── VotingKampus.sol       # Solidity smart contract
├── src/
│   ├── app/
│   │   ├── create/
│   │   │   └── page.tsx       # New Election Creation Page
│   │   ├── election/
│   │   │   └── [id]/
│   │   │       └── page.tsx   # Election Space & Results Chart Page
│   │   ├── globals.css        # Global visual design & glassmorphism
│   │   ├── layout.tsx         # Global layout structure & provider wrapper
│   │   └── page.tsx           # Main dashboard & election statistics
│   ├── components/
│   │   └── Navbar.tsx         # Top navigation bar & MetaMask connection button
│   ├── context/
│   │   └── Web3Context.tsx    # Context provider for global Web3 state
│   ├── hooks/
│   │   └── useWeb3.ts         # Custom React Hook for handling wallets & networks
│   └── lib/
│       └── contract.ts        # ABI location & contract address configuration
└── package.json
```

---

## 💻 How to Run the Project Locally

### 1. Prerequisites
Make sure you have installed:
- [Node.js](https://nodejs.org/) (version 18.x or later)
- [MetaMask](https://metamask.io/) browser extension

### 2. Installing Dependencies
Open your terminal in the project root folder, then run the command:
```bash
npm install
```

### 3. Configuring the Smart Contract
1. Deploy the smart contract file `contracts/VotingKampus.sol` using Remix IDE, Hardhat, or Foundry to the Sepolia Testnet.
2. After successful deployment, retrieve the generated **Contract Address**.
3. Open the `src/lib/contract.ts` file and replace the contract address in the first line:
```typescript
export const CONTRACT_ADDRESS: string = "YOUR_SEPOLIA_CONTRACT_ADDRESS_IS_HERE";
```

### 4. Running the Development Server
Run the following command to start the local Next.js server:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser to see the application running.
