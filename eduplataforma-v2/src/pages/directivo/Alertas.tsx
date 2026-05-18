import React, { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import { Bell, CheckCircle } from 'lucide-react'

interface Alerta {
  id: string
  tipo: 'info' | 'warning' | 'success' | 'error'
  titulo: string
  mensaje: string
  leida: boolean
  creado_en: string
}

const TIPO_STYLES: Record<string, { badge: 'primary'|'amber'|'mint'|'danger'; icon: string }> = {
  info:    { badge: 'primary', icon: 'ℹ️' },
  warning: { badge: 'amber', icon: '⚠️' },
  success: { badge: 'mint', icon: '✅' },
  error:   { badge: 'danger', icon: '❌' },
}

export default function AlertasDirectivo() {
  const [alertas, setAlertas] = useState<Alerta[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { generateAlertas() }, [])

  async function generateAlertas() {
    const alerts: Alerta[] = []
    const now = new Date().toISOString()

    // Check students without activity
    const { data: perfiles } = await supabase.from('perfiles').select('nombre, actualizado').eq('rol', 'alumno')
    const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000
    const inactivos = (perfiles || []).filter((p: any) => !p.actualizado || new Date(p.actualizado).getTime() < weekAgo)
    if (inactivos.length > 0) {
      alerts.push({ id: '1', tipo: 'warning', titulo: 'Alumnos inactivos', mensaje: `${inactivos.length} alumno(s) sin actividad hace más de 7 días`, leida: false, creado_en: now })
    }

    // Check late submissions
    const { data: entregas } = await supabase.from('entregas').select('id', { count: 'exact' }).eq('estado', 'tardio')
    if ((entregas?.length || 0) > 0) {
      alerts.push({ id: '2', tipo: 'error', titulo: 'Entregas tardías', mensaje: `${entregas?.length} entrega(s) realizadas fuera de plazo`, leida: false, creado_en: now })
    }

    // Check pending reviews
    const { count } = await supabase.from('entregas').select('id', { count: 'exact' }).eq('estado', 'entregado')
    if ((count || 0) > 0) {
      alerts.push({ id: '3', tipo: 'info', titulo: 'Entregas por revisar', mensaje: `${count} entrega(s) pendientes de calificación`, leida: false, creado_en: now })
    }

    // System status
    alerts.push({ id: '4', tipo: 'success', titulo: 'Sistema operativo', mensaje: 'Todos los servicios funcionando correctamente', leida: false, creado_en: now })

    setAlertas(alerts)
    setLoading(false)
  }

  function marcarLeida(id: string) {
    setAlertas(prev => prev.map(a => a.id === id ? { ...a, leida: true } : a))
  }

  return (
    <div className="p-4 md:p-6 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="font-display font-extrabold text-2xl text-text dark:text-dark-text">🔔 Alertas</h1>
        <Badge variant="amber">{alertas.filter(a => !a.leida).length} nuevas</Badge>
      </div>

      {loading ? (
        <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="skeleton h-20 w-full" />)}</div>
      ) : (
        <div className="space-y-3">
          {alertas.map(alerta => {
            const style = TIPO_STYLES[alerta.tipo]
            return (
              <Card key={alerta.id} className={`${alerta.leida ? 'opacity-60' : ''} transition-opacity`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <span className="text-xl flex-shrink-0">{style.icon}</span>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium text-sm text-text dark:text-dark-text">{alerta.titulo}</p>
                        <Badge variant={style.badge} size="sm">{alerta.tipo}</Badge>
                      </div>
                      <p className="text-sm text-text-muted">{alerta.mensaje}</p>
                      <p className="text-xs text-text-light mt-1">{new Date(alerta.creado_en).toLocaleString('es-CL')}</p>
                    </div>
                  </div>
                  {!alerta.leida && (
                    <Button variant="ghost" size="sm" onClick={() => marcarLeida(alerta.id)}>
                      <CheckCircle size={14} /> Leída
                    </Button>
                  )}
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
