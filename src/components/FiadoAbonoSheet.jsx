import { useState } from 'react'
import { X } from 'lucide-react'
import NumericKeypad from './NumericKeypad'
import { hoyISO, sumarDias } from '../lib/format'
import { supabase } from '../lib/supabase'

export default function FiadoAbonoSheet({
  abierto, tipo, clienteId, negocioId, simbolo = '$', onClose, onGuardado
}) {
  const [monto, setMonto] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [fecha, setFecha] = useState(hoyISO())
  const [vencimiento, setVencimiento] = useState('')
  const [guardando, setGuardando] = useState(false)
  const [ok, setOk] = useState(false)

  if (!abierto) return null

  const titulo = tipo === 'fiado' ? 'Nuevo fiado' : 'Registrar abono'

  const guardar = async () => {
    const n = Number(monto)
    if (!n || n <= 0) return
    setGuardando(true)
    const { error } = await supabase.from('movimientos').insert({
      cliente_id: clienteId,
      negocio_id: negocioId,
      tipo,
      monto: n,
      descripcion: descripcion.trim() || null,
      fecha,
      fecha_vencimiento: tipo === 'fiado' && vencimiento ? vencimiento : null
    })
    setGuardando(false)
    if (error) { alert('No se pudo guardar: ' + error.message); return }
    setOk(true)
    setTimeout(() => {
      setOk(false)
      setMonto(''); setDescripcion(''); setVencimiento(''); setFecha(hoyISO())
      onGuardado?.()
      onClose()
    }, 700)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-black/40">
      <div className="w-full max-w-md mx-auto bg-white rounded-t-3xl p-5 space-y-4 max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">{titulo}</h2>
          <button onClick={onClose} className="p-2 -mr-2"><X /></button>
        </div>

        <div className="text-center py-3 bg-gray-50 rounded-2xl">
          <div className="text-gray-500 text-sm">Monto</div>
          <div className={`text-5xl font-bold tabular-nums ${
            tipo === 'fiado' ? 'text-danger' : 'text-primary'
          }`}>
            {simbolo}{monto || '0'}
          </div>
        </div>

        <NumericKeypad value={monto} onChange={setMonto} />

        <div>
          <label className="block text-sm font-medium mb-1">Descripción (opcional)</label>
          <input className="input-lg" value={descripcion}
            onChange={e => setDescripcion(e.target.value)}
            placeholder={tipo === 'fiado' ? 'Ej. arroz y aceite' : 'Ej. pago parcial'} />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Fecha</label>
          <input type="date" className="input-lg" value={fecha}
            onChange={e => setFecha(e.target.value)} />
        </div>

        {tipo === 'fiado' && (
          <div>
            <label className="block text-sm font-medium mb-1">Vence (opcional)</label>
            <input type="date" className="input-lg" value={vencimiento}
              onChange={e => setVencimiento(e.target.value)} />
            <div className="flex gap-2 mt-2">
              {[7, 15, 30].map(d => (
                <button key={d} type="button"
                  onClick={() => setVencimiento(sumarDias(d))}
                  className="flex-1 py-2 rounded-xl bg-gray-100 text-sm font-medium">
                  {d} días
                </button>
              ))}
            </div>
          </div>
        )}

        <button onClick={guardar} disabled={guardando || !monto} className="btn-primary">
          {ok ? '✓ Guardado' : guardando ? 'Guardando…'
            : tipo === 'fiado' ? 'Guardar fiado' : 'Guardar abono'}
        </button>
      </div>
    </div>
  )
}