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
  const [seccionActiva, setSeccionActiva] = useState('pedidos')

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [pedidosRes, usuariosRes] = await Promise.all([
          api.get('/pedidos/todos'),
          api.get('/usuarios/todos')
        ])

        setPedidos(pedidosRes.data || [])
        setUsuarios(usuariosRes.data || [])
        setLoading(false)
      } catch (error) {
        console.error('Error al cargar datos:', error)
        setError('Error al cargar los datos')
        setLoading(false)
      }
    }

    fetchData()
    const interval = setInterval(fetchData, 30000)

    return () => clearInterval(interval)
  }, [])

  const pedidosFiltrados = pedidos.filter((pedido) => {
    const busquedaLower = busqueda.toLowerCase().trim()
    if (!busquedaLower) return true
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
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando datos...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <div className="text-center">
          <p className="text-red-600 text-xl mb-2">Error</p>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Recargar
          </button>
        </div>
      </div>
    )
  }

  const estadisticas = {
    totalPedidos: pedidos.length,
    pedidosRetirados: pedidos.filter((p) => p.estado === 'retirado').length,
    enProceso: pedidos.filter((p) => p.estado === 'en_proceso').length,
    listos: pedidos.filter((p) => p.estado === 'listo_para_retirar').length,
    totalUsuarios: usuarios.length
  }

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden" style={{ height: '100vh', display: 'flex' }}>
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg flex flex-col">
        {/* Header del Sidebar */}
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-gray-800">Admin Panel</h1>
          <p className="text-sm text-gray-500 mt-1">Panel de Control</p>
        </div>

        {/* Navegación */}
        <nav className="flex-1 p-4 space-y-2">
          <button
            onClick={() => setSeccionActiva('pedidos')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
              seccionActiva === 'pedidos'
                ? 'bg-blue-600 text-white'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span className="font-medium">Pedidos</span>
          </button>

          <button
            onClick={() => setSeccionActiva('usuarios')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
              seccionActiva === 'usuarios'
                ? 'bg-blue-600 text-white'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            <span className="font-medium">Usuarios</span>
          </button>

          <button
            onClick={() => setSeccionActiva('estadisticas')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
              seccionActiva === 'estadisticas'
                ? 'bg-blue-600 text-white'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <span className="font-medium">Estadísticas</span>
          </button>
        </nav>

        {/* Footer del Sidebar */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center">
              <span className="text-white font-bold">
                {auth?.nombre?.[0]?.toUpperCase() || 'A'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-800 truncate">{auth?.nombre || 'Admin'}</p>
              <p className="text-xs text-gray-500">Administrador</p>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido Principal */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header del Contenido */}
        <div className="bg-white shadow-sm px-8 py-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800">
            {seccionActiva === 'pedidos' && 'Gestión de Pedidos'}
            {seccionActiva === 'usuarios' && 'Gestión de Usuarios'}
            {seccionActiva === 'estadisticas' && 'Estadísticas Generales'}
          </h2>
        </div>

        {/* Contenido de la Sección */}
        <div className="flex-1 overflow-y-auto p-8">
          {seccionActiva === 'pedidos' && (
            <div className="space-y-6">
              {/* Barra de búsqueda */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    placeholder="Buscar por #ID, nombre, email o teléfono..."
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Tabla de Pedidos */}
              <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          ID
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Cliente
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Fecha
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Estado
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Total
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Acciones
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {pedidosFiltrados.length === 0 ? (
                        <tr>
                          <td colSpan="6" className="px-6 py-12 text-center">
                            <div className="flex flex-col items-center">
                              <svg className="w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                              <p className="text-gray-500 text-lg">No se encontraron pedidos</p>
                              {busqueda && (
                                <p className="text-gray-400 text-sm mt-2">Intenta con otros términos de búsqueda</p>
                              )}
                            </div>
                          </td>
                        </tr>
                      ) : (
                        pedidosFiltrados.map((pedido) => (
                          <tr key={pedido.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="text-sm font-semibold text-gray-900">#{pedido.id}</span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm font-medium text-gray-900">
                                {pedido.Usuario?.nombre || 'N/A'}
                              </div>
                              <div className="text-sm text-gray-500">
                                {pedido.Usuario?.email || ''}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
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
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span
                                className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
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
                                  ? 'En Proceso'
                                  : pedido.estado === 'retirado'
                                  ? 'Retirado'
                                  : 'Pendiente'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="text-sm font-semibold text-gray-900">
                                ${Number(pedido.precio_total).toFixed(2)}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <button
                                onClick={() => verDetalles(pedido)}
                                className="text-blue-600 hover:text-blue-800 font-medium text-sm transition-colors"
                              >
                                Ver detalles
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
          )}

          {seccionActiva === 'usuarios' && (
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        ID
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Nombre
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Teléfono
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Rol
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {usuarios.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="px-6 py-12 text-center">
                          <div className="flex flex-col items-center">
                            <svg className="w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                            </svg>
                            <p className="text-gray-500 text-lg">No hay usuarios registrados</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      usuarios.map((usuario) => (
                        <tr key={usuario.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm font-semibold text-gray-900">#{usuario.id}</span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm font-medium text-gray-900">{usuario.nombre}</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900">{usuario.email}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{usuario.telefono || 'N/A'}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
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
          )}

          {seccionActiva === 'estadisticas' && (
            <div className="space-y-6">
              {/* Tarjetas de Estadísticas */}
              <div className="grid grid-cols-4 gap-6">
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Pedidos</p>
                      <p className="text-3xl font-bold text-blue-600 mt-2">{estadisticas.totalPedidos}</p>
                    </div>
                    <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Retirados</p>
                      <p className="text-3xl font-bold text-green-600 mt-2">{estadisticas.pedidosRetirados}</p>
                    </div>
                    <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">En Proceso</p>
                      <p className="text-3xl font-bold text-yellow-600 mt-2">{estadisticas.enProceso}</p>
                    </div>
                    <div className="h-12 w-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Listos</p>
                      <p className="text-3xl font-bold text-green-600 mt-2">{estadisticas.listos}</p>
                    </div>
                    <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* Estadísticas de Usuarios */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Usuarios Registrados</h3>
                <div className="flex items-center space-x-4">
                  <div className="h-16 w-16 bg-purple-100 rounded-lg flex items-center justify-center">
                    <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total de usuarios</p>
                    <p className="text-3xl font-bold text-gray-800">{estadisticas.totalUsuarios}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal de Detalles */}
      {mostrarDetalles && pedidoSeleccionado && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full p-6 max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">
                Pedido #{pedidoSeleccionado.id}
              </h2>
              <button
                onClick={() => {
                  setMostrarDetalles(false)
                  setPedidoSeleccionado(null)
                }}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-800 mb-3">Información del Cliente</h3>
                <div className="grid grid-cols-2 gap-4">
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
                <div>
                  <h3 className="font-semibold text-gray-800 mb-3">Archivos del Pedido</h3>
                  <div className="space-y-2">
                    {pedidoSeleccionado.archivo.split(',').map((archivo, index) => (
                      <div key={index} className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                        <span className="text-sm text-gray-700">{archivo.trim().split('/').pop()}</span>
                        <a
                          href={archivo.trim()}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          Descargar
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {pedidoSeleccionado.observaciones && (
                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">Observaciones</h3>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="text-gray-700 whitespace-pre-wrap">{pedidoSeleccionado.observaciones}</p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">Estado del Pedido</h3>
                  <select
                    value={pedidoSeleccionado.estado}
                    onChange={(e) => actualizarEstado(e.target.value)}
                    className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2 px-3"
                  >
                    <option value="pendiente">Pendiente</option>
                    <option value="en_proceso">En Proceso</option>
                    <option value="listo_para_retirar">Listo para retirar</option>
                    <option value="retirado">Retirado</option>
                  </select>
                </div>
                <div className="bg-blue-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-800 mb-2">Total</h3>
                  <p className="text-2xl font-bold text-blue-600">
                    ${Number(pedidoSeleccionado.precio_total).toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Admin
