import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AlertTriangle, TrendingUp, Users, Wallet, Plus, X } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useClientes } from '../hooks/useClientes'
import { supabase } from '../lib/supabase'
import { formatMoney } from '../lib/format'
import FiadoAbonoSheet from '../components/FiadoAbonoSheet'

export default function Inicio() {
  const { negocio } = useAuth()
  const { clientes, loading, recargar } = useClientes()
  const [pickerAbierto, setPickerAbierto] = useState(false)
  const [clienteElegido, setClienteElegido] = useState(null)

  const simbolo = negocio?.simbolo || '$'

  // ====== MÉTRICAS ======
  const totalPorCobrar = useMemo(
    () => clientes.reduce((s, c) => s + Math.max(0, c.saldo), 0),
    [clientes]
  )

  const conDeuda = useMemo(
    () => clientes.filter(c => c.saldo > 0).length,
    [clientes]
  )

  const vencidos = useMemo(
    () => clientes.filter(c => c.vencido),
    [clientes]
  )

  // Cobrado este mes: sumar abonos del mes actual
  const [cobradoMes, setCobradoMes] = useState(0)
  useMemo(() => {
    if (!negocio?.id) return
    const inicioMes = new Date()
    inicioMes.setDate(1)
    const iso = inicioMes.toISOString().slice(0, 10)
    supabase
      .from('movimientos')
      .select('monto')
      .eq('negocio_id', negocio.id)
      .eq('tipo', 'abono')
      .gte('fecha', iso)
      .then(({ data }) => {
        const total = (data || []).reduce((s, m) => s + Number(m.monto), 0)
        setCobradoMes(total)
      })
  }, [negocio?.id, clientes])

  const top5 = useMemo(
    () => [...clientes].filter(c => c.saldo > 0)
      .sort((a, b) => b.saldo - a.saldo)
      .slice(0, 5),
    [clientes]
  )

  if (loading) {
    return <div className="app-shell p-8 text-center text-gray-400">Cargando…</div>
  }

  return (
    <div className="app-shell">
      <header className="px-5 pt-6 pb-2">
        <p className="text-sm text-gray-500">Hola,</p>
        <h1 className="text-2xl font-bold truncate">{negocio?.nombre || 'Mi negocio'}</h1>
      </header>

      {/* TARJETA PRINCIPAL */}
      <section className="px-5 pt-3">
        <div className="rounded-3xl bg-gradient-to-br from-primary to-primary-dark text-white p-6 shadow-lg">
          <div className="flex items-center gap-2 text-primary-light">
            <Wallet size={18} />
            <span className="text-sm font-medium">Total por cobrar</span>
          </div>
          <div className="mt-3 text-5xl font-bold tabular-nums">
            {formatMoney(totalPorCobrar, simbolo)}
          </div>
          <div className="mt-2 text-sm text-primary-light">
            {conDeuda === 0 ? 'Todo al día 🎉'
              : `${conDeuda} cliente${conDeuda !== 1 ? 's' : ''} con deuda`}
          </div>
        </div>
      </section>

      {/* INDICADORES */}
      <section className="px-5 mt-4 grid grid-cols-3 gap-3">
        <Indicador
          icon={<Users size={18} />}
          label="Con deuda"
          valor={conDeuda}
          color="primary"
        />
        <Indicador
          icon={<AlertTriangle size={18} />}
          label="Vencidos"
          valor={vencidos.length}
          color={vencidos.length > 0 ? 'danger' : 'gray'}
        />
        <Indicador
          icon={<TrendingUp size={18} />}
          label="Cobrado mes"
          valor={formatMoney(cobradoMes, simbolo)}
          color="primary"
          chico
        />
      </section>

      {/* TOP 5 */}
      <section className="px-5 mt-6">
        <h2 className="font-bold text-lg mb-2">Te deben más</h2>
        {top5.length === 0 ? (
          <div className="text-center text-gray-400 py-6 text-sm">
            Nadie te debe nada por ahora ✨
          </div>
        ) : (
          <ul className="space-y-2">
            {top5.map(c => (
              <li key={c.id}>
                <Link to={`/clientes/${c.id}`}
                  className="flex items-center justify-between gap-3 p-3 bg-white rounded-2xl border border-gray-100 active:bg-gray-50">
                  <span className="font-semibold truncate">{c.nombre}</span>
                  <span className="monto text-danger">
                    {formatMoney(c.saldo, simbolo)}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* VENCIDOS */}
      {vencidos.length > 0 && (
        <section className="px-5 mt-6">
          <h2 className="font-bold text-lg mb-2 text-danger">⚠️ Vencidos</h2>
          <ul className="space-y-2">
            {vencidos.slice(0, 5).map(c => (
              <li key={c.id}>
                <Link to={`/clientes/${c.id}`}
                  className="flex items-center justify-between gap-3 p-3 bg-danger-light rounded-2xl active:bg-danger-light/70">
                  <span className="font-semibold truncate">{c.nombre}</span>
                  <span className="monto text-danger">
                    {formatMoney(c.saldo, simbolo)}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* ESPACIO INFERIOR */}
      <div className="h-32" />

      {/* BOTÓN FLOTANTE */}
      <button
        onClick={() => setPickerAbierto(true)}
        className="fixed bottom-24 right-4 z-30 h-14 px-5 rounded-full bg-danger text-white font-semibold shadow-lg active:scale-95 flex items-center gap-2">
        <Plus size={22} /> Fiado rápido
      </button>

      {/* PICKER DE CLIENTE */}
      {pickerAbierto && (
        <ClientePicker
          clientes={clientes}
          onClose={() => setPickerAbierto(false)}
          onElegir={(c) => { setPickerAbierto(false); setClienteElegido(c) }}
        />
      )}

      {/* SHEET DE FIADO */}
      {clienteElegido && negocio && (
        <FiadoAbonoSheet
          abierto
          tipo="fiado"
          clienteId={clienteElegido.id}
          negocioId={negocio.id}
          simbolo={simbolo}
          onClose={() => setClienteElegido(null)}
          onGuardado={recargar}
        />
      )}
    </div>
  )
}

function Indicador({ icon, label, valor, color = 'primary', chico }) {
  const colorBg = {
    primary: 'bg-primary-light text-primary',
    danger: 'bg-danger-light text-danger',
    gray: 'bg-gray-100 text-gray-500'
  }[color]

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-3 flex flex-col gap-1">
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${colorBg}`}>
        {icon}
      </div>
      <div className="text-xs text-gray-500">{label}</div>
      <div className={`font-bold tabular-nums ${chico ? 'text-sm' : 'text-xl'}`}>
        {valor}
      </div>
    </div>
  )
}

function ClientePicker({ clientes, onClose, onElegir }) {
  const [q, setQ] = useState('')
  const nav = useNavigate()

  const filtrados = useMemo(() => {
    const t = q.trim().toLowerCase()
    if (!t) return clientes
    return clientes.filter(c =>
      c.nombre.toLowerCase().includes(t) || (c.telefono || '').includes(t)
    )
  }, [clientes, q])

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-black/40">
      <div className="w-full max-w-md mx-auto bg-white rounded-t-3xl p-5 max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl font-bold">¿A quién le fiaste?</h2>
          <button onClick={onClose} className="p-2 -mr-2"><X /></button>
        </div>

        <input
          className="input-lg mb-3"
          placeholder="Buscar cliente…"
          value={q}
          onChange={e => setQ(e.target.value)}
          autoFocus
        />

        <div className="overflow-y-auto -mx-1 px-1 flex-1">
          {clientes.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <p className="mb-4">Todavía no tienes clientes.</p>
              <button onClick={() => { onClose(); nav('/clientes/nuevo') }}
                className="btn-primary max-w-xs mx-auto">
                + Crear cliente
              </button>
            </div>
          ) : filtrados.length === 0 ? (
            <p className="text-center text-gray-400 py-8">Sin resultados</p>
          ) : (
            <ul className="space-y-2">
              {filtrados.map(c => (
                <li key={c.id}>
                  <button
                    onClick={() => onElegir(c)}
                    className="w-full text-left flex items-center justify-between gap-3 p-3 bg-gray-50 rounded-2xl active:bg-gray-100">
                    <span className="font-semibold truncate">{c.nombre}</span>
                    <span className="text-xs text-gray-400">
                      {c.telefono || ''}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}