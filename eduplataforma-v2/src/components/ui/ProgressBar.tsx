import React from 'react'

interface ProgressBarProps {
  value: number
  max?: number
  size?: 'sm' | 'md' | 'lg'
  gradient?: boolean
  className?: string
}

export default function ProgressBar({ value, max = 100, size = 'sm', gradient = true, className = '' }: ProgressBarProps) {
  const pct = Math.min((value / max) * 100, 100)

  const heightClass = size === 'sm' ? 'h-1.5' : size === 'md' ? 'h-2' : 'h-3'

  return (
    <div className={`${heightClass} bg-surface dark:bg-dark-card2 rounded-full overflow-hidden ${className}`}>
      <div
        className={`h-full rounded-full progress-fill ${
          gradient
            ? 'bg-gradient-to-r from-primary to-mint'
            : 'bg-primary'
        }`}
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}
