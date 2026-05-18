import React from 'react'

interface CardProps {
  children: React.ReactNode
  className?: string
  hover?: boolean
  borderColor?: string
  onClick?: () => void
}

export default function Card({ children, className = '', hover = false, borderColor, onClick }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={`
        bg-card dark:bg-dark-card rounded-lg shadow-card p-5
        ${hover ? 'card-hover cursor-pointer' : ''}
        ${borderColor ? `border-l-4 ${borderColor}` : ''}
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  )
}
