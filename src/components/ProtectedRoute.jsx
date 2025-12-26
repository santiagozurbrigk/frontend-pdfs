import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const ProtectedRoute = ({ children, adminOnly = false, adminOrEmployee = false }) => {
  const { auth, loading } = useAuth()

  // Esperar a que termine de cargar la autenticación
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

  if (adminOnly && auth.rol !== 'admin') {
    console.log('Acceso denegado - Rol actual:', auth.rol, 'Rol requerido: admin')
    return <Navigate to="/dashboard" replace />
  }

  if (adminOrEmployee && auth.rol !== 'admin' && auth.rol !== 'empleado') {
    console.log('Acceso denegado - Rol actual:', auth.rol, 'Rol requerido: admin o empleado')
    return <Navigate to="/dashboard" replace />
  }

  return children
}

export default ProtectedRoute

