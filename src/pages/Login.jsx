import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function Login() {
  const { signIn } = useAuth()
  const nav = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [err, setErr] = useState('')
  const [cargando, setCargando] = useState(false)

  const onSubmit = async (e) => {
    e.preventDefault()
    setErr(''); setCargando(true)
    const { error } = await signIn(email.trim(), password)
    setCargando(false)
    if (error) setErr('Correo o contraseña incorrectos')
    else nav('/')
  }

  return (
    <div className="app-shell flex flex-col justify-center px-6">
      <div className="text-center mb-8">
        <div className="text-5xl mb-2">📒</div>
        <h1 className="text-3xl font-bold text-primary">Fiadito</h1>
        <p className="text-gray-500 mt-1">Tu cuaderno de fiados digital</p>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Correo</label>
          <input type="email" required className="input-lg"
            value={email} onChange={e => setEmail(e.target.value)}
            placeholder="tucorreo@ejemplo.com" autoComplete="email" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Contraseña</label>
          <input type="password" required className="input-lg"
            value={password} onChange={e => setPassword(e.target.value)}
            placeholder="••••••••" autoComplete="current-password" />
        </div>

        {err && <p className="text-danger text-sm">{err}</p>}

        <button disabled={cargando} className="btn-primary">
          {cargando ? 'Entrando…' : 'Entrar'}
        </button>
      </form>

      <p className="text-center mt-6 text-gray-600">
        ¿No tienes cuenta?{' '}
        <Link to="/registro" className="text-primary font-semibold">Crear una</Link>
      </p>
    </div>
  )
}