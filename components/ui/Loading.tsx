/**
 * VoicePay Arc - Loading Component
 * Reusable loading spinner with variants, sizes, and accessibility
 */

import { motion } from 'framer-motion';

interface LoadingProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'spinner' | 'dots' | 'pulse' | 'bars';
  message?: string;
  fullScreen?: boolean;
  color?: 'primary' | 'secondary' | 'white' | 'gray';
  className?: string;
}

export const Loading: React.FC<LoadingProps> = ({
  size = 'md',
  variant = 'spinner',
  message,
  fullScreen = false,
  color = 'primary',
  className = '',
}) => {
  // Size configurations
  const sizeStyles = {
    xs: 'w-4 h-4',
    sm: 'w-6 h-6',
    md: 'w-10 h-10',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24',
  };

  const dotSizes = {
    xs: 'w-1 h-1',
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4',
    xl: 'w-6 h-6',
  };

  const barSizes = {
    xs: 'w-1 h-3',
    sm: 'w-1 h-4',
    md: 'w-2 h-8',
    lg: 'w-2 h-12',
    xl: 'w-3 h-16',
  };

  // Color configurations
  const colorStyles = {
    primary: 'text-primary-500 border-primary-500',
    secondary: 'text-gray-500 border-gray-500',
    white: 'text-white border-white',
    gray: 'text-gray-400 border-gray-400',
  };

  const dotColors = {
    primary: 'bg-primary-500',
    secondary: 'bg-gray-500',
    white: 'bg-white',
    gray: 'bg-gray-400',
  };

  /**
   * Spinner Variant
   */
  const SpinnerVariant = () => (
    <div
      className={`${sizeStyles[size]} border-4 border-t-transparent rounded-full animate-spin ${colorStyles[color]}`}
      role="status"
      aria-label="Loading"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );

  /**
   * Dots Variant
   */
  const DotsVariant = () => (
    <div className="flex items-center space-x-2" role="status" aria-label="Loading">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className={`${dotSizes[size]} ${dotColors[color]} rounded-full`}
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            delay: i * 0.2,
            ease: 'easeInOut',
          }}
        />
      ))}
      <span className="sr-only">Loading...</span>
    </div>
  );

  /**
   * Pulse Variant
   */
  const PulseVariant = () => (
    <div className="relative" role="status" aria-label="Loading">
      <motion.div
        className={`${sizeStyles[size]} ${dotColors[color]} rounded-full`}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [1, 0.5, 1],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      <motion.div
        className={`absolute inset-0 ${sizeStyles[size]} ${dotColors[color]} rounded-full opacity-50`}
        animate={{
          scale: [1, 1.5, 1],
          opacity: [0.5, 0, 0.5],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      <span className="sr-only">Loading...</span>
    </div>
  );

  /**
   * Bars Variant
   */
  const BarsVariant = () => (
    <div className="flex items-end space-x-1" role="status" aria-label="Loading">
      {[0, 1, 2, 3].map((i) => (
        <motion.div
          key={i}
          className={`${barSizes[size]} ${dotColors[color]} rounded-sm`}
          animate={{
            scaleY: [1, 2, 1],
          }}
          transition={{
            duration: 0.8,
            repeat: Infinity,
            delay: i * 0.1,
            ease: 'easeInOut',
          }}
        />
      ))}
      <span className="sr-only">Loading...</span>
    </div>
  );

  /**
   * Get variant component
   */
  const getVariant = () => {
    switch (variant) {
      case 'dots':
        return <DotsVariant />;
      case 'pulse':
        return <PulseVariant />;
      case 'bars':
        return <BarsVariant />;
      case 'spinner':
      default:
        return <SpinnerVariant />;
    }
  };

  /**
   * Loading container
   */
  const LoadingContainer = () => (
    <div
      className={`flex flex-col items-center justify-center space-y-4 ${className}`}
      aria-live="polite"
      aria-busy="true"
    >
      {getVariant()}
      {message && (
        <p
          className={`text-sm font-medium ${
            color === 'white' ? 'text-white' : 'text-gray-600'
          } animate-pulse`}
        >
          {message}
        </p>
      )}
    </div>
  );

  // Full screen overlay
  if (fullScreen) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm"
      >
        <LoadingContainer />
      </motion.div>
    );
  }

  return <LoadingContainer />;
};

/**
 * Inline Loading Spinner (for buttons, etc.)
 */
interface InlineLoadingProps {
  size?: 'xs' | 'sm' | 'md';
  color?: 'primary' | 'white' | 'gray';
  className?: string;
}

export const InlineLoading: React.FC<InlineLoadingProps> = ({
  size = 'sm',
  color = 'primary',
  className = '',
}) => {
  const sizeMap = {
    xs: 'w-3 h-3 border-2',
    sm: 'w-4 h-4 border-2',
    md: 'w-5 h-5 border-2',
  };

  const colorMap = {
    primary: 'border-primary-500 border-t-transparent',
    white: 'border-white border-t-transparent',
    gray: 'border-gray-500 border-t-transparent',
  };

  return (
    <div
      className={`${sizeMap[size]} ${colorMap[color]} rounded-full animate-spin ${className}`}
      role="status"
      aria-label="Loading"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
};

/**
 * Skeleton Loading Component
 */
interface SkeletonProps {
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
  className?: string;
  count?: number;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  variant = 'text',
  width = '100%',
  height,
  className = '',
  count = 1,
}) => {
  const variantStyles = {
    text: 'h-4 rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-lg',
  };

  const style = {
    width: typeof width === 'number' ? `${width}px` : width,
    height: height
      ? typeof height === 'number'
        ? `${height}px`
        : height
      : variant === 'circular'
      ? width
      : undefined,
  };

  const skeletonElement = (
    <div
      className={`bg-gray-200 animate-pulse ${variantStyles[variant]} ${className}`}
      style={style}
      role="status"
      aria-label="Loading content"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );

  if (count === 1) {
    return skeletonElement;
  }

  return (
    <div className="space-y-2">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i}>{skeletonElement}</div>
      ))}
    </div>
  );
};

/**
 * Progress Bar Component
 */
interface ProgressBarProps {
  progress: number; // 0-100
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'success' | 'warning' | 'danger';
  showPercentage?: boolean;
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  size = 'md',
  color = 'primary',
  showPercentage = false,
  className = '',
}) => {
  const sizeStyles = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3',
  };

  const colorStyles = {
    primary: 'bg-primary-500',
    success: 'bg-green-500',
    warning: 'bg-yellow-500',
    danger: 'bg-red-500',
  };

  const clampedProgress = Math.min(Math.max(progress, 0), 100);

  return (
    <div className={`w-full ${className}`}>
      {showPercentage && (
        <div className="flex justify-between mb-1">
          <span className="text-sm font-medium text-gray-700">Progress</span>
          <span className="text-sm font-medium text-gray-700">{clampedProgress}%</span>
        </div>
      )}
      <div
        className={`w-full bg-gray-200 rounded-full overflow-hidden ${sizeStyles[size]}`}
        role="progressbar"
        aria-valuenow={clampedProgress}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <motion.div
          className={`${sizeStyles[size]} ${colorStyles[color]} rounded-full`}
          initial={{ width: 0 }}
          animate={{ width: `${clampedProgress}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
};

export default Loading;
