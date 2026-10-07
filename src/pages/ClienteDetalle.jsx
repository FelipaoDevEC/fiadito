import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, MessageCircle, Pencil, Trash2 } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { useMovimientos } from '../hooks/useMovimientos'
import { useClientes } from '../hooks/useClientes'
import { formatMoney, diasDesde } from '../lib/format'
import { construirMensaje } from '../lib/whatsapp'
import FiadoAbonoSheet from '../components/FiadoAbonoSheet'
import WhatsAppPreview from '../components/WhatsAppPreview'

export default function ClienteDetalle() {
  const { id } = useParams()
  const nav = useNavigate()
  const { negocio } = useAuth()
  const { clientes, recargar: recargarClientes } = useClientes()
  const cliente = clientes.find(c => c.id === id)
  const { movimientos, recargar } = useMovimientos(id)

  const [sheet, setSheet] = useState(null)
  const [verWA, setVerWA] = useState(null)

  const simbolo = negocio?.simbolo || '$'

  const movimientosConSaldo = useMemo(() => {
    const asc = [...movimientos].sort((a, b) =>
      a.fecha === b.fecha
        ? new Date(a.created_at) - new Date(b.created_at)
        : (a.fecha < b.fecha ? -1 : 1))
    let s = 0
    const conSaldo = asc.map(m => {
      s += m.tipo === 'fiado' ? Number(m.monto) : -Number(m.monto)
      return { ...m, saldo_resultante: s }
    })
    return conSaldo.reverse()
  }, [movimientos])

  const saldo = cliente?.saldo ?? movimientosConSaldo[0]?.saldo_resultante ?? 0
  const excede = cliente?.limite_credito != null && saldo > Number(cliente.limite_credito)

  const refrescarTodo = () => { recargar(); recargarClientes() }

  const eliminar = async (m) => {
    if (!confirm('¿Eliminar este movimiento?')) return
    const { error } = await supabase.from('movimientos').delete().eq('id', m.id)
    if (error) return alert(error.message)
    refrescarTodo()
  }

  const editar = async (m) => {
    const nuevo = prompt('Nuevo monto:', String(m.monto))
    if (nuevo == null) return
    const n = Number(nuevo)
    if (!n || n <= 0) return alert('Monto inválido')
    const { error } = await supabase.from('movimientos').update({ monto: n }).eq('id', m.id)
    if (error) return alert(error.message)
    refrescarTodo()
  }

  const cobrar = () => {
    if (!cliente) return
    const ultimoFiado = movimientos.find(m => m.tipo === 'fiado')
    const mensaje = construirMensaje(negocio?.plantilla_mensaje, {
      cliente: cliente.nombre,
      saldo: formatMoney(saldo, simbolo),
      negocio: negocio?.nombre || '',
      fecha_ultimo_fiado: ultimoFiado?.fecha || ''
    })
    setVerWA({ mensaje, telefono: cliente.telefono || '' })
  }

  if (!cliente) return (
    <div className="app-shell p-6 text-center text-gray-500">Cargando cliente…</div>
  )

  const debe = saldo > 0
  const dias = diasDesde(cliente.ultima_fecha)

  return (
    <div className="app-shell">
      <header className="px-5 pt-5 pb-4">
        <button onClick={() => nav(-1)} className="p-2 -ml-2 mb-2"><ArrowLeft /></button>
        <h1 className="text-2xl font-bold">{cliente.nombre}</h1>
        <p className="text-gray-500">
          {cliente.telefono || 'Sin teléfono'}
          {dias != null && <> · último mov. hace {dias} día{dias !== 1 ? 's' : ''}</>}
        </p>

        <div className={`mt-4 p-5 rounded-2xl text-center ${
          debe ? 'bg-danger-light' : 'bg-primary-light'}`}>
          <div className="text-sm text-gray-600">Saldo actual</div>
          <div className={`text-4xl font-bold monto ${debe ? 'text-danger' : 'text-primary'}`}>
            {formatMoney(saldo, simbolo)}
          </div>
          {cliente.limite_credito != null && (
            <div className="text-xs text-gray-500 mt-1">
              Límite: {formatMoney(cliente.limite_credito, simbolo)}
            </div>
          )}
        </div>

        {excede && (
          <div className="mt-3 bg-danger text-white text-sm rounded-xl p-3 text-center font-semibold">
            ⚠️ Superó su límite de crédito
          </div>
        )}

        <div className="grid grid-cols-3 gap-2 mt-4">
          <button onClick={() => setSheet('fiado')}
            className="rounded-2xl bg-danger text-white font-semibold py-3 text-sm active:scale-95">
            + Fiado
          </button>
          <button onClick={() => setSheet('abono')}
            className="rounded-2xl bg-primary text-white font-semibold py-3 text-sm active:scale-95">
            + Abono
          </button>
          <button onClick={cobrar} disabled={!debe}
            className="rounded-2xl bg-gray-900 text-white font-semibold py-3 text-sm active:scale-95 disabled:opacity-40 flex items-center justify-center gap-1">
            <MessageCircle size={16} /> Cobrar
          </button>
        </div>
      </header>

      <section className="px-5 pb-8">
        <h2 className="font-semibold text-gray-700 mb-2">Historial</h2>
        {movimientosConSaldo.length === 0 ? (
          <div className="text-center text-gray-500 py-10">
            Sin movimientos todavía.<br />
            Registra el primer fiado con el botón rojo.
          </div>
        ) : (
          <ul className="space-y-2">
            {movimientosConSaldo.map(m => (
              <MovimientoItem key={m.id} m={m} simbolo={simbolo}
                onEditar={() => editar(m)} onEliminar={() => eliminar(m)} />
            ))}
          </ul>
        )}
      </section>

      {sheet && (
        <FiadoAbonoSheet
          abierto
          tipo={sheet}
          clienteId={cliente.id}
          negocioId={negocio.id}
          simbolo={simbolo}
          onClose={() => setSheet(null)}
          onGuardado={refrescarTodo}
        />
      )}

      {verWA && (
        <WhatsAppPreview
          {...verWA}
          prefijo={negocio?.prefijo_pais || '593'}
          onClose={() => setVerWA(null)}
        />
      )}
    </div>
  )
}

function MovimientoItem({ m, simbolo, onEditar, onEliminar }) {
  const esFiado = m.tipo === 'fiado'
  return (
    <li className="bg-white rounded-2xl border border-gray-100 p-3 flex items-center gap-3">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg font-bold ${
        esFiado ? 'bg-danger-light text-danger' : 'bg-primary-light text-primary'}`}>
        {esFiado ? '↑' : '↓'}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between gap-2">
          <span className="font-semibold">{esFiado ? 'Fiado' : 'Abono'}</span>
          <span className={`monto ${esFiado ? 'text-danger' : 'text-primary'}`}>
            {esFiado ? '+' : '-'}{formatMoney(m.monto, simbolo)}
          </span>
        </div>
        <div className="text-xs text-gray-500 truncate">
          {m.fecha}{m.descripcion ? ` · ${m.descripcion}` : ''}
          {m.fecha_vencimiento ? ` · vence ${m.fecha_vencimiento}` : ''}
        </div>
        <div className="text-xs text-gray-400">
          Saldo: {formatMoney(m.saldo_resultante, simbolo)}
        </div>
      </div>
      <div className="flex flex-col gap-1">
        <button onClick={onEditar} className="p-1.5 text-gray-400"><Pencil size={16} /></button>
        <button onClick={onEliminar} className="p-1.5 text-gray-400"><Trash2 size={16} /></button>
      </div>
    </li>
  )
}