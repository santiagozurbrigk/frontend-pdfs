import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import NuevoPedido from './pages/NuevoPedido'
import Historial from './pages/Historial'
import Configuracion from './pages/Configuracion'
import DetallePedido from './pages/DetallePedido'
import Admin from './pages/Admin'
import PedidoConfirmado from './pages/PedidoConfirmado'

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Layout>
                  <Dashboard />
                </Layout>
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/nuevo-pedido"
            element={
              <ProtectedRoute>
                <Layout>
                  <NuevoPedido />
                </Layout>
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/historial"
            element={
              <ProtectedRoute>
                <Layout>
                  <Historial />
                </Layout>
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/configuracion"
            element={
              <ProtectedRoute>
                <Layout>
                  <Configuracion />
                </Layout>
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/pedido/:id"
            element={
              <ProtectedRoute>
                <Layout>
                  <DetallePedido />
                </Layout>
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/admin"
            element={
              <ProtectedRoute adminOnly>
                <Layout>
                  <Admin />
                </Layout>
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/pedido-confirmado"
            element={
              <ProtectedRoute>
                <Layout>
                  <PedidoConfirmado />
                </Layout>
              </ProtectedRoute>
            }
          />
          
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App

