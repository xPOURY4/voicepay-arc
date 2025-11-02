# Quick Deploy Guide - VoicePay Arc

**Developer:** TheRealPourya ([@xPOURY4](https://github.com/xPOURY4))  
**Date:** November 2025  
**Status:** ✅ Ready for Deployment

---

## 🚀 Deploy to Vercel in 3 Steps

### Step 1: Fork & Connect
1. Fork this repository to your GitHub account
2. Go to [vercel.com](https://vercel.com) and sign in
3. Click "New Project" and import your forked repository

### Step 2: Configure Environment Variables

Choose **Demo Mode** OR **Production Mode**:

#### Option A: Demo Mode (No API Keys Required) ⚡

Set this single environment variable in Vercel:

```
NEXT_PUBLIC_DEMO_MODE=true
```

**That's it!** Deploy and test with mock data.

#### Option B: Production Mode (Full Features) 🔥

Set these environment variables in Vercel:

```
NEXT_PUBLIC_DEMO_MODE=false
ELEVENLABS_API_KEY=your_key_here
CLOUDFLARE_API_KEY=your_key_here
CLOUDFLARE_ACCOUNT_ID=your_account_id_here
TEST_PRIVATE_KEY=your_private_key_here
NEXT_PUBLIC_TEST_WALLET_ADDRESS=your_wallet_address
NEXT_PUBLIC_ARC_RPC_URL=https://sepolia-rollup.arbitrum.io/rpc
NEXT_PUBLIC_USDC_CONTRACT=0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d
```

### Step 3: Deploy 🚀

Click "Deploy" in Vercel. That's it!

---

## 🔑 Getting API Keys (Production Mode)

### ElevenLabs API Key
1. Go to [elevenlabs.io](https://elevenlabs.io)
2. Sign up or log in
3. Go to Profile → API Keys
4. Copy your API key

### Cloudflare Workers AI
1. Go to [dash.cloudflare.com](https://dash.cloudflare.com)
2. Sign up or log in
3. Go to Workers & Pages → AI
4. Get your Account ID (in URL bar)
5. Create API Token with "Workers AI" permissions

### Arc Testnet Wallet
1. Install MetaMask or any Web3 wallet
2. Create a new wallet for testing
3. Export the private key (keep it secret!)
4. Get your wallet address
5. Get test USDC from Arc Testnet faucet

---

## ✅ Verify Deployment

After deployment:

### Demo Mode:
- Visit your deployed URL
- Look for "Demo Mode" badge in the UI
- Click "Start Recording" - should use mock data
- Try voice commands (will use simulated responses)

### Production Mode:
- Visit your deployed URL
- Click "Start Recording"
- Speak a command: "Send 10 USDC to Alice"
- Should transcribe and process real voice
- Check balance displays correctly

---

## 🎯 Test Commands (Demo Mode)

Try these voice commands:

```
"Send 10 USDC to Alice"
"What's my balance?"
"View transaction history"
"Split 100 USDC with Bob and Charlie"
"Pay 50 USDC to 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"
```

---

## 🐛 Common Issues

### Build fails with "ETARGET" error
✅ **FIXED!** This was caused by wrong package dependencies. The fix is already applied.

### "env.NEXT_PUBLIC_DEMO_MODE should be string"
Set the value as `true` (without quotes) in Vercel UI.

### Voice recording doesn't work
- In demo mode: Should work with mock data
- In production: Check ElevenLabs API key is valid

### Balance shows $0.00
- In demo mode: Should show $125.50 mock balance
- In production: Check wallet has test USDC on Arc Testnet

---

## 📦 What's Fixed

We fixed the deployment issues by:
- ✅ Removed `@elevenlabs/client` (wrong package)
- ✅ Removed `@cloudflare/ai` (deprecated)
- ✅ Using REST APIs directly with `axios`
- ✅ Updated all API routes to use correct endpoints
- ✅ Added comprehensive error handling

---

## 🔗 One-Click Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FxPOURY4%2Fvoicepay-arc&env=NEXT_PUBLIC_DEMO_MODE&envDescription=Set%20to%20%27true%27%20for%20demo%20mode%20or%20%27false%27%20for%20production&envLink=https%3A%2F%2Fgithub.com%2FxPOURY4%2Fvoicepay-arc%23environment-variables&project-name=voicepay-arc&repository-name=voicepay-arc)

Click the button above to deploy in demo mode automatically!

---

## 📚 Documentation

- **Full Documentation:** [README.md](./README.md)
- **Deployment Fix Details:** [DEPLOYMENT_FIX.md](./DEPLOYMENT_FIX.md)
- **Vercel Guide:** [VERCEL_DEPLOY.md](./VERCEL_DEPLOY.md)
- **Quick Start:** [QUICKSTART.md](./docs/QUICKSTART.md)

---

## 💬 Support

- **GitHub:** [github.com/xPOURY4/voicepay-arc](https://github.com/xPOURY4/voicepay-arc)
- **Issues:** [github.com/xPOURY4/voicepay-arc/issues](https://github.com/xPOURY4/voicepay-arc/issues)
- **Twitter:** [@TheRealPourya](https://x.com/TheRealPourya)

---

## 🎉 Ready to Deploy!

The project is now deployment-ready with all package issues fixed. Choose demo mode for quick testing or production mode for full functionality.

**Happy Building! 🚀**