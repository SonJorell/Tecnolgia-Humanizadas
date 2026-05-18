import React, { useEffect, useState } from 'react'
import { useAuthStore } from '../../stores/authStore'
import { useAppStore } from '../../stores/appStore'
import { supabase } from '../../lib/supabase'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import ProgressBar from '../../components/ui/ProgressBar'

interface CursoData {
  id: string; nombre: string; descripcion?: string; icono?: string; color?: string; nivel?: string
}
interface InscripcionData {
  id: string; alumno_id: string; curso_id: string; progreso: number; curso: CursoData
}

export default function CursosAlumno() {
  const perfil = useAuthStore((s) => s.perfil)
  const conexion = useAppStore((s) => s.conexion)
  const [inscripciones, setInscripciones] = useState<InscripcionData[]>([])
  const [selectedCurso, setSelectedCurso] = useState<string | null>(null)
  const [materiales, setMateriales] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!perfil || conexion !== 'ONLINE_SUPABASE') { setLoading(false); return }
    loadCursos()
  }, [perfil, conexion])

  async function loadCursos() {
    const { data } = await supabase.from('inscripciones').select('*, curso:cursos(*)').eq('alumno_id', perfil!.id)
    setInscripciones((data || []) as any)
    setLoading(false)
  }

  async function loadMateriales(cursoId: string) {
    setSelectedCurso(cursoId)
    const { data } = await supabase.from('materiales').select('*').eq('curso_id', cursoId).eq('publicado', true).order('creado_en', { ascending: false })
    setMateriales(data || [])
  }

  if (selectedCurso) {
    const curso = inscripciones.find(i => i.curso_id === selectedCurso)?.curso
    return (
      <div className="p-4 md:p-6 space-y-4 animate-fade-in">
        <button onClick={() => setSelectedCurso(null)} className="text-sm text-primary hover:underline font-medium">← Volver a cursos</button>
        <h1 className="font-display font-extrabold text-xl text-text dark:text-dark-text">{curso?.icono} {curso?.nombre}</h1>
        {materiales.length === 0 ? (
          <p className="text-sm text-text-muted py-8 text-center">No hay materiales disponibles aún</p>
        ) : (
          <div className="space-y-2">
            {materiales.map((mat: any) => (
              <Card key={mat.id} hover className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary-bg dark:bg-primary/20 rounded-lg flex items-center justify-center text-lg flex-shrink-0">
                  {mat.tipo === 'guia' ? '📖' : mat.tipo === 'tarea' ? '📝' : mat.tipo === 'evaluacion' ? '📋' : '📁'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-text dark:text-dark-text truncate">{mat.titulo}</p>
                  <Badge variant={mat.tipo === 'tarea' ? 'amber' : 'primary'} size="sm">{mat.tipo}</Badge>
                </div>
                {mat.archivo_url && (
                  <button className="text-xs bg-primary text-white px-3 py-1.5 rounded-lg hover:bg-primary-light transition-colors">Ver</button>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="p-4 md:p-6 space-y-6 animate-fade-in">
      <h1 className="font-display font-extrabold text-2xl text-text dark:text-dark-text">📚 Mis Cursos</h1>
      {loading ? (
        <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="skeleton h-24 w-full" />)}</div>
      ) : inscripciones.length === 0 ? (
        <p className="text-sm text-text-muted py-8 text-center">No estás inscrito en ningún curso aún</p>
      ) : (
        <div className="cursos-grid grid grid-cols-1 gap-4">
          {inscripciones.map(insc => {
            const curso = insc.curso
            return (
              <Card key={insc.id} hover onClick={() => loadMateriales(insc.curso_id)} className="cursor-pointer" borderColor={`border-l-[${curso?.color || '#1a6fa8'}]`}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{curso?.icono || '📘'}</span>
                    <div>
                      <h3 className="font-display font-bold text-text dark:text-dark-text">{curso?.nombre}</h3>
                      <p className="text-xs text-text-muted">{curso?.descripcion}</p>
                    </div>
                  </div>
                  <Badge variant="neutral" size="sm">{curso?.nivel}</Badge>
                </div>
                <ProgressBar value={insc.progreso} />
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs text-text-muted">{insc.progreso}% completado</span>
                  <Badge variant="neutral" size="sm">📶 Offline</Badge>
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
