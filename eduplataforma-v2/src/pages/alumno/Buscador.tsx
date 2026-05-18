import React, { useState, useMemo, useCallback } from 'react'
import { idb } from '../../lib/indexeddb'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import { Search as SearchIcon, Filter } from 'lucide-react'

type TipoFiltro = 'todos' | 'guia' | 'tarea' | 'evaluacion' | 'recurso'

export default function BuscadorAlumno() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<any[]>([])
  const [filtroTipo, setFiltroTipo] = useState<TipoFiltro>('todos')
  const [searched, setSearched] = useState(false)

  const debounceRef = React.useRef<ReturnType<typeof setTimeout>>()

  const handleSearch = useCallback((value: string) => {
    setQuery(value)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      if (!value.trim()) { setResults([]); setSearched(false); return }
      const materiales = await idb.getAll('materiales')
      const q = value.toLowerCase()
      const filtered = materiales.filter((m: any) =>
        m.titulo?.toLowerCase().includes(q) || m.descripcion?.toLowerCase().includes(q)
      )
      setResults(filtered)
      setSearched(true)
    }, 300)
  }, [])

  const filteredResults = useMemo(() => {
    if (filtroTipo === 'todos') return results
    return results.filter((r: any) => r.tipo === filtroTipo)
  }, [results, filtroTipo])

  const TIPOS: { key: TipoFiltro; label: string }[] = [
    { key: 'todos', label: 'Todos' },
    { key: 'guia', label: '📖 Guías' },
    { key: 'tarea', label: '📝 Tareas' },
    { key: 'evaluacion', label: '📋 Evaluaciones' },
    { key: 'recurso', label: '📁 Recursos' },
  ]

  return (
    <div className="p-4 md:p-6 space-y-6 animate-fade-in">
      <h1 className="font-display font-extrabold text-2xl text-text dark:text-dark-text">🔍 Buscador Offline</h1>

      <div className="relative">
        <SearchIcon size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-light" />
        <input
          value={query}
          onChange={e => handleSearch(e.target.value)}
          placeholder="Buscar en materiales descargados..."
          className="w-full h-11 pl-10 pr-4 rounded-xl bg-card dark:bg-dark-card border border-border dark:border-white/10 text-sm font-body focus:outline-none focus:ring-2 focus:ring-primary/30 shadow-card"
        />
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {TIPOS.map(t => (
          <button key={t.key} onClick={() => setFiltroTipo(t.key)}
            className={`text-xs font-medium px-3 py-1.5 rounded-full whitespace-nowrap transition-colors ${
              filtroTipo === t.key ? 'bg-primary text-white' : 'bg-surface dark:bg-dark-card2 text-text-muted'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {searched && filteredResults.length === 0 && (
        <p className="text-sm text-text-muted text-center py-8">No se encontraron resultados offline</p>
      )}

      <div className="space-y-2">
        {filteredResults.map((mat: any) => (
          <Card key={mat.id} hover className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-bg rounded-lg flex items-center justify-center text-lg flex-shrink-0">
              {mat.tipo === 'guia' ? '📖' : mat.tipo === 'tarea' ? '📝' : mat.tipo === 'evaluacion' ? '📋' : '📁'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm text-text dark:text-dark-text truncate">{mat.titulo}</p>
              <Badge variant="neutral" size="sm">{mat.tipo}</Badge>
            </div>
            <button className="text-xs bg-primary text-white px-3 py-1.5 rounded-lg">Abrir</button>
          </Card>
        ))}
      </div>
    </div>
  )
}
