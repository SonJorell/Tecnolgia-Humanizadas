import React, { useState } from 'react'
import { useAuthStore } from '../../stores/authStore'
import { useAppStore } from '../../stores/appStore'
import { supabase } from '../../lib/supabase'
import { agregarACola, procesarColaSync } from '../../lib/sync'
import Button from '../../components/ui/Button'

const EMOJIS = ['😞', '😕', '😐', '🙂', '🤩']
const CATEGORIAS = ['Contenido', 'Navegación', 'Velocidad', 'Diseño', 'Materiales']

export default function FeedbackAlumno() {
  const perfil = useAuthStore((s) => s.perfil)
  const conexion = useAppStore((s) => s.conexion)
  const addToast = useAppStore((s) => s.addToast)
  const updatePerfil = useAuthStore((s) => s.updatePerfil)

  const [rating, setRating] = useState(0)
  const [cats, setCats] = useState<string[]>([])
  const [comentario, setComentario] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [sent, setSent] = useState(false)

  function toggleCat(cat: string) {
    setCats(prev => prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat])
  }

  async function handleSubmit() {
    if (!rating || !perfil) return
    setSubmitting(true)
    const fb = {
      id: crypto.randomUUID(),
      autor_id: perfil.id,
      rating,
      categorias: cats,
      comentario,
      resuelto: false,
      creado_en: new Date().toISOString()
    }

    if (conexion === 'ONLINE_SUPABASE') {
      await supabase.from('feedback').insert(fb)
    } else {
      await agregarACola('feedback', fb)
    }

    // Award 5 coins
    const newMonedas = perfil.monedas + 5
    updatePerfil({ monedas: newMonedas })

    if (conexion === 'ONLINE_SUPABASE') {
      await supabase.from('perfiles').update({ monedas: newMonedas }).eq('id', perfil.id)
    } else {
      await agregarACola('monedas', { user_id: perfil.id, monedas: newMonedas, xp: perfil.xp })
    }

    addToast({ tipo: 'sync', mensaje: '✅ Feedback enviado · +5 🪙 monedas' })
    setSent(true)
    setSubmitting(false)
  }

  if (sent) {
    return (
      <div className="p-4 md:p-6 flex flex-col items-center justify-center min-h-[60vh] animate-bounce-in">
        <div className="text-6xl mb-4">🎉</div>
        <h2 className="font-display font-bold text-xl text-text dark:text-dark-text">¡Gracias!</h2>
        <p className="text-sm text-text-muted mt-2">Tu opinión nos ayuda a mejorar</p>
        <Button onClick={() => { setSent(false); setRating(0); setCats([]); setComentario('') }} variant="secondary" className="mt-6">
          Enviar otro
        </Button>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-6 space-y-6 animate-fade-in max-w-lg">
      <h1 className="font-display font-extrabold text-2xl text-text dark:text-dark-text">💬 Feedback</h1>

      {/* Rating */}
      <div>
        <p className="text-sm font-medium text-text dark:text-dark-text mb-3">¿Cómo calificarías tu experiencia?</p>
        <div className="flex gap-3">
          {EMOJIS.map((emoji, i) => (
            <button key={i} onClick={() => setRating(i + 1)}
              className={`text-3xl transition-transform ${rating === i + 1 ? 'scale-125' : 'opacity-40 hover:opacity-70 hover:scale-110'}`}>
              {emoji}
            </button>
          ))}
        </div>
      </div>

      {/* Categories */}
      <div>
        <p className="text-sm font-medium text-text dark:text-dark-text mb-3">¿Sobre qué es tu feedback?</p>
        <div className="flex flex-wrap gap-2">
          {CATEGORIAS.map(cat => (
            <button key={cat} onClick={() => toggleCat(cat)}
              className={`text-xs font-medium px-3 py-1.5 rounded-full transition-colors ${
                cats.includes(cat) ? 'bg-primary text-white' : 'bg-surface dark:bg-dark-card2 text-text-muted border border-border dark:border-white/10'}`}>
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Comment */}
      <div>
        <p className="text-sm font-medium text-text dark:text-dark-text mb-2">Comentario (opcional)</p>
        <textarea value={comentario} onChange={e => setComentario(e.target.value)}
          placeholder="Cuéntanos más..."
          className="w-full h-28 p-3 rounded-xl bg-surface dark:bg-dark-card2 border border-border dark:border-white/10 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/30" />
      </div>

      <Button onClick={handleSubmit} loading={submitting} disabled={!rating} fullWidth size="lg">
        Enviar feedback
      </Button>
    </div>
  )
}
