import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import BottomNav from './components/BottomNav'
import Login from './pages/Login'
import Registro from './pages/Registro'
import Inicio from './pages/Inicio'
import Clientes from './pages/Clientes'
import NuevoCliente from './pages/NuevoCliente'
import ClienteDetalle from './pages/ClienteDetalle'
import Ajustes from './pages/Ajustes'
import Upgrade from './pages/Upgrade'

function Privado({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="p-8 text-center text-gray-400">Cargando…</div>
  if (!user) return <Navigate to="/login" replace />
  return children
}

function ConNav({ children }) {
  return <><div className="pb-20">{children}</div><BottomNav /></>
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/registro" element={<Registro />} />

          <Route path="/" element={
            <Privado><ConNav><Inicio /></ConNav></Privado>
          } />
          <Route path="/clientes" element={
            <Privado><ConNav><Clientes /></ConNav></Privado>
          } />
          <Route path="/clientes/nuevo" element={
            <Privado><NuevoCliente /></Privado>
          } />
          <Route path="/clientes/:id" element={
            <Privado><ClienteDetalle /></Privado>
          } />
          <Route path="/ajustes" element={
            <Privado><ConNav><Ajustes /></ConNav></Privado>
          } />
          <Route path="/upgrade" element={
            <Privado><Upgrade /></Privado>
          } />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}