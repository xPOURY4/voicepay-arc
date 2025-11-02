/**
 * VoicePay Arc - Validation Utilities
 * Input validation functions for addresses, amounts, and voice commands
 */

import { ethers } from 'ethers';
import type { PaymentIntent, PaymentAction } from '../blockchain/types';

// ============================================================================
// Address Validation
// ============================================================================

/**
 * Validate Ethereum address format
 */
export function validateAddress(address: string): {
  valid: boolean;
  error?: string;
  checksumAddress?: string;
} {
  try {
    // Check if it's a valid address format
    if (!ethers.isAddress(address)) {
      return {
        valid: false,
        error: 'Invalid address format',
      };
    }

    // Get checksummed address
    const checksumAddress = ethers.getAddress(address);

    return {
      valid: true,
      checksumAddress,
    };
  } catch (error) {
    return {
      valid: false,
      error: 'Invalid Ethereum address',
    };
  }
}

/**
 * Validate recipient address for transactions
 */
export function validateRecipientAddress(address: string): boolean {
  const result = validateAddress(address);
  return result.valid;
}

/**
 * Check if address is a zero address
 */
export function isZeroAddress(address: string): boolean {
  return address === ethers.ZeroAddress || address === '0x0000000000000000000000000000000000000000';
}

/**
 * Validate and sanitize address input
 */
export function sanitizeAddress(address: string): string | null {
  try {
    // Remove whitespace
    const cleaned = address.trim();

    // Validate
    if (!ethers.isAddress(cleaned)) {
      return null;
    }

    // Return checksummed address
    return ethers.getAddress(cleaned);
  } catch {
    return null;
  }
}

// ============================================================================
// Amount Validation
// ============================================================================

/**
 * Validate USDC amount
 */
export function validateUSDCAmount(
  amount: string | number,
  options?: {
    minAmount?: number;
    maxAmount?: number;
    maxDecimals?: number;
  }
): {
  valid: boolean;
  error?: string;
  normalized?: string;
} {
  try {
    // Convert to string if number
    const amountStr = typeof amount === 'number' ? amount.toString() : amount;

    // Remove whitespace and currency symbols
    const cleaned = amountStr.trim().replace(/[$,]/g, '');

    // Parse as float
    const numAmount = parseFloat(cleaned);

    // Check if valid number
    if (isNaN(numAmount)) {
      return {
        valid: false,
        error: 'Invalid amount format',
      };
    }

    // Check if positive
    if (numAmount <= 0) {
      return {
        valid: false,
        error: 'Amount must be greater than zero',
      };
    }

    // Check minimum amount
    const minAmount = options?.minAmount ?? parseFloat(process.env.NEXT_PUBLIC_MIN_USDC_AMOUNT || '0.01');
    if (numAmount < minAmount) {
      return {
        valid: false,
        error: `Amount must be at least ${minAmount} USDC`,
      };
    }

    // Check maximum amount
    const maxAmount = options?.maxAmount ?? parseFloat(process.env.NEXT_PUBLIC_MAX_USDC_AMOUNT || '10000');
    if (numAmount > maxAmount) {
      return {
        valid: false,
        error: `Amount cannot exceed ${maxAmount} USDC`,
      };
    }

    // Check decimal places
    const maxDecimals = options?.maxDecimals ?? 6;
    const decimalParts = cleaned.split('.');
    if (decimalParts.length > 1 && decimalParts[1].length > maxDecimals) {
      return {
        valid: false,
        error: `Amount cannot have more than ${maxDecimals} decimal places`,
      };
    }

    // Normalize to fixed decimal places
    const normalized = numAmount.toFixed(Math.min(maxDecimals, 6));

    return {
      valid: true,
      normalized,
    };
  } catch (error) {
    return {
      valid: false,
      error: 'Invalid amount',
    };
  }
}

/**
 * Parse amount from string (handles various formats)
 */
export function parseAmount(input: string): number | null {
  try {
    // Remove common prefixes and suffixes
    let cleaned = input
      .toLowerCase()
      .trim()
      .replace(/^(send|pay|transfer)\s+/i, '')
      .replace(/\s+(usdc|dollars?|usd)$/i, '')
      .replace(/[$,]/g, '');

    // Parse number
    const amount = parseFloat(cleaned);

    return isNaN(amount) ? null : amount;
  } catch {
    return null;
  }
}

