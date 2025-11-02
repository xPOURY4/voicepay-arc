/**
 * VoicePay Arc - Balance Display Component
 * Developer: TheRealPourya (https://github.com/xPOURY4)
 * Twitter: https://x.com/TheRealPourya
 * Date: November 2025
 *
 * This component is part of the VoicePay Arc project - a production-ready
 * voice payment system for Arc Testnet.
 *
 * Shows wallet USDC balance and connection status
 */

import { motion } from "framer-motion";
import type { WalletBalance } from "@/lib/blockchain/types";

interface BalanceDisplayProps {
  balance: string | WalletBalance;
  isLoading?: boolean;
  address?: string;
  onRefresh?: () => void;
}

export const BalanceDisplay: React.FC<BalanceDisplayProps> = ({
  balance,
  isLoading = false,
  address,
  onRefresh,
}) => {
  // Extract USDC balance
  const usdcBalance = typeof balance === "string" ? balance : balance.usdc;

  // Format balance for display
  const formatBalance = (bal: string): string => {
    const num = parseFloat(bal);
    if (isNaN(num)) return "0.00";
    return num.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  // Format address for display
  const formatAddress = (addr: string): string => {
    if (!addr) return "";
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl shadow-xl p-6 text-white"
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="text-sm opacity-90 font-medium">Your Balance</p>
          <p className="text-xs opacity-70 mt-1">Arc Testnet</p>
        </div>

        {/* Refresh Button */}
        {onRefresh && (
          <motion.button
            onClick={onRefresh}
            disabled={isLoading}
            className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors disabled:opacity-50"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <motion.span
              className="inline-block text-xl"
              animate={isLoading ? { rotate: 360 } : {}}
              transition={
                isLoading
                  ? { duration: 1, repeat: Infinity, ease: "linear" }
                  : {}
              }
            >
              🔄
            </motion.span>
          </motion.button>
        )}
      </div>

      {/* Balance Amount */}
      <div className="mb-4">
        {isLoading ? (
          <div className="h-12 bg-white/20 rounded-lg animate-pulse" />
        ) : (
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-baseline">
              <span className="text-5xl font-bold">
                {formatBalance(usdcBalance)}
              </span>
              <span className="text-2xl ml-2 opacity-90">USDC</span>
            </div>
          </motion.div>
        )}
      </div>

      {/* Wallet Address */}
      {address && (
        <div className="flex items-center justify-between pt-4 border-t border-white/20">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span className="text-xs opacity-70">Connected</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-mono opacity-90">
              {formatAddress(address)}
            </span>
            <button
              onClick={() => {
                navigator.clipboard.writeText(address);
              }}
              className="text-xs opacity-70 hover:opacity-100 transition-opacity"
              title="Copy address"
            >
              📋
            </button>
          </div>
        </div>
      )}

      {/* Native Balance (if available) */}
      {typeof balance === "object" && balance.native && (
        <div className="mt-3 pt-3 border-t border-white/20">
          <div className="flex justify-between items-center text-xs">
            <span className="opacity-70">Gas Balance</span>
            <span className="opacity-90 font-mono">
              {parseFloat(balance.native).toFixed(4)} ETH
            </span>
          </div>
        </div>
      )}

      {/* Last Updated */}
      {typeof balance === "object" && balance.lastUpdated && (
        <div className="mt-2 text-center">
          <p className="text-xs opacity-60">
            Updated {new Date(balance.lastUpdated).toLocaleTimeString()}
          </p>
        </div>
      )}
    </motion.div>
  );
};

export default BalanceDisplay;
