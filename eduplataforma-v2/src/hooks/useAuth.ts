import { useEffect } from 'react'
import { iniciarMonitoreo } from '../lib/connectivity'
import { useAppStore } from '../stores/appStore'
import { procesarColaSync, contarPendientes } from '../lib/sync'
import { useSyncStore } from '../stores/syncStore'

export function useConnectivity() {
  const setConexion = useAppStore((s) => s.setConexion)
  const conexion = useAppStore((s) => s.conexion)
  const addToast = useAppStore((s) => s.addToast)
  const { setPendientes, setSyncing, setUltimoSync } = useSyncStore()

  useEffect(() => {
    let prevEstado = conexion

    const cleanup = iniciarMonitoreo(async (estado) => {
      setConexion(estado)

      // When transitioning from offline to online, sync
      if (prevEstado !== 'ONLINE_SUPABASE' && estado === 'ONLINE_SUPABASE') {
        setSyncing(true)
        const count = await procesarColaSync()
        setSyncing(false)
        setUltimoSync(Date.now())

        if (count > 0) {
          addToast({
            tipo: 'sync',
            mensaje: `✅ ${count} elemento${count > 1 ? 's' : ''} sincronizado${count > 1 ? 's' : ''}`
          })
        }
      }

      // Update pending count
      const pendientes = await contarPendientes()
      setPendientes(pendientes)

      prevEstado = estado
    })

    return cleanup
  }, [])

  return conexion
}
