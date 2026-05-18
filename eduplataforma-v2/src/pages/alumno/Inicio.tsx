import React, { useEffect, useState } from 'react'
import { useAuthStore } from '../../stores/authStore'
import { useAppStore } from '../../stores/appStore'
import { useSyncStore } from '../../stores/syncStore'
import { supabase } from '../../lib/supabase'
import StatCard from '../../components/ui/StatCard'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import { BookOpen, ClipboardList, Trophy, Coins, AlertTriangle, Clock } from 'lucide-react'
import type { Material } from '../../types/database'

export default function InicioAlumno() {
  const perfil = useAuthStore((s) => s.perfil)
  const conexion = useAppStore((s) => s.conexion)
  const pendientes = useSyncStore((s) => s.pendientes)

  const [stats, setStats] = useState({ cursos: 0, tareas: 0, logros: 0 })
  const [materialesNuevos, setMatNuevos] = useState<Material[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!perfil || conexion !== 'ONLINE_SUPABASE') {
      setLoading(false)
      return
    }
    loadStats()
  }, [perfil, conexion])

  async function loadStats() {
    try {
      const [inscRes, entregaRes, logrosRes, matRes] = await Promise.all([
        supabase.from('inscripciones').select('id', { count: 'exact' }).eq('alumno_id', perfil!.id),
        supabase.from('entregas').select('id', { count: 'exact' }).eq('alumno_id', perfil!.id).eq('estado', 'pendiente'),
        supabase.from('logros_alumno').select('id', { count: 'exact' }).eq('alumno_id', perfil!.id),
        supabase.from('materiales').select('*').eq('publicado', true).order('creado_en', { ascending: false }).limit(3)
      ])

      setStats({
        cursos: inscRes.count || 0,
        tareas: entregaRes.count || 0,
        logros: logrosRes.count || 0,
      })
      setMatNuevos(matRes.data as Material[] || [])
    } catch (err) {
      console.error('[Inicio] Error loading stats:', err)
    } finally {
      setLoading(false)
    }
  }

  if (!perfil) return null

  return (
    <div className="p-4 md:p-6 space-y-6 animate-fade-in">
      {/* Welcome */}
      <div>
        <h1 className="font-display font-extrabold text-2xl text-text dark:text-dark-text">
          ¡Hola, {perfil.nombre.split(' ')[0]}! 👋
        </h1>
        <p className="text-sm text-text-muted dark:text-dark-muted mt-1">
          Revisa tu progreso y tareas pendientes
        </p>
      </div>

      {/* Sync warning banner */}
      {pendientes > 0 && (
        <div className="flex items-center gap-3 bg-amber-bg dark:bg-amber/10 text-amber px-4 py-3 rounded-xl animate-slide-up">
          <AlertTriangle size={18} />
          <span className="text-sm font-medium">
            {pendientes} elemento{pendientes > 1 ? 's' : ''} pendiente{pendientes > 1 ? 's' : ''} de sincronizar
          </span>
        </div>
      )}

      {/* Stats */}
      <div className="stats-row grid grid-cols-1 gap-4">
        <StatCard
          icon={<BookOpen size={20} className="text-primary" />}
          label="Cursos activos"
          value={loading ? '—' : stats.cursos}
          iconBg="bg-primary-bg"
        />
        <StatCard
          icon={<ClipboardList size={20} className="text-amber" />}
          label="Tareas pendientes"
          value={loading ? '—' : stats.tareas}
          iconBg="bg-amber-bg"
          subtitle={stats.tareas > 0 ? 'Revísalas' : undefined}
        />
        <StatCard
          icon={<Trophy size={20} className="text-mint" />}
          label="Logros ganados"
          value={loading ? '—' : stats.logros}
          iconBg="bg-mint-bg"
        />
        <StatCard
          icon={<Coins size={20} className="text-amber" />}
          label="Monedas"
          value={perfil.monedas}
          iconBg="bg-amber-bg"
          subtitle="Canjea en la tienda"
        />
      </div>

      {/* New materials */}
      {materialesNuevos.length > 0 && (
        <div>
          <h2 className="font-display font-bold text-lg text-text dark:text-dark-text mb-3">
            📚 Material nuevo
          </h2>
          <div className="space-y-2">
            {materialesNuevos.map((mat) => (
              <Card key={mat.id} hover className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary-bg rounded-lg flex items-center justify-center text-lg flex-shrink-0">
                  {mat.tipo === 'guia' ? '📖' : mat.tipo === 'tarea' ? '📝' : mat.tipo === 'evaluacion' ? '📋' : '📁'}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-sm text-text dark:text-dark-text truncate">{mat.titulo}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <Badge variant={mat.tipo === 'tarea' ? 'amber' : 'primary'} size="sm">{mat.tipo}</Badge>
                    {mat.disponible_offline && <Badge variant="neutral" size="sm">📶 Offline</Badge>}
                  </div>
                </div>
                {mat.fecha_entrega && (
                  <div className="flex items-center gap-1 text-xs text-text-muted flex-shrink-0">
                    <Clock size={12} />
                    {new Date(mat.fecha_entrega).toLocaleDateString('es-CL')}
                  </div>
                )}
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
