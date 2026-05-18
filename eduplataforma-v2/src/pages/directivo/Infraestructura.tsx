import React, { useEffect, useState } from 'react'
import { useAppStore } from '../../stores/appStore'
import { useSyncStore } from '../../stores/syncStore'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import { Wifi, WifiOff, Server, Database, HardDrive, Clock } from 'lucide-react'

export default function InfraestructuraDirectivo() {
  const conexion = useAppStore((s) => s.conexion)
  const ultimoSync = useSyncStore((s) => s.ultimoSync)
  const [lanStatus, setLanStatus] = useState<'ok'|'error'|'checking'>('checking')
  const [supaStatus, setSupaStatus] = useState<'ok'|'error'|'checking'>('checking')
  const [cacheSize, setCacheSize] = useState('Calculando...')

  useEffect(() => {
    checkServices()
    estimateCache()
  }, [])

  async function checkServices() {
    // LAN
    try {
      const res = await fetch('http://192.168.1.50/ping', { signal: AbortSignal.timeout(2000) })
      setLanStatus(res.ok ? 'ok' : 'error')
    } catch { setLanStatus('error') }

    // Supabase
    try {
      const res = await fetch('https://slmbeartbgkihoznylly.supabase.co/rest/v1/', {
        headers: { 'apikey': 'sb_publishable_TKXdtfKSmH12SYNZAOBjRg_dqwCfa14' },
        signal: AbortSignal.timeout(3000)
      })
      setSupaStatus(res.ok ? 'ok' : 'error')
    } catch { setSupaStatus('error') }
  }

  async function estimateCache() {
    try {
      if ('storage' in navigator && 'estimate' in navigator.storage) {
        const est = await navigator.storage.estimate()
        const mb = ((est.usage || 0) / 1024 / 1024).toFixed(1)
        setCacheSize(`${mb} MB`)
      } else {
        setCacheSize('No disponible')
      }
    } catch { setCacheSize('Error') }
  }

  const statusIcon = (s: 'ok'|'error'|'checking') =>
    s === 'ok' ? '🟢' : s === 'error' ? '🔴' : '🟡'

  return (
    <div className="p-4 md:p-6 space-y-6 animate-fade-in">
      <h1 className="font-display font-extrabold text-2xl text-text dark:text-dark-text">🖥️ Infraestructura</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-primary-bg rounded-lg flex items-center justify-center">
              <Wifi size={20} className="text-primary" />
            </div>
            <div>
              <p className="font-display font-bold text-text dark:text-dark-text">Servidor LAN</p>
              <p className="text-xs text-text-muted">http://192.168.1.50</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span>{statusIcon(lanStatus)}</span>
            <Badge variant={lanStatus === 'ok' ? 'mint' : 'danger'}>
              {lanStatus === 'ok' ? 'Conectado' : lanStatus === 'checking' ? 'Verificando...' : 'Sin conexión'}
            </Badge>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-violet-bg rounded-lg flex items-center justify-center">
              <Database size={20} className="text-violet" />
            </div>
            <div>
              <p className="font-display font-bold text-text dark:text-dark-text">Supabase Cloud</p>
              <p className="text-xs text-text-muted">slmbeartbgkihoznylly.supabase.co</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span>{statusIcon(supaStatus)}</span>
            <Badge variant={supaStatus === 'ok' ? 'mint' : 'danger'}>
              {supaStatus === 'ok' ? 'Operativo' : supaStatus === 'checking' ? 'Verificando...' : 'Sin respuesta'}
            </Badge>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-mint-bg rounded-lg flex items-center justify-center">
              <Clock size={20} className="text-mint" />
            </div>
            <div>
              <p className="font-display font-bold text-text dark:text-dark-text">Última sincronización</p>
              <p className="text-xs text-text-muted">Procesamiento de cola offline</p>
            </div>
          </div>
          <p className="text-sm font-medium text-text dark:text-dark-text">
            {ultimoSync ? new Date(ultimoSync).toLocaleString('es-CL') : 'Sin sincronización reciente'}
          </p>
        </Card>

        <Card>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-amber-bg rounded-lg flex items-center justify-center">
              <HardDrive size={20} className="text-amber" />
            </div>
            <div>
              <p className="font-display font-bold text-text dark:text-dark-text">Caché Service Worker</p>
              <p className="text-xs text-text-muted">Almacenamiento local</p>
            </div>
          </div>
          <p className="text-sm font-medium text-text dark:text-dark-text">{cacheSize}</p>
        </Card>
      </div>

      {/* Current connection mode */}
      <Card>
        <h3 className="font-display font-bold text-sm text-text dark:text-dark-text mb-3">Estado actual del sistema</h3>
        <div className="flex items-center gap-3">
          {conexion === 'ONLINE_SUPABASE' ? <Wifi size={20} className="text-mint" /> :
           conexion === 'ONLINE_LAN_ONLY' ? <Server size={20} className="text-amber" /> :
           <WifiOff size={20} className="text-danger" />}
          <div>
            <p className="font-medium text-sm text-text dark:text-dark-text">
              {conexion === 'ONLINE_SUPABASE' ? 'Modo Cloud — Todo sincronizado' :
               conexion === 'ONLINE_LAN_ONLY' ? 'Modo LAN — Solo red local' :
               'Modo Offline — Sin conexión'}
            </p>
            <p className="text-xs text-text-muted">Monitoreo cada 10 segundos</p>
          </div>
        </div>
      </Card>
    </div>
  )
}
