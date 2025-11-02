/**
 * VoicePay Arc - Mock Data for Demo Mode
 * Developer: TheRealPourya (https://github.com/xPOURY4)
 * Twitter: https://x.com/TheRealPourya
 * Date: November 2025
 *
 * This component is part of the VoicePay Arc project - a production-ready
 * voice payment system for Arc Testnet.
 *
 * Mock data and services for running demo without API keys
 */

import type { Transaction, PaymentIntent } from "@/lib/blockchain/types";

/**
 * Demo configuration
 */
export const DEMO_CONFIG = {
  ENABLED: process.env.NEXT_PUBLIC_DEMO_MODE === "true",
  DEMO_WALLET_ADDRESS: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
  DEMO_BALANCE: "1234.56",
  DEMO_NATIVE_BALANCE: "0.5",
  PROCESSING_DELAY: 1500, // ms
};

/**
 * Mock voice commands for demo
 */
export const MOCK_VOICE_COMMANDS = [
  {
    audio: "send-50-usdc",
    transcript: "Send 50 USDC to Alice",
    intent: {
      action: "send" as const,
      amount: 50,
      currency: "USDC" as const,
      recipient: "0x1234567890123456789012345678901234567890",
      confirmationRequired: true,
      originalCommand: "Send 50 USDC to Alice",
      parsedAt: new Date(),
      isValid: true,
    },
  },
  {
    audio: "check-balance",
    transcript: "What's my balance?",
    intent: {
      action: "check_balance" as const,
      amount: 0,
      currency: "USDC" as const,
      confirmationRequired: false,
      originalCommand: "What's my balance?",
      parsedAt: new Date(),
      isValid: true,
    },
  },
  {
    audio: "show-history",
    transcript: "Show transaction history",
    intent: {
      action: "view_history" as const,
      amount: 0,
      currency: "USDC" as const,
      confirmationRequired: false,
      originalCommand: "Show transaction history",
      parsedAt: new Date(),
      isValid: true,
    },
  },
  {
    audio: "send-100-usdc",
    transcript: "Transfer 100 USDC to Bob",
    intent: {
      action: "send" as const,
      amount: 100,
      currency: "USDC" as const,
      recipient: "0x9876543210987654321098765432109876543210",
      confirmationRequired: true,
      originalCommand: "Transfer 100 USDC to Bob",
      parsedAt: new Date(),
      isValid: true,
    },
  },
];

/**
 * Mock transaction history
 */
export const MOCK_TRANSACTIONS: Transaction[] = [
  {
    id: "demo-tx-1",
    hash: "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890",
    from: DEMO_CONFIG.DEMO_WALLET_ADDRESS,
    to: "0x1234567890123456789012345678901234567890",
    amount: "50.00",
    status: "confirmed",
    timestamp: new Date(Date.now() - 3600000), // 1 hour ago
    fee: "0.001",
    confirmations: 12,
    blockNumber: 1234567,
    metadata: {
      voiceCommand: "Send 50 USDC to Alice",
    },
  },
  {
    id: "demo-tx-2",
    hash: "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
    from: "0x9876543210987654321098765432109876543210",
    to: DEMO_CONFIG.DEMO_WALLET_ADDRESS,
    amount: "25.50",
    status: "confirmed",
    timestamp: new Date(Date.now() - 7200000), // 2 hours ago
    fee: "0.001",
    confirmations: 24,
    blockNumber: 1234550,
  },
  {
    id: "demo-tx-3",
    hash: "0xfedcba0987654321fedcba0987654321fedcba0987654321fedcba0987654321",
    from: DEMO_CONFIG.DEMO_WALLET_ADDRESS,
    to: "0x5555555555555555555555555555555555555555",
    amount: "100.00",
    status: "confirmed",
    timestamp: new Date(Date.now() - 86400000), // 1 day ago
    fee: "0.001",
    confirmations: 156,
    blockNumber: 1233000,
    metadata: {
      voiceCommand: "Transfer 100 USDC to Bob",
    },
  },
];

/**
 * Demo Voice Service - Simulates voice transcription
 */
