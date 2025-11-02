/**
 * VoicePay Arc - useTransactions Hook
 * Custom hook for transaction history management with filtering, pagination, and real-time updates
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { ArcService } from '@/lib/blockchain/arc';
import type { Transaction, TransactionStatus } from '@/lib/blockchain/types';

interface UseTransactionsOptions {
  address?: string;
  autoRefresh?: boolean;
  refreshInterval?: number;
  pageSize?: number;
  onNewTransaction?: (tx: Transaction) => void;
  onError?: (error: string) => void;
}

interface TransactionFilter {
  status?: TransactionStatus;
  minAmount?: number;
  maxAmount?: number;
  startDate?: Date;
  endDate?: Date;
  type?: 'sent' | 'received' | 'all';
}

interface UseTransactionsReturn {
  // State
  transactions: Transaction[];
  filteredTransactions: Transaction[];
  isLoading: boolean;
  error: string | null;
  hasMore: boolean;
  currentPage: number;
  totalPages: number;
  totalTransactions: number;

  // Actions
  loadTransactions: () => Promise<void>;
  refreshTransactions: () => Promise<void>;
  loadMore: () => Promise<void>;
  setFilter: (filter: TransactionFilter) => void;
  clearFilter: () => void;
  getTransaction: (hash: string) => Transaction | undefined;
  checkTransactionStatus: (hash: string) => Promise<TransactionStatus>;

  // Utils
  getPendingTransactions: () => Transaction[];
  getConfirmedTransactions: () => Transaction[];
  getFailedTransactions: () => Transaction[];
  getSentTransactions: () => Transaction[];
  getReceivedTransactions: () => Transaction[];
}

export function useTransactions(options: UseTransactionsOptions = {}): UseTransactionsReturn {
  const {
    address,
    autoRefresh = true,
    refreshInterval = 30000, // 30 seconds
    pageSize = 10,
    onNewTransaction,
    onError,
  } = options;

  // State
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [filter, setFilterState] = useState<TransactionFilter>({});

  // Refs
  const arcServiceRef = useRef<ArcService | null>(null);
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastTransactionCountRef = useRef<number>(0);

  /**
   * Initialize Arc service
   */
  const initializeService = useCallback(() => {
    if (!arcServiceRef.current) {
      arcServiceRef.current = new ArcService({
        privateKey: process.env.NEXT_PUBLIC_TEST_PRIVATE_KEY,
      });
    }
    return arcServiceRef.current;
  }, []);

  /**
   * Apply filters to transactions
   */
  const applyFilters = useCallback(
    (txs: Transaction[], filterOptions: TransactionFilter): Transaction[] => {
      let filtered = [...txs];

      // Filter by status
      if (filterOptions.status) {
        filtered = filtered.filter((tx) => tx.status === filterOptions.status);
      }

      // Filter by amount range
      if (filterOptions.minAmount !== undefined) {
        filtered = filtered.filter((tx) => parseFloat(tx.amount) >= filterOptions.minAmount!);
      }

      if (filterOptions.maxAmount !== undefined) {
        filtered = filtered.filter((tx) => parseFloat(tx.amount) <= filterOptions.maxAmount!);
      }

      // Filter by date range
      if (filterOptions.startDate) {
        filtered = filtered.filter((tx) => tx.timestamp >= filterOptions.startDate!);
      }

      if (filterOptions.endDate) {
        filtered = filtered.filter((tx) => tx.timestamp <= filterOptions.endDate!);
      }

      // Filter by type (sent/received)
      if (filterOptions.type && filterOptions.type !== 'all' && address) {
        if (filterOptions.type === 'sent') {
          filtered = filtered.filter((tx) => tx.from.toLowerCase() === address.toLowerCase());
        } else if (filterOptions.type === 'received') {
          filtered = filtered.filter((tx) => tx.to.toLowerCase() === address.toLowerCase());
        }
      }

      return filtered;
    },
    [address]
  );

  /**
   * Load transactions from blockchain
   */
  const loadTransactions = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const service = initializeService();
      const txs = await service.getTransactions(address, pageSize * 10); // Load more for filtering

      setTransactions(txs);

      // Apply current filters
      const filtered = applyFilters(txs, filter);
      setFilteredTransactions(filtered);

      // Check for new transactions
      if (txs.length > lastTransactionCountRef.current && lastTransactionCountRef.current > 0) {
        const newTxs = txs.slice(0, txs.length - lastTransactionCountRef.current);
        newTxs.forEach((tx) => {
          if (onNewTransaction) {
            onNewTransaction(tx);
          }
        });
      }

      lastTransactionCountRef.current = txs.length;
    } catch (err: any) {
      console.error('Failed to load transactions:', err);
      const errorMessage = 'Failed to load transaction history';
      setError(errorMessage);

      if (onError) {
        onError(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  }, [address, pageSize, filter, applyFilters, initializeService, onNewTransaction, onError]);

  /**
   * Refresh transactions
   */
  const refreshTransactions = useCallback(async () => {
    await loadTransactions();
  }, [loadTransactions]);

  /**
   * Load more transactions (pagination)
   */
  const loadMore = useCallback(async () => {
    setCurrentPage((prev) => prev + 1);
  }, []);

  /**
   * Set filter
   */
  const setFilter = useCallback(
    (newFilter: TransactionFilter) => {
      setFilterState(newFilter);
      const filtered = applyFilters(transactions, newFilter);
      setFilteredTransactions(filtered);
      setCurrentPage(1);
    },
    [transactions, applyFilters]
  );

  /**
   * Clear filter
   */
  const clearFilter = useCallback(() => {
    setFilterState({});
    setFilteredTransactions(transactions);
    setCurrentPage(1);
  }, [transactions]);

  /**
   * Get transaction by hash
   */
  const getTransaction = useCallback(
    (hash: string): Transaction | undefined => {
      return transactions.find((tx) => tx.hash.toLowerCase() === hash.toLowerCase());
    },
    [transactions]
  );

  /**
   * Check transaction status on blockchain
   */
  const checkTransactionStatus = useCallback(
    async (hash: string): Promise<TransactionStatus> => {
      try {
        const service = initializeService();
        const status = await service.checkTransactionStatus(hash);
        return status.status as TransactionStatus;
      } catch (err) {
        console.error('Failed to check transaction status:', err);
        throw new Error('Failed to check transaction status');
      }
    },
    [initializeService]
  );

  /**
   * Get pending transactions
   */
  const getPendingTransactions = useCallback((): Transaction[] => {
    return filteredTransactions.filter((tx) => tx.status === 'pending' || tx.status === 'confirming');
  }, [filteredTransactions]);

  /**
   * Get confirmed transactions
   */
  const getConfirmedTransactions = useCallback((): Transaction[] => {
    return filteredTransactions.filter((tx) => tx.status === 'confirmed');
  }, [filteredTransactions]);

  /**
   * Get failed transactions
   */
  const getFailedTransactions = useCallback((): Transaction[] => {
    return filteredTransactions.filter((tx) => tx.status === 'failed');
  }, [filteredTransactions]);

  /**
   * Get sent transactions
   */
  const getSentTransactions = useCallback((): Transaction[] => {
    if (!address) return [];
    return filteredTransactions.filter((tx) => tx.from.toLowerCase() === address.toLowerCase());
  }, [filteredTransactions, address]);

  /**
   * Get received transactions
   */
  const getReceivedTransactions = useCallback((): Transaction[] => {
    if (!address) return [];
    return filteredTransactions.filter((tx) => tx.to.toLowerCase() === address.toLowerCase());
  }, [filteredTransactions, address]);

  /**
   * Auto-load on mount and setup refresh interval
   */
  useEffect(() => {
    loadTransactions();

    if (autoRefresh && refreshInterval > 0) {
      refreshIntervalRef.current = setInterval(() => {
        loadTransactions();
      }, refreshInterval);
    }

    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, [autoRefresh, refreshInterval, loadTransactions]);

  /**
   * Recalculate filtered transactions when filter changes
   */
  useEffect(() => {
    const filtered = applyFilters(transactions, filter);
    setFilteredTransactions(filtered);
  }, [transactions, filter, applyFilters]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredTransactions.length / pageSize);
  const hasMore = currentPage < totalPages;
  const paginatedTransactions = filteredTransactions.slice(0, currentPage * pageSize);

  return {
    // State
    transactions: paginatedTransactions,
    filteredTransactions,
    isLoading,
    error,
    hasMore,
    currentPage,
    totalPages,
    totalTransactions: filteredTransactions.length,

    // Actions
    loadTransactions,
    refreshTransactions,
    loadMore,
    setFilter,
    clearFilter,
    getTransaction,
    checkTransactionStatus,

    // Utils
    getPendingTransactions,
    getConfirmedTransactions,
    getFailedTransactions,
    getSentTransactions,
    getReceivedTransactions,
  };
}

export default useTransactions;
