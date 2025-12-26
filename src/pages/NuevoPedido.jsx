import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'

const NuevoPedido = () => {
  const [formData, setFormData] = useState({
    tipo_impresion: 'simple_faz',
    acabado: 'normal',
    num_paginas: '',
    copias: '1',
    observaciones: ''
  })
  const [archivos, setArchivos] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleFileChange = (e) => {
    setArchivos(Array.from(e.target.files))
  }

  const calcularPrecio = () => {
    const precioPorPagina = {
      simple_faz: 50,
      doble_faz: 80,
      doble_faz_2pag: 100
    }

    const precio = precioPorPagina[formData.tipo_impresion] || 50
    const totalPaginas = parseInt(formData.num_paginas) || 0
    const copias = parseInt(formData.copias) || 1
    const precioAnillado = formData.acabado === 'anillado' ? 2500 : 0

    return (precio * totalPaginas * copias) + precioAnillado
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    if (archivos.length === 0) {
      setError('Debes subir al menos un archivo')
      setLoading(false)
      return
    }

    try {
      const formDataToSend = new FormData()
      
      archivos.forEach((archivo) => {
        formDataToSend.append('archivos', archivo)
      })

      formDataToSend.append('tipo_impresion', formData.tipo_impresion)
      formDataToSend.append('acabado', formData.acabado)
      formDataToSend.append('num_paginas', formData.num_paginas)
      formDataToSend.append('copias', formData.copias)
      formDataToSend.append('observaciones', formData.observaciones)

      const { data } = await api.post('/pedidos', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      navigate(`/pedido-confirmado?id=${data.id}`)
    } catch (error) {
      console.error('Error al crear pedido:', error)
      setError(error.response?.data?.mensaje || 'Error al crear el pedido')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6 mt-16 md:mt-20">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Nuevo Pedido</h1>

      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded mb-4">
          <p>{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-lg p-6 space-y-6">
        <div>
          <label className="block text-gray-700 text-sm font-medium mb-2">
            Archivos
          </label>
          <input
            type="file"
            multiple
            onChange={handleFileChange}
            className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
            accept=".pdf,.doc,.docx"
            required
          />
          {archivos.length > 0 && (
            <p className="text-sm text-gray-600 mt-2">
              {archivos.length} archivo(s) seleccionado(s)
            </p>
          )}
        </div>

        <div>
          <label className="block text-gray-700 text-sm font-medium mb-2">
            Tipo de Impresión
          </label>
          <select
            name="tipo_impresion"
            value={formData.tipo_impresion}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
          >
            <option value="simple_faz">Simple faz</option>
            <option value="doble_faz">Doble faz</option>
            <option value="doble_faz_2pag">Doble faz (2 páginas por hoja)</option>
          </select>
        </div>

        <div>
          <label className="block text-gray-700 text-sm font-medium mb-2">
            Acabado
          </label>
          <select
            name="acabado"
            value={formData.acabado}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
          >
            <option value="normal">Normal</option>
            <option value="anillado">Anillado</option>
          </select>
        </div>

        <div>
          <label className="block text-gray-700 text-sm font-medium mb-2">
            Número de Páginas
          </label>
          <input
            type="number"
            name="num_paginas"
            value={formData.num_paginas}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
            min="1"
            required
          />
        </div>

        <div>
          <label className="block text-gray-700 text-sm font-medium mb-2">
            Copias
          </label>
          <input
            type="number"
            name="copias"
            value={formData.copias}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
            min="1"
            required
          />
        </div>

        <div>
          <label className="block text-gray-700 text-sm font-medium mb-2">
            Observaciones
          </label>
          <textarea
            name="observaciones"
            value={formData.observaciones}
            onChange={handleChange}
            rows="4"
            className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
            placeholder="Instrucciones especiales o comentarios..."
          />
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex justify-between items-center">
            <span className="text-lg font-semibold text-gray-800">Total:</span>
            <span className="text-2xl font-bold text-blue-600">
              ${calcularPrecio().toFixed(2)}
            </span>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          {loading ? 'Creando pedido...' : 'Crear Pedido'}
        </button>
      </form>
    </div>
  )
}

export default NuevoPedido

