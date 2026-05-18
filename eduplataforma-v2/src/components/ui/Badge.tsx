import React from 'react'

interface BadgeProps {
  children: React.ReactNode
  variant?: 'primary' | 'mint' | 'amber' | 'violet' | 'danger' | 'neutral'
  size?: 'sm' | 'md'
}

const VARIANTS: Record<string, string> = {
  primary: 'bg-primary-bg text-primary dark:bg-primary/20',
  mint:    'bg-mint-bg text-mint dark:bg-mint/20',
  amber:   'bg-amber-bg text-amber dark:bg-amber/20',
  violet:  'bg-violet-bg text-violet dark:bg-violet/20',
  danger:  'bg-danger-bg text-danger dark:bg-danger/20',
  neutral: 'bg-surface dark:bg-dark-card2 text-text-muted dark:text-dark-muted'
}

export default function Badge({ children, variant = 'primary', size = 'sm' }: BadgeProps) {
  return (
    <span className={`
      inline-flex items-center font-medium font-body rounded-full
      ${VARIANTS[variant]}
      ${size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-sm px-3 py-1'}
    `}>
      {children}
    </span>
  )
}
