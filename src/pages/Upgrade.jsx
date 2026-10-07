import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Check, Crown, Clock } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

const BENEFICIOS = [
  { titulo: 'Clientes ilimitados', desc: 'Sin tope de 10 clientes' },
  { titulo: 'Recordatorios automáticos', desc: 'Envía recordatorios por WhatsApp sin esfuerzo' },
  { titulo: 'Reportes de ventas', desc: 'Ve cuánto fiado diste y cuánto cobraste' },
  { titulo: 'Respaldo en la nube', desc: 'Tus datos seguros y sincronizados' },
  { titulo: 'Soporte prioritario', desc: 'Respuesta rápida cuando lo necesites' }
]

export default function Upgrade() {
  const nav = useNavigate()
  const { negocio } = useAuth()
  const esPro = negocio?.plan === 'pro'

  return (
    <div className="app-shell">
      <header className="px-5 pt-5 pb-3">
        <button onClick={() => nav(-1)} className="p-2 -ml-2 mb-2">
          <ArrowLeft />
        </button>
      </header>

      <section className="px-5 pb-4 text-center">
        <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center mb-4 shadow-lg">
          <Crown size={40} className="text-white" />
        </div>
        <h1 className="text-3xl font-bold mb-1">Plan Pro</h1>
        <p className="text-gray-500">
          {esPro
            ? '¡Ya tienes el Plan Pro activo! 🎉'
            : 'Desbloquea todo el potencial de Fiadito'}
        </p>
      </section>

      <section className="px-5 space-y-3">
        {BENEFICIOS.map(b => (
          <div key={b.titulo}
            className="flex gap-3 p-4 bg-white rounded-2xl border border-gray-100">
            <div className="w-6 h-6 rounded-full bg-primary-light text-primary flex items-center justify-center flex-shrink-0 mt-0.5">
              <Check size={16} strokeWidth={3} />
            </div>
            <div>
              <div className="font-semibold">{b.titulo}</div>
              <div className="text-sm text-gray-500">{b.desc}</div>
            </div>
          </div>
        ))}
      </section>

      <section className="px-5 mt-6 pb-8">
        {esPro ? (
          <div className="bg-primary-light text-primary rounded-2xl p-4 text-center font-semibold">
            ✓ Tu plan está activo
          </div>
        ) : (
          <>
            <button
              onClick={() => alert('Próximamente 💚\n\nEstamos afinando los últimos detalles para que puedas pagar de forma segura.')}
              className="w-full rounded-2xl bg-gradient-to-r from-amber-400 to-amber-600 text-white font-bold py-4 text-lg shadow-lg active:scale-[0.98] flex items-center justify-center gap-2">
              <Crown size={20} /> Hacerme Pro
            </button>

            <div className="mt-3 flex items-center justify-center gap-2 text-xs text-gray-500">
              <Clock size={14} /> Próximamente disponible
            </div>

            <p className="text-xs text-gray-400 text-center mt-4 leading-relaxed">
              Mientras tanto, si quieres el Plan Pro escríbenos y lo activamos manualmente.
            </p>
          </>
        )}
      </section>
    </div>
  )
}