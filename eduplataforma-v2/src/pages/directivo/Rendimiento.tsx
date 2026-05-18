import React, { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import { Line } from 'react-chartjs-2'
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend)

export default function RendimientoDirectivo() {
  const [cursos, setCursos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadData() }, [])

  async function loadData() {
    const { data: cursosData } = await supabase.from('cursos').select('id, nombre, icono, color')
    if (!cursosData) { setLoading(false); return }

    const { data: entregas } = await supabase.from('entregas').select('calificacion, material:materiales(curso_id)').not('calificacion', 'is', null)

    const cursosStats = cursosData.map(c => {
      const ce = (entregas || []).filter((e: any) => e.material?.curso_id === c.id)
      const avg = ce.length > 0 ? (ce.reduce((a: number, e: any) => a + (e.calificacion || 0), 0) / ce.length).toFixed(1) : '—'
      return { ...c, promedio: avg, entregas: ce.length }
    })
    cursosStats.sort((a, b) => parseFloat(b.promedio) - parseFloat(a.promedio))
    setCursos(cursosStats)
    setLoading(false)
  }

  const lineData = {
    labels: ['Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov'],
    datasets: [{
      label: 'Promedio calificaciones',
      data: [4.2, 4.5, 4.3, 4.8, 5.0, 4.9, 5.2, 5.1, 5.3],
      borderColor: '#1a6fa8',
      backgroundColor: 'rgba(26,111,168,0.1)',
      fill: true,
      tension: 0.4,
      pointRadius: 4,
      pointBackgroundColor: '#1a6fa8',
    }]
  }

  const top3 = cursos.filter(c => c.promedio !== '—').slice(0, 3)
  const alertas = cursos.filter(c => parseFloat(c.promedio) > 0 && parseFloat(c.promedio) < 4.0)

  return (
    <div className="p-4 md:p-6 space-y-6 animate-fade-in">
      <h1 className="font-display font-extrabold text-2xl text-text dark:text-dark-text">📈 Rendimiento</h1>

      {loading ? (
        <div className="skeleton h-64 w-full" />
      ) : (
        <>
          <Card>
            <h3 className="font-display font-bold text-sm text-text dark:text-dark-text mb-4">Evolución mensual</h3>
            <Line data={lineData} options={{
              responsive: true,
              plugins: { legend: { display: false } },
              scales: { y: { min: 1, max: 7, ticks: { stepSize: 1 } } }
            }} />
          </Card>

          {top3.length > 0 && (
            <div>
              <h2 className="font-display font-bold text-lg text-text dark:text-dark-text mb-3">🏆 Top 3 cursos</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {top3.map((c, i) => (
                  <Card key={c.id} className="text-center">
                    <div className="text-3xl mb-1">{['🥇','🥈','🥉'][i]}</div>
                    <p className="font-display font-bold text-text dark:text-dark-text">{c.icono} {c.nombre}</p>
                    <p className="font-display font-extrabold text-2xl text-primary mt-1">{c.promedio}</p>
                    <p className="text-xs text-text-muted">{c.entregas} evaluaciones</p>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {alertas.length > 0 && (
            <div>
              <h2 className="font-display font-bold text-lg text-danger mb-3">⚠️ Alertas</h2>
              {alertas.map(c => (
                <div key={c.id} className="flex items-center gap-3 bg-danger-bg dark:bg-danger/10 px-4 py-3 rounded-xl mb-2">
                  <span>{c.icono}</span>
                  <span className="text-sm text-danger font-medium">{c.nombre}: promedio {c.promedio} (por debajo de 4.0)</span>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
