# 🎤 VoicePay Arc

**Voice-activated cryptocurrency payments on Arc Blockchain**

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/xPOURY4/voicepay-arc&env=NEXT_PUBLIC_DEMO_MODE&envDescription=Set%20to%20true%20for%20demo%20mode&project-name=voicepay-arc-demo)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Next.js](https://img.shields.io/badge/Next.js-14.x-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)](https://www.typescriptlang.org/)
[![Build Status](https://img.shields.io/badge/build-passing-brightgreen)]()

**Developer**: [TheRealPourya](https://github.com/xPOURY4) | **Twitter**: [@TheRealPourya](https://x.com/TheRealPourya) | **Date**: November 2025

VoicePay Arc is a production-ready web application that enables users to make USDC payments on the Arc Testnet using natural voice commands. Built with Next.js, TypeScript, and integrated with ElevenLabs for voice processing and Cloudflare Workers AI for natural language understanding.

> **🎉 DEPLOYMENT FIXED!** The package dependency issues have been resolved. The project now uses REST APIs directly and deploys successfully to Vercel. See [DEPLOYMENT_FIX.md](./DEPLOYMENT_FIX.md) for details or [QUICK_DEPLOY.md](./QUICK_DEPLOY.md) for instant deployment.

---

## 🚀 Quick Deploy (2 Options)

### Option 1: GitHub + Vercel (Recommended)

**Step 1: Deploy to GitHub**
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/voicepay-arc.git
git push -u origin main
```

**Step 2: Deploy to Vercel**

Click the button below or see [DEPLOY_GUIDE.md](./QUICK_DEPLOY.md) for detailed instructions:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/YOUR_USERNAME/voicepay-arc&env=NEXT_PUBLIC_DEMO_MODE&envDescription=Set%20to%20true%20for%20demo%20mode&project-name=voicepay-arc)

### Option 2: Local Demo (No API Keys Required!)

Want to test locally first? Run the demo on your PC:

```bash
npm install
npm run dev
# Open http://localhost:3000
```

**What's Included:**
- ✅ Full UI/UX with animations
- ✅ Simulated voice commands  
- ✅ Mock balance ($125.50 USDC)
- ✅ Sample transaction history
- ✅ Mobile responsive
- ✅ **No API keys required for demo!**

**📚 Deployment Documentation:**
- [DEPLOY_GUIDE.md](./DEPLOY_GUIDE.md) - Complete GitHub + Vercel guide
- [START_DEMO.md](./START_DEMO.md) - Local demo instructions
- [VERCEL_DEPLOY.md](./VERCEL_DEPLOY.md) - Vercel-specific guide
- [DEPLOYMENT_FIX.md](./DEPLOYMENT_FIX.md) - Technical fixes documentation
</text>

<old_text line=476>
## 🚢 Deployment

### Vercel Deployment (Recommended)

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Next.js](https://img.shields.io/badge/Next.js-14.x-black.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)
![Arc](https://img.shields.io/badge/Arc-Testnet-purple.svg)

---

## 📋 Table of Contents

- [✨ Features](#-features)
  - [Core Functionality](#core-functionality)
  - [Technical Features](#technical-features)
- [🏗️ Architecture](#️-architecture)
  - [Technology Stack](#technology-stack)
- [📦 Prerequisites](#-prerequisites)
  - [Required Software](#required-software)
  - [Required API Keys](#required-api-keys)
- [🚀 Installation](#-installation)
  - [1. Clone the Repository](#1-clone-the-repository)
  - [2. Install Dependencies](#2-install-dependencies)
  - [3. Environment Configuration](#3-environment-configuration)
  - [4. Start Development Server](#4-start-development-server)
- [⚙️ Configuration](#️-configuration)
  - [Environment Variables](#environment-variables)
  - [Arc Testnet Setup](#arc-testnet-setup)
- [🎯 Usage](#-usage)
  - [Voice Commands](#voice-commands)
  - [Application Flow](#application-flow)
- [📚 API Documentation](#-api-documentation)
  - [Voice Processing API](#voice-processing-api)
  - [NLP Processing API](#nlp-processing-api)
- [📁 Project Structure](#-project-structure)
- [🛠️ Development](#️-development)
  - [Available Scripts](#available-scripts)
  - [Code Quality](#code-quality)
  - [Adding New Features](#adding-new-features)
- [🧪 Testing](#-testing)
  - [Manual Testing](#manual-testing)
  - [Test Commands](#test-commands)
- [🚢 Deployment](#-deployment)
  - [Vercel Deployment (Recommended)](#vercel-deployment-recommended)
  - [Manual Deployment](#manual-deployment)
  - [Environment-Specific Configurations](#environment-specific-configurations)
- [🔒 Security](#-security)
  - [Best Practices](#best-practices)
  - [Reporting Security Issues](#reporting-security-issues)
- [🐛 Troubleshooting](#-troubleshooting)
  - [Common Issues](#common-issues)
  - [Debug Mode](#debug-mode)
- [🤝 Contributing](#-contributing)
  - [How to Contribute](#how-to-contribute)
  - [Contribution Guidelines](#contribution-guidelines)
  - [Code of Conduct](#code-of-conduct)
- [📄 License](#-license)
- [🙏 Acknowledgments](#-acknowledgments)
- [📞 Support](#-support)
  - [Developer](#developer)
  - [Documentation](#documentation)
  - [Resources](#resources)
- [📈 Roadmap](#-roadmap)
  - [Version 1.1.0 (Q1 2025)](#version-110-q1-2025)
  - [Version 1.2.0 (Q2 2025)](#version-120-q2-2025)
  - [Version 2.0.0 (Q4 2025)](#version-200-q4-2025)
- [📊 Status](#-status)

---

## ✨ Features

### Core Functionality
- 🎤 **Voice Commands**: Natural language voice input for payments
- 🔊 **Real-time Transcription**: Powered by ElevenLabs Speech-to-Text
- 🧠 **Intent Extraction**: AI-powered command understanding with Cloudflare Workers AI
- 💸 **USDC Transactions**: Native USDC transfers on Arc Testnet
- 📊 **Balance Display**: Real-time wallet balance updates
- 📜 **Transaction History**: Complete transaction history with ArcScan links
- ✅ **Confirmation Flow**: Secure transaction confirmation before sending

### Technical Features
- ⚡ **Fast Finality**: Sub-second transaction confirmation on Arc
- 🎨 **Beautiful UI**: Modern, responsive design with Framer Motion animations
- 📱 **Mobile-First**: Optimized for mobile devices
- 🔐 **Type-Safe**: Full TypeScript coverage
- ♿ **Accessible**: WCAG 2.1 compliant
- 🌐 **PWA Ready**: Progressive Web App capabilities

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    VOICEPAY ARC                         │
├─────────────────┬─────────────────┬────────────────────┤
│   FRONTEND      │   BACKEND       │   BLOCKCHAIN       │
│   Next.js       │   API Routes    │   Arc Testnet      │
│   React         │   ElevenLabs    │   USDC Contract    │
│   TypeScript    │   Cloudflare AI │   Ethers.js v6     │
│   Tailwind      │   NLP Engine    │   RPC Provider     │
│   Framer Motion │   Validation    │   Transaction Mgmt │
└─────────────────┴─────────────────┴────────────────────┘
```

### Technology Stack

**Frontend:**
- Next.js 14+ (React Framework)
- TypeScript 5+ (Type Safety)
- Tailwind CSS 3+ (Styling)
- Framer Motion 11+ (Animations)

**Backend:**
- Next.js API Routes
- ElevenLabs API (Voice Transcription)
- Cloudflare Workers AI (NLP)
- Formidable (File Upload)

**Blockchain:**
- Arc Testnet (L2 Blockchain)
- Ethers.js v6 (Blockchain Interaction)
- USDC Contract (ERC20 Token)

---

## 📦 Prerequisites

Before you begin, ensure you have the following installed and configured:

### Required Software
- **Node.js**: Version 18.0.0 or higher
- **npm**: Version 9.0.0 or higher (or yarn/pnpm)
- **Git**: For version control

### Required API Keys

1. **ElevenLabs API Key**
   - Sign up at [elevenlabs.io](https://elevenlabs.io)
   - Navigate to Settings → API Keys
   - Generate a new API key

2. **Cloudflare Account**
   - Create account at [cloudflare.com](https://cloudflare.com)
   - Navigate to Dashboard → Workers & Pages → AI
   - Copy your Account ID and API Token

3. **Arc Testnet Wallet**
   - Set up a test wallet (MetaMask recommended)
   - Get testnet ETH for gas from Arc faucet
   - Get testnet USDC from Circle faucet
   - **⚠️ NEVER use mainnet private keys!**

---

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/xPOURY4/voicepay-arc.git
cd voicepay-arc
```

### 2. Install Dependencies

```bash
npm install
```

Or with yarn:

```bash
yarn install
```

### 3. Environment Configuration

Copy the example environment file:

```bash
cp .env.example .env.local
```

Edit `.env.local` with your configuration:

```env
# ElevenLabs Voice API
ELEVENLABS_API_KEY=your_elevenlabs_api_key_here

# Cloudflare Workers AI
CLOUDFLARE_API_KEY=your_cloudflare_api_key_here
CLOUDFLARE_ACCOUNT_ID=your_cloudflare_account_id_here

# Arc Testnet Configuration
NEXT_PUBLIC_ARC_RPC_URL=https://rpc.testnet.arc.network
NEXT_PUBLIC_ARC_CHAIN_ID=5042002
NEXT_PUBLIC_USDC_CONTRACT_ADDRESS=0x3600000000000000000000000000000000000000

# Test Wallet (TESTNET ONLY - Never use real private keys!)
TEST_PRIVATE_KEY=0xYOUR_TEST_WALLET_PRIVATE_KEY
NEXT_PUBLIC_TEST_WALLET_ADDRESS=0xYOUR_TEST_WALLET_ADDRESS
```

### 4. Start Development Server

```bash
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000)

---

## ⚙️ Configuration

### Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `ELEVENLABS_API_KEY` | ElevenLabs API key for voice transcription | Yes | - |
| `CLOUDFLARE_API_KEY` | Cloudflare API token | Yes | - |
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare account ID | Yes | - |
| `NEXT_PUBLIC_ARC_RPC_URL` | Arc RPC endpoint | Yes | `https://rpc.testnet.arc.network` |
| `NEXT_PUBLIC_ARC_CHAIN_ID` | Arc network chain ID | Yes | `5042002` |
| `NEXT_PUBLIC_USDC_CONTRACT_ADDRESS` | USDC contract address | Yes | `0x3600...0000` |
| `TEST_PRIVATE_KEY` | Test wallet private key | Yes | - |
| `NEXT_PUBLIC_TEST_WALLET_ADDRESS` | Test wallet address | Yes | - |
| `NEXT_PUBLIC_MAX_RECORDING_DURATION` | Max voice recording time (ms) | No | `10000` |
| `NEXT_PUBLIC_MIN_USDC_AMOUNT` | Minimum transaction amount | No | `0.01` |
| `NEXT_PUBLIC_MAX_USDC_AMOUNT` | Maximum transaction amount | No | `10000` |

### Arc Testnet Setup

1. **Get Testnet ETH**
   ```
   Visit: https://faucet.arc.network
   Enter your wallet address
   Receive testnet ETH for gas fees
   ```

2. **Get Testnet USDC**
   ```
   Visit: https://faucet.circle.com
   Select Arc Testnet
   Request USDC tokens
   ```

3. **Verify Balance**
   ```
   Check your balance on ArcScan:
   https://testnet.arcscan.app/address/YOUR_ADDRESS
   ```

---

## 🎯 Usage

### Voice Commands

VoicePay Arc understands natural language commands. Here are examples:

#### Send Money
```
"Send 50 USDC to Alice"
"Transfer 100 dollars to 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"
"Pay 25 USDC to Bob"
```

#### Check Balance
```
"What's my balance?"
"How much money do I have?"
"Show my balance"
```

#### View History
```
"Show my transactions"
"View transaction history"
"What are my recent payments?"
```

### Application Flow

1. **Grant Microphone Access**
   - Click the microphone button
   - Allow browser access to microphone

2. **Speak Your Command**
   - Speak clearly and naturally
   - Wait for the recording indicator
   - Command is automatically processed

3. **Review Intent**
   - View transcribed text
   - Check extracted payment details

4. **Confirm Transaction**
   - Review amount and recipient
   - Confirm or cancel the transaction

5. **Track Status**
   - Monitor transaction progress
   - View confirmation on blockchain
   - Check updated balance

---

## 📚 API Documentation

### Voice Processing API

**Endpoint:** `POST /api/voice`

**Request:**
```typescript
Content-Type: multipart/form-data

audio: Blob (audio/webm)
```

**Response:**
```typescript
{
  "success": true,
  "transcript": "Send 50 USDC to Alice",
  "confidence": 0.95,
  "duration": 1.234
}
```

### NLP Processing API

**Endpoint:** `POST /api/nlp`

**Request:**
```typescript
Content-Type: application/json

{
  "text": "Send 50 USDC to Alice"
}
```

**Response:**
```typescript
{
  "success": true,
  "intent": {
    "action": "send",
    "amount": 50,
    "currency": "USDC",
    "recipient": "Alice",
    "confirmationRequired": true,
    "isValid": true
  }
}
```

---

## 📁 Project Structure

```
voicepay-arc/
├── components/           # React components
│   ├── ui/              # Reusable UI components
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Loading.tsx
│   │   ├── ErrorDisplay.tsx
│   │   └── Modal.tsx
│   ├── voice/           # Voice-related components
│   │   └── VoiceRecorder.tsx
│   └── wallet/          # Wallet components
│       ├── BalanceDisplay.tsx
│       └── TransactionList.tsx
├── lib/                 # Core libraries
│   ├── api/            # API utilities
│   │   └── validation.ts
│   ├── blockchain/     # Blockchain services
│   │   ├── arc.ts
│   │   └── types.ts
│   └── hooks/          # React hooks
│       ├── useVoice.ts
│       ├── useWallet.ts
│       └── useTransactions.ts
├── pages/              # Next.js pages
│   ├── api/           # API routes
│   │   ├── voice.ts
│   │   └── nlp.ts
│   ├── _app.tsx       # App wrapper
│   └── index.tsx      # Main page
├── styles/            # Global styles
│   └── globals.css
├── public/            # Static assets
├── .env.example       # Environment template
├── next.config.js     # Next.js config
├── tailwind.config.js # Tailwind config
├── tsconfig.json      # TypeScript config
└── package.json       # Dependencies
```

---

## 🛠️ Development

### Available Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Run linting
npm run lint

# Type checking
npm run type-check
```

### Code Quality

**ESLint Configuration:**
- Extends Next.js and TypeScript recommended rules
- Custom rules for code quality
- Automatic fixing with `npm run lint:fix`

**TypeScript:**
- Strict mode enabled
- Comprehensive type coverage
- No implicit any

**Prettier:**
- Consistent code formatting
- Runs on commit with husky

### Adding New Features

1. **Create Feature Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Implement Feature**
   - Write types first
   - Add components
   - Create API routes if needed
   - Update documentation

3. **Test Thoroughly**
   - Manual testing
   - Edge cases
   - Error handling

4. **Submit Pull Request**
   - Clear description
   - Screenshots/videos
   - Link related issues

---

## 🧪 Testing

### Manual Testing

Test the following scenarios:

1. **Voice Recording**
   - Microphone access granted/denied
   - Audio recording and stopping
   - Transcription accuracy

2. **Transaction Flow**
   - Valid transactions
   - Invalid addresses
   - Insufficient balance
   - Transaction confirmation

3. **UI/UX**
   - Mobile responsiveness
   - Loading states
   - Error messages
   - Success feedback

### Test Commands

```bash
# Valid commands to test:
"Send 10 USDC to 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"
"What's my balance?"
"Show transaction history"

# Invalid commands to test:
"Send -5 USDC to Alice"  # Negative amount
"Send 999999 USDC to Bob"  # Exceeds balance
"Send money"  # Missing details
```

---

## 🚢 Deployment

### Vercel Deployment (Recommended)

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Deploy**
   ```bash
   vercel
   ```

3. **Set Environment Variables**
   - Go to Vercel dashboard
   - Add all environment variables
   - Redeploy

### Manual Deployment

1. **Build Application**
   ```bash
   npm run build
   ```

2. **Start Server**
   ```bash
   npm run start
   ```

3. **Configure Reverse Proxy**
   - Use Nginx or Apache
   - Configure SSL/TLS
   - Set up domain

### Environment-Specific Configurations

**Production Checklist:**
- [ ] Use production RPC URLs
- [ ] Enable error tracking (Sentry)
- [ ] Configure analytics
- [ ] Set up monitoring
- [ ] Enable rate limiting
- [ ] Configure CORS properly
- [ ] Use secure headers
- [ ] Enable compression

---

## 🔒 Security

### Best Practices

1. **Never Commit Secrets**
   - Use `.env.local` for sensitive data
   - Add to `.gitignore`
   - Use environment variables

2. **Private Key Safety**
   - NEVER use mainnet keys in development
   - Use test wallets only
   - Rotate keys regularly

3. **API Security**
   - Validate all inputs
   - Sanitize user data
   - Rate limit endpoints
   - Use HTTPS only

4. **Frontend Security**
   - Validate all transactions
   - Confirm before sending
   - Display clear warnings
   - Handle errors gracefully

### Reporting Security Issues

If you discover a security vulnerability, please email: security@voicepay.arc

**Do NOT** open public issues for security vulnerabilities.

---

## 🐛 Troubleshooting

### Common Issues

#### Microphone Not Working
```
Problem: Browser doesn't detect microphone
Solution:
1. Check browser permissions
2. Use HTTPS (required for mic access)
3. Try a different browser
4. Check system microphone settings
```

#### Transaction Fails
```
Problem: Transaction reverts or fails
Solution:
1. Check wallet has sufficient USDC
2. Verify recipient address is valid
3. Ensure sufficient gas (ETH)
4. Check Arc Testnet status
```

#### API Errors
```
Problem: Voice or NLP API returns errors
Solution:
1. Verify API keys are correct
2. Check API rate limits
3. Ensure APIs are accessible
4. Review API error messages
```

#### Build Errors
```
Problem: npm run build fails
Solution:
1. Delete node_modules and package-lock.json
2. Run: npm install
3. Clear Next.js cache: rm -rf .next
4. Run: npm run build
```

### Debug Mode

Enable debug logging:

```env
NEXT_PUBLIC_DEBUG=true
```

Check browser console for detailed logs.

---

## 🤝 Contributing

We welcome contributions! Please follow these guidelines:

### How to Contribute

1. **Fork the Repository**
2. **Create Feature Branch** (`git checkout -b feature/AmazingFeature`)
3. **Commit Changes** (`git commit -m 'Add some AmazingFeature'`)
4. **Push to Branch** (`git push origin feature/AmazingFeature`)
5. **Open Pull Request**

### Contribution Guidelines

- Follow existing code style
- Add TypeScript types
- Update documentation
- Test thoroughly
- Write clear commit messages

### Code of Conduct

- Be respectful and inclusive
- Welcome newcomers
- Focus on constructive feedback
- Follow community guidelines

---

## 📄 License

This project is licensed under the MIT License.

---

## 🙏 Acknowledgments

- **TheRealPourya** - Developer and Implementation
- **Arc Network** - Blockchain infrastructure
- **ElevenLabs** - Voice transcription API
- **Cloudflare** - Workers AI platform
- **Circle** - USDC integration
- **Next.js Team** - Amazing framework

---

## 📞 Support

### Developer
- **GitHub**: [xPOURY4](https://github.com/xPOURY4)
- **Twitter**: [@TheRealPourya](https://x.com/TheRealPourya)

### Documentation
- [Arc Network Docs](https://docs.arc.network)
- [ElevenLabs API Docs](https://elevenlabs.io/docs)
- [Cloudflare AI Docs](https://developers.cloudflare.com/workers-ai)

### Resources
- [Arc Testnet Explorer](https://testnet.arcscan.app)
- [Arc Faucet](https://faucet.arc.network)
- [USDC Faucet](https://faucet.circle.com)

---

## 📈 Roadmap

### Version 1.1.0 (Q1 2025)
- [ ] Multi-language support
- [ ] Voice biometric authentication
- [ ] Split payment functionality
- [ ] Bill payment integration

### Version 1.2.0 (Q2 2025)
- [ ] Wallet connection (MetaMask, WalletConnect)
- [ ] Account abstraction integration
- [ ] Gasless transactions
- [ ] Mobile app (React Native)

### Version 2.0.0 (Q4 2025)
- [ ] Mainnet deployment
- [ ] Additional token support
- [ ] Advanced voice commands
- [ ] Transaction scheduling

---

## 📊 Status

- **Build Status**: ✅ Passing
- **Tests**: ✅ Manual Testing Complete
- **Version**: 1.0.0
- **Environment**: Arc Testnet
- **Developer**: TheRealPourya
- **Date**: November 2025

---

**Made with ❤️ by [TheRealPourya](https://github.com/xPOURY4)**

*For more information, visit the [GitHub repository](https://github.com/xPOURY4/voicepay-arc).*
