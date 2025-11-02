/**
 * VoicePay Arc - Type Definitions
 * Comprehensive type system for blockchain operations, transactions, and voice processing
 */

import { ethers } from 'ethers';

// ============================================================================
// Blockchain Types
// ============================================================================

/**
 * Represents a blockchain transaction
 */
export interface Transaction {
  /** Unique transaction identifier */
  id: string;
  /** Transaction hash on the blockchain */
  hash: string;
  /** Sender address */
  from: string;
  /** Recipient address */
  to: string;
  /** Transaction amount in USDC */
  amount: string;
  /** Current transaction status */
  status: TransactionStatus;
  /** Transaction timestamp */
  timestamp: Date;
  /** Transaction fee in native token */
  fee: string;
  /** Number of block confirmations */
  confirmations?: number;
  /** Block number where transaction was included */
  blockNumber?: number;
  /** Additional metadata */
  metadata?: TransactionMetadata;
}

/**
 * Transaction status enum
 */
export type TransactionStatus =
  | 'pending'
  | 'confirming'
  | 'confirmed'
  | 'failed'
  | 'cancelled';

/**
 * Additional transaction metadata
 */
export interface TransactionMetadata {
  /** Voice command that initiated the transaction */
  voiceCommand?: string;
  /** Processing intent */
  intent?: PaymentIntent;
  /** User notes or labels */
  notes?: string;
  /** Transaction category */
  category?: 'send' | 'receive' | 'split' | 'bill_payment';
}

/**
 * Transaction response from blockchain
 */
export interface TransactionResponse {
  /** Transaction hash */
  hash: string;
  /** Transaction amount */
  amount: string;
  /** Recipient address */
  to: string;
  /** Sender address */
  from: string;
  /** Transaction receipt (if confirmed) */
  receipt?: ethers.TransactionReceipt;
  /** Wait for confirmation */
  wait: (confirmations?: number) => Promise<ethers.TransactionReceipt>;
}

/**
 * Wallet balance information
 */
export interface WalletBalance {
  /** USDC balance */
  usdc: string;
  /** Native token balance (for gas) */
  native: string;
  /** Last updated timestamp */
  lastUpdated: Date;
}

/**
 * Gas estimation details
 */
export interface GasEstimate {
  /** Estimated gas limit */
  gasLimit: bigint;
  /** Gas price in wei */
  gasPrice: bigint;
  /** Total estimated fee */
  estimatedFee: string;
  /** Fee in USD equivalent */
  feeInUSD?: string;
}

// ============================================================================
// Voice Processing Types
// ============================================================================

/**
 * Voice processing state machine
 */
export type VoiceProcessingState =
  | 'idle'           // Ready to record
  | 'requesting'     // Requesting microphone permission
  | 'listening'      // Recording audio
  | 'processing'     // Transcribing and analyzing
  | 'confirming'     // Waiting for user confirmation
  | 'executing'      // Sending transaction
  | 'complete'       // Transaction successful
  | 'error';         // Error occurred

/**
 * Voice command result
 */
export interface VoiceCommandResult {
  /** Transcribed text */
  transcript: string;
  /** Extracted payment intent */
  intent: PaymentIntent;
  /** Confidence score (0-1) */
  confidence: number;
  /** Processing time in milliseconds */
  processingTime: number;
  /** Any warnings or validation issues */
  warnings?: string[];
}

/**
 * Audio recording configuration
 */
export interface AudioConfig {
  /** Sample rate in Hz */
  sampleRate: number;
  /** Number of audio channels */
  channels: number;
  /** Audio format/mime type */
  mimeType: string;
  /** Maximum recording duration in ms */
  maxDuration: number;
  /** Minimum recording duration in ms */
  minDuration: number;
}

// ============================================================================
// Payment Intent Types
// ============================================================================

/**
 * Represents the extracted payment intent from voice command
 */
