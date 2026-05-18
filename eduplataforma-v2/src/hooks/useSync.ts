import { useCallback } from 'react'
import { procesarColaSync, contarPendientes } from '../lib/sync'
import { useSyncStore } from '../stores/syncStore'
import { useAppStore } from '../stores/appStore'

export function useSync() {
  const { syncing, pendientes, ultimoSync, setSyncing, setPendientes, setUltimoSync } = useSyncStore()
  const addToast = useAppStore((s) => s.addToast)
  const conexion = useAppStore((s) => s.conexion)

  const syncAhora = useCallback(async () => {
    if (conexion !== 'ONLINE_SUPABASE') {
      addToast({ tipo: 'error', mensaje: '⚠️ Sin conexión a Supabase' })
      return
    }

    setSyncing(true)
    try {
      const count = await procesarColaSync()
      const remaining = await contarPendientes()
      setPendientes(remaining)
      setUltimoSync(Date.now())

      if (count > 0) {
        addToast({
          tipo: 'sync',
          mensaje: `✅ ${count} elemento${count > 1 ? 's' : ''} sincronizado${count > 1 ? 's' : ''}`
        })
      } else {
        addToast({ tipo: 'info', mensaje: 'Todo está sincronizado' })
      }
    } catch {
      addToast({ tipo: 'error', mensaje: '❌ Error de sincronización' })
    } finally {
      setSyncing(false)
    }
  }, [conexion, addToast, setSyncing, setPendientes, setUltimoSync])

  return { syncing, pendientes, ultimoSync, syncAhora }
}
