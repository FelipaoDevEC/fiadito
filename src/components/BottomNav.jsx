import { NavLink } from 'react-router-dom'
import { Home, Users, Settings } from 'lucide-react'

const items = [
  { to: '/', label: 'Inicio', icon: Home },
  { to: '/clientes', label: 'Clientes', icon: Users },
  { to: '/ajustes', label: 'Ajustes', icon: Settings }
]

export default function BottomNav() {
  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-40 bg-white border-t"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="max-w-md mx-auto grid grid-cols-3">
        {items.map(({ to, label, icon: Icon }) => (
          <NavLink key={to} to={to} end={to === '/'}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 py-2 text-xs ${
                isActive ? 'text-primary font-semibold' : 'text-gray-500'}`}>
            <Icon size={22} />
            {label}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}