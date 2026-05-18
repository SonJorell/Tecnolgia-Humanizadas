import React, { useEffect, useState } from 'react'
import { useAuthStore } from '../../stores/authStore'
import { supabase } from '../../lib/supabase'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import { useAppStore } from '../../stores/appStore'
import { agregarACola, procesarColaSync } from '../../lib/sync'
import type { Material, Entrega } from '../../types/database'

export default function TareasAlumno() {
  const perfil = useAuthStore((s) => s.perfil)
  const conexion = useAppStore((s) => s.conexion)
  const addToast = useAppStore((s) => s.addToast)
  const [materiales, setMateriales] = useState<Material[]>([])
  const [entregas, setEntregas] = useState<Entrega[]>([])
  const [filtro, setFiltro] = useState<'pendiente'|'entregado'|'tardio'>('pendiente')
  const [expanded, setExpanded] = useState<string|null>(null)
  const [contenido, setContenido] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!perfil || conexion !== 'ONLINE_SUPABASE') { setLoading(false); return }
    loadData()
  }, [perfil, conexion])

  async function loadData() {
    const [matRes, entRes] = await Promise.all([
      supabase.from('materiales').select('*').in('tipo', ['tarea','evaluacion']).eq('publicado', true),
      supabase.from('entregas').select('*').eq('alumno_id', perfil!.id)
    ])
    setMateriales((matRes.data || []) as Material[])
    setEntregas((entRes.data || []) as Entrega[])
    setLoading(false)
  }

  const entregaMap = new Map(entregas.map(e => [e.material_id, e]))

  const filteredMats = materiales.filter(m => {
    const e = entregaMap.get(m.id)
    if (filtro === 'pendiente') return !e
    if (filtro === 'entregado') return e?.estado === 'entregado' || e?.estado === 'revisado'
    if (filtro === 'tardio') return e?.estado === 'tardio'
    return true
  })

  async function handleEntrega(materialId: string) {
    if (!contenido.trim()) return
    setSubmitting(true)
    const entrega = {
      id: crypto.randomUUID(),
      material_id: materialId,
      alumno_id: perfil!.id,
      contenido,
      estado: 'entregado',
      sincronizado: false,
      entregado_en: new Date().toISOString()
    }
    await agregarACola('entrega', entrega)
    if (conexion === 'ONLINE_SUPABASE') await procesarColaSync()
    setEntregas(prev => [...prev, entrega as any])
    setContenido('')
    setExpanded(null)
    setSubmitting(false)
    addToast({ tipo: 'xp', mensaje: '🌟 +50 XP · 🪙 +10 monedas por tu entrega' })
  }

  const FILTROS = [
    { key: 'pendiente', label: 'Pendientes', variant: 'amber' as const },
    { key: 'entregado', label: 'Entregadas', variant: 'mint' as const },
    { key: 'tardio', label: 'Vencidas', variant: 'danger' as const },
  ]

  return (
    <div className="p-4 md:p-6 space-y-6 animate-fade-in">
      <h1 className="font-display font-extrabold text-2xl text-text dark:text-dark-text">📝 Tareas</h1>
      <div className="flex gap-2">
        {FILTROS.map(f => (
          <button key={f.key} onClick={() => setFiltro(f.key as any)}
            className={`text-xs font-medium px-3 py-1.5 rounded-full transition-colors ${
              filtro === f.key ? `bg-${f.variant} text-white` : 'bg-surface dark:bg-dark-card2 text-text-muted'}`}>
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="skeleton h-20 w-full" />)}</div>
      ) : filteredMats.length === 0 ? (
        <p className="text-sm text-text-muted py-8 text-center">No hay tareas {filtro === 'pendiente' ? 'pendientes' : filtro === 'entregado' ? 'entregadas' : 'vencidas'}</p>
      ) : (
        <div className="space-y-3">
          {filteredMats.map(mat => {
            const entrega = entregaMap.get(mat.id)
            const isExpanded = expanded === mat.id
            return (
              <Card key={mat.id} className="overflow-hidden">
                <div className="flex items-center justify-between cursor-pointer" onClick={() => setExpanded(isExpanded ? null : mat.id)}>
                  <div>
                    <p className="font-medium text-sm text-text dark:text-dark-text">{mat.titulo}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant={entrega ? 'mint' : 'amber'} size="sm">{entrega ? entrega.estado : 'pendiente'}</Badge>
                      {mat.xp_premio > 0 && <Badge variant="primary" size="sm">+{mat.xp_premio} XP</Badge>}
                    </div>
                  </div>
                  <span className="text-text-light text-lg">{isExpanded ? '▲' : '▼'}</span>
                </div>
                {isExpanded && !entrega && (
                  <div className="mt-4 pt-4 border-t border-border dark:border-white/10 animate-slide-up">
                    {mat.descripcion && <p className="text-xs text-text-muted mb-3">{mat.descripcion}</p>}
                    <textarea value={contenido} onChange={e => setContenido(e.target.value)}
                      placeholder="Escribe tu respuesta aquí..."
                      className="w-full h-24 p-3 rounded-lg bg-surface dark:bg-dark-card2 border border-border dark:border-white/10 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/30" />
                    <Button onClick={() => handleEntrega(mat.id)} loading={submitting} className="mt-2" size="sm">
                      Entregar
                    </Button>
                  </div>
                )}
                {isExpanded && entrega && (
                  <div className="mt-4 pt-4 border-t border-border dark:border-white/10 animate-slide-up">
                    <p className="text-xs text-text-muted">Entregado: {new Date(entrega.entregado_en!).toLocaleString('es-CL')}</p>
                    {entrega.calificacion && <p className="text-sm font-bold text-mint mt-1">Nota: {entrega.calificacion}</p>}
                    {entrega.comentario && <p className="text-xs text-text-muted mt-1">💬 {entrega.comentario}</p>}
                  </div>
                )}
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
