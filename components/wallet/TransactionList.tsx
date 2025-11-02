/**
 * VoicePay Arc - Transaction List Component
 * Developer: TheRealPourya (https://github.com/xPOURY4)
 * Twitter: https://x.com/TheRealPourya
 * Date: November 2025
 *
 * This component is part of the VoicePay Arc project - a production-ready
 * voice payment system for Arc Testnet.
 *
 * Displays transaction history with links to ArcScan explorer
 */

import { motion, AnimatePresence } from "framer-motion";
import type { Transaction } from "@/lib/blockchain/types";

interface TransactionListProps {
  transactions: Transaction[];
  currentAddress?: string;
  isLoading?: boolean;
  onTransactionClick?: (tx: Transaction) => void;
}

export const TransactionList: React.FC<TransactionListProps> = ({
  transactions,
  currentAddress,
  isLoading = false,
  onTransactionClick,
}) => {
  /**
   * Format amount for display
   */
  const formatAmount = (amount: string): string => {
    const num = parseFloat(amount);
    if (isNaN(num)) return "0.00";
    return num.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  /**
   * Format address for display
   */
  const formatAddress = (address: string): string => {
    if (!address) return "";
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  /**
   * Format timestamp for display
   */
  const formatTimestamp = (timestamp: Date): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
    });
  };

  /**
   * Determine if transaction is incoming or outgoing
   */
  const isIncoming = (tx: Transaction): boolean => {
    if (!currentAddress) return false;
    return tx.to.toLowerCase() === currentAddress.toLowerCase();
  };

  /**
   * Get transaction status badge
   */
  const getStatusBadge = (status: Transaction["status"]) => {
    const styles = {
      pending: "bg-yellow-100 text-yellow-800",
      confirming: "bg-blue-100 text-blue-800",
      confirmed: "bg-green-100 text-green-800",
      failed: "bg-red-100 text-red-800",
      cancelled: "bg-gray-100 text-gray-800",
    };

    const icons = {
      pending: "⏳",
      confirming: "🔄",
      confirmed: "✅",
      failed: "❌",
      cancelled: "🚫",
    };

    return (
      <span
        className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${styles[status]}`}
      >
        <span className="mr-1">{icons[status]}</span>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  /**
   * Get ArcScan URL for transaction
   */
  const getArcScanUrl = (txHash: string): string => {
    return `https://testnet.arcscan.app/tx/${txHash}`;
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">
          Recent Transactions
        </h2>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-20 bg-gray-200 rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="bg-white rounded-2xl shadow-lg p-6"
    >
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800">Recent Transactions</h2>
        {transactions.length > 0 && (
          <span className="text-sm text-gray-500">
            {transactions.length} transaction
            {transactions.length !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      {transactions.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">💸</div>
          <p className="text-gray-500 text-sm">No transactions yet</p>
          <p className="text-gray-400 text-xs mt-1">
            Your transaction history will appear here
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {transactions.map((tx, index) => {
              const incoming = isIncoming(tx);

              return (
                <motion.div
                  key={tx.id || tx.hash}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => onTransactionClick?.(tx)}
                >
                  <div className="flex items-start justify-between">
                    {/* Left Section: Icon and Details */}
                    <div className="flex items-start space-x-3 flex-1">
                      {/* Icon */}
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center text-xl ${
                          incoming
                            ? "bg-green-100 text-green-600"
                            : "bg-blue-100 text-blue-600"
                        }`}
                      >
                        {incoming ? "↓" : "↑"}
                      </div>

                      {/* Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <p className="font-semibold text-gray-800">
                            {incoming ? "Received" : "Sent"}
                          </p>
                          {getStatusBadge(tx.status)}
                        </div>

                        <div className="text-sm text-gray-600 space-y-1">
                          <div className="flex items-center space-x-1">
                            <span className="text-gray-500">
                              {incoming ? "From:" : "To:"}
                            </span>
                            <span className="font-mono">
                              {formatAddress(incoming ? tx.from : tx.to)}
                            </span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                navigator.clipboard.writeText(
                                  incoming ? tx.from : tx.to,
                                );
                              }}
                              className="text-gray-400 hover:text-gray-600 text-xs"
                              title="Copy address"
                            >
                              📋
                            </button>
                          </div>

                          <div className="flex items-center space-x-2 text-xs text-gray-500">
                            <span>{formatTimestamp(tx.timestamp)}</span>
                            {tx.confirmations !== undefined &&
                              tx.confirmations > 0 && (
                                <>
                                  <span>•</span>
                                  <span>
                                    {tx.confirmations} confirmation
                                    {tx.confirmations !== 1 ? "s" : ""}
                                  </span>
                                </>
                              )}
                          </div>

                          {/* Voice Command Metadata */}
                          {tx.metadata?.voiceCommand && (
                            <div className="mt-2 p-2 bg-purple-50 rounded text-xs text-purple-700">
                              <span className="mr-1">🎤</span>"
                              {tx.metadata.voiceCommand}"
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right Section: Amount */}
                    <div className="text-right ml-4">
                      <p
                        className={`text-lg font-bold ${
                          incoming ? "text-green-600" : "text-gray-800"
                        }`}
                      >
                        {incoming ? "+" : "-"}
                        {formatAmount(tx.amount)}
                      </p>
                      <p className="text-sm text-gray-500">USDC</p>
                    </div>
                  </div>

                  {/* Bottom Section: Transaction Hash and Links */}
                  <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-xs">
                      <span className="text-gray-500">Hash:</span>
                      <span className="font-mono text-gray-600">
                        {formatAddress(tx.hash)}
                      </span>
                    </div>

                    <a
                      href={getArcScanUrl(tx.hash)}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="text-xs text-primary-600 hover:text-primary-700 font-medium flex items-center space-x-1"
                    >
                      <span>View on ArcScan</span>
                      <span>↗</span>
                    </a>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  );
};

export default TransactionList;
