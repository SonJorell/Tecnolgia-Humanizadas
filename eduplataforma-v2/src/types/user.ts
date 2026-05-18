export interface Perfil {
  id: string
  nombre: string
  rol: 'alumno' | 'docente' | 'directivo'
  curso_id?: string
  avatar_url?: string
  xp: number
  monedas: number
  nivel: number
  creado_en?: string
  actualizado?: string
}

export interface UserSession {
  id: string
  email: string
  role?: string
}
