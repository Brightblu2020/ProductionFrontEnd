import { createContext, useState, useEffect } from 'react'
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth'
import { auth } from '../config/firebase'
import api from '../services/api'

export const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [role, setRole] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const { data: profile } = await api.get('/auth/profile')
          setUser({
            uid: profile.uid,
            email: profile.email,
            displayName: profile.displayName,
          })
          setRole(profile.role || 'viewer')
        } catch {
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName,
          })
          setRole('viewer')
        }
      } else {
        setUser(null)
        setRole(null)
      }
      setLoading(false)
    })
    return unsubscribe
  }, [])

  const login = async (email, password) => {
    await signInWithEmailAndPassword(auth, email, password)
  }

  const logout = async () => {
    await signOut(auth)
  }

  const getToken = async () => {
    const currentUser = auth.currentUser
    if (!currentUser) throw new Error('Not authenticated')
    return currentUser.getIdToken()
  }

  return (
    <AuthContext.Provider value={{ user, role, loading, login, logout, getToken }}>
      {children}
    </AuthContext.Provider>
  )
}
