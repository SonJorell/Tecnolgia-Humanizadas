import React, { useEffect, useState } from 'react'
import { useAuthStore } from '../../stores/authStore'
import { supabase } from '../../lib/supabase'
import StatCard from '../../components/ui/StatCard'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import { Users, ClipboardList, Upload, TrendingUp, AlertTriangle } from 'lucide-react'

export default function PanelDocente() {
  const perfil = useAuthStore((s) => s.perfil)
  const [stats, setStats] = useState({ alumnos: 0, porRevisar: 0, materiales: 0, progPromedio: 0 })
  const [alertas, setAlertas] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!perfil) return
    loadStats()
  }, [perfil])

  async function loadStats() {
    try {
      const [cursosRes, matsRes, entregasRes] = await Promise.all([
        supabase.from('cursos').select('id').eq('docente_id', perfil!.id),
        supabase.from('materiales').select('id', { count: 'exact' }).eq('docente_id', perfil!.id),
        supabase.from('entregas').select('*, material:materiales(curso_id)').eq('estado', 'entregado')
      ])

      const cursoIds = (cursosRes.data || []).map((c: any) => c.id)
      const misEntregas = (entregasRes.data || []).filter((e: any) => cursoIds.includes(e.material?.curso_id))

      // Count unique students in inscriptions
      const inscRes = await supabase.from('inscripciones').select('alumno_id').in('curso_id', cursoIds)
      const uniqueAlumnos = new Set((inscRes.data || []).map((i: any) => i.alumno_id))

      // Average progress
      const progRes = await supabase.from('inscripciones').select('progreso').in('curso_id', cursoIds)
      const progs = (progRes.data || []).map((p: any) => p.progreso)
      const avg = progs.length > 0 ? Math.round(progs.reduce((a: number, b: number) => a + b, 0) / progs.length) : 0

      setStats({
        alumnos: uniqueAlumnos.size,
        porRevisar: misEntregas.length,
        materiales: matsRes.count || 0,
        progPromedio: avg
      })

      // Alerts
      const als: string[] = []
      if (misEntregas.length > 5) als.push(`${misEntregas.length} entregas pendientes de revisión`)
      if (avg < 30) als.push('Progreso promedio bajo (<30%)')
      setAlertas(als)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-4 md:p-6 space-y-6 animate-fade-in">
      <h1 className="font-display font-extrabold text-2xl text-text dark:text-dark-text">
        Panel Docente 📋
      </h1>

      {/* Alerts */}
      {alertas.map((a, i) => (
        <div key={i} className="flex items-center gap-3 bg-amber-bg dark:bg-amber/10 text-amber px-4 py-3 rounded-xl">
          <AlertTriangle size={18} />
          <span className="text-sm font-medium">{a}</span>
        </div>
      ))}

      {/* Stats */}
      <div className="stats-row grid grid-cols-1 gap-4">
        <StatCard icon={<Users size={20} className="text-primary" />} label="Alumnos activos" value={loading ? '—' : stats.alumnos} iconBg="bg-primary-bg" />
        <StatCard icon={<ClipboardList size={20} className="text-amber" />} label="Tareas por revisar" value={loading ? '—' : stats.porRevisar} iconBg="bg-amber-bg" subtitle={stats.porRevisar > 0 ? 'Revisar ahora' : undefined} />
        <StatCard icon={<Upload size={20} className="text-mint" />} label="Materiales subidos" value={loading ? '—' : stats.materiales} iconBg="bg-mint-bg" />
        <StatCard icon={<TrendingUp size={20} className="text-violet" />} label="Progreso promedio" value={loading ? '—' : `${stats.progPromedio}%`} iconBg="bg-violet-bg" />
      </div>
    </div>
  )
}
