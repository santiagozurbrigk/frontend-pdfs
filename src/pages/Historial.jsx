import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'

const Historial = () => {
  const [pedidos, setPedidos] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchPedidos = async () => {
      try {
        const { data } = await api.get('/pedidos/historial')
        setPedidos(data)
      } catch (error) {
        console.error('Error al cargar historial:', error)
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
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Historial de Pedidos</h1>

      {pedidos.length === 0 ? (
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <p className="text-gray-600">No tienes pedidos aún</p>
          <button
            onClick={() => navigate('/nuevo-pedido')}
            className="mt-4 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Crear Primer Pedido
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {pedidos.map((pedido) => (
            <div
              key={pedido.id}
              className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow cursor-pointer"
              onClick={() => navigate(`/pedido/${pedido.id}`)}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-semibold text-gray-800">
                    Pedido #{pedido.id}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {new Date(pedido.createdAt).toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                  <p className="text-sm text-gray-600 mt-2">
                    Tipo: {pedido.tipo_impresion?.replace(/_/g, ' ')}
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
                  <p className="text-lg font-bold text-blue-600 mt-2">
                    ${Number(pedido.precio_total).toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Historial

