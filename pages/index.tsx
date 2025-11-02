/**
 * VoicePay Arc - Main Application Page
 * Developer: TheRealPourya (https://github.com/xPOURY4)
 * Twitter: https://x.com/TheRealPourya
 * Date: November 2025
 *
 * This component is part of the VoicePay Arc project - a production-ready
 * voice payment system for Arc Testnet.
 *
 * Voice-activated cryptocurrency payment interface
 */

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import Head from "next/head";
import VoiceRecorder from "@/components/voice/VoiceRecorder";
import BalanceDisplay from "@/components/wallet/BalanceDisplay";
import TransactionList from "@/components/wallet/TransactionList";
import Button from "@/components/ui/Button";
import { ArcService } from "@/lib/blockchain/arc";
import type {
  Transaction,
  PaymentIntent,
  WalletBalance,
} from "@/lib/blockchain/types";
import { isDemoMode, DemoArcService } from "@/lib/demo/mockData";

export default function Home() {
  // State management
  const [balance, setBalance] = useState<WalletBalance>({
    usdc: "0",
    native: "0",
    lastUpdated: new Date(),
  });
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [walletAddress, setWalletAddress] = useState<string>("");
  const [isLoading, setIsLoading] = useState({
    balance: false,
    transactions: false,
    transaction: false,
  });
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const [currentCommand, setCurrentCommand] = useState<{
    transcript: string;
    intent: PaymentIntent;
  } | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);

  // Arc service instance
  const [arcService, setArcService] = useState<ArcService | null>(null);

  /**
   * Initialize Arc service and load wallet data
   */
  useEffect(() => {
    initializeWallet();
  }, []);

  /**
   * Initialize wallet connection
   */
  const initializeWallet = async () => {
    try {
      // Check if demo mode is enabled
      let service: any;
      if (isDemoMode()) {
        service = new DemoArcService();
      } else {
        // Create Arc service instance
        service = new ArcService({
          privateKey: process.env.NEXT_PUBLIC_TEST_PRIVATE_KEY,
        });
      }

      setArcService(service);

      // Get wallet address
      const address = await service.getAddress();
      setWalletAddress(address);

      // Load initial data
      await Promise.all([loadBalance(service), loadTransactions(service)]);
    } catch (error: any) {
      console.error("Failed to initialize wallet:", error);
      setError("Failed to initialize wallet. Please check your configuration.");
    }
  };

  /**
   * Load wallet balance
   */
  const loadBalance = async (service?: ArcService) => {
    const svc = service || arcService;
    if (!svc) return;

    setIsLoading((prev) => ({ ...prev, balance: true }));
    try {
      const walletBalance = await svc.getWalletBalance();
      setBalance(walletBalance);
    } catch (error: any) {
      console.error("Failed to load balance:", error);
      setError("Failed to load balance");
    } finally {
      setIsLoading((prev) => ({ ...prev, balance: false }));
    }
  };

  /**
   * Load transaction history
   */
  const loadTransactions = async (service?: ArcService) => {
    const svc = service || arcService;
    if (!svc) return;

    setIsLoading((prev) => ({ ...prev, transactions: true }));
    try {
      const txHistory = await svc.getTransactions(undefined, 10);
      setTransactions(txHistory);
    } catch (error: any) {
      console.error("Failed to load transactions:", error);
    } finally {
      setIsLoading((prev) => ({ ...prev, transactions: false }));
    }
  };

  /**
   * Handle voice command processed
   */
  const handleVoiceCommandProcessed = useCallback(
    (transcript: string, intent: PaymentIntent) => {
      setCurrentCommand({ transcript, intent });
      setError("");
      setSuccess("");

      // Handle different actions
      switch (intent.action) {
        case "check_balance":
          handleCheckBalance();
          break;
        case "view_history":
          handleViewHistory();
          break;
        case "send":
          if (intent.confirmationRequired) {
            setShowConfirmation(true);
          } else {
            handleSendTransaction(intent);
          }
          break;
        case "split":
          setError("Split payments are not yet implemented");
          break;
        case "pay_bill":
          setError("Bill payments are not yet implemented");
          break;
        default:
          setError("Action not supported");
      }
    },
    [],
  );

  /**
   * Handle check balance action
   */
  const handleCheckBalance = () => {
    setSuccess(`Your balance is ${balance.usdc} USDC`);
    loadBalance();
  };

  /**
   * Handle view history action
   */
  const handleViewHistory = () => {
    loadTransactions();
    setSuccess("Transaction history refreshed");
  };

  /**
   * Handle send transaction
   */
  const handleSendTransaction = async (intent: PaymentIntent) => {
    if (!arcService) {
      setError("Wallet not initialized");
      return;
    }

    if (!intent.recipient) {
      setError("Recipient address is required");
      return;
    }

    if (!intent.amount || intent.amount <= 0) {
      setError("Valid amount is required");
      return;
    }

    setIsLoading((prev) => ({ ...prev, transaction: true }));
    setError("");
    setSuccess("");
    setShowConfirmation(false);

    try {
      // Validate amount
      const amountValidation = arcService.validateAmount(
        intent.amount.toString(),
      );
      if (!amountValidation.valid) {
        throw new Error(amountValidation.error || "Invalid amount");
      }

      // Check balance
      const currentBalance = parseFloat(balance.usdc);
      if (currentBalance < intent.amount) {
        throw new Error("Insufficient balance");
      }

      // Send transaction
      const result = await arcService.sendUSDC(
        intent.recipient,
        intent.amount.toString(),
      );

      // Wait for confirmation
      await arcService.waitForTransaction(result.hash, 1);

      // Create transaction record
      const newTransaction: Transaction = {
        id: `${result.hash}-0`,
        hash: result.hash,
        from: walletAddress,
        to: intent.recipient,
        amount: intent.amount.toString(),
        status: "confirmed",
        timestamp: new Date(),
        fee: "0",
        metadata: {
          voiceCommand: currentCommand?.transcript,
          intent: intent,
        },
      };

      // Update transactions list
      setTransactions((prev) => [newTransaction, ...prev]);

      // Reload balance
      await loadBalance();

      setSuccess(
        `Successfully sent ${intent.amount} USDC to ${intent.recipient.slice(0, 6)}...${intent.recipient.slice(-4)}`,
      );
    } catch (error: any) {
      console.error("Transaction failed:", error);
      setError(error.message || "Transaction failed");
    } finally {
      setIsLoading((prev) => ({ ...prev, transaction: false }));
      setCurrentCommand(null);
    }
  };

  /**
   * Handle confirmation
   */
  const handleConfirmTransaction = () => {
    if (currentCommand?.intent) {
      handleSendTransaction(currentCommand.intent);
    }
  };

  /**
   * Handle cancel confirmation
   */
  const handleCancelConfirmation = () => {
    setShowConfirmation(false);
    setCurrentCommand(null);
    setError("Transaction cancelled");
  };

  /**
   * Handle voice error
   */
  const handleVoiceError = (errorMessage: string) => {
    setError(errorMessage);
    setCurrentCommand(null);
    setShowConfirmation(false);
  };

  /**
   * Handle refresh
   */
  const handleRefresh = () => {
    loadBalance();
    loadTransactions();
  };

  /**
   * Format amount for display
   */
  const formatAmount = (amount: number): string => {
    return amount.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  return (
    <>
      <Head>
        <title>VoicePay Arc - Voice Payments Made Easy</title>
      </Head>

      <div className="min-h-screen py-8 px-4 safe-top safe-bottom">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <motion.header
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <h1 className="text-4xl font-bold text-gray-800 mb-2">
              🎤 VoicePay Arc
            </h1>
            <p className="text-gray-600">
              Voice-activated payments on Arc Testnet
            </p>
            {isDemoMode() && (
              <div className="mt-2 inline-block px-3 py-1 bg-yellow-100 text-yellow-800 text-sm rounded-full">
                🎬 Demo Mode - No API Keys Required
              </div>
            )}
          </motion.header>

          {/* Error Display */}
          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="mb-6 p-4 bg-red-100 border border-red-400 rounded-lg"
            >
              <div className="flex items-start">
                <span className="text-red-600 mr-2 text-xl">❌</span>
                <div className="flex-1">
                  <p className="text-red-800 font-medium">Error</p>
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
                <button
                  onClick={() => setError("")}
                  className="text-red-600 hover:text-red-800"
                >
                  ✕
                </button>
              </div>
            </motion.div>
          )}

          {/* Success Display */}
          {success && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="mb-6 p-4 bg-green-100 border border-green-400 rounded-lg"
            >
              <div className="flex items-start">
                <span className="text-green-600 mr-2 text-xl">✅</span>
                <div className="flex-1">
                  <p className="text-green-800 font-medium">Success</p>
                  <p className="text-green-700 text-sm">{success}</p>
                </div>
                <button
                  onClick={() => setSuccess("")}
                  className="text-green-600 hover:text-green-800"
                >
                  ✕
                </button>
              </div>
            </motion.div>
          )}

          {/* Balance Display */}
          <div className="mb-8">
            <BalanceDisplay
              balance={balance}
              isLoading={isLoading.balance}
              address={walletAddress}
              onRefresh={handleRefresh}
            />
          </div>

          {/* Voice Recorder */}
          <div className="mb-8">
            <VoiceRecorder
              onCommandProcessed={handleVoiceCommandProcessed}
              onError={handleVoiceError}
              disabled={isLoading.transaction}
            />
          </div>

          {/* Transaction in Progress */}
          {isLoading.transaction && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8 p-6 bg-white rounded-2xl shadow-lg"
            >
              <div className="flex items-center justify-center space-x-3">
                <div className="flex space-x-2">
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      className="w-3 h-3 bg-primary-500 rounded-full"
                      animate={{
                        scale: [1, 1.5, 1],
                        opacity: [0.5, 1, 0.5],
                      }}
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                        delay: i * 0.2,
                      }}
                    />
                  ))}
                </div>
                <p className="text-gray-700 font-medium">
                  Sending transaction...
                </p>
              </div>
            </motion.div>
          )}

          {/* Confirmation Modal */}
          {showConfirmation && currentCommand?.intent && (
            <>
              {/* Overlay */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
                onClick={handleCancelConfirmation}
              />

              {/* Modal */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md mx-4"
              >
                <div className="bg-white rounded-2xl shadow-2xl p-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-4">
                    Confirm Transaction
                  </h3>

                  <div className="space-y-4 mb-6">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">You said:</p>
                      <p className="text-gray-800 font-medium">
                        "{currentCommand.transcript}"
                      </p>
                    </div>

                    <div className="border-t border-gray-200 pt-4">
                      <div className="flex justify-between mb-2">
                        <span className="text-gray-600">Amount:</span>
                        <span className="font-bold text-gray-800">
                          {formatAmount(currentCommand.intent.amount)} USDC
                        </span>
                      </div>

                      <div className="flex justify-between mb-2">
                        <span className="text-gray-600">To:</span>
                        <span className="font-mono text-sm text-gray-800">
                          {currentCommand.intent.recipient
                            ? `${currentCommand.intent.recipient.slice(0, 6)}...${currentCommand.intent.recipient.slice(-4)}`
                            : "Unknown"}
                        </span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-gray-600">Network:</span>
                        <span className="text-gray-800">Arc Testnet</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex space-x-3">
                    <Button
                      variant="outline"
                      isFullWidth
                      onClick={handleCancelConfirmation}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="primary"
                      isFullWidth
                      onClick={handleConfirmTransaction}
                    >
                      Confirm & Send
                    </Button>
                  </div>
                </div>
              </motion.div>
            </>
          )}

          {/* Transaction List */}
          <div className="mb-8">
            <TransactionList
              transactions={transactions}
              currentAddress={walletAddress}
              isLoading={isLoading.transactions}
            />
          </div>

          {/* Footer */}
          <motion.footer
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-center text-sm text-gray-500 mt-12 pb-8"
          >
            <p>Built on Arc Testnet</p>
            <p className="mt-1">
              Powered by ElevenLabs, Cloudflare AI, and Arc Blockchain
            </p>
            <div className="mt-4 space-x-4">
              <a
                href="https://testnet.arcscan.app"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary-600 hover:text-primary-700 underline"
              >
                ArcScan Explorer
              </a>
              <a
                href="https://docs.arc.network"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary-600 hover:text-primary-700 underline"
              >
                Arc Docs
              </a>
            </div>
          </motion.footer>
        </div>
      </div>
    </>
  );
}
