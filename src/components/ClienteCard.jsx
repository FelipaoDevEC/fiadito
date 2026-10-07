import { Link } from 'react-router-dom'
import { diasDesde, formatMoney } from '../lib/format'

export default function ClienteCard({ cliente, simbolo = '$' }) {
  const debe = cliente.saldo > 0
  const dias = diasDesde(cliente.ultima_fecha)
  return (
    <Link to={`/clientes/${cliente.id}`}
      className="flex items-center justify-between gap-3 p-4 bg-white rounded-2xl border border-gray-100 active:bg-gray-50">
      <div className="min-w-0">
        <div className="font-semibold text-lg truncate">{cliente.nombre}</div>
        <div className="text-sm text-gray-500 truncate">
          {cliente.telefono || 'Sin teléfono'}
          {dias != null && <> · {dias === 0 ? 'hoy' : `hace ${dias} día${dias !== 1 ? 's' : ''}`}</>}
        </div>
      </div>
      <div className={`monto text-xl ${debe ? 'text-danger' : 'text-primary'}`}>
        {formatMoney(cliente.saldo, simbolo)}
      </div>
    </Link>
  )
}