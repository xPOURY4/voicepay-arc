/**
 * VoicePay Arc - Card Component
 * Reusable card component with variants, header, footer, and responsive design
 */

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  variant?: 'default' | 'bordered' | 'elevated' | 'flat' | 'gradient';
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  header?: ReactNode;
  footer?: ReactNode;
  title?: string;
  subtitle?: string;
  hoverable?: boolean;
  clickable?: boolean;
  onClick?: () => void;
  animate?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  variant = 'default',
  padding = 'md',
  header,
  footer,
  title,
  subtitle,
  hoverable = false,
  clickable = false,
  onClick,
  animate = true,
}) => {
  // Variant styles
  const variantStyles = {
    default: 'bg-white shadow-md border border-gray-200',
    bordered: 'bg-white border-2 border-gray-300',
    elevated: 'bg-white shadow-xl',
    flat: 'bg-gray-50',
    gradient: 'bg-gradient-to-br from-primary-500 to-primary-700 text-white shadow-lg',
  };

  // Padding styles
  const paddingStyles = {
    none: '',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
    xl: 'p-8',
  };

  // Hover styles
  const hoverStyles = hoverable
    ? 'transition-all duration-300 hover:shadow-xl hover:-translate-y-1'
    : '';

  // Clickable styles
  const clickableStyles = clickable || onClick
    ? 'cursor-pointer active:scale-[0.98]'
    : '';

  // Base styles
  const baseStyles = `
    rounded-xl overflow-hidden
    ${variantStyles[variant]}
    ${hoverStyles}
    ${clickableStyles}
    ${className}
  `;

  const CardContent = () => (
    <div className={baseStyles} onClick={onClick}>
      {/* Header Section */}
      {(header || title) && (
        <div className={`border-b ${variant === 'gradient' ? 'border-white/20' : 'border-gray-200'} ${paddingStyles[padding]}`}>
          {header ? (
            header
          ) : (
            <div>
              {title && (
                <h3 className={`text-lg font-semibold ${variant === 'gradient' ? 'text-white' : 'text-gray-800'}`}>
                  {title}
                </h3>
              )}
              {subtitle && (
                <p className={`text-sm mt-1 ${variant === 'gradient' ? 'text-white/80' : 'text-gray-600'}`}>
                  {subtitle}
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Main Content */}
      <div className={header || title || footer ? paddingStyles[padding] : paddingStyles[padding]}>
        {children}
      </div>

      {/* Footer Section */}
      {footer && (
        <div className={`border-t ${variant === 'gradient' ? 'border-white/20' : 'border-gray-200'} ${paddingStyles[padding]}`}>
          {footer}
        </div>
      )}
    </div>
  );

  if (!animate) {
    return <CardContent />;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={hoverable ? { scale: 1.02 } : {}}
      whileTap={clickable || onClick ? { scale: 0.98 } : {}}
    >
      <CardContent />
    </motion.div>
  );
};

/**
 * Card Header Component
 */
interface CardHeaderProps {
  children: ReactNode;
  className?: string;
}

export const CardHeader: React.FC<CardHeaderProps> = ({ children, className = '' }) => (
  <div className={`font-semibold text-gray-800 ${className}`}>{children}</div>
);

/**
 * Card Title Component
 */
interface CardTitleProps {
  children: ReactNode;
  className?: string;
}

export const CardTitle: React.FC<CardTitleProps> = ({ children, className = '' }) => (
  <h3 className={`text-xl font-bold text-gray-800 ${className}`}>{children}</h3>
);

/**
 * Card Description Component
 */
interface CardDescriptionProps {
  children: ReactNode;
  className?: string;
}

export const CardDescription: React.FC<CardDescriptionProps> = ({ children, className = '' }) => (
  <p className={`text-sm text-gray-600 mt-1 ${className}`}>{children}</p>
);

/**
 * Card Content Component
 */
interface CardContentProps {
  children: ReactNode;
  className?: string;
}

export const CardContent: React.FC<CardContentProps> = ({ children, className = '' }) => (
  <div className={className}>{children}</div>
);

/**
 * Card Footer Component
 */
interface CardFooterProps {
  children: ReactNode;
  className?: string;
}

export const CardFooter: React.FC<CardFooterProps> = ({ children, className = '' }) => (
  <div className={`flex items-center justify-between ${className}`}>{children}</div>
);

export default Card;