export class DemoVoiceService {
  async transcribe(audio: Blob): Promise<{
    success: boolean;
    transcript: string;
    confidence: number;
    duration: number;
  }> {
    // Simulate processing delay
    await this.delay(DEMO_CONFIG.PROCESSING_DELAY);

    // Get random command from mock data
    const randomCommand =
      MOCK_VOICE_COMMANDS[
        Math.floor(Math.random() * MOCK_VOICE_COMMANDS.length)
      ];

    return {
      success: true,
      transcript: randomCommand.transcript,
      confidence: 0.95,
      duration: 1.2,
    };
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

/**
 * Demo NLP Service - Simulates intent extraction
 */
export class DemoNLPService {
  async processIntent(text: string): Promise<{
    success: boolean;
    intent: PaymentIntent;
  }> {
    // Simulate processing delay
    await this.delay(DEMO_CONFIG.PROCESSING_DELAY);

    // Find matching command or create from text
    const matchingCommand = MOCK_VOICE_COMMANDS.find(
      (cmd) => cmd.transcript.toLowerCase() === text.toLowerCase()
    );

    if (matchingCommand) {
      return {
        success: true,
        intent: {
          ...matchingCommand.intent,
          parsedAt: new Date(),
        },
      };
    }

    // Fallback: try to parse the text
    return {
      success: true,
      intent: this.parseTextIntent(text),
    };
  }

  private parseTextIntent(text: string): PaymentIntent {
    const lowerText = text.toLowerCase();

    // Check balance
    if (lowerText.includes("balance")) {
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

    // View history
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

    // Extract amount for send command
    const amountMatch = text.match(/(\d+(?:\.\d+)?)/);
    const amount = amountMatch ? parseFloat(amountMatch[1]) : 10;

    // Default to send action
    return {
      action: "send",
      amount,
      currency: "USDC",
      recipient: "0x1234567890123456789012345678901234567890",
      confirmationRequired: true,
      originalCommand: text,
      parsedAt: new Date(),
      isValid: true,
    };
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

/**
 * Demo Arc Service - Simulates blockchain interactions
 */
export class DemoArcService {
  private transactions: Transaction[] = [...MOCK_TRANSACTIONS];

  async getAddress(): Promise<string> {
    return DEMO_CONFIG.DEMO_WALLET_ADDRESS;
  }

  async getWalletBalance(): Promise<{
    usdc: string;
    native: string;
    lastUpdated: Date;
  }> {
    await this.delay(500);
    return {
      usdc: DEMO_CONFIG.DEMO_BALANCE,
      native: DEMO_CONFIG.DEMO_NATIVE_BALANCE,
      lastUpdated: new Date(),
    };
  }

  async sendUSDC(
    to: string,
    amount: string
  ): Promise<{
    hash: string;
    amount: string;
    to: string;
    from: string;
    wait: (confirmations?: number) => Promise<any>;
  }> {
    await this.delay(DEMO_CONFIG.PROCESSING_DELAY);

    // Generate mock transaction hash
    const hash = "0x" + this.generateRandomHex(64);

    // Add to transactions
    const newTx: Transaction = {
      id: `demo-tx-${Date.now()}`,
      hash,
      from: DEMO_CONFIG.DEMO_WALLET_ADDRESS,
      to,
      amount,
      status: "confirmed",
      timestamp: new Date(),
      fee: "0.001",
      confirmations: 1,
      blockNumber: 1234567 + this.transactions.length,
    };

    this.transactions.unshift(newTx);

    return {
      hash,
      amount,
      to,
      from: DEMO_CONFIG.DEMO_WALLET_ADDRESS,
      wait: async () => ({ status: 1, blockNumber: newTx.blockNumber }),
    };
  }

  async getTransactions(
    address?: string,
    limit: number = 10
  ): Promise<Transaction[]> {
    await this.delay(500);
    return this.transactions.slice(0, limit);
  }

  async waitForTransaction(txHash: string, confirmations: number = 1): Promise<any> {
    await this.delay(1000);
    return { status: 1, blockNumber: 1234567 };
  }

  validateAmount(amount: string): { valid: boolean; error?: string } {
    const num = parseFloat(amount);
    if (isNaN(num)) {
      return { valid: false, error: "Invalid amount" };
    }
    if (num <= 0) {
      return { valid: false, error: "Amount must be greater than 0" };
    }
    if (num > parseFloat(DEMO_CONFIG.DEMO_BALANCE)) {
      return { valid: false, error: "Insufficient balance" };
    }
    return { valid: true };
  }

  isValidAddress(address: string): boolean {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
  }

  private generateRandomHex(length: number): string {
    let result = "";
    const characters = "0123456789abcdef";
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

/**
 * Check if demo mode is enabled
 */
export function isDemoMode(): boolean {
  return DEMO_CONFIG.ENABLED;
}

/**
 * Get demo service instances
 */
export function getDemoServices() {
  return {
    voiceService: new DemoVoiceService(),
    nlpService: new DemoNLPService(),
    arcService: new DemoArcService(),
  };
}

export default {
  DEMO_CONFIG,
  MOCK_VOICE_COMMANDS,
  MOCK_TRANSACTIONS,
  DemoVoiceService,
  DemoNLPService,
  DemoArcService,
  isDemoMode,
  getDemoServices,
};
