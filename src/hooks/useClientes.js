import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

export function useClientes() {
  const { negocio } = useAuth()
  const [clientes, setClientes] = useState([])
  const [loading, setLoading] = useState(true)

  const cargar = useCallback(async () => {
    if (!negocio?.id) return
    setLoading(true)
    const { data, error } = await supabase
      .from('clientes')
      .select('*, movimientos(tipo, monto, fecha, fecha_vencimiento)')
      .eq('negocio_id', negocio.id)
      .order('nombre')
    if (error) { console.error(error); setLoading(false); return }

    const lista = (data || []).map(c => {
      const movs = c.movimientos || []
      const saldo = movs.reduce(
        (s, m) => s + (m.tipo === 'fiado' ? Number(m.monto) : -Number(m.monto)), 0)
      const ultima = movs.reduce((max, m) => (!max || m.fecha > max ? m.fecha : max), null)
      const hoy = new Date().toISOString().slice(0, 10)
      const vencido = saldo > 0 && movs.some(
        m => m.tipo === 'fiado' && m.fecha_vencimiento && m.fecha_vencimiento < hoy
      )
      return { ...c, saldo, ultima_fecha: ultima, vencido }
    })
    setClientes(lista)
    setLoading(false)
  }, [negocio?.id])

  useEffect(() => { cargar() }, [cargar])

  return { clientes, loading, recargar: cargar }
}