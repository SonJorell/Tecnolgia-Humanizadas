import React from 'react'

interface LogroCardProps {
  nombre: string
  descripcion?: string
  icono?: string
  desbloqueado: boolean
  fecha?: string
  onClick?: () => void
}

export default function LogroCard({ nombre, descripcion, icono, desbloqueado, fecha, onClick }: LogroCardProps) {
  return (
    <div
      onClick={desbloqueado ? onClick : undefined}
      className={`
        relative p-4 rounded-xl text-center transition-all duration-300
        ${desbloqueado
          ? 'bg-amber-bg dark:bg-amber/10 cursor-pointer hover:shadow-hover hover:scale-[1.02] active:scale-[0.98]'
          : 'bg-surface dark:bg-dark-card2 grayscale opacity-50 cursor-default'
        }
      `}
    >
      <div className="text-4xl mb-2">{icono || '🏆'}</div>
      <p className="font-display font-bold text-sm text-text dark:text-dark-text">{nombre}</p>
      {descripcion && (
        <p className="text-xs text-text-muted dark:text-dark-muted mt-1">{descripcion}</p>
      )}
      {desbloqueado && fecha && (
        <p className="text-[10px] text-amber mt-2 font-medium">
          ✨ {new Date(fecha).toLocaleDateString('es-CL')}
        </p>
      )}
      {!desbloqueado && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-3xl opacity-30">🔒</span>
        </div>
      )}
    </div>
  )
}
