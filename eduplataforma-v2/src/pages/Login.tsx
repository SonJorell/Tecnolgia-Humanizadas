import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import { useAppStore } from '../stores/appStore'
import { Mail, Lock, Eye, EyeOff } from 'lucide-react'
import Logo from '../components/ui/Logo'
import Button from '../components/ui/Button'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPwd, setShowPwd] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const signIn = useAuthStore((s) => s.signIn)
  const conexion = useAppStore((s) => s.conexion)
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await signIn(email, password)
      const perfil = useAuthStore.getState().perfil
      if (perfil) {
        navigate(`/${perfil.rol}`)
      }
    } catch (err: any) {
      setError(err.message || 'Credenciales incorrectas')
    } finally {
      setLoading(false)
    }
  }

  const connColor = conexion === 'ONLINE_SUPABASE' ? 'bg-[#2db88a]' :
                    conexion === 'ONLINE_LAN_ONLY' ? 'bg-[#e8a020]' : 'bg-[#e05050]'
  const connText = conexion === 'ONLINE_SUPABASE' ? 'Conectado a Supabase' :
                   conexion === 'ONLINE_LAN_ONLY' ? 'Solo LAN' : 'Modo offline'

  return (
    <div className="min-h-screen bg-gradient-to-br from-surface to-primary-bg dark:from-dark-surface dark:to-dark-card flex items-center justify-center p-4">
      <div className="max-w-sm w-full">
        <form
          onSubmit={handleSubmit}
          className="bg-card dark:bg-dark-card rounded-2xl shadow-modal p-8 animate-slide-up"
        >
          {/* Logo */}
          <div className="flex flex-col items-center mb-6">
            <Logo size={48} />
            <h1 className="font-display text-2xl font-extrabold text-text dark:text-dark-text mt-3">
              EduPlataforma v2.0
            </h1>
            <p className="text-sm text-text-muted dark:text-dark-muted mt-1">
              Tu escuela, sin límites
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-danger-bg dark:bg-danger/20 text-danger text-sm p-3 rounded-lg mb-4 animate-slide-up">
              {error}
            </div>
          )}

          {/* Email */}
          <div className="mb-4">
            <label className="block text-xs font-medium text-text-muted dark:text-dark-muted mb-1.5">
              Correo electrónico
            </label>
            <div className="relative">
              <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-light" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="usuario@escuela.cl"
                className="w-full h-11 pl-10 pr-4 rounded-lg bg-surface dark:bg-dark-card2 border border-border dark:border-white/10 text-sm text-text dark:text-dark-text placeholder:text-text-light focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all font-body"
                required
                id="email-input"
              />
            </div>
          </div>

          {/* Password */}
          <div className="mb-6">
            <label className="block text-xs font-medium text-text-muted dark:text-dark-muted mb-1.5">
              Contraseña
            </label>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-light" />
              <input
                type={showPwd ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full h-11 pl-10 pr-10 rounded-lg bg-surface dark:bg-dark-card2 border border-border dark:border-white/10 text-sm text-text dark:text-dark-text placeholder:text-text-light focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all font-body"
                required
                id="password-input"
              />
              <button
                type="button"
                onClick={() => setShowPwd(!showPwd)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-light hover:text-text-muted transition-colors"
              >
                {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Submit */}
          <Button type="submit" fullWidth size="lg" loading={loading} id="login-button">
            Ingresar
          </Button>

          {/* Connection status */}
          <div className="flex items-center justify-center gap-2 mt-4">
            <div className={`w-2 h-2 rounded-full ${connColor}`} />
            <span className="text-xs text-text-muted dark:text-dark-muted">Estado: {connText}</span>
          </div>
        </form>

        {/* Footer */}
        <p className="text-center text-xs text-text-light mt-6">
          J2N Software · Santo Tomás Arica 2026
        </p>
      </div>
    </div>
  )
}
