import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { AiOutlineHome } from 'react-icons/ai'
import { FiSearch } from 'react-icons/fi'
import { BsClockHistory } from 'react-icons/bs'
import { FaUser } from 'react-icons/fa'

const Navbar = () => {
  const location = useLocation()
  
  const isActive = (path) => location.pathname === path

  return (
    <nav className="fixed bottom-0 left-0 w-full bg-white shadow-lg rounded-t-3xl p-4 md:top-0 md:rounded-none">
      <div className="max-w-screen-xl mx-auto">
        <div className="flex justify-around items-center">
          <Link
            to="/dashboard"
            className={`flex flex-col items-center ${
              isActive('/dashboard') ? 'text-[#191970]' : 'text-gray-500'
            }`}
          >
            <AiOutlineHome className="text-2xl" />
            <span className="text-xs mt-1">Inicio</span>
          </Link>

          <Link
            to="/nuevo-pedido"
            className={`flex flex-col items-center ${
              isActive('/nuevo-pedido') ? 'text-[#191970]' : 'text-gray-500'
            }`}
          >
            <FiSearch className="text-2xl" />
            <span className="text-xs mt-1">Nuevo</span>
          </Link>

          <Link
            to="/historial"
            className={`flex flex-col items-center ${
              isActive('/historial') ? 'text-[#191970]' : 'text-gray-500'
            }`}
          >
            <BsClockHistory className="text-2xl" />
            <span className="text-xs mt-1">Historial</span>
          </Link>

          <Link
            to="/configuracion"
            className={`flex flex-col items-center ${
              isActive('/configuracion') ? 'text-[#191970]' : 'text-gray-500'
            }`}
          >
            <FaUser className="text-2xl" />
            <span className="text-xs mt-1">Perfil</span>
          </Link>
        </div>
      </div>
    </nav>
  )
}

export default Navbar

