import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'

const Admin = () => {
  const { auth } = useAuth()
  const [pedidos, setPedidos] = useState([])
  const [usuarios, setUsuarios] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState(null)
  const [mostrarDetalles, setMostrarDetalles] = useState(false)
  const [busqueda, setBusqueda] = useState('')
  const [facturacionDiaria, setFacturacionDiaria] = useState(0)
  const [limiteFacturacion, setLimiteFacturacion] = useState(50000)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [pedidosRes, preciosRes, usuariosRes, facturacionRes] = await Promise.all([
          api.get('/pedidos/todos'),
          api.get('/precios'),
          api.get('/usuarios/todos'),
          api.get('/pedidos/facturacion-diaria')
        ])

        setPedidos(pedidosRes.data || [])
        setUsuarios(usuariosRes.data || [])
        
        const limite = preciosRes.data.find(p => p.tipo === 'limite_facturacion')
        if (limite) {
          setLimiteFacturacion(Number(limite.precio) || 50000)
        }

        if (facturacionRes.data?.facturacionDiaria) {
          setFacturacionDiaria(parseFloat(facturacionRes.data.facturacionDiaria))
        }

        setLoading(false)
      } catch (error) {
        console.error('Error al cargar datos:', error)
        setError('Error al cargar los datos')
        setLoading(false)
      }
    }

    fetchData()
    const interval = setInterval(fetchData, 15000) // Actualizar cada 15 segundos

    return () => clearInterval(interval)
  }, [])

  const pedidosFiltrados = pedidos.filter((pedido) => {
    const busquedaLower = busqueda.toLowerCase().trim()
    if (busquedaLower.startsWith('#')) {
      return pedido.id.toString() === busquedaLower.substring(1)
    }
    if (!isNaN(busquedaLower) && busquedaLower !== '') {
      return (
        pedido.id.toString() === busquedaLower ||
        pedido.Usuario?.telefono?.toString().includes(busquedaLower) ||
        pedido.Usuario?.email?.toLowerCase().includes(busquedaLower) ||
        pedido.Usuario?.nombre?.toLowerCase().includes(busquedaLower)
      )
    }
    return (
      pedido.Usuario?.nombre?.toLowerCase().includes(busquedaLower) ||
      pedido.Usuario?.email?.toLowerCase().includes(busquedaLower) ||
      pedido.Usuario?.telefono?.toString().includes(busquedaLower)
    )
  })

  const verDetalles = async (pedido) => {
    try {
      const { data } = await api.get(`/pedidos/${pedido.id}`)
      setPedidoSeleccionado(data || pedido)
      setMostrarDetalles(true)
    } catch (error) {
      console.error('Error al obtener detalles:', error)
      setPedidoSeleccionado(pedido)
      setMostrarDetalles(true)
    }
  }

  const actualizarEstado = async (nuevoEstado) => {
    try {
      await api.put(`/pedidos/${pedidoSeleccionado.id}/estado`, {
        estado: nuevoEstado
      })
      setPedidos(
        pedidos.map((p) =>
          p.id === pedidoSeleccionado.id ? { ...p, estado: nuevoEstado } : p
        )
      )
      setPedidoSeleccionado({ ...pedidoSeleccionado, estado: nuevoEstado })
    } catch (error) {
      console.error('Error al actualizar estado:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center mt-10 text-red-600">
        <p>{error}</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 w-full pb-20 md:pb-0">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
              Panel de Administración
            </h1>
            <p className="text-gray-600 mt-1 text-sm md:text-base">
              Gestiona pedidos y usuarios desde un solo lugar
            </p>
          </div>
          <div className="bg-white p-3 md:p-4 rounded-lg shadow flex items-center space-x-3 md:space-x-4 w-full md:w-auto">
            <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
              <span className="text-lg text-white font-bold">
                {auth?.nombre?.[0]?.toUpperCase() || 'A'}
              </span>
            </div>
            <div>
              <p className="text-xs md:text-sm text-gray-600">Administrador</p>
              <p className="font-medium text-gray-800 text-sm md:text-base">{auth?.nombre || 'Admin'}</p>
            </div>
          </div>
        </div>

        {/* Estadísticas - Responsive grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 lg:gap-6 mb-6">
          <div className="bg-white rounded-lg shadow p-4 md:p-6">
            <div>
              <h3 className="text-sm md:text-base font-semibold text-gray-600">Total Pedidos</h3>
              <p className="text-2xl md:text-3xl font-bold text-blue-600 mt-1 md:mt-2">
                {pedidos.length > 0 ? Math.max(...pedidos.map((p) => p.id)) : 0}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4 md:p-6">
            <div>
              <h3 className="text-sm md:text-base font-semibold text-gray-600">Retirados</h3>
              <p className="text-2xl md:text-3xl font-bold text-green-600 mt-1 md:mt-2">
                {pedidos.filter((p) => p.estado === 'retirado').length}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4 md:p-6">
            <div>
              <h3 className="text-sm md:text-base font-semibold text-gray-600">En Proceso</h3>
              <p className="text-2xl md:text-3xl font-bold text-yellow-600 mt-1 md:mt-2">
                {pedidos.filter((p) => p.estado === 'en_proceso').length}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4 md:p-6">
            <div>
              <h3 className="text-sm md:text-base font-semibold text-gray-600">Listos</h3>
              <p className="text-2xl md:text-3xl font-bold text-green-600 mt-1 md:mt-2">
                {pedidos.filter((p) => p.estado === 'listo_para_retirar').length}
              </p>
            </div>
          </div>
        </div>

        {/* Layout principal - Desktop: lado a lado, Mobile: apilado */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 md:gap-6">
          {/* Panel de Pedidos - Ocupa 8 columnas en desktop (2/3 del espacio) */}
          <div className="xl:col-span-8 bg-white rounded-lg shadow-lg">
            <div className="p-4 md:p-6 border-b border-gray-200">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div>
                  <h2 className="text-lg md:text-xl font-semibold text-gray-800">Pedidos</h2>
                  <p className="text-xs md:text-sm text-gray-600 mt-1">
                    {pedidosFiltrados.length} de {pedidos.length} pedidos
                  </p>
                </div>
                <div className="relative w-full lg:w-80">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    placeholder="Buscar por #ID, nombre o teléfono..."
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
            <div className="overflow-x-auto">
              <div className="min-h-[300px] max-h-[calc(100vh-400px)] overflow-y-auto">
                <table className="w-full min-w-[800px]">
                  <thead className="bg-gray-50 sticky top-0 z-10">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-16">
                        ID
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[150px]">
                        Cliente
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[180px] hidden md:table-cell">
                        Fecha Creación
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                        Estado
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24 hidden lg:table-cell">
                        Total
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {pedidosFiltrados.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                          <div className="flex flex-col items-center">
                            <svg className="w-12 h-12 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <p>No se encontraron pedidos</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      pedidosFiltrados.map((pedido) => (
                        <tr key={pedido.id} className="hover:bg-blue-50 transition-colors cursor-pointer" onClick={() => verDetalles(pedido)}>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="text-sm font-semibold text-gray-900">#{pedido.id}</div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="text-sm font-medium text-gray-900">
                              {pedido.Usuario?.nombre || 'N/A'}
                            </div>
                            <div className="text-xs text-gray-500 md:hidden mt-1">
                              {new Date(pedido.createdAt).toLocaleDateString('es-ES', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric'
                              })}
                            </div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap hidden md:table-cell">
                            <div className="text-sm text-gray-900">
                              {new Date(pedido.createdAt).toLocaleDateString('es-ES', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span
                              className={`px-2.5 py-1 inline-flex text-xs font-semibold rounded-full ${
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
                                ? 'Listo'
                                : pedido.estado === 'en_proceso'
                                ? 'Proceso'
                                : pedido.estado === 'retirado'
                                ? 'Retirado'
                                : 'Pendiente'}
                            </span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap hidden lg:table-cell">
                            <div className="text-sm font-semibold text-gray-900">
                              ${Number(pedido.precio_total).toFixed(2)}
                            </div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm">
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                verDetalles(pedido)
                              }}
                              className="text-blue-600 hover:text-blue-800 font-medium transition-colors"
                            >
                              Ver
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Panel de Usuarios - Ocupa 4 columnas en desktop (1/3 del espacio) */}
          <div className="xl:col-span-4 bg-white rounded-lg shadow-lg">
            <div className="p-4 md:p-6 border-b border-gray-200">
              <h2 className="text-lg md:text-xl font-semibold text-gray-800">Usuarios</h2>
              <p className="text-xs md:text-sm text-gray-600 mt-1">
                {usuarios.length} usuario{usuarios.length !== 1 ? 's' : ''} registrado{usuarios.length !== 1 ? 's' : ''}
              </p>
            </div>
            <div className="overflow-x-auto max-h-[calc(100vh-400px)] overflow-y-auto">
              <table className="w-full">
                <thead className="bg-gray-50 sticky top-0 z-10">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nombre
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                      Email
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20">
                      Rol
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {usuarios.length === 0 ? (
                    <tr>
                      <td colSpan="3" className="px-6 py-12 text-center text-gray-500">
                        <div className="flex flex-col items-center">
                          <svg className="w-12 h-12 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                          </svg>
                          <p>No hay usuarios</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    usuarios.map((usuario) => (
                      <tr key={usuario.id} className="hover:bg-blue-50 transition-colors">
                        <td className="px-4 py-3">
                          <div className="text-sm font-medium text-gray-900 truncate">{usuario.nombre}</div>
                          <div className="text-xs text-gray-500 lg:hidden mt-1 truncate">{usuario.email}</div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap hidden lg:table-cell">
                          <div className="text-sm text-gray-500 truncate max-w-[200px]" title={usuario.email}>
                            {usuario.email}
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 inline-flex text-xs font-semibold rounded-full ${
                              usuario.rol === 'admin'
                                ? 'bg-purple-100 text-purple-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {usuario.rol}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {mostrarDetalles && pedidoSeleccionado && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full p-6 max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-blue-700">
                Pedido #{pedidoSeleccionado.id}
              </h2>
              <button
                onClick={() => {
                  setMostrarDetalles(false)
                  setPedidoSeleccionado(null)
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <span className="text-2xl">×</span>
              </button>
            </div>

            <div className="mb-6 bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold mb-3 text-gray-800">Información del Cliente</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <p className="text-sm text-gray-600">Nombre</p>
                  <p className="font-medium text-gray-900">{pedidoSeleccionado.Usuario?.nombre || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="font-medium text-gray-900">{pedidoSeleccionado.Usuario?.email || 'N/A'}</p>
                </div>
                {pedidoSeleccionado.Usuario?.telefono && (
                  <div>
                    <p className="text-sm text-gray-600">Teléfono</p>
                    <p className="font-medium text-gray-900">{pedidoSeleccionado.Usuario.telefono}</p>
                  </div>
                )}
              </div>
            </div>

            {pedidoSeleccionado.archivo && (
              <div className="mb-6">
                <h3 className="font-semibold mb-3 text-gray-800">Archivos del Pedido</h3>
                <div className="space-y-2">
                  {pedidoSeleccionado.archivo.split(',').map((archivo, index) => (
                    <div key={index} className="flex items-center justify-between bg-gray-50 rounded-lg p-3 hover:bg-gray-100 transition-colors">
                      <div className="flex items-center space-x-3 flex-1 min-w-0">
                        <svg className="w-5 h-5 text-gray-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <span className="text-sm text-gray-700 truncate">{archivo.trim().split('/').pop()}</span>
                      </div>
                      <a
                        href={archivo.trim()}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-3 px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors flex-shrink-0"
                      >
                        Descargar
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {pedidoSeleccionado.observaciones && (
              <div className="mb-6">
                <h3 className="font-semibold mb-2">Observaciones del Cliente</h3>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {pedidoSeleccionado.observaciones}
                  </p>
                </div>
              </div>
            )}

            <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-2 text-gray-800">Estado del Pedido</h3>
                <select
                  value={pedidoSeleccionado.estado}
                  onChange={(e) => actualizarEstado(e.target.value)}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2 px-3"
                >
                  <option value="pendiente">Pendiente</option>
                  <option value="en_proceso">En Proceso</option>
                  <option value="listo_para_retirar">Listo para retirar</option>
                  <option value="retirado">Retirado</option>
                </select>
              </div>
              <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="font-semibold mb-2 text-gray-800">Resumen de Costos</h3>
                <p className="text-2xl font-bold text-blue-600">
                  ${Number(pedidoSeleccionado.precio_total).toFixed(2)}
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setMostrarDetalles(false)
                  setPedidoSeleccionado(null)
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Admin

