import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const RedirectHome = () => {
  const { auth, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-900"></div>
      </div>
    )
  }

  if (!auth) {
    return <Navigate to="/login" replace />
  }

  // Redirigir según el rol
  if (auth.rol === 'admin' || auth.rol === 'empleado') {
    return <Navigate to="/admin" replace />
  }

  return <Navigate to="/dashboard" replace />
}

export default RedirectHome
