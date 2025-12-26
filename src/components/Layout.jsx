import React from 'react'
import Navbar from './Navbar'
import { useLocation } from 'react-router-dom'

const Layout = ({ children }) => {
  const location = useLocation()
  const isAdminPage = location.pathname === '/admin'

  // Para el panel de admin, no mostrar el Layout normal
  if (isAdminPage) {
    return <>{children}</>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {children}
      <Navbar />
    </div>
  )
}

export default Layout

