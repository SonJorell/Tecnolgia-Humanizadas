import React from 'react'
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from './stores/authStore'
import { useConnectivity } from './hooks/useAuth'

// Layout
import ConnBanner from './components/layout/ConnBanner'
import Topbar from './components/layout/Topbar'
import Sidebar from './components/layout/Sidebar'
import BottomNav from './components/layout/BottomNav'
import ToastContainer from './components/ui/Toast'
import XPFloat from './components/gamification/XPFloat'

// Pages
import Login from './pages/Login'
import InicioAlumno from './pages/alumno/Inicio'
import CursosAlumno from './pages/alumno/Cursos'
import TareasAlumno from './pages/alumno/Tareas'
import LogrosAlumno from './pages/alumno/Logros'
import BuscadorAlumno from './pages/alumno/Buscador'
import FeedbackAlumno from './pages/alumno/Feedback'
import TiendaAlumno from './pages/alumno/Tienda'

import PanelDocente from './pages/docente/Panel'
import AlumnosDocente from './pages/docente/Alumnos'
import MaterialesDocente from './pages/docente/Materiales'
import DashboardDocente from './pages/docente/Dashboard'
import ReportesDocente from './pages/docente/Reportes'

import ResumenDirectivo from './pages/directivo/Resumen'
import RendimientoDirectivo from './pages/directivo/Rendimiento'
import InfraestructuraDirectivo from './pages/directivo/Infraestructura'
import AlertasDirectivo from './pages/directivo/Alertas'

function ProtectedRoute({ children, roles }: { children: React.ReactElement; roles: string[] }) {
  const { perfil, loading } = useAuthStore()

  if (loading) {
    return (
      <div className="min-h-screen bg-surface dark:bg-dark-surface flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-text-muted font-body">Cargando...</p>
        </div>
      </div>
    )
  }

  if (!perfil) return <Navigate to="/login" replace />
  if (!roles.includes(perfil.rol)) return <Navigate to="/login" replace />
  return children
}

function AppLayout() {
  useConnectivity()

  return (
    <div className="min-h-screen bg-surface dark:bg-dark-surface">
      <ConnBanner />
      <div style={{ paddingTop: '36px' }}>
        <Topbar />
        <div className="app-layout">
          <Sidebar />
          <main className="main-content flex-1 min-h-[calc(100dvh-96px)] pb-20 md:pb-6">
            <Outlet />
          </main>
        </div>
      </div>
      <BottomNav />
      <ToastContainer />
      <XPFloat />
    </div>
  )
}

function RedirigirPorRol() {
  const { perfil, loading } = useAuthStore()
  if (loading) return null
  if (!perfil) return <Navigate to="/login" replace />
  return <Navigate to={`/${perfil.rol}`} replace />
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        {/* Alumno */}
        <Route element={
          <ProtectedRoute roles={['alumno']}>
            <AppLayout />
          </ProtectedRoute>
        }>
          <Route path="/alumno" element={<InicioAlumno />} />
          <Route path="/alumno/cursos" element={<CursosAlumno />} />
          <Route path="/alumno/tareas" element={<TareasAlumno />} />
          <Route path="/alumno/logros" element={<LogrosAlumno />} />
          <Route path="/alumno/buscador" element={<BuscadorAlumno />} />
          <Route path="/alumno/feedback" element={<FeedbackAlumno />} />
          <Route path="/alumno/tienda" element={<TiendaAlumno />} />
        </Route>

        {/* Docente */}
        <Route element={
          <ProtectedRoute roles={['docente']}>
            <AppLayout />
          </ProtectedRoute>
        }>
          <Route path="/docente" element={<PanelDocente />} />
          <Route path="/docente/alumnos" element={<AlumnosDocente />} />
          <Route path="/docente/materiales" element={<MaterialesDocente />} />
          <Route path="/docente/dashboard" element={<DashboardDocente />} />
          <Route path="/docente/reportes" element={<ReportesDocente />} />
        </Route>

        {/* Directivo */}
        <Route element={
          <ProtectedRoute roles={['directivo']}>
            <AppLayout />
          </ProtectedRoute>
        }>
          <Route path="/directivo" element={<ResumenDirectivo />} />
          <Route path="/directivo/rendimiento" element={<RendimientoDirectivo />} />
          <Route path="/directivo/infraestructura" element={<InfraestructuraDirectivo />} />
          <Route path="/directivo/alertas" element={<AlertasDirectivo />} />
        </Route>

        {/* Root redirect */}
        <Route path="/" element={<RedirigirPorRol />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
