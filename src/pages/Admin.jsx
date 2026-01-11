import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import EtiquetaPedido from '../components/EtiquetaPedido'

const Admin = () => {
  const navigate = useNavigate()
  const { auth, logout } = useAuth()
  const [pedidos, setPedidos] = useState([])
  const [usuarios, setUsuarios] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState(null)
  const [mostrarDetalles, setMostrarDetalles] = useState(false)
  const [mostrarEtiqueta, setMostrarEtiqueta] = useState(false)
  const [pedidoParaEtiqueta, setPedidoParaEtiqueta] = useState(null)
  const [busqueda, setBusqueda] = useState('')
  const [seccionActiva, setSeccionActiva] = useState('pedidos')
  const [mostrarConfirmacionEliminar, setMostrarConfirmacionEliminar] = useState(false)
  const [pedidoAEliminar, setPedidoAEliminar] = useState(null)
  const [eliminando, setEliminando] = useState(false)

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
    
    // Buscar por ID (puede ser decimal o hexadecimal)
    if (busquedaLower.startsWith('#')) {
      const idBusqueda = busquedaLower.substring(1)
      return pedido.id.toString() === idBusqueda || pedido.id.toString(16) === idBusqueda.toLowerCase()
    }
    
    // Si es un número, buscar por ID (decimal o hexadecimal)
    if (!isNaN(parseInt(busquedaLower, 10)) || /^[0-9a-f]+$/.test(busquedaLower)) {
      const idDecimal = parseInt(busquedaLower, 10)
      const idHex = busquedaLower.toLowerCase()
      return (
        pedido.id === idDecimal ||
        pedido.id.toString() === busquedaLower ||
        pedido.id.toString(16) === idHex ||
        pedido.Usuario?.telefono?.toString().includes(busquedaLower) ||
        pedido.Usuario?.email?.toLowerCase().includes(busquedaLower) ||
        pedido.Usuario?.nombre?.toLowerCase().includes(busquedaLower)
      )
    }
    
    // Búsqueda por texto
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

  const generarEtiqueta = async (pedido) => {
    try {
      // Obtener detalles completos del pedido si no los tenemos
      const { data } = await api.get(`/pedidos/${pedido.id}`)
      setPedidoParaEtiqueta(data || pedido)
      setMostrarEtiqueta(true)
    } catch (error) {
      console.error('Error al obtener detalles del pedido:', error)
      setPedidoParaEtiqueta(pedido)
      setMostrarEtiqueta(true)
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const confirmarEliminar = (pedido) => {
    setPedidoAEliminar(pedido)
    setMostrarConfirmacionEliminar(true)
  }

  const eliminarPedido = async () => {
    if (!pedidoAEliminar) return

    setEliminando(true)
    try {
      await api.delete(`/pedidos/${pedidoAEliminar.id}`)
      // Actualizar la lista de pedidos removiendo el eliminado
      setPedidos(pedidos.filter((p) => p.id !== pedidoAEliminar.id))
      setMostrarConfirmacionEliminar(false)
      setPedidoAEliminar(null)
    } catch (error) {
      console.error('Error al eliminar el pedido:', error)
      alert(error.response?.data?.mensaje || 'Error al eliminar el pedido')
    } finally {
      setEliminando(false)
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

  // Calcular estadísticas avanzadas
  const calcularEstadisticas = () => {
    const totalPedidos = pedidos.length
    const pedidosRetirados = pedidos.filter((p) => p.estado === 'retirado').length
    const enProceso = pedidos.filter((p) => p.estado === 'en_proceso').length
    const listos = pedidos.filter((p) => p.estado === 'listo_para_retirar').length
    const pendientes = pedidos.filter((p) => p.estado === 'pendiente').length
    
    // Ingresos
    const ingresosTotales = pedidos.reduce((sum, p) => sum + parseFloat(p.precio_total || 0), 0)
    const ingresosRetirados = pedidos
      .filter((p) => p.estado === 'retirado')
      .reduce((sum, p) => sum + parseFloat(p.precio_total || 0), 0)
    const promedioPorPedido = totalPedidos > 0 ? ingresosTotales / totalPedidos : 0
    
    // Pedidos del día
    const hoy = new Date()
    hoy.setHours(0, 0, 0, 0)
    const pedidosHoy = pedidos.filter((p) => {
      const fechaPedido = new Date(p.createdAt)
      fechaPedido.setHours(0, 0, 0, 0)
      return fechaPedido.getTime() === hoy.getTime()
    }).length
    
    const ingresosHoy = pedidos
      .filter((p) => {
        const fechaPedido = new Date(p.createdAt)
        fechaPedido.setHours(0, 0, 0, 0)
        return fechaPedido.getTime() === hoy.getTime()
      })
      .reduce((sum, p) => sum + parseFloat(p.precio_total || 0), 0)
    
    // Pedidos de la semana
    const inicioSemana = new Date(hoy)
    inicioSemana.setDate(hoy.getDate() - hoy.getDay())
    const pedidosSemana = pedidos.filter((p) => {
      const fechaPedido = new Date(p.createdAt)
      return fechaPedido >= inicioSemana
    }).length
    
    // Pedidos del mes
    const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1)
    const pedidosMes = pedidos.filter((p) => {
      const fechaPedido = new Date(p.createdAt)
      return fechaPedido >= inicioMes
    }).length
    
    const ingresosMes = pedidos
      .filter((p) => {
        const fechaPedido = new Date(p.createdAt)
        return fechaPedido >= inicioMes
      })
      .reduce((sum, p) => sum + parseFloat(p.precio_total || 0), 0)
    
    // Clientes únicos
    const clientesUnicos = new Set(pedidos.map((p) => p.Usuario?.id).filter(Boolean)).size
    
    return {
      totalPedidos,
      pedidosRetirados,
      enProceso,
      listos,
      pendientes,
      totalUsuarios: usuarios.length,
      ingresosTotales,
      ingresosRetirados,
      ingresosHoy,
      ingresosMes,
      promedioPorPedido,
      pedidosHoy,
      pedidosSemana,
      pedidosMes,
      clientesUnicos
    }
  }

  const estadisticas = calcularEstadisticas()
  const esAdmin = auth?.rol === 'admin'
  const esEmpleado = auth?.rol === 'empleado'

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden" style={{ height: '100vh', display: 'flex' }}>
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg flex flex-col">
        {/* Header del Sidebar */}
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-gray-800">
            {esAdmin ? 'Admin Panel' : 'Panel Empleado'}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {esAdmin ? 'Panel de Control' : 'Gestión de Pedidos'}
          </p>
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

          {esAdmin && (
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
          )}

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
        <div className="p-4 border-t border-gray-200 space-y-3">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center">
              <span className="text-white font-bold">
                {auth?.nombre?.[0]?.toUpperCase() || 'A'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-800 truncate">{auth?.nombre || 'Usuario'}</p>
              <p className="text-xs text-gray-500">
                {esAdmin ? 'Administrador' : esEmpleado ? 'Empleado' : 'Usuario'}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </div>

      {/* Contenido Principal */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header del Contenido */}
        <div className="bg-white shadow-sm px-8 py-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800">
            {seccionActiva === 'pedidos' && 'Gestión de Pedidos'}
            {seccionActiva === 'usuarios' && esAdmin && 'Gestión de Usuarios'}
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
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => verDetalles(pedido)}
                                  className="text-blue-600 hover:text-blue-800 font-medium text-sm transition-colors"
                                >
                                  Ver detalles
                                </button>
                                <button
                                  onClick={() => generarEtiqueta(pedido)}
                                  className="text-green-600 hover:text-green-800 font-medium text-sm transition-colors flex items-center gap-1"
                                  title="Generar código de barras"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                  </svg>
                                  Código
                                </button>
                                {esAdmin && (
                                  <button
                                    onClick={() => confirmarEliminar(pedido)}
                                    className="text-red-600 hover:text-red-800 font-medium text-sm transition-colors flex items-center gap-1"
                                    title="Eliminar pedido"
                                  >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                    Eliminar
                                  </button>
                                )}
                              </div>
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

          {seccionActiva === 'usuarios' && esAdmin && (
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
              {/* Tarjetas de Estadísticas Principales */}
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

              {/* Estadísticas de Ingresos */}
              <div className="grid grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-sm p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-green-100">Ingresos Totales</p>
                      <p className="text-3xl font-bold mt-2">${estadisticas.ingresosTotales.toFixed(2)}</p>
                    </div>
                    <div className="h-12 w-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-sm p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-blue-100">Ingresos del Mes</p>
                      <p className="text-3xl font-bold mt-2">${estadisticas.ingresosMes.toFixed(2)}</p>
                    </div>
                    <div className="h-12 w-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-sm p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-purple-100">Promedio por Pedido</p>
                      <p className="text-3xl font-bold mt-2">${estadisticas.promedioPorPedido.toFixed(2)}</p>
                    </div>
                    <div className="h-12 w-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* Estadísticas Temporales */}
              <div className="grid grid-cols-3 gap-6">
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-semibold text-gray-700">Hoy</h3>
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Pedidos</span>
                      <span className="text-lg font-bold text-gray-800">{estadisticas.pedidosHoy}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Ingresos</span>
                      <span className="text-lg font-bold text-green-600">${estadisticas.ingresosHoy.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-semibold text-gray-700">Esta Semana</h3>
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Pedidos</span>
                      <span className="text-lg font-bold text-gray-800">{estadisticas.pedidosSemana}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-semibold text-gray-700">Este Mes</h3>
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Pedidos</span>
                      <span className="text-lg font-bold text-gray-800">{estadisticas.pedidosMes}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Ingresos</span>
                      <span className="text-lg font-bold text-green-600">${estadisticas.ingresosMes.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Estadísticas Adicionales */}
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex items-center space-x-4">
                    <div className="h-16 w-16 bg-purple-100 rounded-lg flex items-center justify-center">
                      <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Clientes Únicos</p>
                      <p className="text-3xl font-bold text-gray-800">{estadisticas.clientesUnicos}</p>
                    </div>
                  </div>
                </div>

                {esAdmin && (
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex items-center space-x-4">
                      <div className="h-16 w-16 bg-indigo-100 rounded-lg flex items-center justify-center">
                        <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Total Usuarios</p>
                        <p className="text-3xl font-bold text-gray-800">{estadisticas.totalUsuarios}</p>
                      </div>
                    </div>
                  </div>
                )}
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

              {/* Detalles de la Impresión */}
              <div>
                <h3 className="font-semibold text-gray-800 mb-3">Detalles de la Impresión</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-1">Tipo de impresión</p>
                    <p className="font-medium text-gray-900">
                      {pedidoSeleccionado.tipo_impresion
                        ? pedidoSeleccionado.tipo_impresion
                            .replace(/_/g, ' ')
                            .split(' ')
                            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                            .join(' ')
                        : 'N/A'}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-1">Acabado</p>
                    <p className="font-medium text-gray-900">
                      {pedidoSeleccionado.acabado
                        ? pedidoSeleccionado.acabado
                            .split('_')
                            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                            .join(' ')
                        : 'N/A'}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-1">Número de páginas</p>
                    <p className="font-medium text-gray-900">{pedidoSeleccionado.num_paginas || 'N/A'}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-1">Copias</p>
                    <p className="font-medium text-gray-900">{pedidoSeleccionado.copias || 'N/A'}</p>
                  </div>
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

      {/* Modal de Etiqueta con Código de Barras */}
      {mostrarEtiqueta && pedidoParaEtiqueta && (
        <EtiquetaPedido
          pedido={pedidoParaEtiqueta}
          onClose={() => {
            setMostrarEtiqueta(false)
            setPedidoParaEtiqueta(null)
          }}
        />
      )}

      {/* Modal de Confirmación de Eliminación */}
      {mostrarConfirmacionEliminar && pedidoAEliminar && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl">
            <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full mb-4">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-800 text-center mb-2">
              ¿Eliminar pedido?
            </h2>
            <p className="text-gray-600 text-center mb-6">
              ¿Estás seguro de que deseas eliminar el pedido <span className="font-semibold">#{pedidoAEliminar.id}</span>? Esta acción no se puede deshacer.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setMostrarConfirmacionEliminar(false)
                  setPedidoAEliminar(null)
                }}
                disabled={eliminando}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancelar
              </button>
              <button
                onClick={eliminarPedido}
                disabled={eliminando}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {eliminando ? (
                  <>
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Eliminando...
                  </>
                ) : (
                  'Eliminar'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Admin
