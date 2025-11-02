/**
 * VoicePay Arc - Blockchain Service
 * Developer: TheRealPourya (https://github.com/xPOURY4)
 * Twitter: https://x.com/TheRealPourya
 * Date: November 2025
 *
 * This component is part of the VoicePay Arc project - a production-ready
 * voice payment system for Arc Testnet.
 *
 * Handles all Arc blockchain interactions including wallet management and USDC transactions
 */

import { ethers, EventLog } from "ethers";
import type {
  Transaction,
  TransactionResponse,
  WalletBalance,
  GasEstimate,
  WalletConfig,
  VoicePayError,
  ErrorCode,
} from "./types";

/**
 * USDC Contract ABI - Only the methods we need
 */
const USDC_ABI = [
  "function transfer(address to, uint256 amount) returns (bool)",
  "function balanceOf(address account) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)",
  "function name() view returns (string)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "event Transfer(address indexed from, address indexed to, uint256 value)",
];

/**
 * Arc Blockchain Service
 * Manages wallet connections and USDC transactions on Arc Testnet
 */
export class ArcService {
  private provider: ethers.JsonRpcProvider;
  private signer: ethers.Wallet | null = null;
  private usdcContract: ethers.Contract | null = null;
  private config: WalletConfig;

  constructor(config?: Partial<WalletConfig>) {
    // Default configuration for Arc Testnet
    this.config = {
      rpcUrl:
        config?.rpcUrl ||
        process.env.NEXT_PUBLIC_ARC_RPC_URL ||
        "https://rpc.testnet.arc.network",
      chainId:
        config?.chainId ||
        parseInt(process.env.NEXT_PUBLIC_ARC_CHAIN_ID || "5042002"),
      usdcAddress:
        config?.usdcAddress ||
        process.env.NEXT_PUBLIC_USDC_CONTRACT_ADDRESS ||
        "0x3600000000000000000000000000000000000000",
      privateKey: config?.privateKey,
    };

    // Initialize provider
    this.provider = new ethers.JsonRpcProvider(this.config.rpcUrl, {
      chainId: this.config.chainId,
      name: "arc-testnet",
    });

    // Initialize wallet if private key is provided (server-side only)
    if (this.config.privateKey) {
      this.initializeWallet(this.config.privateKey);
    }
  }

  /**
   * Initialize wallet with private key
   * WARNING: Only use this server-side with testnet keys
   */
  private initializeWallet(privateKey: string): void {
    try {
      this.signer = new ethers.Wallet(privateKey, this.provider);

      // Initialize USDC contract with signer
      this.usdcContract = new ethers.Contract(
        this.config.usdcAddress,
        USDC_ABI,
        this.signer,
      );

      console.log("Wallet initialized:", this.signer.address);
    } catch (error) {
      console.error("Failed to initialize wallet:", error);
      throw new Error("Invalid private key");
    }
  }

  /**
   * Set signer manually (for client-side wallet connections)
   */
  public setSigner(signer: ethers.Signer): void {
    this.signer = signer as ethers.Wallet;
    this.usdcContract = new ethers.Contract(
      this.config.usdcAddress,
      USDC_ABI,
      this.signer,
    );
  }

  /**
   * Get the current wallet address
   */
  public async getAddress(): Promise<string> {
    if (!this.signer) {
      throw new Error("Wallet not initialized");
    }
    return await this.signer.getAddress();
  }

  /**
   * Get USDC balance for an address
   */
  public async getBalance(address?: string): Promise<string> {
    try {
      const targetAddress = address || (await this.getAddress());

      if (!this.usdcContract) {
        // Create a read-only contract instance
        const contract = new ethers.Contract(
          this.config.usdcAddress,
          USDC_ABI,
          this.provider,
        );
        const balance = await contract.balanceOf(targetAddress);
        const decimals = await contract.decimals();
        return ethers.formatUnits(balance, decimals);
      }

      const balance = await this.usdcContract.balanceOf(targetAddress);
      const decimals = await this.usdcContract.decimals();

      return ethers.formatUnits(balance, decimals);
    } catch (error) {
      console.error("Failed to get balance:", error);
      throw new Error("Failed to fetch USDC balance");
    }
  }

