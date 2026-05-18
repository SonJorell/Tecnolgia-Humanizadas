import { useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAppStore } from '../stores/appStore'

export function useRealtime(channel: string, event: string, callback: (payload: any) => void) {
  const conexion = useAppStore((s) => s.conexion)

  useEffect(() => {
    if (conexion !== 'ONLINE_SUPABASE') return

    const ch = supabase.channel(channel)
      .on('broadcast', { event }, ({ payload }) => {
        callback(payload)
      })
      .subscribe()

    return () => {
      supabase.removeChannel(ch)
    }
  }, [channel, event, conexion, callback])
}