export interface PaymentIntent {
  /** Type of payment action */
  action: PaymentAction;
  /** Amount in USDC */
  amount: number;
  /** Currency (always USDC for now) */
  currency: 'USDC';
  /** Recipient address or identifier */
  recipient?: string;
  /** Multiple recipients for split payments */
  participants?: Participant[];
  /** Whether confirmation is required */
  confirmationRequired: boolean;
  /** Original voice command */
  originalCommand?: string;
  /** Parsed timestamp */
  parsedAt: Date;
  /** Validation status */
  isValid: boolean;
  /** Validation errors if any */
  validationErrors?: string[];
}

/**
 * Payment action types
 */
export type PaymentAction =
  | 'send'          // Send to one recipient
  | 'request'       // Request payment
  | 'split'         // Split amount among participants
  | 'pay_bill'      // Pay a bill
  | 'check_balance' // Check account balance
  | 'view_history'  // View transaction history
  | 'cancel';       // Cancel last transaction

/**
 * Participant in split payment
 */
export interface Participant {
  /** Participant identifier (address or name) */
  identifier: string;
  /** Amount allocated to this participant */
  amount?: number;
  /** Participant's wallet address (resolved) */
  address?: string;
}

// ============================================================================
// API Response Types
// ============================================================================

/**
 * Standard API response wrapper
 */
export interface ApiResponse<T = any> {
  /** Whether the request was successful */
  success: boolean;
  /** Response data */
  data?: T;
  /** Error message if failed */
  error?: string;
  /** Error code for specific handling */
  errorCode?: string;
  /** Additional metadata */
  metadata?: Record<string, any>;
}

/**
 * Voice transcription response
 */
export interface TranscriptionResponse {
  /** Transcribed text */
  text: string;
  /** Confidence score */
  confidence: number;
  /** Language detected */
  language: string;
  /** Duration of audio in seconds */
  duration: number;
  /** Words with timestamps */
  words?: WordTimestamp[];
}

/**
 * Word with timestamp for detailed transcription
 */
export interface WordTimestamp {
  word: string;
  start: number;
  end: number;
  confidence: number;
}

/**
 * NLP processing response
 */
export interface NLPResponse {
  /** Extracted intent */
  intent: PaymentIntent;
  /** Named entities found */
  entities: Entity[];
  /** Sentiment analysis */
  sentiment?: 'positive' | 'neutral' | 'negative';
  /** Confidence score */
  confidence: number;
}

/**
 * Named entity from NLP
 */
export interface Entity {
  /** Entity type */
  type: 'amount' | 'currency' | 'recipient' | 'date' | 'action';
  /** Extracted value */
  value: string;
  /** Confidence score */
  confidence: number;
  /** Position in text */
  span: [number, number];
}

// ============================================================================
// Wallet & Connection Types
// ============================================================================

/**
 * Wallet connection status
 */
export interface WalletConnection {
  /** Whether wallet is connected */
  isConnected: boolean;
  /** Connected wallet address */
  address?: string;
  /** Chain ID */
  chainId?: number;
  /** Wallet provider name */
  provider?: string;
  /** Connection timestamp */
  connectedAt?: Date;
}

/**
 * Wallet configuration
 */
export interface WalletConfig {
  /** RPC URL for blockchain connection */
  rpcUrl: string;
  /** Chain ID */
  chainId: number;
  /** USDC contract address */
  usdcAddress: string;
  /** Private key (for server-side only) */
  privateKey?: string;
  /** Mnemonic phrase (for server-side only) */
  mnemonic?: string;
}

// ============================================================================
// Error Types
// ============================================================================

/**
 * Application error codes
 */
export enum ErrorCode {
  // Voice processing errors
  MICROPHONE_ACCESS_DENIED = 'MICROPHONE_ACCESS_DENIED',
  VOICE_PROCESSING_FAILED = 'VOICE_PROCESSING_FAILED',
  TRANSCRIPTION_FAILED = 'TRANSCRIPTION_FAILED',
  INTENT_EXTRACTION_FAILED = 'INTENT_EXTRACTION_FAILED',