/**
 * Format amount for display
 */
export function formatAmount(amount: string | number, decimals: number = 2): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;

  if (isNaN(num)) {
    return '0.00';
  }

  return num.toFixed(decimals);
}

// ============================================================================
// Payment Intent Validation
// ============================================================================

/**
 * Validate payment intent object
 */
export function validatePaymentIntent(intent: PaymentIntent): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Validate action
  const validActions: PaymentAction[] = [
    'send',
    'request',
    'split',
    'pay_bill',
    'check_balance',
    'view_history',
    'cancel',
  ];

  if (!validActions.includes(intent.action)) {
    errors.push('Invalid payment action');
  }

  // Validate amount for actions that require it
  const actionsRequiringAmount: PaymentAction[] = ['send', 'split', 'pay_bill'];
  if (actionsRequiringAmount.includes(intent.action)) {
    if (!intent.amount || intent.amount <= 0) {
      errors.push('Amount is required and must be greater than zero');
    }

    const amountValidation = validateUSDCAmount(intent.amount);
    if (!amountValidation.valid) {
      errors.push(amountValidation.error || 'Invalid amount');
    }
  }

  // Validate recipient for send action
  if (intent.action === 'send') {
    if (!intent.recipient) {
      errors.push('Recipient address is required for send action');
    } else {
      const addressValidation = validateAddress(intent.recipient);
      if (!addressValidation.valid) {
        errors.push(addressValidation.error || 'Invalid recipient address');
      }

      if (isZeroAddress(intent.recipient)) {
        errors.push('Cannot send to zero address');
      }
    }
  }

  // Validate participants for split action
  if (intent.action === 'split') {
    if (!intent.participants || intent.participants.length === 0) {
      errors.push('Participants are required for split action');
    } else if (intent.participants.length < 2) {
      errors.push('Split action requires at least 2 participants');
    }

    // Validate each participant's address if provided
    if (intent.participants) {
      for (const participant of intent.participants) {
        if (participant.address) {
          const addressValidation = validateAddress(participant.address);
          if (!addressValidation.valid) {
            errors.push(`Invalid address for participant: ${participant.identifier}`);
          }
        }
      }
    }
  }

  // Validate currency
  if (intent.currency !== 'USDC') {
    errors.push('Only USDC is supported');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

// ============================================================================
// Voice Command Validation
// ============================================================================

/**
 * Validate voice command text
 */
export function validateVoiceCommand(command: string): {
  valid: boolean;
  error?: string;
  normalized?: string;
} {
  try {
    // Remove extra whitespace
    const normalized = command.trim().replace(/\s+/g, ' ');

    // Check minimum length
    if (normalized.length < 3) {
      return {
        valid: false,
        error: 'Command is too short',
      };
    }

    // Check maximum length
    if (normalized.length > 500) {
      return {
        valid: false,
        error: 'Command is too long',
      };
    }

    // Check for common command patterns
    const commandPatterns = [
      /send/i,
      /transfer/i,
      /pay/i,
      /split/i,
      /balance/i,
      /history/i,
      /transaction/i,
      /cancel/i,
    ];

    const hasValidPattern = commandPatterns.some(pattern => pattern.test(normalized));

    if (!hasValidPattern) {
      return {
        valid: false,
        error: 'Command does not contain a recognized action',
      };
    }

    return {
      valid: true,
      normalized,
    };
  } catch (error) {
    return {
      valid: false,
      error: 'Invalid command format',
    };
  }
}

/**
 * Extract amount from voice command
 */
export function extractAmountFromCommand(command: string): number | null {
  try {
    // Patterns to match amounts
    const patterns = [
      /(\d+(?:\.\d+)?)\s*(?:usdc|dollars?|usd)/i,
      /(?:send|pay|transfer)\s+(\d+(?:\.\d+)?)/i,
      /(\d+(?:\.\d+)?)/,
    ];

    for (const pattern of patterns) {
      const match = command.match(pattern);
      if (match && match[1]) {
        const amount = parseFloat(match[1]);
        if (!isNaN(amount) && amount > 0) {
          return amount;
        }
      }
    }

    return null;
  } catch {
    return null;
  }
}

/**
 * Extract recipient from voice command
 */
export function extractRecipientFromCommand(command: string): string | null {
  try {
    // Pattern to match Ethereum addresses
    const addressPattern = /0x[a-fA-F0-9]{40}/;
    const match = command.match(addressPattern);

    if (match && match[0]) {
      return match[0];
    }

    // Pattern to match names (to be resolved elsewhere)
    const namePatterns = [
      /to\s+(\w+)/i,
      /for\s+(\w+)/i,
      /recipient\s+(\w+)/i,
    ];

    for (const pattern of namePatterns) {
      const nameMatch = command.match(pattern);
      if (nameMatch && nameMatch[1]) {
        return nameMatch[1];
      }
    }

    return null;
  } catch {
    return null;
  }
}

// ============================================================================
// Balance Validation
// ============================================================================

/**
 * Check if balance is sufficient for transaction
 */
export function validateSufficientBalance(
  balance: string,
  amount: string,
  includeGasBuffer: boolean = true
): {
  sufficient: boolean;
  error?: string;
} {
  try {
    const balanceNum = parseFloat(balance);
    const amountNum = parseFloat(amount);

    if (isNaN(balanceNum) || isNaN(amountNum)) {
      return {
        sufficient: false,
        error: 'Invalid balance or amount',
      };
    }

    // Add small buffer for gas (in USDC equivalent, very small on Arc)
    const buffer = includeGasBuffer ? 0.01 : 0;
    const required = amountNum + buffer;

    if (balanceNum < required) {
      return {
        sufficient: false,
        error: `Insufficient balance. Required: ${required.toFixed(2)} USDC, Available: ${balanceNum.toFixed(2)} USDC`,
      };
    }

    return {
      sufficient: true,
    };
  } catch (error) {
    return {
      sufficient: false,
      error: 'Failed to validate balance',
    };
  }
}

// ============================================================================
// General Validation Utilities
// ============================================================================

/**
 * Sanitize user input
 */
export function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/[\x00-\x1F\x7F]/g, ''); // Remove control characters
}

