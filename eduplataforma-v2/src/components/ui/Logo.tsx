import React from 'react'

export default function Logo({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-label="EduPlataforma">
      <rect x="4" y="8" width="24" height="18" rx="3" fill="#1a6fa8"/>
      <rect x="15" y="8" width="1.5" height="18" fill="white" opacity="0.4"/>
      <path d="M11 5 Q16 2 21 5" stroke="#2db88a" strokeWidth="2" strokeLinecap="round"/>
      <path d="M13.5 7 Q16 5.5 18.5 7" stroke="#2db88a" strokeWidth="1.5" strokeLinecap="round"/>
      <circle cx="16" cy="8.5" r="1" fill="#2db88a"/>
      <rect x="7"  y="14" width="6" height="1.5" rx="0.75" fill="white" opacity="0.7"/>
      <rect x="7"  y="17" width="5" height="1.5" rx="0.75" fill="white" opacity="0.5"/>
      <rect x="19" y="14" width="6" height="1.5" rx="0.75" fill="white" opacity="0.7"/>
      <rect x="19" y="17" width="4" height="1.5" rx="0.75" fill="white" opacity="0.5"/>
    </svg>
  )
}