  /**
   * Get detailed wallet balance including native token
   */
  public async getWalletBalance(address?: string): Promise<WalletBalance> {
    try {
      const targetAddress = address || (await this.getAddress());

      // Get USDC balance
      const usdcBalance = await this.getBalance(targetAddress);

      // Get native token balance (for gas)
      const nativeBalance = await this.provider.getBalance(targetAddress);
      const nativeFormatted = ethers.formatEther(nativeBalance);

      return {
        usdc: usdcBalance,
        native: nativeFormatted,
        lastUpdated: new Date(),
      };
    } catch (error) {
      console.error("Failed to get wallet balance:", error);
      throw new Error("Failed to fetch wallet balance");
    }
  }

  /**
   * Send USDC to a recipient
   */
  public async sendUSDC(
    to: string,
    amount: string,
    options?: {
      gasLimit?: bigint;
      maxFeePerGas?: bigint;
    },
  ): Promise<TransactionResponse> {
    if (!this.signer || !this.usdcContract) {
      throw new Error("Wallet not initialized");
    }

    try {
      // Validate recipient address
      if (!ethers.isAddress(to)) {
        throw new Error("Invalid recipient address");
      }

      // Get decimals and convert amount
      const decimals = await this.usdcContract.decimals();
      const amountWei = ethers.parseUnits(amount, decimals);

      // Check balance
      const senderAddress = await this.signer.getAddress();
      const balance = await this.usdcContract.balanceOf(senderAddress);

      if (balance < amountWei) {
        throw new Error("Insufficient USDC balance");
      }

      // Prepare transaction
      const txOptions: any = {};
      if (options?.gasLimit) {
        txOptions.gasLimit = options.gasLimit;
      }
      if (options?.maxFeePerGas) {
        txOptions.maxFeePerGas = options.maxFeePerGas;
      }

      // Send transaction
      const tx = await this.usdcContract.transfer(to, amountWei, txOptions);

      console.log("Transaction sent:", tx.hash);

      return {
        hash: tx.hash,
        amount,
        to,
        from: senderAddress,
        wait: (confirmations?: number) => tx.wait(confirmations),
      };
    } catch (error: any) {
      console.error("Failed to send USDC:", error);

      // Parse specific error messages
      if (error.message.includes("insufficient funds")) {
        throw new Error("Insufficient funds for gas");
      }
      if (error.code === "INSUFFICIENT_FUNDS") {
        throw new Error("Insufficient USDC balance");
      }

      throw new Error(`Transaction failed: ${error.message}`);
    }
  }

  /**
   * Wait for a transaction to be confirmed
   */
  public async waitForTransaction(
    txHash: string,
    confirmations: number = 1,
  ): Promise<ethers.TransactionReceipt> {
    try {
      const receipt = await this.provider.waitForTransaction(
        txHash,
        confirmations,
      );

      if (!receipt) {
        throw new Error("Transaction receipt not found");
      }

      if (receipt.status === 0) {
        throw new Error("Transaction reverted");
      }

      return receipt;
    } catch (error) {
      console.error("Failed to wait for transaction:", error);
      throw new Error("Transaction confirmation failed");
    }
  }

  /**
   * Get transaction details
   */
  public async getTransaction(
    txHash: string,
  ): Promise<ethers.TransactionResponse | null> {
    try {
      return await this.provider.getTransaction(txHash);
    } catch (error) {
      console.error("Failed to get transaction:", error);
      return null;
    }
  }

  /**
   * Get transaction receipt
   */
  public async getTransactionReceipt(
    txHash: string,
  ): Promise<ethers.TransactionReceipt | null> {
    try {
      return await this.provider.getTransactionReceipt(txHash);
    } catch (error) {
      console.error("Failed to get transaction receipt:", error);
      return null;
    }
  }