  // Validation errors
  INVALID_AMOUNT = 'INVALID_AMOUNT',
  INVALID_ADDRESS = 'INVALID_ADDRESS',
  INVALID_COMMAND = 'INVALID_COMMAND',
  INSUFFICIENT_BALANCE = 'INSUFFICIENT_BALANCE',

  // Blockchain errors
  TRANSACTION_FAILED = 'TRANSACTION_FAILED',
  TRANSACTION_REVERTED = 'TRANSACTION_REVERTED',
  NETWORK_ERROR = 'NETWORK_ERROR',
  CONTRACT_ERROR = 'CONTRACT_ERROR',

  // API errors
  API_TIMEOUT = 'API_TIMEOUT',
  API_ERROR = 'API_ERROR',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',

  // General errors
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
  USER_CANCELLED = 'USER_CANCELLED',
}

/**
 * Custom application error
 */
export class VoicePayError extends Error {
  constructor(
    public code: ErrorCode,
    message: string,
    public details?: any
  ) {
    super(message);
    this.name = 'VoicePayError';
  }
}

// ============================================================================
// UI State Types
// ============================================================================

/**
 * Application state
 */
export interface AppState {
  /** Voice processing state */
  voiceState: VoiceProcessingState;
  /** Wallet connection */
  wallet: WalletConnection;
  /** Current balance */
  balance: WalletBalance;
  /** Transaction history */
  transactions: Transaction[];
  /** Current command being processed */
  currentCommand?: VoiceCommandResult;
  /** Loading states */
  isLoading: {
    balance: boolean;
    transactions: boolean;
    voice: boolean;
    transaction: boolean;
  };
  /** Error state */
  error?: {
    code: ErrorCode;
    message: string;
    timestamp: Date;
  };
}

/**
 * Notification type
 */
export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

// ============================================================================
// Configuration Types
// ============================================================================

/**
 * Application configuration
 */
export interface AppConfig {
  /** Voice processing settings */
  voice: {
    maxRecordingDuration: number;
    minRecordingDuration: number;
    autoStop: boolean;
    enableWaveform: boolean;
  };
  /** Transaction settings */
  transaction: {
    minAmount: number;
    maxAmount: number;
    confirmationRequired: boolean;
    defaultConfirmations: number;
  };
  /** API settings */
  api: {
    timeout: number;
    retryAttempts: number;
    retryDelay: number;
  };
  /** Feature flags */
  features: {
    voiceConfirmation: boolean;
    biometricAuth: boolean;
    multiLanguage: boolean;
    analytics: boolean;
  };
}

// ============================================================================
// Utility Types
// ============================================================================

/**
 * Make all properties optional recursively
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

/**
 * Make specific properties required
 */
export type RequireFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

/**
 * Async function type
 */
export type AsyncFunction<T = void> = () => Promise<T>;

/**
 * Event handler type
 */
export type EventHandler<T = void> = (event: T) => void;

// ============================================================================
// Contract ABI Types
// ============================================================================

/**
 * USDC contract interface
 */
export interface USDCContract {
  transfer(to: string, amount: bigint): Promise<ethers.ContractTransaction>;
  balanceOf(account: string): Promise<bigint>;
  decimals(): Promise<number>;
  symbol(): Promise<string>;
  name(): Promise<string>;
  totalSupply(): Promise<bigint>;
  allowance(owner: string, spender: string): Promise<bigint>;
  approve(spender: string, amount: bigint): Promise<ethers.ContractTransaction>;
  transferFrom(from: string, to: string, amount: bigint): Promise<ethers.ContractTransaction>;
}

/**
 * Standard ERC20 events
 */
export interface ERC20Events {
  Transfer: {
    from: string;
    to: string;
    value: bigint;
  };
  Approval: {
    owner: string;
    spender: string;
    value: bigint;
  };
}
