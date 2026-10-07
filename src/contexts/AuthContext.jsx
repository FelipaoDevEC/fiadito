import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [negocio, setNegocio] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null)
      setLoading(false)
    })
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null)
    })
    return () => sub.subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (!user) { setNegocio(null); return }
    supabase
      .from('negocios')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle()
      .then(({ data }) => setNegocio(data))
  }, [user])

  const signIn = (email, password) =>
    supabase.auth.signInWithPassword({ email, password })

  const signUp = async ({ email, password, nombreNegocio, telefono }) => {
    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error) return { error }
    const uid = data.user?.id
    if (uid) {
      const { error: errNeg } = await supabase.from('negocios').insert({
        user_id: uid,
        nombre: nombreNegocio,
        telefono
      })
      if (errNeg) return { error: errNeg }
      const { data: neg } = await supabase
        .from('negocios').select('*').eq('user_id', uid).single()
      setNegocio(neg)
    }
    return { data }
  }

  const signOut = () => supabase.auth.signOut()

  const refreshNegocio = async () => {
    if (!user) return
    const { data } = await supabase
      .from('negocios').select('*').eq('user_id', user.id).maybeSingle()
    setNegocio(data)
  }

  return (
    <AuthContext.Provider value={{
      user, negocio, loading, signIn, signUp, signOut, refreshNegocio
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)