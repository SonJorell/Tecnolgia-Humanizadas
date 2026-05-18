import React, { useEffect, useState } from 'react'
import { useAuthStore } from '../../stores/authStore'
import { useAppStore } from '../../stores/appStore'
import { supabase } from '../../lib/supabase'
import CanjeCard from '../../components/gamification/CanjeCard'
import Modal from '../../components/ui/Modal'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import confetti from 'canvas-confetti'
import type { Premio, Canje } from '../../types/database'

const FILTROS = ['Todos', 'Educativo', 'Recreativo', 'Escolar', 'Digital', 'Especial']

export default function TiendaAlumno() {
  const perfil = useAuthStore((s) => s.perfil)
  const updatePerfil = useAuthStore((s) => s.updatePerfil)
  const addToast = useAppStore((s) => s.addToast)
  const [premios, setPremios] = useState<Premio[]>([])
  const [canjes, setCanjes] = useState<Canje[]>([])
  const [filtro, setFiltro] = useState('Todos')
  const [modal, setModal] = useState<Premio | null>(null)
  const [loading, setLoading] = useState(true)
  const [showFAQ, setShowFAQ] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    const [pRes, cRes] = await Promise.all([
      supabase.from('premios').select('*').eq('activo', true),
      supabase.from('canjes').select('*, premio:premios(*)').eq('alumno_id', perfil!.id).order('canjeado_en', { ascending: false }).limit(5)
    ])
    setPremios((pRes.data || []) as Premio[])
    setCanjes((cRes.data || []) as Canje[])
    setLoading(false)
  }

  async function confirmarCanje() {
    if (!modal || !perfil) return
    const newMonedas = perfil.monedas - modal.precio_monedas
    if (newMonedas < 0) return

    await supabase.from('canjes').insert({
      alumno_id: perfil.id,
      premio_id: modal.id,
      monedas_gastadas: modal.precio_monedas,
      estado: 'pendiente'
    })
    await supabase.from('perfiles').update({ monedas: newMonedas }).eq('id', perfil.id)
    updatePerfil({ monedas: newMonedas })

    confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } })
    addToast({ tipo: 'xp', mensaje: `🎉 ¡Canjeaste "${modal.nombre}"!` })
    setModal(null)
    loadData()
  }

  const filtered = filtro === 'Todos' ? premios : premios.filter(p => p.categoria?.toLowerCase() === filtro.toLowerCase())

  return (
    <div className="p-4 md:p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="font-display font-extrabold text-2xl text-text dark:text-dark-text">🛍️ Tienda</h1>
        <p className="font-display text-xl font-bold text-amber">🪙 {perfil?.monedas || 0}</p>
      </div>

      {/* FAQ Accordion */}
      <button onClick={() => setShowFAQ(!showFAQ)}
        className="w-full text-left bg-amber-bg dark:bg-amber/10 rounded-xl px-4 py-3 text-sm font-medium text-amber">
        {showFAQ ? '▲' : '▼'} ¿Cómo ganar monedas?
      </button>
      {showFAQ && (
        <div className="bg-card dark:bg-dark-card rounded-xl p-4 text-xs text-text-muted space-y-1 animate-slide-up">
          <p>📝 Entregar tarea a tiempo: +10 monedas</p>
          <p>📝 Entregar tarea tarde: +4 monedas</p>
          <p>💬 Enviar feedback: +5 monedas</p>
          <p>📥 Descargar material: +1 moneda</p>
          <p>🏆 Desbloquear logro: monedas variables</p>
        </div>
      )}

      {/* Filter pills */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {FILTROS.map(f => (
          <button key={f} onClick={() => setFiltro(f)}
            className={`text-xs font-medium px-3 py-1.5 rounded-full whitespace-nowrap transition-colors ${
              filtro === f ? 'bg-primary text-white' : 'bg-surface dark:bg-dark-card2 text-text-muted'}`}>
            {f}
          </button>
        ))}
      </div>

      {/* Prizes grid */}
      {loading ? (
        <div className="grid grid-cols-2 gap-3">{[1,2,3,4].map(i => <div key={i} className="skeleton h-40" />)}</div>
      ) : (
        <div className="canjes-grid grid grid-cols-2 gap-3">
          {filtered.map(p => (
            <CanjeCard key={p.id} premio={p} monedas={perfil?.monedas || 0} onCanjear={setModal} />
          ))}
        </div>
      )}

      {/* Recent redemptions */}
      {canjes.length > 0 && (
        <div>
          <h2 className="font-display font-bold text-lg text-text dark:text-dark-text mb-3">Historial de canjes</h2>
          <div className="space-y-2">
            {canjes.map(c => (
              <div key={c.id} className="flex items-center justify-between bg-card dark:bg-dark-card rounded-lg p-3 shadow-card">
                <div>
                  <p className="text-sm font-medium text-text dark:text-dark-text">{(c as any).premio?.nombre || 'Premio'}</p>
                  <p className="text-xs text-text-muted">{new Date(c.canjeado_en!).toLocaleDateString('es-CL')}</p>
                </div>
                <Badge variant={c.estado === 'aprobado' ? 'mint' : c.estado === 'rechazado' ? 'danger' : 'amber'}>
                  {c.estado}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Confirmation modal */}
      <Modal open={!!modal} onClose={() => setModal(null)} title="Confirmar canje">
        {modal && (
          <div className="text-center">
            <div className="text-5xl mb-3">{modal.icono}</div>
            <p className="font-display font-bold text-text dark:text-dark-text">{modal.nombre}</p>
            <p className="text-sm text-text-muted mt-1">{modal.descripcion}</p>
            <p className="font-display font-bold text-amber text-lg mt-3">🪙 {modal.precio_monedas} monedas</p>
            <div className="flex gap-3 mt-6">
              <Button variant="secondary" fullWidth onClick={() => setModal(null)}>Cancelar</Button>
              <Button variant="amber" fullWidth onClick={confirmarCanje}>¡Canjear!</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
