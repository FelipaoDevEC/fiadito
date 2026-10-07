import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Search } from 'lucide-react'
import { useClientes } from '../hooks/useClientes'
import { useAuth } from '../contexts/AuthContext'
import ClienteCard from '../components/ClienteCard'

const FILTROS = ['Todos', 'Con deuda', 'Vencidos', 'Al día']

export default function Clientes() {
  const nav = useNavigate()
  const { negocio } = useAuth()
  const { clientes, loading } = useClientes()
  const [q, setQ] = useState('')
  const [filtro, setFiltro] = useState('Todos')

  const simbolo = negocio?.simbolo || '$'

  const filtrados = useMemo(() => {
    const term = q.trim().toLowerCase()
    return clientes.filter(c => {
      if (term && !(c.nombre.toLowerCase().includes(term) ||
                    (c.telefono || '').includes(term))) return false
      if (filtro === 'Con deuda' && !(c.saldo > 0)) return false
      if (filtro === 'Al día' && c.saldo > 0) return false
      if (filtro === 'Vencidos' && !c.vencido) return false
      return true
    })
  }, [clientes, q, filtro])

  const irNuevo = () => {
    const limite = negocio?.plan === 'gratis' ? 10 : Infinity
    if (clientes.length >= limite) nav('/upgrade')
    else nav('/clientes/nuevo')
  }

  return (
    <div className="app-shell">
      <header className="sticky top-0 z-30 bg-white px-4 pt-5 pb-3 border-b">
        <h1 className="text-2xl font-bold mb-3">Clientes</h1>
        <div className="relative">
          <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input className="input-lg pl-10" placeholder="Buscar por nombre o teléfono"
            value={q} onChange={e => setQ(e.target.value)} />
        </div>
        <div className="flex gap-2 mt-3 overflow-x-auto -mx-1 px-1">
          {FILTROS.map(f => (
            <button key={f} onClick={() => setFiltro(f)}
              className={`whitespace-nowrap px-3 py-1.5 rounded-full text-sm font-medium ${
                filtro === f ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700'
              }`}>
              {f}
            </button>
          ))}
        </div>
      </header>

      <div className="px-4 py-4 space-y-2">
        {loading ? (
          <p className="text-center text-gray-400 py-8">Cargando…</p>
        ) : filtrados.length === 0 ? (
          <Empty onAdd={irNuevo} hayClientes={clientes.length > 0} />
        ) : (
          filtrados.map(c => <ClienteCard key={c.id} cliente={c} simbolo={simbolo} />)
        )}
      </div>

      <button onClick={irNuevo}
        className="fixed bottom-24 right-4 z-30 h-14 px-5 rounded-full bg-primary text-white font-semibold shadow-lg active:scale-95 flex items-center gap-2">
        <Plus size={22} /> Nuevo cliente
      </button>
    </div>
  )
}

function Empty({ onAdd, hayClientes }) {
  return (
    <div className="text-center py-16 px-6">
      <div className="text-5xl mb-3">👥</div>
      <p className="text-gray-600 text-lg">
        {hayClientes ? 'No hay clientes con ese filtro'
          : 'Aún no tienes clientes. Agrega el primero en 10 segundos.'}
      </p>
      {!hayClientes && (
        <button onClick={onAdd} className="btn-primary mt-5 max-w-xs mx-auto">
          + Nuevo cliente
        </button>
      )}
    </div>
  )
}