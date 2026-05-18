import React, { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import type { Feedback } from '../../types/database'

const EMOJIS = ['', '😞', '😕', '😐', '🙂', '🤩']

export default function ReportesDocente() {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([])
  const [filtro, setFiltro] = useState<'todos'|'bajo'|'alto'|'pendiente'|'resuelto'>('todos')
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadFeedback() }, [])

  async function loadFeedback() {
    const { data } = await supabase.from('feedback').select('*, autor:perfiles(nombre)').order('creado_en', { ascending: false })
    setFeedbacks((data || []) as any)
    setLoading(false)
  }

  async function marcarResuelto(id: string) {
    await supabase.from('feedback').update({ resuelto: true }).eq('id', id)
    setFeedbacks(prev => prev.map(f => f.id === id ? { ...f, resuelto: true } : f))
  }

  const filtered = feedbacks.filter(f => {
    if (filtro === 'bajo') return f.rating <= 3
    if (filtro === 'alto') return f.rating >= 4
    if (filtro === 'pendiente') return !f.resuelto
    if (filtro === 'resuelto') return f.resuelto
    return true
  })

  return (
    <div className="p-4 md:p-6 space-y-6 animate-fade-in">
      <h1 className="font-display font-extrabold text-2xl text-text dark:text-dark-text">📋 Reportes de Feedback</h1>

      <div className="flex gap-2 flex-wrap">
        {(['todos','bajo','alto','pendiente','resuelto'] as const).map(f => (
          <button key={f} onClick={() => setFiltro(f)}
            className={`text-xs font-medium px-3 py-1.5 rounded-full transition-colors ${filtro === f ? 'bg-primary text-white' : 'bg-surface dark:bg-dark-card2 text-text-muted'}`}>
            {f === 'todos' ? 'Todos' : f === 'bajo' ? '≤3 ⭐' : f === 'alto' ? '≥4 ⭐' : f === 'pendiente' ? 'Pendientes' : 'Resueltos'}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="skeleton h-20 w-full" />)}</div>
      ) : filtered.length === 0 ? (
        <p className="text-sm text-text-muted text-center py-8">No hay feedbacks</p>
      ) : (
        <div className="space-y-3">
          {filtered.map(fb => (
            <Card key={fb.id}>
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xl">{EMOJIS[fb.rating]}</span>
                    <span className="font-medium text-sm text-text dark:text-dark-text">{(fb as any).autor?.nombre || 'Anónimo'}</span>
                    <Badge variant={fb.resuelto ? 'mint' : 'amber'} size="sm">{fb.resuelto ? 'Resuelto' : 'Pendiente'}</Badge>
                  </div>
                  <div className="flex gap-1.5 mb-2">
                    {fb.categorias?.map(cat => (
                      <Badge key={cat} variant="neutral" size="sm">{cat}</Badge>
                    ))}
                  </div>
                  {fb.comentario && <p className="text-sm text-text-muted">{fb.comentario}</p>}
                  <p className="text-xs text-text-light mt-2">{new Date(fb.creado_en!).toLocaleString('es-CL')}</p>
                </div>
                {!fb.resuelto && (
                  <Button variant="ghost" size="sm" onClick={() => marcarResuelto(fb.id)}>
                    ✅ Resolver
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
