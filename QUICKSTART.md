# 🚀 VoicePay Arc - Quick Start Guide

Get up and running with VoicePay Arc in 5 minutes!

---

## ⚡ Quick Setup (5 Minutes)

### Step 1: Install Dependencies (1 min)

```bash
# Navigate to project directory
cd ArcVoice

# Install all dependencies
npm install
```

### Step 2: Get API Keys (2 mins)

#### ElevenLabs API Key
1. Go to https://elevenlabs.io
2. Sign up for a free account
3. Navigate to Settings → API Keys
4. Copy your API key

#### Cloudflare AI Credentials
1. Go to https://dash.cloudflare.com
2. Sign up/log in
3. Navigate to AI → Workers AI
4. Copy your Account ID and API Token

### Step 3: Setup Test Wallet (1 min)

1. Install MetaMask: https://metamask.io
2. Create a new wallet (or use existing testnet wallet)
3. **IMPORTANT**: Only use testnet wallets - NEVER mainnet!
4. Copy your private key and address

### Step 4: Configure Environment (1 min)

```bash
# Copy example environment file
cp .env.example .env.local
```

Edit `.env.local` with your values:

```env
# Paste your ElevenLabs API key
ELEVENLABS_API_KEY=sk_your_key_here

# Paste your Cloudflare credentials
CLOUDFLARE_API_KEY=your_cloudflare_token_here
CLOUDFLARE_ACCOUNT_ID=your_account_id_here

# Arc Testnet (keep as is)
NEXT_PUBLIC_ARC_RPC_URL=https://rpc.testnet.arc.network
NEXT_PUBLIC_ARC_CHAIN_ID=5042002
NEXT_PUBLIC_USDC_CONTRACT_ADDRESS=0x3600000000000000000000000000000000000000

# Your TEST wallet (TESTNET ONLY!)
TEST_PRIVATE_KEY=0xYOUR_TESTNET_PRIVATE_KEY
NEXT_PUBLIC_TEST_WALLET_ADDRESS=0xYOUR_WALLET_ADDRESS
```

### Step 5: Get Testnet Tokens (Optional - for real transactions)

#### Get Testnet ETH (for gas)
```
1. Visit: https://faucet.arc.network
2. Enter your wallet address
3. Request testnet ETH
4. Wait 1-2 minutes
```

#### Get Testnet USDC
```
1. Visit: https://faucet.circle.com
2. Select "Arc Testnet"
3. Enter your wallet address
4. Request USDC
5. Wait 1-2 minutes
```

---

## 🎯 Start the Application

```bash
npm run dev
```

Open http://localhost:3000 in your browser.

---

## 🎤 Try Your First Voice Command

1. **Click the microphone button** (🎤)
2. **Allow microphone access** when prompted
3. **Speak clearly**: "What's my balance?"
4. **Wait for processing** (~2 seconds)
5. **See your balance!**

### More Commands to Try:

```
✅ "Send 10 USDC to 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"
✅ "What's my balance?"
✅ "Show transaction history"
```

---

## 📱 Test Without Real Transactions

You can test the voice recognition and UI without actually sending transactions:

1. Use "What's my balance?" - Shows your balance
2. Use "Show transaction history" - Displays transactions
3. Skip getting testnet tokens if you only want to test voice

---

## 🐛 Common Issues & Fixes

### Issue: Microphone not working
**Solution**: 
- Make sure you're using HTTPS or localhost
- Grant microphone permissions in browser
- Try Chrome/Firefox (Safari can be finicky)

### Issue: "Failed to initialize wallet"
**Solution**:
- Check your private key is correct
- Make sure it starts with "0x"
- Verify it's a valid Ethereum private key

### Issue: API errors
**Solution**:
- Verify API keys are correct (no extra spaces)
- Check API rate limits
- Make sure you have internet connection

### Issue: Build errors
**Solution**:
```bash
# Clean and reinstall
rm -rf node_modules package-lock.json .next
npm install
npm run dev
```

---

## 🎓 Next Steps

### Learn More
- Read the full [README.md](./README.md) for detailed documentation
- Check [doc.md](./doc.md) for technical specifications
- Explore the code in `components/`, `pages/`, and `lib/`

### Customize
- Modify voice commands in `pages/api/nlp.ts`
- Adjust UI colors in `tailwind.config.js`
- Add new features in `components/`

### Deploy
- Deploy to Vercel: `vercel`
- Or any Node.js hosting platform
- See README.md deployment section

---

## 💡 Tips for Best Experience

1. **Speak Clearly**: Enunciate words clearly for best transcription
2. **Use Natural Language**: "Send 50 USDC to Alice" works great
3. **Check Balance First**: Make sure you have testnet tokens
4. **Mobile Works Great**: Try it on your phone!
5. **Test in Quiet Environment**: Background noise affects accuracy

---

## 🆘 Need Help?

### Documentation
- **README.md** - Complete documentation
- **doc.md** - Technical specifications
- **Code Comments** - Inline documentation

### Resources
- Arc Network: https://docs.arc.network
- ElevenLabs: https://elevenlabs.io/docs
- Cloudflare AI: https://developers.cloudflare.com/workers-ai

### Debug Mode
Enable detailed logging:
```env
NEXT_PUBLIC_DEBUG=true
```
Then check browser console (F12) for logs.

---

## ✅ Verification Checklist

Before using the app, ensure:

- [ ] Node.js 18+ installed
- [ ] Dependencies installed (`npm install`)
- [ ] `.env.local` file created and configured
- [ ] ElevenLabs API key added
- [ ] Cloudflare credentials added
- [ ] Test wallet configured
- [ ] Development server running
- [ ] Browser microphone access granted
- [ ] (Optional) Testnet tokens received

---

## 🎉 You're Ready!

Your VoicePay Arc application is now running!

Try saying: **"What's my balance?"** to get started.

For full documentation, see [README.md](./README.md)

---

**Built with ❤️ using Next.js, TypeScript, Arc Blockchain, ElevenLabs, and Cloudflare AI**