  /**
   * Get transaction history for an address
   * Note: This is a simplified version. In production, use an indexer or subgraph
   */
  public async getTransactions(
    address?: string,
    limit: number = 10,
  ): Promise<Transaction[]> {
    try {
      const targetAddress = address || (await this.getAddress());
      const transactions: Transaction[] = [];

      // Get current block
      const currentBlock = await this.provider.getBlockNumber();

      // Query Transfer events (last 10000 blocks for demo)
      const startBlock = Math.max(0, currentBlock - 10000);

      if (!this.usdcContract) {
        // Create read-only contract for querying events
        const contract = new ethers.Contract(
          this.config.usdcAddress,
          USDC_ABI,
          this.provider,
        );

        // Query sent transactions
        const sentFilter = contract.filters.Transfer(targetAddress, null);
        const sentEvents = await contract.queryFilter(
          sentFilter,
          startBlock,
          currentBlock,
        );

        // Query received transactions
        const receivedFilter = contract.filters.Transfer(null, targetAddress);
        const receivedEvents = await contract.queryFilter(
          receivedFilter,
          startBlock,
          currentBlock,
        );

        // Combine and process events
        const allEvents = [...sentEvents, ...receivedEvents];
        const decimals = await contract.decimals();

        for (const event of allEvents.slice(-limit)) {
          if (event instanceof EventLog) {
            const block = await event.getBlock();
            const args = event.args;

            if (args && args.length >= 3) {
              transactions.push({
                id: `${event.transactionHash}-${event.index}`,
                hash: event.transactionHash,
                from: args[0],
                to: args[1],
                amount: ethers.formatUnits(args[2], decimals),
                status: "confirmed",
                timestamp: new Date(block.timestamp * 1000),
                fee: "0", // Fee information would require additional queries
                blockNumber: event.blockNumber,
                confirmations: currentBlock - event.blockNumber,
              });
            }
          }
        }
      } else {
        // Use existing contract instance
        const sentFilter = this.usdcContract.filters.Transfer(
          targetAddress,
          null,
        );
        const sentEvents = await this.usdcContract.queryFilter(
          sentFilter,
          startBlock,
          currentBlock,
        );

        const receivedFilter = this.usdcContract.filters.Transfer(
          null,
          targetAddress,
        );
        const receivedEvents = await this.usdcContract.queryFilter(
          receivedFilter,
          startBlock,
          currentBlock,
        );

        const allEvents = [...sentEvents, ...receivedEvents];
        const decimals = await this.usdcContract.decimals();

        for (const event of allEvents.slice(-limit)) {
          if (event instanceof EventLog) {
            const block = await event.getBlock();
            const args = event.args;

            if (args && args.length >= 3) {
              transactions.push({
                id: `${event.transactionHash}-${event.index}`,
                hash: event.transactionHash,
                from: args[0],
                to: args[1],
                amount: ethers.formatUnits(args[2], decimals),
                status: "confirmed",
                timestamp: new Date(block.timestamp * 1000),
                fee: "0",
                blockNumber: event.blockNumber,
                confirmations: currentBlock - event.blockNumber,
              });
            }
          }
        }
      }

      // Sort by timestamp, newest first
      transactions.sort(
        (a, b) => b.timestamp.getTime() - a.timestamp.getTime(),
      );

      return transactions.slice(0, limit);
    } catch (error) {
      console.error("Failed to get transactions:", error);
      return [];
    }
  }

  /**
   * Estimate gas for a USDC transfer
   */
  public async estimateTransferGas(
    to: string,
    amount: string,
  ): Promise<GasEstimate> {
    if (!this.usdcContract) {
      throw new Error("Contract not initialized");
    }

    try {
      const decimals = await this.usdcContract.decimals();
      const amountWei = ethers.parseUnits(amount, decimals);

      // Estimate gas limit
      const gasLimit = await this.usdcContract.transfer.estimateGas(
        to,
        amountWei,
      );

      // Get current gas price
      const feeData = await this.provider.getFeeData();
      const gasPrice = feeData.gasPrice || BigInt(0);

      // Calculate total fee
      const estimatedFee = gasLimit * gasPrice;
      const feeInEther = ethers.formatEther(estimatedFee);

      return {
        gasLimit,
        gasPrice,
        estimatedFee: feeInEther,
      };
    } catch (error) {
      console.error("Failed to estimate gas:", error);
      throw new Error("Gas estimation failed");
    }
  }

