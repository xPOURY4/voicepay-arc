/**
 * VoicePay Arc - NLP Processing API
 * Developer: TheRealPourya (https://github.com/xPOURY4)
 * Twitter: https://x.com/TheRealPourya
 * Date: November 2025
 *
 * This component is part of the VoicePay Arc project - a production-ready
 * voice payment system for Arc Testnet.
 *
 * Extracts payment intent from transcribed text using Cloudflare Workers AI
 */

import type { NextApiRequest, NextApiResponse } from "next";
import type { PaymentIntent } from "@/lib/blockchain/types";
import { validatePaymentIntent, sanitizeInput } from "@/lib/api/validation";
import { DemoNLPService, isDemoMode } from "@/lib/demo/mockData";
import axios from "axios";

/**
 * NLP API response
 */
interface NLPResponse {
  success: boolean;
  intent?: PaymentIntent;
  error?: string;
  errorCode?: string;
}

/**
 * Call Cloudflare Workers AI REST API
 */
async function callCloudflareAI(messages: any[], maxTokens: number = 256) {
  const apiKey = process.env.CLOUDFLARE_API_KEY;
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;

  if (!apiKey || !accountId) {
    throw new Error("Cloudflare AI credentials not configured");
  }

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
    },
  );

  return response.data;
}

/**
 * Extract payment intent using Cloudflare Workers AI
 */
async function extractIntent(text: string): Promise<PaymentIntent> {
  const systemPrompt = `You are a payment intent extraction system for a voice-activated cryptocurrency wallet.
Extract payment information from the user's voice command and return ONLY valid JSON.

Rules:
1. Extract the action: "send", "request", "split", "pay_bill", "check_balance", "view_history", or "cancel"
2. Extract the amount as a number (if applicable)
3. Extract the recipient address or name (if applicable)
4. Currency is always "USDC"
5. For split payments, extract all participants

Return JSON in this exact format:
{
  "action": "send|request|split|pay_bill|check_balance|view_history|cancel",
  "amount": <number or 0>,
  "currency": "USDC",
  "recipient": "<address or name or null>",
  "participants": [{"identifier": "name", "amount": <number>}] or null,
  "confirmationRequired": true or false
}

Examples:
"Send 50 USDC to Alice" -> {"action":"send","amount":50,"currency":"USDC","recipient":"Alice","confirmationRequired":true}
"What's my balance?" -> {"action":"check_balance","amount":0,"currency":"USDC","confirmationRequired":false}
"Split 100 USDC with Bob and Charlie" -> {"action":"split","amount":100,"currency":"USDC","participants":[{"identifier":"Bob"},{"identifier":"Charlie"}],"confirmationRequired":true}

Return ONLY the JSON object, no additional text.`;

  const response = await callCloudflareAI([
    {
      role: "system",
      content: systemPrompt,
    },
    {
      role: "user",
      content: text,
    },
  ]);

  // Parse the AI response
  let intentData: any;

  try {
    // Extract JSON from response
    const responseText =
      response.result?.response || response.result || JSON.stringify(response);
    const textContent =
      typeof responseText === "string"
        ? responseText
        : JSON.stringify(responseText);

    // Try to find JSON in the response
    const jsonMatch = textContent.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      intentData = JSON.parse(jsonMatch[0]);
    } else {
      intentData = JSON.parse(textContent);
    }
  } catch (parseError) {
    console.error("Failed to parse AI response:", response);
    throw new Error("Failed to extract intent from AI response");
  }

  // Construct payment intent
  const intent: PaymentIntent = {
    action: intentData.action || "send",
    amount: parseFloat(intentData.amount) || 0,
    currency: "USDC",
    recipient: intentData.recipient || undefined,
    participants: intentData.participants || undefined,
    confirmationRequired: intentData.confirmationRequired !== false,
    originalCommand: text,
    parsedAt: new Date(),
    isValid: true,
    validationErrors: [],
  };

  return intent;
}

/**
 * Fallback intent extraction using regex patterns
 */
