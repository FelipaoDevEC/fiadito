import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'

export default function NuevoCliente() {
  const nav = useNavigate()
  const { negocio } = useAuth()
  const [nombre, setNombre] = useState('')
  const [telefono, setTelefono] = useState('')
  const [nota, setNota] = useState('')
  const [limite, setLimite] = useState('')
  const [guardando, setGuardando] = useState(false)

  const guardar = async (e) => {
    e.preventDefault()
    if (!nombre.trim()) return
    setGuardando(true)
    const { data, error } = await supabase.from('clientes').insert({
      negocio_id: negocio.id,
      nombre: nombre.trim(),
      telefono: telefono.trim() || null,
      nota: nota.trim() || null,
      limite_credito: limite ? Number(limite) : null
    }).select().single()
    setGuardando(false)
    if (error) { alert(error.message); return }
    nav(`/clientes/${data.id}`, { replace: true })
  }

  return (
    <div className="app-shell px-5 py-5">
      <button onClick={() => nav(-1)} className="p-2 -ml-2 mb-2"><ArrowLeft /></button>
      <h1 className="text-2xl font-bold mb-1">Nuevo cliente</h1>
      <p className="text-gray-500 mb-5">Solo el nombre es obligatorio</p>

      <form onSubmit={guardar} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Nombre *</label>
          <input required autoFocus className="input-lg"
            value={nombre} onChange={e => setNombre(e.target.value)}
            placeholder="Ej. Juan Pérez" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Teléfono (WhatsApp)</label>
          <input inputMode="tel" className="input-lg"
            value={telefono} onChange={e => setTelefono(e.target.value)}
            placeholder="0991234567" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Nota (opcional)</label>
          <input className="input-lg" value={nota}
            onChange={e => setNota(e.target.value)} placeholder="Ej. vive en la esquina" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Límite de crédito (opcional)</label>
          <input type="number" step="0.01" min="0" className="input-lg"
            value={limite} onChange={e => setLimite(e.target.value)} placeholder="Ej. 50" />
        </div>

        <button disabled={guardando} className="btn-primary">
          {guardando ? 'Guardando…' : 'Guardar cliente'}
        </button>
      </form>
    </div>
  )
}