  /**
   * Get current gas price
   */
  public async getGasPrice(): Promise<string> {
    try {
      const feeData = await this.provider.getFeeData();
      const gasPrice = feeData.gasPrice || BigInt(0);
      return ethers.formatUnits(gasPrice, "gwei");
    } catch (error) {
      console.error("Failed to get gas price:", error);
      return "0";
    }
  }

  /**
   * Check if an address is valid
   */
  public isValidAddress(address: string): boolean {
    return ethers.isAddress(address);
  }

  /**
   * Get network information
   */
  public async getNetwork(): Promise<ethers.Network> {
    return await this.provider.getNetwork();
  }

  /**
   * Get current block number
   */
  public async getBlockNumber(): Promise<number> {
    return await this.provider.getBlockNumber();
  }

  /**
   * Check transaction status
   */
  public async checkTransactionStatus(txHash: string): Promise<{
    status: "pending" | "confirmed" | "failed";
    confirmations: number;
    blockNumber?: number;
  }> {
    try {
      const receipt = await this.provider.getTransactionReceipt(txHash);

      if (!receipt) {
        return {
          status: "pending",
          confirmations: 0,
        };
      }

      const currentBlock = await this.provider.getBlockNumber();
      const confirmations = currentBlock - receipt.blockNumber + 1;

      return {
        status: receipt.status === 1 ? "confirmed" : "failed",
        confirmations,
        blockNumber: receipt.blockNumber,
      };
    } catch (error) {
      console.error("Failed to check transaction status:", error);
      throw new Error("Failed to check transaction status");
    }
  }

  /**
   * Validate USDC amount
   */
  public validateAmount(amount: string): { valid: boolean; error?: string } {
    try {
      const numAmount = parseFloat(amount);

      if (isNaN(numAmount)) {
        return { valid: false, error: "Invalid amount format" };
      }

      if (numAmount <= 0) {
        return { valid: false, error: "Amount must be greater than zero" };
      }

      // Check minimum amount (0.01 USDC)
      const minAmount = parseFloat(
        process.env.NEXT_PUBLIC_MIN_USDC_AMOUNT || "0.01",
      );
      if (numAmount < minAmount) {
        return {
          valid: false,
          error: `Amount must be at least ${minAmount} USDC`,
        };
      }

      // Check maximum amount (10000 USDC for safety)
      const maxAmount = parseFloat(
        process.env.NEXT_PUBLIC_MAX_USDC_AMOUNT || "10000",
      );
      if (numAmount > maxAmount) {
        return {
          valid: false,
          error: `Amount cannot exceed ${maxAmount} USDC`,
        };
      }

      return { valid: true };
    } catch (error) {
      return { valid: false, error: "Invalid amount" };
    }
  }

  /**
   * Get USDC contract address
   */
  public getUSDCAddress(): string {
    return this.config.usdcAddress;
  }

  /**
   * Get provider instance (for advanced usage)
   */
  public getProvider(): ethers.JsonRpcProvider {
    return this.provider;
  }

  /**
   * Get signer instance (for advanced usage)
   */
  public getSigner(): ethers.Wallet | null {
    return this.signer;
  }
}

/**
 * Create a singleton instance for server-side usage
 */
let arcServiceInstance: ArcService | null = null;

export function getArcService(): ArcService {
  if (!arcServiceInstance) {
    arcServiceInstance = new ArcService({
      privateKey: process.env.TEST_PRIVATE_KEY,
    });
  }
  return arcServiceInstance;
}

/**
 * Create a new instance for client-side usage (without private key)
 */
export function createArcService(): ArcService {
  return new ArcService();
}

export default ArcService;
