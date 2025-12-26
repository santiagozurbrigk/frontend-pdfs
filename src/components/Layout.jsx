import React from 'react'
import Navbar from './Navbar'

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      {children}
      <Navbar />
    </div>
  )
}

export default Layout

