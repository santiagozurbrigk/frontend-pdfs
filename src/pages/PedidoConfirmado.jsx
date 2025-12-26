import React, { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

const PedidoConfirmado = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const pedidoId = searchParams.get('id')

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/historial')
    }, 5000)

    return () => clearTimeout(timer)
  }, [navigate])

  return (
    <div className="max-w-2xl mx-auto p-6 mt-16 md:mt-20">
      <div className="bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="mb-6">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <svg
              className="w-8 h-8 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
        </div>

        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          ¡Pedido Confirmado!
        </h1>

        {pedidoId && (
          <p className="text-lg text-gray-600 mb-6">
            Tu pedido #{pedidoId} ha sido creado exitosamente
          </p>
        )}

        <p className="text-gray-600 mb-6">
          Recibirás una notificación cuando tu pedido esté listo para retirar.
        </p>

        <div className="space-y-4">
          <button
            onClick={() => navigate('/historial')}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Ver Historial
          </button>
          <button
            onClick={() => navigate('/nuevo-pedido')}
            className="w-full bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Crear Otro Pedido
          </button>
        </div>

        <p className="text-sm text-gray-500 mt-6">
          Serás redirigido al historial en 5 segundos...
        </p>
      </div>
    </div>
  )
}

export default PedidoConfirmado

