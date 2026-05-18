export type EstadoConexion = 'ONLINE_SUPABASE' | 'ONLINE_LAN_ONLY' | 'OFFLINE_TOTAL'

const SUPABASE_REST = 'https://slmbeartbgkihoznylly.supabase.co/rest/v1/'
const SUPABASE_KEY = 'sb_publishable_TKXdtfKSmH12SYNZAOBjRg_dqwCfa14'
const LAN_URL = import.meta.env.VITE_LAN_SERVER_URL || 'http://192.168.1.50'

export async function detectarConexion(): Promise<EstadoConexion> {
  if (!navigator.onLine) return 'OFFLINE_TOTAL'

  // Try Supabase first
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 3000)
    const res = await fetch(`${SUPABASE_REST}cursos?limit=1`, {
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`
      },
      signal: controller.signal
    })
    clearTimeout(timeout)
    if (res.ok || res.status === 200 || res.status === 401) return 'ONLINE_SUPABASE'
  } catch {
    // Supabase not reachable
  }

  // Try LAN
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 1000)
    await fetch(`${LAN_URL}/ping`, { signal: controller.signal })
    clearTimeout(timeout)
    return 'ONLINE_LAN_ONLY'
  } catch {
    // LAN not reachable
  }

  return 'OFFLINE_TOTAL'
}

export function iniciarMonitoreo(cb: (estado: EstadoConexion) => void): () => void {
  const check = async () => {
    const estado = await detectarConexion()
    cb(estado)
  }

  // Initial check
  check()

  // Polling every 10 seconds
  const intervalId = setInterval(check, 10_000)

  // Listen to browser online/offline events
  const onlineHandler = () => check()
  const offlineHandler = () => cb('OFFLINE_TOTAL')

  window.addEventListener('online', onlineHandler)
  window.addEventListener('offline', offlineHandler)

  // Cleanup function
  return () => {
    clearInterval(intervalId)
    window.removeEventListener('online', onlineHandler)
    window.removeEventListener('offline', offlineHandler)
  }
}
