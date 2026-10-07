import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function Registro() {
  const { signUp } = useAuth()
  const nav = useNavigate()
  const [form, setForm] = useState({
    nombreNegocio: '', telefono: '', email: '', password: ''
  })
  const [err, setErr] = useState('')
  const [cargando, setCargando] = useState(false)

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  const onSubmit = async (e) => {
    e.preventDefault()
    setErr(''); setCargando(true)
    const { error } = await signUp(form)
    setCargando(false)
    if (error) setErr(error.message)
    else nav('/')
  }

  return (
    <div className="app-shell px-6 py-8">
      <h1 className="text-2xl font-bold mb-1">Crear tu cuenta</h1>
      <p className="text-gray-500 mb-6">Solo te tomará 30 segundos</p>

      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Nombre del negocio</label>
          <input required className="input-lg" value={form.nombreNegocio}
            onChange={set('nombreNegocio')} placeholder="Ej. Tienda Doña Rosa" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">WhatsApp del negocio</label>
          <input required className="input-lg" inputMode="tel"
            value={form.telefono} onChange={set('telefono')} placeholder="0991234567" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Correo</label>
          <input type="email" required className="input-lg"
            value={form.email} onChange={set('email')} placeholder="tucorreo@ejemplo.com" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Contraseña</label>
          <input type="password" required minLength={6} className="input-lg"
            value={form.password} onChange={set('password')}
            placeholder="Mínimo 6 caracteres" />
        </div>

        {err && <p className="text-danger text-sm">{err}</p>}

        <button disabled={cargando} className="btn-primary">
          {cargando ? 'Creando…' : 'Crear cuenta'}
        </button>
      </form>

      <p className="text-center mt-6 text-gray-600">
        ¿Ya tienes cuenta?{' '}
        <Link to="/login" className="text-primary font-semibold">Entrar</Link>
      </p>
    </div>
  )
}