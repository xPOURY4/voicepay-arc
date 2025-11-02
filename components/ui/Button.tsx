/**
 * VoicePay Arc - Button Component
 * Reusable button component with variants, sizes, and loading states
 */

import { motion } from "framer-motion";
import { ButtonHTMLAttributes, ReactNode } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?:
    | "primary"
    | "secondary"
    | "danger"
    | "success"
    | "outline"
    | "ghost";
  size?: "sm" | "md" | "lg" | "xl";
  isLoading?: boolean;
  isFullWidth?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  animate?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = "primary",
  size = "md",
  isLoading = false,
  isFullWidth = false,
  leftIcon,
  rightIcon,
  animate = true,
  disabled,
  className = "",
  ...props
}) => {
  // Variant styles
  const variantStyles = {
    primary:
      "bg-primary-500 hover:bg-primary-600 text-white shadow-md hover:shadow-lg",
    secondary:
      "bg-gray-500 hover:bg-gray-600 text-white shadow-md hover:shadow-lg",
    danger: "bg-red-500 hover:bg-red-600 text-white shadow-md hover:shadow-lg",
    success:
      "bg-green-500 hover:bg-green-600 text-white shadow-md hover:shadow-lg",
    outline: "border-2 border-primary-500 text-primary-500 hover:bg-primary-50",
    ghost: "text-primary-500 hover:bg-primary-50",
  };

  // Size styles
  const sizeStyles = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-6 py-3 text-lg",
    xl: "px-8 py-4 text-xl",
  };

  // Base styles
  const baseStyles = `
    inline-flex items-center justify-center
    font-semibold rounded-lg
    transition-all duration-200
    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500
    disabled:opacity-50 disabled:cursor-not-allowed
    ${isFullWidth ? "w-full" : ""}
    ${variantStyles[variant]}
    ${sizeStyles[size]}
    ${className}
  `;

  const ButtonContent = () => (
    <>
      {isLoading && (
        <svg
          className="animate-spin -ml-1 mr-2 h-4 w-4"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      {!isLoading && leftIcon && <span className="mr-2">{leftIcon}</span>}
      <span>{children}</span>
      {!isLoading && rightIcon && <span className="ml-2">{rightIcon}</span>}
    </>
  );

  if (!animate) {
    return (
      <button
        className={baseStyles}
        disabled={disabled || isLoading}
        {...props}
      >
        <ButtonContent />
      </button>
    );
  }

  const {
    onDrag,
    onDragEnd,
    onDragStart,
    onAnimationStart,
    onAnimationEnd,
    ...restProps
  } = props;

  return (
    <motion.button
      className={baseStyles}
      disabled={disabled || isLoading}
      whileHover={!disabled && !isLoading ? { scale: 1.02 } : {}}
      whileTap={!disabled && !isLoading ? { scale: 0.98 } : {}}
      {...restProps}
    >
      <ButtonContent />
    </motion.button>
  );
};

export default Button;
