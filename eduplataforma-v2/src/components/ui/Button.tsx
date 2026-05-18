import React from 'react'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'mint' | 'violet' | 'amber'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  fullWidth?: boolean
}

const VARIANT_STYLES: Record<string, string> = {
  primary:   'bg-primary hover:bg-primary-light text-white shadow-sm',
  secondary: 'bg-surface dark:bg-dark-card2 hover:bg-primary-bg dark:hover:bg-dark-card text-text dark:text-dark-text border border-border dark:border-white/10',
  danger:    'bg-danger hover:bg-danger/90 text-white',
  ghost:     'hover:bg-surface dark:hover:bg-dark-card2 text-text-muted dark:text-dark-muted',
  mint:      'bg-mint hover:bg-mint-light text-white',
  violet:    'bg-violet hover:bg-violet-light text-white',
  amber:     'bg-amber hover:bg-amber-light text-white',
}

const SIZE_STYLES: Record<string, string> = {
  sm: 'h-8 px-3 text-xs rounded-md gap-1.5',
  md: 'h-10 px-4 text-sm rounded-lg gap-2',
  lg: 'h-11 px-6 text-sm rounded-lg gap-2',
}

export default function Button({
  variant = 'primary',
  size = 'md',
  loading,
  fullWidth,
  children,
  disabled,
  className = '',
  ...props
}: ButtonProps) {
  return (
    <button
      className={`
        inline-flex items-center justify-center font-medium font-body transition-all duration-200
        ${VARIANT_STYLES[variant]}
        ${SIZE_STYLES[size]}
        ${fullWidth ? 'w-full' : ''}
        ${disabled || loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer active:scale-[0.98]'}
        ${className}
      `}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg className="animate-spin h-4 w-4 flex-shrink-0" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      )}
      {children}
    </button>
  )
}
