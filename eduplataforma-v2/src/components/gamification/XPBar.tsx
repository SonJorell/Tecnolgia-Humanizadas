import React from 'react'

interface XPBarProps {
  xp: number
  nivel: number
  monedas: number
}

const XP_LEVELS = [
  { min: 0, max: 100, label: 'Novato' },
  { min: 100, max: 250, label: 'Aprendiz' },
  { min: 250, max: 500, label: 'Dedicado' },
  { min: 500, max: 800, label: 'Avanzado' },
  { min: 800, max: 1200, label: 'Experto' },
  { min: 1200, max: 2000, label: 'Maestro' },
]

export default function XPBar({ xp, nivel, monedas }: XPBarProps) {
  const level = XP_LEVELS[Math.min(nivel - 1, XP_LEVELS.length - 1)] || XP_LEVELS[0]
  const pct = Math.min(((xp - level.min) / (level.max - level.min)) * 100, 100)

  return (
    <div className="bg-gradient-to-br from-primary to-primary-light rounded-xl p-4">
      <p className="text-xs font-bold uppercase tracking-wider text-white/75">
        🌟 Nivel {nivel} — {level.label}
      </p>
      <p className="text-sm font-semibold text-white mt-1 mb-2">{xp} / {level.max} XP</p>
      <div className="h-2 bg-white/20 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-amber to-amber-light rounded-full progress-fill"
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="text-white font-semibold text-sm mt-2">🪙 {monedas} monedas</p>
    </div>
  )
}
