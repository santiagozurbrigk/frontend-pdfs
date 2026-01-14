import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import * as pdfjsLib from 'pdfjs-dist'

// Configurar el worker para pdfjs-dist
// Usar el worker desde node_modules a través de Vite (versión 5.x usa .mjs)
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString()

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
  const [contandoPaginas, setContandoPaginas] = useState(false)
  const [error, setError] = useState('')
  const [precios, setPrecios] = useState({
    simple_faz: 50,
    doble_faz: 80,
    doble_faz_2pag: 100,
    anillado: 2500
  })
  const navigate = useNavigate()

  // Cargar precios desde la API
  useEffect(() => {
    const cargarPrecios = async () => {
      try {
        const { data } = await api.get('/precios')
        const preciosMap = {}
        data.forEach(p => {
          preciosMap[p.tipo] = parseFloat(p.precio)
        })
        setPrecios(preciosMap)
      } catch (error) {
        console.error('Error al cargar precios, usando valores por defecto:', error)
        // Mantener valores por defecto si hay error
      }
    }
    cargarPrecios()
  }, [])

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  // Función para contar páginas de un PDF
  const contarPaginasPDF = async (file) => {
    return new Promise((resolve, reject) => {
      // Solo procesar archivos PDF
      if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
        // Si no es PDF, retornar 0 páginas (para archivos .doc, .docx)
        resolve(0)
        return
      }

      const reader = new FileReader()
      reader.onload = async (e) => {
        try {
          const typedArray = new Uint8Array(e.target.result)
          const pdf = await pdfjsLib.getDocument({ data: typedArray }).promise
          resolve(pdf.numPages)
        } catch (error) {
          console.error('Error al leer PDF:', error)
          reject(error)
        }
      }
      reader.onerror = reject
      reader.readAsArrayBuffer(file)
    })
  }

  const handleFileChange = async (e) => {
    const archivosSeleccionados = Array.from(e.target.files)
    setArchivos(archivosSeleccionados)
    setError('')

    // Contar páginas automáticamente
    if (archivosSeleccionados.length > 0) {
      setContandoPaginas(true)
      try {
        let totalPaginas = 0
        const errores = []

        for (const archivo of archivosSeleccionados) {
          try {
            const paginas = await contarPaginasPDF(archivo)
            totalPaginas += paginas
          } catch (error) {
            console.error(`Error al contar páginas de ${archivo.name}:`, error)
            errores.push(archivo.name)
          }
        }

        if (totalPaginas > 0) {
          setFormData(prev => ({
            ...prev,
            num_paginas: totalPaginas.toString()
          }))
        } else if (errores.length > 0) {
          setError(`No se pudieron contar las páginas de algunos archivos: ${errores.join(', ')}. Por favor, contacta al administrador.`)
        } else {
          setError('Los archivos seleccionados no son PDFs. Solo se pueden procesar archivos PDF.')
        }
      } catch (error) {
        console.error('Error al procesar archivos:', error)
        setError('Error al contar las páginas. Por favor, intenta con otros archivos o contacta al administrador.')
      } finally {
        setContandoPaginas(false)
      }
    } else {
      // Si no hay archivos, limpiar el número de páginas
      setFormData(prev => ({
        ...prev,
        num_paginas: ''
      }))
    }
  }

  const calcularPrecio = () => {
    const precioPorPagina = precios[formData.tipo_impresion] || 50
    const totalPaginas = parseInt(formData.num_paginas) || 0
    const copias = parseInt(formData.copias) || 1
    // El precio del anillado se multiplica por el número de copias
    const precioAnillado = formData.acabado === 'anillado' ? (precios.anillado || 2500) * copias : 0

    return (precioPorPagina * totalPaginas * copias) + precioAnillado
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
    <div className="max-w-2xl mx-auto p-6 mt-16 md:mt-20 pb-24 md:pb-6">
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
            <div className="mt-2 space-y-1">
              <p className="text-sm text-gray-600">
                {archivos.length} archivo(s) seleccionado(s)
              </p>
              {contandoPaginas && (
                <p className="text-sm text-blue-600 flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Contando páginas...
                </p>
              )}
            </div>
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
            {formData.num_paginas && !contandoPaginas && (
              <span className="ml-2 text-xs text-green-600 font-normal">
                (calculado automáticamente)
              </span>
            )}
            {contandoPaginas && (
              <span className="ml-2 text-xs text-blue-600 font-normal">
                (contando páginas...)
              </span>
            )}
          </label>
          <input
            type="number"
            name="num_paginas"
            value={formData.num_paginas}
            readOnly
            className="w-full p-2 border border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed"
            min="1"
            required
            disabled={contandoPaginas}
            placeholder={archivos.length === 0 ? "Sube archivos para calcular automáticamente" : ""}
          />
          {contandoPaginas && (
            <p className="text-xs text-gray-500 mt-1">
              Procesando archivos para contar páginas...
            </p>
          )}
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

        <div className="pt-4">
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-4 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 font-semibold text-lg shadow-lg"
          >
            {loading ? 'Creando pedido...' : 'Crear Pedido'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default NuevoPedido