function extractIntentFallback(text: string): PaymentIntent {
  const lowerText = text.toLowerCase();

  // Check for balance query
  if (lowerText.includes("balance") || lowerText.includes("how much")) {
    return {
      action: "check_balance",
      amount: 0,
      currency: "USDC",
      confirmationRequired: false,
      originalCommand: text,
      parsedAt: new Date(),
      isValid: true,
    };
  }

  // Check for history query
  if (lowerText.includes("history") || lowerText.includes("transaction")) {
    return {
      action: "view_history",
      amount: 0,
      currency: "USDC",
      confirmationRequired: false,
      originalCommand: text,
      parsedAt: new Date(),
      isValid: true,
    };
  }

  // Check for cancel
  if (lowerText.includes("cancel")) {
    return {
      action: "cancel",
      amount: 0,
      currency: "USDC",
      confirmationRequired: true,
      originalCommand: text,
      parsedAt: new Date(),
      isValid: true,
    };
  }

  // Extract amount
  const amountMatch = text.match(/(\d+(?:\.\d+)?)\s*(?:usdc|dollars?|usd)?/i);
  const amount = amountMatch ? parseFloat(amountMatch[1]) : 0;

  // Check for split payment
  if (lowerText.includes("split")) {
    const participants: any[] = [];
    const nameMatches = text.match(/(?:with|and)\s+(\w+)/gi);

    if (nameMatches) {
      nameMatches.forEach((match) => {
        const name = match.replace(/^(with|and)\s+/i, "").trim();
        participants.push({ identifier: name });
      });
    }

    return {
      action: "split",
      amount,
      currency: "USDC",
      participants: participants.length > 0 ? participants : undefined,
      confirmationRequired: true,
      originalCommand: text,
      parsedAt: new Date(),
      isValid: true,
    };
  }

  // Extract recipient for send/transfer/pay
  let recipient: string | undefined;

  // Try to find Ethereum address
  const addressMatch = text.match(/0x[a-fA-F0-9]{40}/);
  if (addressMatch) {
    recipient = addressMatch[0];
  } else {
    // Try to find name after "to"
    const nameMatch = text.match(/(?:to|for)\s+(\w+)/i);
    if (nameMatch) {
      recipient = nameMatch[1];
    }
  }

  // Check for send/transfer/pay actions
  if (
    lowerText.includes("send") ||
    lowerText.includes("transfer") ||
    lowerText.includes("pay")
  ) {
    const action = lowerText.includes("bill") ? "pay_bill" : "send";

    return {
      action,
      amount,
      currency: "USDC",
      recipient,
      confirmationRequired: true,
      originalCommand: text,
      parsedAt: new Date(),
      isValid: true,
    };
  }

  // Default to send action
  return {
    action: "send",
    amount,
    currency: "USDC",
    recipient,
    confirmationRequired: true,
    originalCommand: text,
    parsedAt: new Date(),
    isValid: true,
  };
}

/**
 * POST /api/nlp
 * Extract payment intent from text
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<NLPResponse>,
) {
  // Only accept POST requests
  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      error: "Method not allowed",
      errorCode: "METHOD_NOT_ALLOWED",
    });
  }

  try {
    const { text } = req.body;

    // Validate input
    if (!text || typeof text !== "string") {
      return res.status(400).json({
        success: false,
        error: "Text is required",
        errorCode: "MISSING_TEXT",
      });
    }

    // Sanitize input
    const sanitizedText = sanitizeInput(text);

    if (sanitizedText.length === 0) {
      return res.status(400).json({
        success: false,
        error: "Invalid text input",
        errorCode: "INVALID_TEXT",
      });
    }

    // Check if demo mode is enabled
    if (isDemoMode()) {
      const demoService = new DemoNLPService();
      const result = await demoService.processIntent(sanitizedText);
      return res.status(200).json(result);
    }

    // Extract intent using AI or fallback to regex
    let intent: PaymentIntent;

    try {
      intent = await extractIntent(sanitizedText);
    } catch (aiError) {
      console.warn("AI extraction failed, using fallback:", aiError);
      intent = extractIntentFallback(sanitizedText);
    }

    // Validate the extracted intent
    const validation = validatePaymentIntent(intent);

    if (!validation.valid) {
      intent.isValid = false;
      intent.validationErrors = validation.errors;
    }

    // Return successful response
    return res.status(200).json({
      success: true,
      intent,
    });
  } catch (error: any) {
    console.error("NLP processing error:", error);

    // Handle specific error types
    if (error.message?.includes("credentials")) {
      return res.status(500).json({
        success: false,
        error: "NLP service configuration error",
        errorCode: "API_CONFIGURATION_ERROR",
      });
    }

    if (error.message?.includes("rate limit")) {
      return res.status(429).json({
        success: false,
        error: "Too many requests. Please try again later.",
        errorCode: "RATE_LIMIT_EXCEEDED",
      });
    }

    // Generic error response
    return res.status(500).json({
      success: false,
      error: "Failed to process intent",
      errorCode: "NLP_PROCESSING_FAILED",
    });
  }
}
