# 🚀 Start Demo - VoicePay Arc

**Quick Start Guide for Running Demo Locally**

---

## ✅ Prerequisites

You already have these installed:
- ✅ Node.js (v18 or higher)
- ✅ npm
- ✅ Project files

---

## 🎯 Run Demo in 3 Steps

### Step 1: Install Dependencies (if not already done)
```bash
npm install
```

### Step 2: Start Development Server
```bash
npm run dev
```

### Step 3: Open Your Browser
```
http://localhost:3000
```

---

## 🎮 Demo Features

The demo runs with **mock data** - no API keys needed!

### What You'll See:
- ✅ Full voice payment interface
- ✅ Voice recording button
- ✅ Mock balance: $125.50 USDC
- ✅ Sample transaction history
- ✅ Beautiful animations
- ✅ Mobile responsive design

### Try These Commands:
1. Click "Start Recording"
2. Speak (or just click stop - demo uses mock data)
3. Try these phrases:
   - "Send 10 USDC to Alice"
   - "What's my balance?"
   - "View transaction history"
   - "Split 100 USDC with Bob and Charlie"

---

## 🔧 Configuration

Demo mode is already configured in `.env.local`:

```env
NEXT_PUBLIC_DEMO_MODE=true
```

**That's it!** No API keys needed for demo.

---

## 📱 What Works in Demo Mode

| Feature | Status |
|---------|--------|
| Voice UI | ✅ Working |
| Recording Interface | ✅ Working |
| Mock Transcription | ✅ Working |
| Mock NLP | ✅ Working |
| Balance Display | ✅ Working ($125.50) |
| Transaction History | ✅ Working (sample data) |
| Animations | ✅ Working |
| Mobile View | ✅ Working |

---

## 🛑 Stop the Server

Press `Ctrl + C` in the terminal

---

## 🔄 Switching to Production Mode

To use real API keys:

1. Edit `.env.local`:
   ```env
   NEXT_PUBLIC_DEMO_MODE=false
   ELEVENLABS_API_KEY=your_key_here
   CLOUDFLARE_API_KEY=your_key_here
   CLOUDFLARE_ACCOUNT_ID=your_account_id
   ```

2. Restart the server:
   ```bash
   npm run dev
   ```

---

## 📚 Additional Documentation

- **README.md** - Full project documentation
- **QUICKSTART.md** - Detailed quick start guide
- **DEPLOYMENT_FIX.md** - Technical fixes and deployment info
- **VERCEL_DEPLOY.md** - Vercel deployment guide

---

## 💬 Need Help?

- GitHub: https://github.com/xPOURY4/voicepay-arc
- Twitter: @TheRealPourya

---

**Enjoy the demo! 🎉**