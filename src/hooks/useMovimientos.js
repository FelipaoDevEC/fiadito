import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export function useMovimientos(clienteId) {
  const [movimientos, setMovimientos] = useState([])
  const [loading, setLoading] = useState(true)

  const cargar = useCallback(async () => {
    if (!clienteId) return
    setLoading(true)
    const { data, error } = await supabase
      .from('movimientos')
      .select('*')
      .eq('cliente_id', clienteId)
      .order('fecha', { ascending: false })
      .order('created_at', { ascending: false })
    if (error) console.error(error)
    setMovimientos(data || [])
    setLoading(false)
  }, [clienteId])

  useEffect(() => { cargar() }, [cargar])

  return { movimientos, loading, recargar: cargar }
}