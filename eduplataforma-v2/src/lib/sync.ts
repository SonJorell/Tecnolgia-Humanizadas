import { supabase } from './supabase'
import { idb } from './indexeddb'

interface SyncItem {
  id: string
  tipo: 'entrega' | 'progreso' | 'feedback' | 'monedas'
  payload: Record<string, unknown>
  intentos: number
  creado_en: number
}

export async function procesarColaSync(): Promise<number> {
  let sincronizados = 0

  try {
    const items = await idb.getAll('sync_queue') as SyncItem[]
    const pendientes = items.filter(i => i.intentos < 3)

    for (const item of pendientes) {
      try {
        switch (item.tipo) {
          case 'entrega': {
            const { error } = await supabase.from('entregas').upsert(item.payload as any)
            if (error) throw error
            break
          }
          case 'progreso': {
            const { error } = await supabase
              .from('inscripciones')
              .update({ progreso: item.payload.progreso })
              .eq('alumno_id', item.payload.alumno_id as string)
              .eq('curso_id', item.payload.curso_id as string)
            if (error) throw error
            break
          }
          case 'feedback': {
            const { error } = await supabase.from('feedback').insert(item.payload as any)
            if (error) throw error
            break
          }
          case 'monedas': {
            const { error } = await supabase
              .from('perfiles')
              .update({ monedas: item.payload.monedas, xp: item.payload.xp })
              .eq('id', item.payload.user_id as string)
            if (error) throw error
            break
          }
        }

        await idb.delete('sync_queue', item.id)
        sincronizados++
      } catch {
        // Increment retry count
        await idb.put('sync_queue', {
          ...item,
          intentos: item.intentos + 1
        } as any)
      }
    }
  } catch (err) {
    console.error('[Sync] Error processing queue:', err)
  }

  return sincronizados
}

export async function agregarACola(
  tipo: SyncItem['tipo'],
  payload: Record<string, unknown>
): Promise<void> {
  await idb.put('sync_queue', {
    id: crypto.randomUUID(),
    tipo,
    payload,
    intentos: 0,
    creado_en: Date.now()
  } as any)
}

export async function contarPendientes(): Promise<number> {
  const items = await idb.getAll('sync_queue')
  return items.filter((i: any) => i.intentos < 3).length
}
