import React, { useEffect, useState, useRef } from 'react'
import { useAuthStore } from '../../stores/authStore'
import { useAppStore } from '../../stores/appStore'
import { supabase } from '../../lib/supabase'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import Card from '../../components/ui/Card'
import type { Material, Curso } from '../../types/database'
import { Upload as UploadIcon, Trash2, FileText } from 'lucide-react'

export default function MaterialesDocente() {
  const perfil = useAuthStore((s) => s.perfil)
  const addToast = useAppStore((s) => s.addToast)
  const [cursos, setCursos] = useState<Curso[]>([])
  const [materiales, setMateriales] = useState<Material[]>([])
  const [loading, setLoading] = useState(true)

  // Form state
  const [cursoId, setCursoId] = useState('')
  const [tipo, setTipo] = useState<string>('guia')
  const [titulo, setTitulo] = useState('')
  const [desc, setDesc] = useState('')
  const [fechaEntrega, setFechaEntrega] = useState('')
  const [xpPremio, setXpPremio] = useState(50)
  const [publicar, setPublicar] = useState(true)
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const fileRef = useRef<HTMLInputElement>(null)
  const [dragOver, setDragOver] = useState(false)

  useEffect(() => {
    if (!perfil) return
    loadData()
  }, [perfil])

  async function loadData() {
    const [cRes, mRes] = await Promise.all([
      supabase.from('cursos').select('*').eq('docente_id', perfil!.id),
      supabase.from('materiales').select('*').eq('docente_id', perfil!.id).order('creado_en', { ascending: false })
    ])
    setCursos((cRes.data || []) as Curso[])
    setMateriales((mRes.data || []) as Material[])
    if (cRes.data?.length) setCursoId(cRes.data[0].id)
    setLoading(false)
  }

  async function handleUpload() {
    if (!titulo.trim() || !cursoId) return
    setUploading(true)
    setUploadProgress(0)

    let archivo_url = ''
    let archivo_nombre = ''
    let archivo_size = 0

    if (file) {
      const path = `cursos/${cursoId}/${Date.now()}_${file.name}`
      const { data, error } = await supabase.storage
        .from('materiales-docentes')
        .upload(path, file)

      if (error) {
        addToast({ tipo: 'error', mensaje: '❌ Error subiendo archivo' })
        setUploading(false)
        return
      }
      archivo_url = data.path
      archivo_nombre = file.name
      archivo_size = file.size
      setUploadProgress(100)
    }

    const { error } = await supabase.from('materiales').insert({
      curso_id: cursoId,
      docente_id: perfil!.id,
      titulo,
      descripcion: desc,
      tipo,
      archivo_url, archivo_nombre, archivo_size,
      disponible_offline: true,
      publicado: publicar,
      fecha_entrega: fechaEntrega || null,
      xp_premio: xpPremio
    })

    if (error) {
      addToast({ tipo: 'error', mensaje: '❌ Error guardando material' })
    } else {
      addToast({ tipo: 'sync', mensaje: '✅ Material guardado correctamente' })
      setTitulo(''); setDesc(''); setFile(null); setUploadProgress(0)
      loadData()
    }
    setUploading(false)
  }

  async function handleDelete(id: string) {
    await supabase.from('materiales').delete().eq('id', id)
    setMateriales(prev => prev.filter(m => m.id !== id))
    addToast({ tipo: 'info', mensaje: 'Material eliminado' })
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragOver(false)
    if (e.dataTransfer.files.length) setFile(e.dataTransfer.files[0])
  }

  return (
    <div className="p-4 md:p-6 space-y-6 animate-fade-in">
      <h1 className="font-display font-extrabold text-2xl text-text dark:text-dark-text">📤 Cargar Material</h1>

      {/* Upload form */}
      <Card className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium text-text-muted block mb-1">Curso destino</label>
            <select value={cursoId} onChange={e => setCursoId(e.target.value)}
              className="w-full h-10 px-3 rounded-lg bg-surface dark:bg-dark-card2 border border-border dark:border-white/10 text-sm">
              {cursos.map(c => <option key={c.id} value={c.id}>{c.icono} {c.nombre}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-text-muted block mb-1">Tipo</label>
            <select value={tipo} onChange={e => setTipo(e.target.value)}
              className="w-full h-10 px-3 rounded-lg bg-surface dark:bg-dark-card2 border border-border dark:border-white/10 text-sm">
              <option value="guia">📖 Guía</option>
              <option value="tarea">📝 Tarea</option>
              <option value="evaluacion">📋 Evaluación</option>
              <option value="recurso">📁 Recurso</option>
            </select>
          </div>
        </div>

        <div>
          <label className="text-xs font-medium text-text-muted block mb-1">Título</label>
          <input value={titulo} onChange={e => setTitulo(e.target.value)} placeholder="Nombre del material"
            className="w-full h-10 px-3 rounded-lg bg-surface dark:bg-dark-card2 border border-border dark:border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
        </div>
        <div>
          <label className="text-xs font-medium text-text-muted block mb-1">Descripción</label>
          <textarea value={desc} onChange={e => setDesc(e.target.value)} placeholder="Instrucciones o descripción..."
            className="w-full h-20 p-3 rounded-lg bg-surface dark:bg-dark-card2 border border-border dark:border-white/10 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/30" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {(tipo === 'tarea' || tipo === 'evaluacion') && (
            <div>
              <label className="text-xs font-medium text-text-muted block mb-1">Fecha de entrega</label>
              <input type="datetime-local" value={fechaEntrega} onChange={e => setFechaEntrega(e.target.value)}
                className="w-full h-10 px-3 rounded-lg bg-surface dark:bg-dark-card2 border border-border dark:border-white/10 text-sm" />
            </div>
          )}
          <div>
            <label className="text-xs font-medium text-text-muted block mb-1">XP premio</label>
            <input type="number" value={xpPremio} onChange={e => setXpPremio(Number(e.target.value))} min={0}
              className="w-full h-10 px-3 rounded-lg bg-surface dark:bg-dark-card2 border border-border dark:border-white/10 text-sm" />
          </div>
        </div>

        {/* Drag & drop */}
        <div onDragOver={e => { e.preventDefault(); setDragOver(true) }} onDragLeave={() => setDragOver(false)} onDrop={handleDrop}
          onClick={() => fileRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
            dragOver ? 'border-primary bg-primary-bg' : 'border-border dark:border-white/10 hover:border-primary/50'}`}>
          <UploadIcon size={24} className="mx-auto mb-2 text-text-light" />
          <p className="text-sm text-text-muted">{file ? file.name : 'Arrastra un archivo o haz clic para seleccionar'}</p>
          <input ref={fileRef} type="file" className="hidden" onChange={e => { if (e.target.files?.[0]) setFile(e.target.files[0]) }} />
        </div>

        {uploadProgress > 0 && uploadProgress < 100 && (
          <div className="h-2 bg-surface rounded-full overflow-hidden">
            <div className="h-full bg-primary rounded-full progress-fill" style={{ width: `${uploadProgress}%` }} />
          </div>
        )}

        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 text-sm text-text-muted cursor-pointer">
            <input type="checkbox" checked={publicar} onChange={e => setPublicar(e.target.checked)} className="rounded" />
            Publicar ahora
          </label>
          <Button onClick={handleUpload} loading={uploading} disabled={!titulo.trim()}>
            <UploadIcon size={16} /> Subir material
          </Button>
        </div>
      </Card>

      {/* Materials list */}
      <h2 className="font-display font-bold text-lg text-text dark:text-dark-text">Materiales subidos</h2>
      <div className="space-y-2">
        {materiales.map(mat => (
          <div key={mat.id} className="flex items-center gap-3 bg-card dark:bg-dark-card rounded-lg p-3 shadow-card">
            <FileText size={18} className="text-primary flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-text dark:text-dark-text truncate">{mat.titulo}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <Badge variant="neutral" size="sm">{mat.tipo}</Badge>
                <Badge variant={mat.publicado ? 'mint' : 'amber'} size="sm">{mat.publicado ? 'Publicado' : 'Borrador'}</Badge>
              </div>
            </div>
            <button onClick={() => handleDelete(mat.id)} className="p-2 text-text-light hover:text-danger transition-colors">
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
