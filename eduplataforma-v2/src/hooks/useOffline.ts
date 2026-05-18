import { useCallback } from 'react'
import { idb } from '../lib/indexeddb'
import { agregarACola, procesarColaSync } from '../lib/sync'
import { useAppStore } from '../stores/appStore'
import { useAuthStore } from '../stores/authStore'

export function useOffline() {
  const conexion = useAppStore((s) => s.conexion)
  const addToast = useAppStore((s) => s.addToast)
  const updatePerfil = useAuthStore((s) => s.updatePerfil)

  const guardarEntregaOffline = useCallback(async (entrega: any) => {
    // Save to IndexedDB first
    await idb.put('entregas', entrega)

    // Add to sync queue
    await agregarACola('entrega', entrega)

    addToast({
      tipo: 'info',
      mensaje: conexion === 'ONLINE_SUPABASE'
        ? '✅ Entrega guardada y sincronizada'
        : '📱 Entrega guardada offline · Se sincronizará al reconectar'
    })

    // If online, sync immediately
    if (conexion === 'ONLINE_SUPABASE') {
      await procesarColaSync()
    }
  }, [conexion, addToast])

  const guardarFeedbackOffline = useCallback(async (feedback: any) => {
    await agregarACola('feedback', feedback)

    // Award 5 coins for feedback
    const perfil = useAuthStore.getState().perfil
    if (perfil) {
      const newMonedas = perfil.monedas + 5
      updatePerfil({ monedas: newMonedas })
      await agregarACola('monedas', {
        user_id: perfil.id,
        monedas: newMonedas,
        xp: perfil.xp
      })
    }

    addToast({ tipo: 'xp', mensaje: '🪙 +5 monedas por tu feedback' })

    if (conexion === 'ONLINE_SUPABASE') {
      await procesarColaSync()
    }
  }, [conexion, addToast, updatePerfil])

  return {
    isOffline: conexion === 'OFFLINE_TOTAL',
    isLanOnly: conexion === 'ONLINE_LAN_ONLY',
    isOnline: conexion === 'ONLINE_SUPABASE',
    guardarEntregaOffline,
    guardarFeedbackOffline
  }
}
