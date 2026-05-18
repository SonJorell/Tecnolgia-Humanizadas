import React from 'react'

interface StatCardProps {
  icon: React.ReactNode
  label: string
  value: string | number
  subtitle?: string
  iconBg?: string
}

export default function StatCard({ icon, label, value, subtitle, iconBg = 'bg-primary-bg' }: StatCardProps) {
  return (
    <div className="p-5 bg-card dark:bg-dark-card rounded-lg shadow-card card-hover">
      <div className={`w-10 h-10 ${iconBg} rounded-lg flex items-center justify-center mb-3`}>
        {icon}
      </div>
      <p className="font-display font-extrabold text-2xl text-text dark:text-dark-text">{value}</p>
      <p className="text-xs text-text-muted dark:text-dark-muted mt-1">{label}</p>
      {subtitle && (
        <p className="text-xs text-mint mt-0.5 font-medium">{subtitle}</p>
      )}
    </div>
  )
}
