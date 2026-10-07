import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Save, LogOut, Crown, ChevronRight } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'

const MONEDAS = [
  { codigo: 'USD', simbolo: '$', nombre: 'Dólar (USD)' },
  { codigo: 'MXN', simbolo: '$', nombre: 'Peso mexicano (MXN)' },
  { codigo: 'COP', simbolo: '$', nombre: 'Peso colombiano (COP)' },
  { codigo: 'PEN', simbolo: 'S/', nombre: 'Sol peruano (PEN)' },
  { codigo: 'CLP', simbolo: '$', nombre: 'Peso chileno (CLP)' },
  { codigo: 'ARS', simbolo: '$', nombre: 'Peso argentino (ARS)' },
  { codigo: 'VES', simbolo: 'Bs', nombre: 'Bolívar (VES)' },
  { codigo: 'BOB', simbolo: 'Bs', nombre: 'Boliviano (BOB)' },
  { codigo: 'PYG', simbolo: '₲', nombre: 'Guaraní (PYG)' },
  { codigo: 'UYU', simbolo: '$U', nombre: 'Peso uruguayo (UYU)' },
  { codigo: 'GTQ', simbolo: 'Q', nombre: 'Quetzal (GTQ)' },
  { codigo: 'CRC', simbolo: '₡', nombre: 'Colón (CRC)' },
  { codigo: 'PAB', simbolo: 'B/.', nombre: 'Balboa (PAB)' },
  { codigo: 'DOP', simbolo: 'RD$', nombre: 'Peso dominicano (DOP)' },
  { codigo: 'HNL', simbolo: 'L', nombre: 'Lempira (HNL)' },
  { codigo: 'NIO', simbolo: 'C$', nombre: 'Córdoba (NIO)' }
]

export default function Ajustes() {
  const nav = useNavigate()
  const { negocio, refreshNegocio, signOut } = useAuth()

  const [form, setForm] = useState({
    nombre: '',
    telefono: '',
    moneda: 'USD',
    simbolo: '$',
    prefijo_pais: '593',
    plantilla_mensaje: ''
  })
  const [guardando, setGuardando] = useState(false)
  const [ok, setOk] = useState(false)
  const [cargado, setCargado] = useState(false)

  useEffect(() => {
    if (negocio && !cargado) {
      setForm({
        nombre: negocio.nombre || '',
        telefono: negocio.telefono || '',
        moneda: negocio.moneda || 'USD',
        simbolo: negocio.simbolo || '$',
        prefijo_pais: negocio.prefijo_pais || '593',
        plantilla_mensaje: negocio.plantilla_mensaje || ''
      })
      setCargado(true)
    }
  }, [negocio, cargado])

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  const cambiarMoneda = (codigo) => {
    const m = MONEDAS.find(x => x.codigo === codigo)
    if (!m) return
    setForm({ ...form, moneda: m.codigo, simbolo: m.simbolo })
  }

  const guardar = async (e) => {
    e.preventDefault()
    setGuardando(true)
    const { error } = await supabase
      .from('negocios')
      .update({
        nombre: form.nombre.trim(),
        telefono: form.telefono.trim(),
        moneda: form.moneda,
        simbolo: form.simbolo,
        prefijo_pais: form.prefijo_pais.replace(/\D/g, '') || '593',
        plantilla_mensaje: form.plantilla_mensaje.trim()
      })
      .eq('id', negocio.id)
    setGuardando(false)
    if (error) { alert(error.message); return }
    await refreshNegocio()
    setOk(true)
    setTimeout(() => setOk(false), 1500)
  }

  if (!negocio) return (
    <div className="app-shell p-8 text-center text-gray-400">Cargando…</div>
  )

  return (
    <div className="app-shell">
      <header className="px-5 pt-5 pb-3">
        <h1 className="text-2xl font-bold">Ajustes</h1>
        <p className="text-gray-500 text-sm">Configura tu negocio</p>
      </header>

      <form onSubmit={guardar} className="px-5 space-y-4 pb-8">
        <div>
          <label className="block text-sm font-medium mb-1">Nombre del negocio</label>
          <input required className="input-lg" value={form.nombre}
            onChange={set('nombre')} placeholder="Ej. Tienda Doña Rosa" />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">WhatsApp del negocio</label>
          <input required className="input-lg" inputMode="tel"
            value={form.telefono} onChange={set('telefono')}
            placeholder="0991234567" />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Moneda</label>
          <select className="input-lg bg-white"
            value={form.moneda} onChange={e => cambiarMoneda(e.target.value)}>
            {MONEDAS.map(m => (
              <option key={m.codigo} value={m.codigo}>
                {m.nombre} — {m.simbolo}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium mb-1">Símbolo</label>
            <input required className="input-lg" value={form.simbolo}
              onChange={set('simbolo')} maxLength={3} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Prefijo país</label>
            <input required className="input-lg" inputMode="numeric"
              value={form.prefijo_pais} onChange={set('prefijo_pais')}
              placeholder="593" maxLength={4} />
          </div>
        </div>
        <p className="text-xs text-gray-500 -mt-2">
          Ej. Ecuador 593, México 52, Colombia 57, Perú 51, Argentina 54, Chile 56
        </p>

        <div>
          <label className="block text-sm font-medium mb-1">Plantilla del mensaje</label>
          <textarea rows={4} className="input-lg resize-none"
            value={form.plantilla_mensaje}
            onChange={set('plantilla_mensaje')} />
          <p className="text-xs text-gray-500 mt-1">
            Variables: <code className="bg-gray-100 px-1 rounded">{'{cliente}'}</code>{' '}
            <code className="bg-gray-100 px-1 rounded">{'{saldo}'}</code>{' '}
            <code className="bg-gray-100 px-1 rounded">{'{negocio}'}</code>{' '}
            <code className="bg-gray-100 px-1 rounded">{'{fecha_ultimo_fiado}'}</code>
          </p>
        </div>

        <button disabled={guardando} className="btn-primary flex items-center justify-center gap-2">
          {ok ? '✓ Guardado'
            : guardando ? 'Guardando…'
            : <><Save size={18} /> Guardar cambios</>}
        </button>
      </form>

      <section className="px-5 pb-8">
        <h2 className="font-bold text-lg mb-3">Cuenta</h2>

        {/* Plan actual */}
        <button onClick={() => nav('/upgrade')}
          className="w-full flex items-center justify-between gap-3 p-4 bg-white rounded-2xl border border-gray-100 active:bg-gray-50 mb-2">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              negocio.plan === 'pro'
                ? 'bg-amber-100 text-amber-600'
                : 'bg-gray-100 text-gray-500'
            }`}>
              <Crown size={20} />
            </div>
            <div className="text-left">
              <div className="font-semibold">
                Plan {negocio.plan === 'pro' ? 'Pro' : 'Gratis'}
              </div>
              <div className="text-xs text-gray-500">
                {negocio.plan === 'pro'
                  ? 'Clientes ilimitados'
                  : 'Hasta 10 clientes'}
              </div>
            </div>
          </div>
          <ChevronRight size={20} className="text-gray-400" />
        </button>

        {/* Cerrar sesión */}
        <button onClick={() => {
          if (confirm('¿Cerrar sesión?')) signOut()
        }}
          className="w-full flex items-center justify-between gap-3 p-4 bg-white rounded-2xl border border-gray-100 active:bg-gray-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-danger-light text-danger flex items-center justify-center">
              <LogOut size={20} />
            </div>
            <div className="font-semibold">Cerrar sesión</div>
          </div>
          <ChevronRight size={20} className="text-gray-400" />
        </button>
      </section>
    </div>
  )
}