/**
 * Validate transaction hash
 */
export function validateTransactionHash(hash: string): boolean {
  return /^0x[a-fA-F0-9]{64}$/.test(hash);
}

/**
 * Check if string contains only alphanumeric characters
 */
export function isAlphanumeric(str: string): boolean {
  return /^[a-zA-Z0-9]+$/.test(str);
}

/**
 * Validate URL
 */
export function validateURL(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Rate limit check (simple in-memory implementation)
 */
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

export function checkRateLimit(
  identifier: string,
  maxRequests: number = 10,
  windowMs: number = 60000
): {
  allowed: boolean;
  remaining: number;
  resetTime: number;
} {
  const now = Date.now();
  const limit = rateLimitMap.get(identifier);

  // Clean up old entries
  if (limit && now > limit.resetTime) {
    rateLimitMap.delete(identifier);
  }

  // Get or create limit entry
  const entry = rateLimitMap.get(identifier) || {
    count: 0,
    resetTime: now + windowMs,
  };

  // Check if allowed
  if (entry.count >= maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: entry.resetTime,
    };
  }

  // Increment counter
  entry.count++;
  rateLimitMap.set(identifier, entry);

  return {
    allowed: true,
    remaining: maxRequests - entry.count,
    resetTime: entry.resetTime,
  };
}

/**
 * Validate environment configuration
 */
export function validateEnvironmentConfig(): {
  valid: boolean;
  missingVars: string[];
} {
  const requiredVars = [
    'NEXT_PUBLIC_ARC_RPC_URL',
    'NEXT_PUBLIC_USDC_CONTRACT_ADDRESS',
    'ELEVENLABS_API_KEY',
    'CLOUDFLARE_API_KEY',
    'CLOUDFLARE_ACCOUNT_ID',
  ];

  const missingVars = requiredVars.filter(
    varName => !process.env[varName]
  );

  return {
    valid: missingVars.length === 0,
    missingVars,
  };
}

export default {
  validateAddress,
  validateRecipientAddress,
  validateUSDCAmount,
  validatePaymentIntent,
  validateVoiceCommand,
  validateSufficientBalance,
  validateTransactionHash,
  sanitizeInput,
  parseAmount,
  formatAmount,
  extractAmountFromCommand,
  extractRecipientFromCommand,
  checkRateLimit,
  validateEnvironmentConfig,
};
