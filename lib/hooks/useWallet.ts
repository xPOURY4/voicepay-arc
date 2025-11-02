/**
 * VoicePay Arc - useWallet Hook
 * Custom hook for wallet management, balance tracking, and transaction submission
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { ArcService } from '@/lib/blockchain/arc';
import type { WalletBalance, Transaction, TransactionResponse } from '@/lib/blockchain/types';

interface UseWalletOptions {
  autoConnect?: boolean;
  autoRefreshInterval?: number;
  privateKey?: string;
  onBalanceChange?: (balance: WalletBalance) => void;
  onTransactionSuccess?: (tx: Transaction) => void;
  onError?: (error: string) => void;
}

interface UseWalletReturn {
  // State
  isConnected: boolean;
  isConnecting: boolean;
  address: string | null;
  balance: WalletBalance | null;
  isLoadingBalance: boolean;
  error: string | null;

  // Actions
  connect: () => Promise<void>;
  disconnect: () => void;
  refreshBalance: () => Promise<void>;
  sendTransaction: (to: string, amount: string) => Promise<TransactionResponse>;
  estimateGas: (to: string, amount: string) => Promise<string>;

  // Utils
  validateAddress: (address: string) => boolean;
  validateAmount: (amount: string) => { valid: boolean; error?: string };
  formatBalance: (balance: string, decimals?: number) => string;
}

export function useWallet(options: UseWalletOptions = {}): UseWalletReturn {
  const {
    autoConnect = true,
    autoRefreshInterval = 30000, // 30 seconds
    privateKey,
    onBalanceChange,
    onTransactionSuccess,
    onError,
  } = options;

  // State
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [address, setAddress] = useState<string | null>(null);
  const [balance, setBalance] = useState<WalletBalance | null>(null);
  const [isLoadingBalance, setIsLoadingBalance] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Refs
  const arcServiceRef = useRef<ArcService | null>(null);
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Initialize Arc service
   */
  const initializeService = useCallback(() => {
    try {
      const service = new ArcService({
        privateKey: privateKey || process.env.NEXT_PUBLIC_TEST_PRIVATE_KEY,
      });
      arcServiceRef.current = service;
      return service;
    } catch (err: any) {
      console.error('Failed to initialize Arc service:', err);
      throw new Error('Failed to initialize wallet service');
    }
  }, [privateKey]);

  /**
   * Connect wallet
   */
  const connect = useCallback(async () => {
    if (isConnected || isConnecting) return;

    setIsConnecting(true);
    setError(null);

    try {
      // Initialize service
      const service = initializeService();

      // Get wallet address
      const walletAddress = await service.getAddress();
      setAddress(walletAddress);

      // Get initial balance
      const walletBalance = await service.getWalletBalance();
      setBalance(walletBalance);

      if (onBalanceChange) {
        onBalanceChange(walletBalance);
      }

      setIsConnected(true);

      // Setup auto-refresh
      if (autoRefreshInterval > 0) {
        refreshIntervalRef.current = setInterval(() => {
          refreshBalance();
        }, autoRefreshInterval);
      }
    } catch (err: any) {
      console.error('Failed to connect wallet:', err);
      const errorMessage = err.message || 'Failed to connect wallet';
      setError(errorMessage);

      if (onError) {
        onError(errorMessage);
      }
    } finally {
      setIsConnecting(false);
    }
  }, [isConnected, isConnecting, initializeService, autoRefreshInterval, onBalanceChange, onError]);

  /**
   * Disconnect wallet
   */
  const disconnect = useCallback(() => {
    // Clear interval
    if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current);
      refreshIntervalRef.current = null;
    }

    // Reset state
    setIsConnected(false);
    setAddress(null);
    setBalance(null);
    setError(null);
    arcServiceRef.current = null;
  }, []);

  /**
   * Refresh wallet balance
   */
  const refreshBalance = useCallback(async () => {
    if (!isConnected || !arcServiceRef.current) return;

    setIsLoadingBalance(true);
    setError(null);

    try {
      const walletBalance = await arcServiceRef.current.getWalletBalance();
      setBalance(walletBalance);

      if (onBalanceChange) {
        onBalanceChange(walletBalance);
      }
    } catch (err: any) {
      console.error('Failed to refresh balance:', err);
      const errorMessage = 'Failed to refresh balance';
      setError(errorMessage);

      if (onError) {
        onError(errorMessage);
      }
    } finally {
      setIsLoadingBalance(false);
    }
  }, [isConnected, onBalanceChange, onError]);

  /**
   * Send transaction
   */
  const sendTransaction = useCallback(
    async (to: string, amount: string): Promise<TransactionResponse> => {
      if (!isConnected || !arcServiceRef.current) {
        throw new Error('Wallet not connected');
      }

      setError(null);

      try {
        // Validate address
        if (!arcServiceRef.current.isValidAddress(to)) {
          throw new Error('Invalid recipient address');
        }

        // Validate amount
        const amountValidation = arcServiceRef.current.validateAmount(amount);
        if (!amountValidation.valid) {
          throw new Error(amountValidation.error || 'Invalid amount');
        }

        // Check balance
        if (balance) {
          const currentBalance = parseFloat(balance.usdc);
          const sendAmount = parseFloat(amount);

          if (currentBalance < sendAmount) {
            throw new Error('Insufficient USDC balance');
          }
        }

        // Send transaction
        const result = await arcServiceRef.current.sendUSDC(to, amount);

        // Wait for confirmation
        await arcServiceRef.current.waitForTransaction(result.hash, 1);

        // Create transaction object
        const transaction: Transaction = {
          id: `${result.hash}-0`,
          hash: result.hash,
          from: result.from,
          to: result.to,
          amount: result.amount,
          status: 'confirmed',
          timestamp: new Date(),
          fee: '0',
        };

        // Refresh balance
        await refreshBalance();

        // Call success callback
        if (onTransactionSuccess) {
          onTransactionSuccess(transaction);
        }

        return result;
      } catch (err: any) {
        console.error('Transaction failed:', err);
        const errorMessage = err.message || 'Transaction failed';
        setError(errorMessage);

        if (onError) {
          onError(errorMessage);
        }

        throw err;
      }
    },
    [isConnected, balance, refreshBalance, onTransactionSuccess, onError]
  );

  /**
   * Estimate gas for transaction
   */
  const estimateGas = useCallback(
    async (to: string, amount: string): Promise<string> => {
      if (!isConnected || !arcServiceRef.current) {
        throw new Error('Wallet not connected');
      }

      try {
        const gasEstimate = await arcServiceRef.current.estimateTransferGas(to, amount);
        return gasEstimate.estimatedFee;
      } catch (err: any) {
        console.error('Failed to estimate gas:', err);
        throw new Error('Failed to estimate transaction fee');
      }
    },
    [isConnected]
  );

  /**
   * Validate address
   */
  const validateAddress = useCallback((addr: string): boolean => {
    if (!arcServiceRef.current) return false;
    return arcServiceRef.current.isValidAddress(addr);
  }, []);

  /**
   * Validate amount
   */
  const validateAmount = useCallback(
    (amt: string): { valid: boolean; error?: string } => {
      if (!arcServiceRef.current) {
        return { valid: false, error: 'Wallet not initialized' };
      }
      return arcServiceRef.current.validateAmount(amt);
    },
    []
  );

  /**
   * Format balance for display
   */
  const formatBalance = useCallback((bal: string, decimals: number = 2): string => {
    const num = parseFloat(bal);
    if (isNaN(num)) return '0.00';
    return num.toLocaleString('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
  }, []);

  /**
   * Auto-connect on mount
   */
  useEffect(() => {
    if (autoConnect) {
      connect();
    }

    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, [autoConnect, connect]);

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    // State
    isConnected,
    isConnecting,
    address,
    balance,
    isLoadingBalance,
    error,

    // Actions
    connect,
    disconnect,
    refreshBalance,
    sendTransaction,
    estimateGas,

    // Utils
    validateAddress,
    validateAmount,
    formatBalance,
  };
}

export default useWallet;
