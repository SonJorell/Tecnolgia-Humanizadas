import React, { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import StatCard from '../../components/ui/StatCard'
import Card from '../../components/ui/Card'
import ProgressBar from '../../components/ui/ProgressBar'
import { Users, BookOpen, Upload, TrendingUp } from 'lucide-react'

export default function ResumenDirectivo() {
  const [stats, setStats] = useState({ alumnos: 0, docentes: 0, materiales: 0, promGlobal: 0 })
  const [cursos, setCursos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadData() }, [])

  async function loadData() {
    const [alRes, docRes, matRes, cursosRes, inscRes] = await Promise.all([
      supabase.from('perfiles').select('id', { count: 'exact' }).eq('rol', 'alumno'),
      supabase.from('perfiles').select('id', { count: 'exact' }).eq('rol', 'docente'),
      supabase.from('materiales').select('id', { count: 'exact' }).eq('publicado', true),
      supabase.from('cursos').select('*, docente:perfiles(nombre)'),
      supabase.from('inscripciones').select('curso_id, progreso')
    ])

    const inscs = inscRes.data || []
    const allProgs = inscs.map((i: any) => i.progreso)
    const globalAvg = allProgs.length > 0 ? Math.round(allProgs.reduce((a: number, b: number) => a + b, 0) / allProgs.length) : 0

    setStats({ alumnos: alRes.count || 0, docentes: docRes.count || 0, materiales: matRes.count || 0, promGlobal: globalAvg })

    const cursosList = (cursosRes.data || []).map((c: any) => {
      const ci = inscs.filter((i: any) => i.curso_id === c.id)
      const avg = ci.length > 0 ? Math.round(ci.reduce((a: number, b: any) => a + b.progreso, 0) / ci.length) : 0
      return { ...c, alumnosInscritos: ci.length, progresoPromedio: avg }
    })
    setCursos(cursosList)
    setLoading(false)
  }

  return (
    <div className="p-4 md:p-6 space-y-6 animate-fade-in">
      <h1 className="font-display font-extrabold text-2xl text-text dark:text-dark-text">🏫 Resumen General</h1>

      <div className="stats-row grid grid-cols-1 gap-4">
        <StatCard icon={<Users size={20} className="text-primary" />} label="Alumnos totales" value={loading ? '—' : stats.alumnos} iconBg="bg-primary-bg" />
        <StatCard icon={<BookOpen size={20} className="text-mint" />} label="Docentes activos" value={loading ? '—' : stats.docentes} iconBg="bg-mint-bg" />
        <StatCard icon={<Upload size={20} className="text-violet" />} label="Materiales publicados" value={loading ? '—' : stats.materiales} iconBg="bg-violet-bg" />
        <StatCard icon={<TrendingUp size={20} className="text-amber" />} label="Promedio global" value={loading ? '—' : `${stats.promGlobal}%`} iconBg="bg-amber-bg" />
      </div>

      <h2 className="font-display font-bold text-lg text-text dark:text-dark-text">Cursos</h2>
      <div className="bg-card dark:bg-dark-card rounded-xl shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border dark:border-white/10">
                <th className="text-left p-3 font-medium text-text-muted text-xs">Curso</th>
                <th className="text-left p-3 font-medium text-text-muted text-xs">Docente</th>
                <th className="text-left p-3 font-medium text-text-muted text-xs">Alumnos</th>
                <th className="text-left p-3 font-medium text-text-muted text-xs w-32">Progreso</th>
              </tr>
            </thead>
            <tbody>
              {cursos.map(c => (
                <tr key={c.id} className="border-b border-border/50 dark:border-white/5">
                  <td className="p-3 font-medium text-text dark:text-dark-text">{c.icono} {c.nombre}</td>
                  <td className="p-3 text-text-muted">{c.docente?.nombre || '—'}</td>
                  <td className="p-3 text-text-muted">{c.alumnosInscritos}</td>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <ProgressBar value={c.progresoPromedio} className="w-20" />
                      <span className="text-xs text-text-muted">{c.progresoPromedio}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
