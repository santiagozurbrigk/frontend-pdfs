import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'

const Dashboard = () => {
  const { auth } = useAuth()
  const [pedidos, setPedidos] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  // Redirigir a admin si el usuario es administrador o empleado
  useEffect(() => {
    if (auth && (auth.rol === 'admin' || auth.rol === 'empleado')) {
      navigate('/admin', { replace: true })
    }
  }, [auth, navigate])

  useEffect(() => {
    const fetchPedidos = async () => {
      try {
        const { data } = await api.get('/pedidos/historial')
        setPedidos(data.slice(0, 5)) // Mostrar solo los últimos 5
      } catch (error) {
        console.error('Error al cargar pedidos:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchPedidos()
  }, [])

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-900"></div>
      </div>
    )
  }

  return (
    <div className="max-w-screen-xl mx-auto p-6 mt-16 md:mt-20">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Crear Nuevo Pedido
          </h2>
          <p className="text-gray-600 mb-4">
            Sube tus archivos y configura tu impresión
          </p>
          <button
            onClick={() => navigate('/nuevo-pedido')}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Nuevo Pedido
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Ver Historial
          </h2>
          <p className="text-gray-600 mb-4">
            Consulta todos tus pedidos anteriores
          </p>
          <button
            onClick={() => navigate('/historial')}
            className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
          >
            Ver Historial
          </button>
        </div>
      </div>

      {pedidos.length > 0 && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Pedidos Recientes
          </h2>
          <div className="space-y-4">
            {pedidos.map((pedido) => (
              <div
                key={pedido.id}
                className="border-b border-gray-200 pb-4 last:border-b-0"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium text-gray-800">
                      Pedido #{pedido.id}
                    </p>
                    <p className="text-sm text-gray-600">
                      {new Date(pedido.createdAt).toLocaleDateString('es-ES', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                  <div className="text-right">
                    <span
                      className={`inline-block px-4 py-2 rounded-full text-sm font-medium ${
                        pedido.estado === 'listo_para_retirar'
                          ? 'bg-green-100 text-green-800'
                          : pedido.estado === 'en_proceso'
                          ? 'bg-yellow-100 text-yellow-800'
                          : pedido.estado === 'retirado'
                          ? 'bg-gray-100 text-gray-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {pedido.estado === 'listo_para_retirar'
                        ? 'Listo para retirar'
                        : pedido.estado === 'en_proceso'
                        ? 'En proceso'
                        : pedido.estado === 'retirado'
                        ? 'Retirado'
                        : 'Pendiente'}
                    </span>
                    <p className="text-sm text-gray-600 mt-2">
                      ${Number(pedido.precio_total).toFixed(2)}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => navigate(`/pedido/${pedido.id}`)}
                  className="mt-2 text-blue-600 hover:underline text-sm"
                >
                  Ver detalles
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default Dashboard

