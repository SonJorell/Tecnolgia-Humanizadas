import React from 'react'
import type { Premio } from '../../types/database'

interface CanjeCardProps {
  premio: Premio
  monedas: number
  onCanjear: (premio: Premio) => void
}

const CATEGORY_COLORS: Record<string, string> = {
  escolar:    'from-primary to-primary-light',
  recreativo: 'from-mint to-mint-light',
  educativo:  'from-violet to-violet-light',
  digital:    'from-amber to-amber-light',
  especial:   'from-danger to-danger',
}

export default function CanjeCard({ premio, monedas, onCanjear }: CanjeCardProps) {
  const canAfford = monedas >= premio.precio_monedas
  const gradientClass = CATEGORY_COLORS[premio.categoria || 'escolar'] || CATEGORY_COLORS.escolar

  return (
    <div className="bg-card dark:bg-dark-card rounded-xl shadow-card overflow-hidden card-hover">
      {/* Color banner */}
      <div className={`h-2 bg-gradient-to-r ${gradientClass}`} />

      <div className="p-4">
        <div className="text-3xl mb-2">{premio.icono || '🎁'}</div>
        <h3 className="font-display font-bold text-sm text-text dark:text-dark-text">{premio.nombre}</h3>
        {premio.descripcion && (
          <p className="text-xs text-text-muted dark:text-dark-muted mt-1">{premio.descripcion}</p>
        )}
        <div className="flex items-center justify-between mt-3">
          <span className="font-display font-bold text-amber">🪙 {premio.precio_monedas}</span>
          <button
            onClick={() => onCanjear(premio)}
            disabled={!canAfford}
            className={`
              text-xs font-medium px-3 py-1.5 rounded-lg transition-all
              ${canAfford
                ? 'bg-amber text-white hover:bg-amber-light active:scale-95'
                : 'bg-surface dark:bg-dark-card2 text-text-light cursor-not-allowed'
              }
            `}
          >
            {canAfford ? 'Canjear' : 'Sin fondos'}
          </button>
        </div>
      </div>
    </div>
  )
}
