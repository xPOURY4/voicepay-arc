# Deployment Fix - Package Dependencies

**Developer:** TheRealPourya ([@xPOURY4](https://github.com/xPOURY4))  
**Date:** November 2025  
**Issue:** Vercel deployment failing due to incorrect package dependencies

---

## Problem

The initial deployment to Vercel was failing with the following error:

```
npm error code ETARGET
npm error notarget No matching version found for @elevenlabs/client@^1.0.0.
npm error notarget In most cases you or one of your dependencies are requesting
npm error notarget a package version that doesn't exist.
```

## Root Causes

### 1. Incorrect ElevenLabs Package
- **Wrong:** `@elevenlabs/client@^1.0.0` (browser-only SDK, doesn't exist at v1.0.0)
- **Correct:** Direct REST API calls using `axios`

The `@elevenlabs/client` package is specifically designed for browser-based applications and the specified version doesn't exist. For server-side Next.js API routes on Vercel, we use the ElevenLabs REST API directly.

### 2. Deprecated Cloudflare AI Package
- **Wrong:** `@cloudflare/ai@^1.0.0` (deprecated package for Workers only)
- **Correct:** Direct REST API calls using `axios`

The `@cloudflare/ai` package has been deprecated and only works within Cloudflare Workers environment. Since this is a Next.js app deployed on Vercel, we need to use the Cloudflare Workers AI REST API directly.

---

## Changes Made

### 1. Updated package.json

**Before:**
```json
{
  "dependencies": {
    "@elevenlabs/client": "^1.0.0",
    "@cloudflare/ai": "^1.0.0"
  }
}
```

**After:**
```json
{
  "dependencies": {
    "axios": "^1.6.0"
  }
}
```

We removed both problematic packages and use `axios` to make direct REST API calls to both ElevenLabs and Cloudflare services.

### 2. Updated Voice API (`pages/api/voice.ts`)

**Before:**
```typescript
import { ElevenLabsClient } from "@elevenlabs/client";

const client = new ElevenLabsClient({ apiKey });
const result = await client.speechToText.convert(...);
```

**After:**
```typescript
import axios from "axios";

async function transcribeAudio(audioBuffer: Buffer): Promise<string> {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  
  const response = await axios.post(
    "https://api.elevenlabs.io/v1/speech-to-text",
    audioBuffer,
    {
      headers: {
        "xi-api-key": apiKey,
        "Content-Type": "audio/mpeg",
      },
    }
  );
  
  return response.data.text || "";
}
```

Now using ElevenLabs REST API directly for speech-to-text transcription.

### 3. Updated NLP API (`pages/api/nlp.ts`)

**Before:**
```typescript
import { default: Ai } from "@cloudflare/ai";

const ai = new Ai({ apiKey, accountId });
const response = await ai.run("@cf/meta/llama-3-8b-instruct", { ... });
```

**After:**
```typescript
import axios from "axios";

async function callCloudflareAI(messages: any[], maxTokens: number = 256) {
  const apiKey = process.env.CLOUDFLARE_API_KEY;
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;

  const response = await axios.post(
    `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/@cf/meta/llama-3-8b-instruct`,
    {
      messages,
      max_tokens: maxTokens,
      temperature: 0.1,
    },
    {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
    }
  );

  return response.data;
}
```

Now using Cloudflare Workers AI REST API directly for NLP intent extraction.

---

## Deployment Instructions

### Option 1: Quick Demo Deploy (No API Keys)

1. **Fork or clone the repository**
2. **Connect to Vercel**
3. **Set environment variable:**
   - `NEXT_PUBLIC_DEMO_MODE` = `true` (as string, no quotes)
4. **Deploy**

Demo mode uses mock data and doesn't require any API keys.

### Option 2: Full Production Deploy

1. **Obtain API Keys:**
   - **ElevenLabs:** Get from [elevenlabs.io](https://elevenlabs.io)
   - **Cloudflare Workers AI:** Get from [Cloudflare Dashboard](https://dash.cloudflare.com)
   - **Arc Testnet:** Generate test wallet

2. **Set Environment Variables in Vercel:**
   ```
   NEXT_PUBLIC_DEMO_MODE=false
   ELEVENLABS_API_KEY=your_elevenlabs_key_here
   CLOUDFLARE_API_KEY=your_cloudflare_api_key_here
   CLOUDFLARE_ACCOUNT_ID=your_cloudflare_account_id_here
   TEST_PRIVATE_KEY=your_test_wallet_private_key
   NEXT_PUBLIC_TEST_WALLET_ADDRESS=your_test_wallet_address
   NEXT_PUBLIC_ARC_RPC_URL=https://sepolia-rollup.arbitrum.io/rpc
   NEXT_PUBLIC_USDC_CONTRACT=0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d
   ```

3. **Deploy to Vercel**

---

## Verification Steps

### After Deployment:

1. **Check Build Logs**
   - Ensure `npm install` completes successfully
   - Verify no package resolution errors

2. **Test Demo Mode**
   - Visit your deployed URL
   - Should see "Demo Mode" badge
   - Try voice recording with mock data

3. **Test Production Mode** (if using real API keys)
   - Voice transcription should work
   - NLP intent extraction should work
   - Blockchain balance queries should work

---

## API Documentation

### ElevenLabs Speech-to-Text REST API
- **Endpoint:** `https://api.elevenlabs.io/v1/speech-to-text`
- **Docs:** [elevenlabs.io/docs/api-reference](https://elevenlabs.io/docs/api-reference)
- **Auth:** `xi-api-key` header
- **Use Case:** Audio transcription for voice commands

### Cloudflare Workers AI REST API
- **Endpoint:** `https://api.cloudflare.com/client/v4/accounts/{account_id}/ai/run/{model}`
- **Docs:** [developers.cloudflare.com/workers-ai](https://developers.cloudflare.com/workers-ai)
- **Auth:** Bearer token in Authorization header
- **Use Case:** LLM inference for intent extraction

---

## Troubleshooting

### Issue: "Cannot find module 'axios'"
**Solution:** Clear node_modules and reinstall
```bash
rm -rf node_modules package-lock.json
npm install
```

### Issue: "ElevenLabs API returns 401 Unauthorized"
**Solution:** Verify your ElevenLabs API key
- Get your API key from [elevenlabs.io](https://elevenlabs.io) dashboard
- Ensure it's set correctly in Vercel environment variables

### Issue: "Cloudflare AI returns 401 Unauthorized"
**Solution:** Verify your API key and account ID
- API Key format: Should be a long alphanumeric string
- Account ID: Found in Cloudflare Dashboard URL

### Issue: "NEXT_PUBLIC_DEMO_MODE should be string"
**Solution:** In Vercel, set the value as `true` (without quotes in the UI)

### Issue: Voice API not transcribing
**Solution:** 
1. Check ElevenLabs API key is valid
2. Ensure audio file is in supported format (mp3, wav, ogg)
3. Check API quota/billing status

---

## Next Steps

1. **Deploy to Vercel** using the fixed package.json
2. **Test Demo Mode** to ensure basic functionality
3. **Configure API Keys** for production features
4. **Monitor logs** for any runtime errors
5. **Test voice commands** end-to-end

---

## Support

For issues or questions:
- **GitHub:** [github.com/xPOURY4/voicepay-arc](https://github.com/xPOURY4/voicepay-arc)
- **Twitter:** [@TheRealPourya](https://x.com/TheRealPourya)

---

**Status:** ✅ Fixed and ready for deployment  
**Last Updated:** November 2025