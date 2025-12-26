import React, { createContext, useContext, useState, useEffect } from 'react'
import api from '../services/api'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    const user = localStorage.getItem('user')
    
    if (token && user) {
      try {
        setAuth(JSON.parse(user))
      } catch (error) {
        console.error('Error al parsear usuario:', error)
        localStorage.removeItem('token')
        localStorage.removeItem('user')
      }
    }
    setLoading(false)
  }, [])

  const login = async (email, password) => {
    try {
      const { data } = await api.post('/auth/login', { email, password })
      console.log('Respuesta del login:', data) // Debug
      const usuario = {
        id: data.id,
        nombre: data.nombre,
        email: data.email,
        telefono: data.telefono,
        rol: data.rol || 'cliente' // Asegurar que siempre tenga un rol
      }
      console.log('Usuario guardado:', usuario) // Debug
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(usuario))
      setAuth(usuario)
      return { success: true }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.mensaje || 'Error al iniciar sesión'
      }
    }
  }

  const register = async (userData) => {
    try {
      const { data } = await api.post('/auth/registro', userData)
      const usuario = {
        id: data.id,
        nombre: data.nombre,
        email: data.email,
        telefono: data.telefono,
        rol: data.rol || 'cliente'
      }
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(usuario))
      setAuth(usuario)
      return { success: true }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.mensaje || 'Error al registrarse'
      }
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setAuth(null)
  }

  const value = {
    auth,
    login,
    register,
    logout,
    loading
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

