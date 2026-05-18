import React, { useEffect, useState } from 'react'
import { useAuthStore } from '../../stores/authStore'
import { supabase } from '../../lib/supabase'
import Card from '../../components/ui/Card'
import { Bar, Doughnut } from 'react-chartjs-2'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend } from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend)

export default function DashboardDocente() {
  const perfil = useAuthStore((s) => s.perfil)
  const [progresoPorCurso, setProgreso] = useState<{ nombre: string; avg: number }[]>([])
  const [notasDist, setNotasDist] = useState([0, 0, 0])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!perfil) return
    loadData()
  }, [perfil])

  async function loadData() {
    const { data: cursos } = await supabase.from('cursos').select('id, nombre').eq('docente_id', perfil!.id)
    if (!cursos?.length) { setLoading(false); return }

    const progs: { nombre: string; avg: number }[] = []
    for (const c of cursos) {
      const { data } = await supabase.from('inscripciones').select('progreso').eq('curso_id', c.id)
      const vals = (data || []).map((d: any) => d.progreso)
      const avg = vals.length > 0 ? Math.round(vals.reduce((a: number, b: number) => a + b, 0) / vals.length) : 0
      progs.push({ nombre: c.nombre, avg })
    }
    setProgreso(progs)

    // Grade distribution
    const { data: entregas } = await supabase.from('entregas').select('calificacion, material:materiales(curso_id)')
    const misEntregas = (entregas || []).filter((e: any) => cursos.some(c => c.id === e.material?.curso_id))
    const dist = [0, 0, 0]
    misEntregas.forEach((e: any) => {
      if (!e.calificacion) return
      if (e.calificacion < 4) dist[0]++
      else if (e.calificacion < 5.5) dist[1]++
      else dist[2]++
    })
    setNotasDist(dist)
    setLoading(false)
  }

  const barData = {
    labels: progresoPorCurso.map(p => p.nombre),
    datasets: [{
      label: 'Progreso promedio %',
      data: progresoPorCurso.map(p => p.avg),
      backgroundColor: ['#1a6fa8', '#6c5ce7', '#2db88a', '#e8a020'],
      borderRadius: 8,
    }]
  }

  const doughnutData = {
    labels: ['1.0 - 3.9', '4.0 - 5.4', '5.5 - 7.0'],
    datasets: [{
      data: notasDist,
      backgroundColor: ['#e05050', '#e8a020', '#2db88a'],
      borderWidth: 0,
    }]
  }

  return (
    <div className="p-4 md:p-6 space-y-6 animate-fade-in">
      <h1 className="font-display font-extrabold text-2xl text-text dark:text-dark-text">📊 Dashboard</h1>

      {loading ? (
        <div className="space-y-4">
          <div className="skeleton h-64 w-full" />
          <div className="skeleton h-64 w-full" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <h3 className="font-display font-bold text-sm text-text dark:text-dark-text mb-4">Progreso por curso</h3>
            <Bar data={barData} options={{
              responsive: true,
              plugins: { legend: { display: false } },
              scales: { y: { max: 100, ticks: { callback: (v: any) => `${v}%` } } }
            }} />
          </Card>

          <Card>
            <h3 className="font-display font-bold text-sm text-text dark:text-dark-text mb-4">Distribución de notas</h3>
            <Doughnut data={doughnutData} options={{
              responsive: true,
              plugins: { legend: { position: 'bottom' } }
            }} />
          </Card>
        </div>
      )}
    </div>
  )
}
