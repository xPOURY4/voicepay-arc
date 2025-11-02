# 🚀 Deploy VoicePay Arc to Vercel

**Developer**: [TheRealPourya](https://github.com/xPOURY4) | **Twitter**: [@TheRealPourya](https://x.com/TheRealPourya)  
**Date**: November 2025

---

## 📋 Table of Contents

- [Quick Deploy (Demo Mode - No API Keys)](#quick-deploy-demo-mode---no-api-keys)
- [Full Deploy (With API Keys)](#full-deploy-with-api-keys)
- [Environment Variables](#environment-variables)
- [Post-Deployment](#post-deployment)
- [Troubleshooting](#troubleshooting)

---

## 🎬 Quick Deploy (Demo Mode - No API Keys)

This is the **easiest way** to deploy and demo the application without requiring any API keys. Perfect for testing and showcasing!

### Step 1: Fork the Repository

1. Go to [https://github.com/xPOURY4/voicepay-arc](https://github.com/xPOURY4/voicepay-arc)
2. Click the **"Fork"** button in the top right
3. Wait for the fork to complete

### Step 2: Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

1. Click the "Deploy with Vercel" button above (or go to [vercel.com/new](https://vercel.com/new))
2. Sign in with GitHub
3. Click **"Import Git Repository"**
4. Select your forked `voicepay-arc` repository
5. Click **"Import"**

### Step 3: Configure Demo Mode

In the **Environment Variables** section, add:

**Variable Name:**
```
NEXT_PUBLIC_DEMO_MODE
```

**Value:**
```
true
```

⚠️ **Important**: Enter just the word `true` (not `: true` or `= true`, just `true`)

**That's it!** No other environment variables are needed for demo mode.

### Step 4: Deploy

1. Click **"Deploy"**
2. Wait 2-3 minutes for the build to complete
3. Click **"Visit"** to see your live demo!

### 🎯 What Works in Demo Mode?

✅ **Voice Commands** - Simulated voice recognition  
✅ **Balance Display** - Shows demo balance (1,234.56 USDC)  
✅ **Transaction History** - Pre-populated with mock transactions  
✅ **Send Transactions** - Simulated transactions (no real blockchain)  
✅ **Full UI/UX** - Complete interface with animations  
✅ **Mobile Responsive** - Works perfectly on mobile devices  

### 🎤 Demo Voice Commands

Since demo mode doesn't process real audio, it randomly selects from these commands:

- "Send 50 USDC to Alice"
- "What's my balance?"
- "Show transaction history"
- "Transfer 100 USDC to Bob"

Just click the microphone button and it will simulate processing one of these commands!

---

## 🔑 Full Deploy (With API Keys)

For a **fully functional** deployment with real voice recognition, NLP, and blockchain integration.

### Prerequisites

You'll need API keys for:
1. **ElevenLabs** - Voice transcription ([Get Key](https://elevenlabs.io))
2. **Cloudflare** - AI/NLP processing ([Get Key](https://dash.cloudflare.com))
3. **Arc Testnet Wallet** - Blockchain transactions ([Setup Guide](https://docs.arc.network))

### Step 1: Get API Keys

#### ElevenLabs API Key
1. Go to [elevenlabs.io](https://elevenlabs.io)
2. Sign up for a free account
3. Navigate to **Settings → API Keys**
4. Click **"Create API Key"**
5. Copy the key

#### Cloudflare Workers AI
1. Go to [dash.cloudflare.com](https://dash.cloudflare.com)
2. Sign up or log in
3. Navigate to **Workers & Pages → AI**
4. Copy your **Account ID** and **API Token**

#### Arc Testnet Wallet
1. Create a test wallet with MetaMask
2. Get testnet ETH from [faucet.arc.network](https://faucet.arc.network)
3. Get testnet USDC from [faucet.circle.com](https://faucet.circle.com)
4. Copy your wallet's private key (⚠️ testnet only!)

### Step 2: Deploy to Vercel

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your forked repository
3. In **Environment Variables**, add the following:

### Environment Variables

Add these in the Vercel dashboard (**Settings → Environment Variables**):

| Variable Name | Value |
|---------------|-------|
| `NEXT_PUBLIC_DEMO_MODE` | `false` |
| `ELEVENLABS_API_KEY` | `your_elevenlabs_api_key_here` |
| `CLOUDFLARE_API_KEY` | `your_cloudflare_api_key_here` |
| `CLOUDFLARE_ACCOUNT_ID` | `your_cloudflare_account_id_here` |
| `NEXT_PUBLIC_ARC_RPC_URL` | `https://rpc.testnet.arc.network` |
| `NEXT_PUBLIC_ARC_CHAIN_ID` | `5042002` |
| `NEXT_PUBLIC_USDC_CONTRACT_ADDRESS` | `0x3600000000000000000000000000000000000000` |
| `TEST_PRIVATE_KEY` | `0xYOUR_TEST_WALLET_PRIVATE_KEY` |
| `NEXT_PUBLIC_TEST_WALLET_ADDRESS` | `0xYOUR_TEST_WALLET_ADDRESS` |

⚠️ **Important**: 
- Enter ONLY the value (no quotes, no `=` sign)
- For `NEXT_PUBLIC_DEMO_MODE`, enter just: `false`
- ⚠️ TESTNET KEYS ONLY - Never use mainnet private keys!

### Step 3: Deploy

1. Click **"Deploy"**
2. Wait for the build (2-3 minutes)
3. Visit your live site!

---

## 📝 Environment Variables Reference

| Variable | Required | Demo Mode | Full Mode | Description |
|----------|----------|-----------|-----------|-------------|
| `NEXT_PUBLIC_DEMO_MODE` | No | `true` | `false` | Enables demo mode |
| `ELEVENLABS_API_KEY` | No | ❌ | ✅ | ElevenLabs API key |
| `CLOUDFLARE_API_KEY` | No | ❌ | ✅ | Cloudflare API token |
| `CLOUDFLARE_ACCOUNT_ID` | No | ❌ | ✅ | Cloudflare account ID |
| `NEXT_PUBLIC_ARC_RPC_URL` | No | ❌ | ✅ | Arc RPC endpoint |
| `NEXT_PUBLIC_ARC_CHAIN_ID` | No | ❌ | ✅ | Arc chain ID |
| `NEXT_PUBLIC_USDC_CONTRACT_ADDRESS` | No | ❌ | ✅ | USDC contract |
| `TEST_PRIVATE_KEY` | No | ❌ | ✅ | Test wallet key |
| `NEXT_PUBLIC_TEST_WALLET_ADDRESS` | No | ❌ | ✅ | Test wallet address |

---

## 🎨 Customizing Your Deployment

### Custom Domain

1. In Vercel Dashboard, go to your project
2. Click **"Settings"** → **"Domains"**
3. Add your custom domain
4. Follow the DNS configuration instructions

### Environment Variables

Update environment variables anytime:
1. Go to **"Settings"** → **"Environment Variables"**
2. Add/Edit variables
3. Click **"Save"**
4. Redeploy to apply changes

### Automatic Deployments

Vercel automatically deploys when you push to your repository:
- **Main branch** → Production deployment
- **Other branches** → Preview deployments

---

## 🔍 Post-Deployment

### Verify Demo Mode

Visit your deployment and check:
1. Yellow "🎬 Demo Mode" badge appears at the top
2. Click the microphone button
3. A random demo command is processed
4. Mock balance and transactions display

### Test the Application

Demo Mode:
- ✅ Click microphone → Random command processed
- ✅ View balance → Shows 1,234.56 USDC
- ✅ Check transactions → Shows 3 mock transactions
- ✅ Mobile responsive → Test on phone

Full Mode:
- ✅ Record actual voice command
- ✅ Check real USDC balance
- ✅ Send real testnet transaction
- ✅ View blockchain transaction history

### Share Your Demo

Copy your Vercel URL and share:
```
https://your-project-name.vercel.app
```

---

## 🐛 Troubleshooting

### Build Fails

**Issue**: Build fails during deployment

**Solution**:
```bash
# Check the build logs in Vercel dashboard
# Common fixes:
1. Ensure all dependencies are in package.json
2. Check for TypeScript errors
3. Verify environment variables are set correctly
```

### Demo Mode Not Working

**Issue**: Demo mode doesn't activate

**Solution**:
1. Go to Vercel Dashboard → **Settings** → **Environment Variables**
2. Find `NEXT_PUBLIC_DEMO_MODE`
3. Make sure the value is exactly: `true` (just the word, no quotes)
4. Delete and re-add if needed
5. Redeploy the project

Common mistakes:
- ❌ `"true"` (with quotes)
- ❌ `= true` (with equals sign)
- ❌ `: true` (with colon)
- ✅ `true` (correct - just the word)

### API Errors in Full Mode

**Issue**: API calls fail in production

**Solution**:
1. Go to Vercel Dashboard → **Settings** → **Environment Variables**
2. Verify all these are set correctly:
   - `ELEVENLABS_API_KEY` (your actual key)
   - `CLOUDFLARE_API_KEY` (your actual key)
   - `CLOUDFLARE_ACCOUNT_ID` (your actual account ID)
3. Make sure values have NO quotes, just the raw key
4. Redeploy after changing
5. Check logs: **Deployments** → **Function Logs**

### Microphone Not Working

**Issue**: Browser doesn't allow microphone access

**Solution**:
- Vercel deployments use HTTPS by default (required for mic)
- Check browser permissions
- Try a different browser (Chrome/Firefox recommended)

### "Can't Read Environment Variables"

**Issue**: App can't access environment variables

**Solution**:

**In Vercel Dashboard:**

Client-side variables (visible in browser):
- ✅ Variable Name: `NEXT_PUBLIC_DEMO_MODE` | Value: `true`
- ❌ Variable Name: `DEMO_MODE` | Value: `true` (won't work)

Server-side variables (API routes only):
- ✅ Variable Name: `ELEVENLABS_API_KEY` | Value: `sk_xxx...`

**Remember**: Just enter the value, no quotes or special characters!

---

## 🔄 Updating Your Deployment

### Update Code

```bash
# 1. Make changes locally
git add .
git commit -m "Update feature"
git push origin main

# 2. Vercel automatically redeploys
# 3. Wait 2-3 minutes
# 4. Changes are live!
```

### Update Environment Variables

1. Go to Vercel Dashboard
2. Select your project
3. **Settings** → **Environment Variables**
4. Edit variables
5. **Save**
6. Go to **Deployments** → **Redeploy**

---

## 📊 Vercel Dashboard Features

### Deployment Logs
- View build logs
- Check function logs
- Monitor errors

### Analytics
- Page views
- Performance metrics
- User geography

### Preview Deployments
- Every branch gets a preview URL
- Test before merging to main

---

## 🌟 Pro Tips

### 1. Use Preview Deployments
```bash
# Create a feature branch
git checkout -b new-feature

# Make changes and push
git push origin new-feature

# Vercel creates preview URL automatically!
```

### 2. Environment-Specific Variables
```bash
# Set different values for:
- Production (main branch)
- Preview (other branches)  
- Development (local)
```

### 3. Monitor Performance
- Check Vercel Analytics
- Monitor function execution time
- Optimize heavy operations

### 4. Set Up Custom Domain
- Makes your demo more professional
- Example: voicepay.yourdomain.com
- Free SSL certificate included

---

## 🆘 Get Help

### Resources
- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Project Repository](https://github.com/xPOURY4/voicepay-arc)

### Common Commands

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy from terminal
vercel

# Deploy to production
vercel --prod

# View logs
vercel logs
```

### Support
- **GitHub Issues**: [Report a problem](https://github.com/xPOURY4/voicepay-arc/issues)
- **Developer**: [@TheRealPourya](https://twitter.com/TheRealPourya)

---

## ✅ Deployment Checklist

### Before Deploying
- [ ] Fork the repository
- [ ] Create Vercel account
- [ ] Decide: Demo mode or Full mode?
- [ ] Get API keys (if full mode)
- [ ] Prepare environment variables

### During Deployment
- [ ] Import repository to Vercel
- [ ] Set environment variables
- [ ] Click Deploy
- [ ] Wait for build to complete

### After Deployment
- [ ] Visit deployment URL
- [ ] Test microphone button
- [ ] Check mobile responsiveness
- [ ] Share demo link!

---

## 🎉 Success!

Your VoicePay Arc application is now live on Vercel!

**Demo Mode**: Perfect for showcasing without API setup  
**Full Mode**: Complete voice-activated payment system

---

## 📈 Next Steps

1. **Test Your Deployment**
   - Try voice commands
   - Check mobile view
   - Share with friends

2. **Customize**
   - Add custom domain
   - Update styling
   - Add features

3. **Monitor**
   - Check Vercel analytics
   - Review function logs
   - Optimize performance

4. **Scale**
   - Upgrade Vercel plan if needed
   - Add more features
   - Deploy to mainnet (when ready)

---

**Made with ❤️ by [TheRealPourya](https://github.com/xPOURY4)**

*Deploy in minutes, impress in seconds!* 🚀