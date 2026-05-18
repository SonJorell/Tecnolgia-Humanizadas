import React, { useEffect, useState } from 'react'
import { useAuthStore } from '../../stores/authStore'
import { supabase } from '../../lib/supabase'
import ProgressBar from '../../components/ui/ProgressBar'
import Badge from '../../components/ui/Badge'

interface AlumnoRow {
  id: string; nombre: string; progreso: number; xp: number; curso_nombre: string; actualizado?: string
}

export default function AlumnosDocente() {
  const perfil = useAuthStore((s) => s.perfil)
  const [alumnos, setAlumnos] = useState<AlumnoRow[]>([])
  const [filtro, setFiltro] = useState<'todos'|'activo'|'bajo'>('todos')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!perfil) return
    loadAlumnos()
  }, [perfil])

  async function loadAlumnos() {
    const { data: cursos } = await supabase.from('cursos').select('id, nombre').eq('docente_id', perfil!.id)
    if (!cursos?.length) { setLoading(false); return }
    const cursoIds = cursos.map(c => c.id)
    const cursoMap = Object.fromEntries(cursos.map(c => [c.id, c.nombre]))

    const { data: inscs } = await supabase.from('inscripciones').select('*, perfil:perfiles(*)').in('curso_id', cursoIds)
    const rows = (inscs || []).map((i: any) => ({
      id: i.perfil?.id || i.alumno_id,
      nombre: i.perfil?.nombre || 'Alumno',
      progreso: i.progreso || 0,
      xp: i.perfil?.xp || 0,
      curso_nombre: cursoMap[i.curso_id] || '',
      actualizado: i.perfil?.actualizado
    }))
    setAlumnos(rows)
    setLoading(false)
  }

  const filtered = alumnos.filter(a => {
    if (filtro === 'activo') return a.progreso >= 50
    if (filtro === 'bajo') return a.progreso < 50
    return true
  })

  return (
    <div className="p-4 md:p-6 space-y-6 animate-fade-in">
      <h1 className="font-display font-extrabold text-2xl text-text dark:text-dark-text">👥 Alumnos</h1>
      <div className="flex gap-2">
        {(['todos','activo','bajo'] as const).map(f => (
          <button key={f} onClick={() => setFiltro(f)}
            className={`text-xs font-medium px-3 py-1.5 rounded-full transition-colors ${filtro === f ? 'bg-primary text-white' : 'bg-surface dark:bg-dark-card2 text-text-muted'}`}>
            {f === 'todos' ? 'Todos' : f === 'activo' ? 'Activos (≥50%)' : 'Bajo (<50%)'}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-2">{[1,2,3].map(i => <div key={i} className="skeleton h-16 w-full" />)}</div>
      ) : (
        <div className="bg-card dark:bg-dark-card rounded-xl shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border dark:border-white/10">
                  <th className="text-left p-3 font-medium text-text-muted text-xs">Alumno</th>
                  <th className="text-left p-3 font-medium text-text-muted text-xs">Curso</th>
                  <th className="text-left p-3 font-medium text-text-muted text-xs w-24">Progreso</th>
                  <th className="text-left p-3 font-medium text-text-muted text-xs">Estado</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(a => (
                  <tr key={a.id + a.curso_nombre} className="border-b border-border/50 dark:border-white/5 hover:bg-surface dark:hover:bg-dark-card2 transition-colors">
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-mint flex items-center justify-center text-white text-xs font-bold">
                          {a.nombre.charAt(0)}
                        </div>
                        <span className="font-medium text-text dark:text-dark-text">{a.nombre}</span>
                      </div>
                    </td>
                    <td className="p-3 text-text-muted">{a.curso_nombre}</td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <ProgressBar value={a.progreso} className="w-20" />
                        <span className="text-xs text-text-muted">{a.progreso}%</span>
                      </div>
                    </td>
                    <td className="p-3">
                      <Badge variant={a.progreso >= 50 ? 'mint' : 'amber'} size="sm">
                        {a.progreso >= 50 ? 'Activo' : 'Bajo'}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
