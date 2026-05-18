import React, { useEffect, useState } from 'react'
import { useAuthStore } from '../../stores/authStore'
import { supabase } from '../../lib/supabase'
import LogroCard from '../../components/gamification/LogroCard'
import confetti from 'canvas-confetti'
import type { Logro, LogroAlumno } from '../../types/database'

export default function LogrosAlumno() {
  const perfil = useAuthStore((s) => s.perfil)
  const [logros, setLogros] = useState<Logro[]>([])
  const [desbloqueados, setDesbloqueados] = useState<LogroAlumno[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!perfil) return
    loadLogros()
  }, [perfil])

  async function loadLogros() {
    const [logrosRes, desbloqRes] = await Promise.all([
      supabase.from('logros').select('*'),
      supabase.from('logros_alumno').select('*').eq('alumno_id', perfil!.id)
    ])
    setLogros((logrosRes.data || []) as Logro[])
    setDesbloqueados((desbloqRes.data || []) as LogroAlumno[])
    setLoading(false)
  }

  const desbloqIds = new Set(desbloqueados.map(d => d.logro_id))

  function handleClick(logro: Logro) {
    confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } })
  }

  return (
    <div className="p-4 md:p-6 space-y-6 animate-fade-in">
      <div>
        <h1 className="font-display font-extrabold text-2xl text-text dark:text-dark-text">🏆 Logros</h1>
        <p className="text-sm text-text-muted mt-1">
          {desbloqueados.length} de {logros.length} desbloqueados
        </p>
      </div>
      {loading ? (
        <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
          {[...Array(8)].map((_, i) => <div key={i} className="skeleton h-32" />)}
        </div>
      ) : (
        <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
          {logros.map(logro => {
            const desb = desbloqueados.find(d => d.logro_id === logro.id)
            return (
              <LogroCard
                key={logro.id}
                nombre={logro.nombre}
                descripcion={logro.descripcion}
                icono={logro.icono}
                desbloqueado={desbloqIds.has(logro.id)}
                fecha={desb?.desbloqueado}
                onClick={() => handleClick(logro)}
              />
            )
          })}
        </div>
      )}
    </div>
  )
}
