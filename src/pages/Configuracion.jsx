import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'

const Configuracion = () => {
  const { auth, logout } = useAuth()
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    telefono: '',
    password_actual: '',
    password_nuevo: ''
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState({ tipo: '', texto: '' })

  useEffect(() => {
    if (auth) {
      setFormData({
        nombre: auth.nombre || '',
        email: auth.email || '',
        telefono: auth.telefono || '',
        password_actual: '',
        password_nuevo: ''
      })
    }
  }, [auth])

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage({ tipo: '', texto: '' })

    try {
      const updateData = {
        nombre: formData.nombre,
        email: formData.email,
        telefono: formData.telefono
      }

      if (formData.password_actual && formData.password_nuevo) {
        updateData.password_actual = formData.password_actual
        updateData.password_nuevo = formData.password_nuevo
      }

      await api.put('/usuarios/perfil', updateData)
      setMessage({ tipo: 'success', texto: 'Perfil actualizado correctamente' })
      
      // Limpiar campos de contraseña
      setFormData({
        ...formData,
        password_actual: '',
        password_nuevo: ''
      })
    } catch (error) {
      setMessage({
        tipo: 'error',
        texto: error.response?.data?.mensaje || 'Error al actualizar el perfil'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6 mt-16 md:mt-20">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Configuración</h1>

      {message.texto && (
        <div
          className={`p-4 mb-4 rounded ${
            message.tipo === 'success'
              ? 'bg-green-100 text-green-700'
              : 'bg-red-100 text-red-700'
          }`}
        >
          <p>{message.texto}</p>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-lg p-6 space-y-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Información Personal
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">
                Nombre
              </label>
              <input
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">
                Teléfono
              </label>
              <input
                type="tel"
                name="telefono"
                value={formData.telefono}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div className="pt-4 border-t">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Cambiar Contraseña
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2">
                    Contraseña Actual
                  </label>
                  <input
                    type="password"
                    name="password_actual"
                    value={formData.password_actual}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2">
                    Nueva Contraseña
                  </label>
                  <input
                    type="password"
                    name="password_nuevo"
                    value={formData.password_nuevo}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Guardando cambios...' : 'Guardar Cambios'}
            </button>
          </form>
        </div>

        <div className="pt-4 border-t">
          <button
            onClick={logout}
            className="w-full bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors"
          >
            Cerrar Sesión
          </button>
        </div>
      </div>
    </div>
  )
}

export default Configuracion

