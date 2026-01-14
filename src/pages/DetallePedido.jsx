import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../services/api'

const DetallePedido = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [pedido, setPedido] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [precios, setPrecios] = useState({
    simple_faz: 50,
    doble_faz: 80,
    doble_faz_2pag: 100,
    anillado: 2500
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Cargar precios
        try {
          const { data: preciosData } = await api.get('/precios')
          const preciosMap = {}
          preciosData.forEach(p => {
            preciosMap[p.tipo] = parseFloat(p.precio)
          })
          setPrecios(preciosMap)
        } catch (error) {
          console.error('Error al cargar precios, usando valores por defecto:', error)
        }

        // Cargar pedido
        const { data } = await api.get(`/pedidos/historial`)
        const pedidoEncontrado = data.find((p) => p.id === parseInt(id))
        
        if (pedidoEncontrado) {
          setPedido(pedidoEncontrado)
        } else {
          setError('No se encontró el pedido')
          setTimeout(() => {
            navigate('/historial')
          }, 3000)
        }
      } catch (error) {
        console.error('Error al obtener pedido:', error)
        setError('Error al cargar los detalles del pedido')
        setTimeout(() => {
          navigate('/historial')
        }, 3000)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [id, navigate])

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-900"></div>
      </div>
    )
  }

  if (error) {
    return (
      <>
        <div className="max-w-2xl mx-auto p-6 mt-16">
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded">
            <p>{error}</p>
          </div>
        </div>
      </>
    )
  }

  if (!pedido) return null

  return (
    <div className="max-w-2xl mx-auto p-6 mt-16">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="bg-blue-600 p-6 text-white">
          <h2 className="text-2xl font-bold">Pedido #{pedido.id}</h2>
          <p className="mt-2 text-blue-100">
            {new Date(pedido.createdAt).toLocaleDateString('es-ES', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </p>
        </div>

        <div className="p-6 border-b">
          <div className="flex items-center">
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
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Detalles de la impresión
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Tipo de impresión</p>
                <p className="font-medium text-gray-800">
                  {pedido.tipo_impresion?.replace(/_/g, ' ').charAt(0).toUpperCase() +
                    pedido.tipo_impresion?.replace(/_/g, ' ').slice(1)}
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Acabado</p>
                <p className="font-medium text-gray-800">
                  {pedido.acabado?.charAt(0).toUpperCase() + pedido.acabado?.slice(1)}
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Número de páginas</p>
                <p className="font-medium text-gray-800">{pedido.num_paginas}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Copias</p>
                <p className="font-medium text-gray-800">{pedido.copias}</p>
              </div>
            </div>
          </div>

          {pedido.archivo && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Archivos del pedido
              </h3>
              <div className="space-y-3">
                {pedido.archivo.split(',').map((archivo, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center">
                      <svg
                        className="w-5 h-5 mr-3 text-gray-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                      <span className="font-medium text-gray-800 truncate max-w-xs">
                        {archivo.trim().split('/').pop()}
                      </span>
                    </div>
                    <button
                      onClick={() => window.open(archivo.trim(), '_blank')}
                      className="bg-green-600 text-white px-4 py-2 rounded text-sm hover:bg-green-700 transition-colors"
                    >
                      Descargar
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-8 bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Resumen de costos
            </h3>
            <div className="space-y-2">
              {(() => {
                // Calcular desglose correcto
                const precioPorPagina = precios[pedido.tipo_impresion] || 50
                const precioImpresion = precioPorPagina * (pedido.num_paginas || 0) * (pedido.copias || 1)
                const precioAnillado = pedido.acabado === 'anillado' 
                  ? (precios.anillado || 2500) * (pedido.copias || 1) 
                  : 0
                
                return (
                  <>
                    <div className="flex justify-between items-center text-gray-600">
                      <span>Impresión ({pedido.num_paginas || 0} páginas × {pedido.copias || 1} copias)</span>
                      <span>${precioImpresion.toFixed(2)}</span>
                    </div>
                    {pedido.acabado === 'anillado' && (
                      <div className="flex justify-between items-center text-gray-600">
                        <span>Anillado ({pedido.copias || 1} unidades)</span>
                        <span>${precioAnillado.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center text-xl font-bold text-blue-600 pt-4 border-t">
                      <span>Total</span>
                      <span>${pedido.precio_total ? Number(pedido.precio_total).toFixed(2) : '0.00'}</span>
                    </div>
                  </>
                )
              })()}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DetallePedido

