/**
 * VoicePay Arc - Error Display Component
 * Comprehensive error display with categorization, retry, and user-friendly messages
 */

import { motion, AnimatePresence } from 'framer-motion';
import { ReactNode } from 'react';

export enum ErrorCategory {
  NETWORK = 'NETWORK',
  AUTHENTICATION = 'AUTHENTICATION',
  VALIDATION = 'VALIDATION',
  BLOCKCHAIN = 'BLOCKCHAIN',
  VOICE = 'VOICE',
  API = 'API',
  UNKNOWN = 'UNKNOWN',
}

interface ErrorDisplayProps {
  error: Error | string | null;
  errorCode?: string;
  category?: ErrorCategory;
  onRetry?: () => void;
  onDismiss?: () => void;
  retryText?: string;
  dismissText?: string;
  showDetails?: boolean;
  fullWidth?: boolean;
  variant?: 'banner' | 'card' | 'inline';
  className?: string;
}

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
  error,
  errorCode,
  category = ErrorCategory.UNKNOWN,
  onRetry,
  onDismiss,
  retryText = 'Try Again',
  dismissText = 'Dismiss',
  showDetails = false,
  fullWidth = false,
  variant = 'card',
  className = '',
}) => {
  if (!error) return null;

  const errorMessage = typeof error === 'string' ? error : error.message;

  /**
   * Get user-friendly error message based on category and code
   */
  const getUserFriendlyMessage = (): string => {
    // Check for specific error codes first
    if (errorCode) {
      switch (errorCode) {
        case 'MICROPHONE_ACCESS_DENIED':
          return 'Microphone access is required. Please allow microphone access in your browser settings.';
        case 'VOICE_PROCESSING_FAILED':
          return 'Failed to process voice command. Please try speaking again.';
        case 'TRANSCRIPTION_FAILED':
          return 'Could not understand the audio. Please speak clearly and try again.';
        case 'INTENT_EXTRACTION_FAILED':
          return 'Could not understand your command. Please try rephrasing it.';
        case 'INVALID_AMOUNT':
          return 'The amount entered is invalid. Please enter a valid amount.';
        case 'INVALID_ADDRESS':
          return 'The recipient address is invalid. Please check and try again.';
        case 'INSUFFICIENT_BALANCE':
          return 'You do not have enough USDC to complete this transaction.';
        case 'TRANSACTION_FAILED':
          return 'Transaction failed. Please check your balance and try again.';
        case 'TRANSACTION_REVERTED':
          return 'Transaction was reverted by the blockchain. Please try again.';
        case 'NETWORK_ERROR':
          return 'Network error. Please check your internet connection.';
        case 'CONTRACT_ERROR':
          return 'Smart contract error. Please try again later.';
        case 'API_TIMEOUT':
          return 'Request timed out. Please try again.';
        case 'RATE_LIMIT_EXCEEDED':
          return 'Too many requests. Please wait a moment and try again.';
        case 'USER_CANCELLED':
          return 'Action was cancelled.';
        default:
          break;
      }
    }

    // Fallback to category-based messages
    switch (category) {
      case ErrorCategory.NETWORK:
        return 'Network connection error. Please check your internet and try again.';
      case ErrorCategory.AUTHENTICATION:
        return 'Authentication failed. Please check your credentials.';
      case ErrorCategory.VALIDATION:
        return 'Invalid input. Please check your entries and try again.';
      case ErrorCategory.BLOCKCHAIN:
        return 'Blockchain error. Please try again or contact support.';
      case ErrorCategory.VOICE:
        return 'Voice processing error. Please try speaking again.';
      case ErrorCategory.API:
        return 'Service unavailable. Please try again later.';
      case ErrorCategory.UNKNOWN:
      default:
        return errorMessage || 'An unexpected error occurred. Please try again.';
    }
  };

  /**
   * Get error icon based on category
   */
  const getErrorIcon = (): string => {
    switch (category) {
      case ErrorCategory.NETWORK:
        return '🌐';
      case ErrorCategory.AUTHENTICATION:
        return '🔒';
      case ErrorCategory.VALIDATION:
        return '⚠️';
      case ErrorCategory.BLOCKCHAIN:
        return '⛓️';
      case ErrorCategory.VOICE:
        return '🎤';
      case ErrorCategory.API:
        return '🔌';
      case ErrorCategory.UNKNOWN:
      default:
        return '❌';
    }
  };

  /**
   * Get error color scheme based on category
   */
  const getColorScheme = () => {
    switch (category) {
      case ErrorCategory.VALIDATION:
        return {
          bg: 'bg-yellow-50',
          border: 'border-yellow-300',
          text: 'text-yellow-800',
          iconBg: 'bg-yellow-100',
          button: 'bg-yellow-600 hover:bg-yellow-700',
        };
      case ErrorCategory.NETWORK:
      case ErrorCategory.API:
        return {
          bg: 'bg-blue-50',
          border: 'border-blue-300',
          text: 'text-blue-800',
          iconBg: 'bg-blue-100',
          button: 'bg-blue-600 hover:bg-blue-700',
        };
      default:
        return {
          bg: 'bg-red-50',
          border: 'border-red-300',
          text: 'text-red-800',
          iconBg: 'bg-red-100',
          button: 'bg-red-600 hover:bg-red-700',
        };
    }
  };

  const colorScheme = getColorScheme();
  const userMessage = getUserFriendlyMessage();

  /**
   * Variant styles
   */
  const variantStyles = {
    banner: `${colorScheme.bg} ${colorScheme.border} border-l-4 p-4`,
    card: `${colorScheme.bg} ${colorScheme.border} border rounded-lg p-4 shadow-md`,
    inline: `${colorScheme.bg} ${colorScheme.border} border-l-4 p-3`,
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.3 }}
        className={`${variantStyles[variant]} ${fullWidth ? 'w-full' : ''} ${className}`}
        role="alert"
        aria-live="assertive"
      >
        <div className="flex items-start">
          {/* Error Icon */}
          <div
            className={`flex-shrink-0 w-10 h-10 ${colorScheme.iconBg} rounded-full flex items-center justify-center text-xl`}
          >
            {getErrorIcon()}
          </div>

          {/* Error Content */}
          <div className="ml-3 flex-1">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                {/* Error Title */}
                <h3 className={`text-sm font-semibold ${colorScheme.text}`}>
                  {category !== ErrorCategory.UNKNOWN
                    ? `${category.charAt(0)}${category.slice(1).toLowerCase()} Error`
                    : 'Error'}
                </h3>

                {/* Error Message */}
                <p className={`mt-1 text-sm ${colorScheme.text}`}>
                  {userMessage}
                </p>

                {/* Error Code */}
                {errorCode && (
                  <p className={`mt-1 text-xs ${colorScheme.text} opacity-75 font-mono`}>
                    Error Code: {errorCode}
                  </p>
                )}

                {/* Detailed Error (Development) */}
                {showDetails && errorMessage !== userMessage && (
                  <details className="mt-2">
                    <summary className={`text-xs ${colorScheme.text} cursor-pointer hover:underline`}>
                      Technical Details
                    </summary>
                    <pre className={`mt-2 text-xs ${colorScheme.text} bg-white/50 p-2 rounded overflow-x-auto`}>
                      {errorMessage}
                    </pre>
                  </details>
                )}

                {/* Action Buttons */}
                {(onRetry || onDismiss) && (
                  <div className="mt-3 flex items-center space-x-2">
                    {onRetry && (
                      <button
                        onClick={onRetry}
                        className={`px-3 py-1.5 text-xs font-medium text-white ${colorScheme.button} rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500`}
                      >
                        {retryText}
                      </button>
                    )}
                    {onDismiss && (
                      <button
                        onClick={onDismiss}
                        className={`px-3 py-1.5 text-xs font-medium ${colorScheme.text} bg-white border ${colorScheme.border} rounded-md hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500`}
                      >
                        {dismissText}
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Close Button (if dismiss available) */}
              {onDismiss && (
                <button
                  onClick={onDismiss}
                  className={`ml-3 flex-shrink-0 ${colorScheme.text} hover:opacity-75 transition-opacity`}
                  aria-label="Dismiss error"
                >
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

/**
 * Simple Error Text Component
 */
interface ErrorTextProps {
  children: ReactNode;
  className?: string;
}

export const ErrorText: React.FC<ErrorTextProps> = ({ children, className = '' }) => (
  <p className={`text-sm text-red-600 mt-1 ${className}`} role="alert">
    {children}
  </p>
);

/**
 * Error Boundary Fallback Component
 */
interface ErrorBoundaryFallbackProps {
  error: Error;
  resetError: () => void;
}

export const ErrorBoundaryFallback: React.FC<ErrorBoundaryFallbackProps> = ({
  error,
  resetError,
}) => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
    <div className="max-w-md w-full">
      <ErrorDisplay
        error={error}
        category={ErrorCategory.UNKNOWN}
        onRetry={resetError}
        showDetails={process.env.NODE_ENV === 'development'}
        variant="card"
        fullWidth
      />
    </div>
  </div>
);

export default ErrorDisplay;
