import { openDB, type DBSchema, type IDBPDatabase } from 'idb'

interface EduDB extends DBSchema {
  perfiles: {
    key: string
    value: {
      id: string
      nombre: string
      rol: string
      xp: number
      monedas: number
      nivel: number
      avatar_url?: string
      curso_id?: string
      [key: string]: unknown
    }
  }
  materiales: {
    key: string
    value: {
      id: string
      curso_id: string
      titulo: string
      descripcion?: string
      tipo: string
      archivo_url?: string
      archivo_nombre?: string
      disponible_offline: boolean
      [key: string]: unknown
    }
  }
  sync_queue: {
    key: string
    value: {
      id: string
      tipo: 'entrega' | 'progreso' | 'feedback' | 'monedas'
      payload: Record<string, unknown>
      intentos: number
      creado_en: number
    }
    indexes: { by_tipo: string }
  }
  entregas: {
    key: string
    value: {
      id: string
      material_id: string
      alumno_id: string
      contenido?: string
      estado: string
      [key: string]: unknown
    }
  }
  cursos: {
    key: string
    value: {
      id: string
      nombre: string
      descripcion?: string
      docente_id?: string
      nivel?: string
      icono?: string
      color?: string
      [key: string]: unknown
    }
  }
  inscripciones: {
    key: string
    value: {
      id: string
      alumno_id: string
      curso_id: string
      progreso: number
      [key: string]: unknown
    }
  }
}

type StoreName = keyof EduDB

let dbInstance: IDBPDatabase<EduDB> | null = null

async function getDB(): Promise<IDBPDatabase<EduDB>> {
  if (dbInstance) return dbInstance
  dbInstance = await openDB<EduDB>('eduplataforma', 2, {
    upgrade(db, oldVersion) {
      if (oldVersion < 1) {
        db.createObjectStore('perfiles', { keyPath: 'id' })
        db.createObjectStore('materiales', { keyPath: 'id' })
        db.createObjectStore('entregas', { keyPath: 'id' })
        const sq = db.createObjectStore('sync_queue', { keyPath: 'id' })
        sq.createIndex('by_tipo', 'tipo')
      }
      if (oldVersion < 2) {
        if (!db.objectStoreNames.contains('cursos')) {
          db.createObjectStore('cursos', { keyPath: 'id' })
        }
        if (!db.objectStoreNames.contains('inscripciones')) {
          db.createObjectStore('inscripciones', { keyPath: 'id' })
        }
      }
    }
  })
  return dbInstance
}

export const idb = {
  get: async <T extends StoreName>(store: T, key: string) => {
    const db = await getDB()
    return db.get(store, key)
  },

  put: async <T extends StoreName>(store: T, val: EduDB[T]['value']) => {
    const db = await getDB()
    return db.put(store, val)
  },

  getAll: async <T extends StoreName>(store: T) => {
    const db = await getDB()
    return db.getAll(store)
  },

  delete: async <T extends StoreName>(store: T, key: string) => {
    const db = await getDB()
    return db.delete(store, key)
  },

  clear: async <T extends StoreName>(store: T) => {
    const db = await getDB()
    return db.clear(store)
  },

  update: async <T extends StoreName>(store: T, key: string, fn: (val: EduDB[T]['value']) => EduDB[T]['value']) => {
    const db = await getDB()
    const tx = db.transaction(store, 'readwrite')
    const val = await tx.store.get(key)
    if (val) {
      await tx.store.put(fn(val))
    }
    await tx.done
  },

  count: async <T extends StoreName>(store: T) => {
    const db = await getDB()
    return db.count(store)
  }
}
