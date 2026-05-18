export interface Curso {
  id: string
  nombre: string
  descripcion?: string
  docente_id?: string
  nivel?: string
  icono?: string
  color?: string
  creado_en?: string
}

export interface Inscripcion {
  id: string
  alumno_id: string
  curso_id: string
  progreso: number
  inscrito_en?: string
  curso?: Curso
}

export interface Material {
  id: string
  curso_id: string
  docente_id?: string
  titulo: string
  descripcion?: string
  tipo: 'guia' | 'tarea' | 'evaluacion' | 'recurso'
  archivo_url?: string
  archivo_nombre?: string
  archivo_size?: number
  disponible_offline: boolean
  publicado: boolean
  fecha_entrega?: string
  xp_premio: number
  creado_en?: string
}

export interface Entrega {
  id: string
  material_id: string
  alumno_id: string
  contenido?: string
  archivo_url?: string
  calificacion?: number
  comentario?: string
  estado: 'pendiente' | 'entregado' | 'revisado' | 'tardio'
  sincronizado: boolean
  entregado_en?: string
  revisado_en?: string
  material?: Material
}

export interface Logro {
  id: string
  nombre: string
  descripcion?: string
  icono?: string
  xp_premio: number
  categoria?: string
}

export interface LogroAlumno {
  id: string
  alumno_id: string
  logro_id: string
  desbloqueado?: string
  logro?: Logro
}

export interface Premio {
  id: string
  nombre: string
  descripcion?: string
  icono?: string
  categoria?: string
  precio_monedas: number
  stock: number
  activo: boolean
  creado_en?: string
}

export interface Canje {
  id: string
  alumno_id: string
  premio_id: string
  monedas_gastadas: number
  estado: 'pendiente' | 'aprobado' | 'rechazado'
  canjeado_en?: string
  premio?: Premio
}

export interface Feedback {
  id: string
  autor_id: string
  rating: number
  categorias: string[]
  comentario?: string
  resuelto: boolean
  creado_en?: string
  autor?: { nombre: string }
}
