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
    <div className="min-h-screen bg-gray-100 w-full">
      <div className="w-full px-8 py-6">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              Panel de Administración
            </h1>
            <p className="text-gray-600 mt-1">
              Gestiona pedidos y usuarios desde un solo lugar
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow flex items-center space-x-4">
            <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center">
              <span className="text-lg text-white font-bold">
                {auth?.nombre?.[0]?.toUpperCase() || 'A'}
              </span>
            </div>
            <div>
              <p className="text-sm text-gray-600">Administrador</p>
              <p className="font-medium text-gray-800">{auth?.nombre || 'Admin'}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-6 mb-8 w-full">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Total Pedidos</h3>
                <p className="text-3xl font-bold text-blue-600 mt-2">
                  {pedidos.length > 0 ? Math.max(...pedidos.map((p) => p.id)) : 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Pedidos Retirados</h3>
                <p className="text-3xl font-bold text-green-600 mt-2">
                  {pedidos.filter((p) => p.estado === 'retirado').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">En Proceso</h3>
                <p className="text-3xl font-bold text-yellow-600 mt-2">
                  {pedidos.filter((p) => p.estado === 'en_proceso').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Listos para retirar</h3>
                <p className="text-3xl font-bold text-green-600 mt-2">
                  {pedidos.filter((p) => p.estado === 'listo_para_retirar').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-8 w-full">
          <div className="col-span-2 bg-white rounded-lg shadow w-full">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800">Pedidos</h2>
              <p className="text-sm text-gray-600 mt-1">Lista de todos los pedidos activos</p>
              <div className="mt-4">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Buscar por #ID, nombre o teléfono del cliente..."
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    className="w-full p-3 pl-10 pr-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>
            </div>
            <div className="max-h-[600px] overflow-y-auto">
              <table className="w-full">
                <thead className="bg-gray-50 sticky top-0 z-10">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Cliente
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Fecha Creación
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Estado
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Acciones
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {pedidosFiltrados.map((pedido) => (
                    <tr key={pedido.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">#{pedido.id}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {pedido.Usuario?.nombre || 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {new Date(pedido.createdAt).toLocaleDateString('es-ES', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
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
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <button
                          onClick={() => verDetalles(pedido)}
                          className="text-blue-600 hover:text-blue-900 mr-4"
                        >
                          Ver detalles
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        ${Number(pedido.precio_total).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="space-y-8 w-full">
            <div className="bg-white rounded-lg shadow w-full">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-800">Usuarios</h2>
                <p className="text-sm text-gray-600 mt-1">Gestión de usuarios registrados</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Nombre
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Teléfono
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Rol
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {usuarios.map((usuario) => (
                      <tr key={usuario.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          #{usuario.id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {usuario.nombre}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {usuario.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {usuario.telefono || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              usuario.rol === 'admin'
                                ? 'bg-purple-100 text-purple-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {usuario.rol}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      {mostrarDetalles && pedidoSeleccionado && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
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

            <div className="mb-6">
              <h3 className="font-semibold mb-2">Información del Cliente</h3>
              <p>Nombre: {pedidoSeleccionado.Usuario?.nombre}</p>
              <p>Email: {pedidoSeleccionado.Usuario?.email}</p>
            </div>

            {pedidoSeleccionado.archivo && (
              <div className="mb-6">
                <h3 className="font-semibold mb-2">Archivos</h3>
                {pedidoSeleccionado.archivo.split(',').map((archivo, index) => (
                  <div key={index} className="mb-2">
                    <a
                      href={archivo.trim()}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {archivo.trim().split('/').pop()}
                    </a>
                  </div>
                ))}
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

            <div className="mb-6">
              <h3 className="font-semibold mb-2">Estado del Pedido</h3>
              <select
                value={pedidoSeleccionado.estado}
                onChange={(e) => actualizarEstado(e.target.value)}
                className="mt-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="pendiente">Pendiente</option>
                <option value="en_proceso">En Proceso</option>
                <option value="listo_para_retirar">Listo para retirar</option>
                <option value="retirado">Retirado</option>
              </select>
            </div>

            <div className="mb-6">
              <h3 className="font-semibold mb-2">Resumen de Costos</h3>
              <p className="text-lg font-bold text-blue-600">
                Total: ${pedidoSeleccionado.precio_total}
              </p>
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

