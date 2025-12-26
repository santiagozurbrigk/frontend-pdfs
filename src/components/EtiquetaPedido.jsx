import React, { useEffect, useRef } from 'react'
import JsBarcode from 'jsbarcode'

const EtiquetaPedido = ({ pedido, onClose }) => {
  const barcodeRef = useRef(null)
  const barcodePrintRef = useRef(null)

  // Generar código de barras con el ID del pedido
  const generarCodigoBarras = (element, codigo) => {
    if (element && codigo) {
      try {
        // Usar CODE128 que es compatible con la mayoría de lectores
        JsBarcode(element, codigo.toString(), {
          format: 'CODE128',
          width: 2,
          height: 100,
          displayValue: false, // No mostrar el valor debajo del código
          fontSize: 14,
          margin: 5,
          background: 'transparent'
        })
      } catch (error) {
        console.error('Error al generar código de barras:', error)
        // Si falla, intentar con el ID directamente
        try {
          JsBarcode(element, pedido.id.toString(), {
            format: 'CODE128',
            width: 2,
            height: 100,
            displayValue: false,
            margin: 5
          })
        } catch (e) {
          console.error('Error al generar código de barras alternativo:', e)
        }
      }
    }
  }

  useEffect(() => {
    if (pedido) {
      // Generar código de barras para vista previa usando el ID del pedido
      generarCodigoBarras(barcodeRef.current, pedido.id)
      // Generar código de barras para impresión
      setTimeout(() => {
        generarCodigoBarras(barcodePrintRef.current, pedido.id)
      }, 200)
    }
  }, [pedido])

  const handleImprimir = () => {
    // Mostrar la etiqueta de impresión
    const printElement = document.getElementById('etiqueta-print')
    if (printElement) {
      printElement.classList.remove('hidden')
      printElement.style.display = 'block'
      
      // Esperar a que se genere el código de barras
      setTimeout(() => {
        window.print()
        // Ocultar después de imprimir
        setTimeout(() => {
          printElement.classList.add('hidden')
          printElement.style.display = 'none'
        }, 100)
      }, 200)
    } else {
      window.print()
    }
  }

  if (!pedido) return null

  // Formatear fecha
  const fechaFormateada = new Date(pedido.createdAt).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })

  // Obtener nombre del archivo como producto
  const obtenerNombreProducto = () => {
    if (pedido.archivo) {
      const archivos = pedido.archivo.split(',')
      if (archivos.length > 0) {
        // Obtener el nombre del archivo sin la ruta
        const nombreArchivo = archivos[0].split('/').pop().split('?')[0]
        // Remover extensión y formatear
        const nombreSinExtension = nombreArchivo.replace(/\.[^/.]+$/, '')
        return `${nombreSinExtension} x${pedido.copias || 1}`
      }
    }
    return `Pedido x${pedido.copias || 1}`
  }

  const productoTexto = obtenerNombreProducto()
  
  // Usar solo números (formato decimal) para el ID del pedido
  const codigoPedido = pedido.id.toString()
  // Generar código numérico más largo para mostrar debajo del código de barras
  // Usamos el ID del pedido con padding para crear un código único pero escaneable
  const codigoBarrasTexto = pedido.id.toString().padStart(10, '0')

  return (
    <>
      {/* Modal para mostrar la etiqueta */}
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800">Etiqueta de Pedido</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Vista previa de la etiqueta */}
          <div className="border-2 border-dashed border-gray-300 p-6 mb-4 bg-white">
            <div className="text-center space-y-4">
              {/* Número del pedido rotado 180 grados */}
              <div className="transform rotate-180" style={{ transform: 'rotate(180deg)' }}>
                <h3 className="text-xl font-bold text-gray-900 uppercase">Pedido #{codigoPedido}</h3>
              </div>
              
              <div className="flex justify-center py-2">
                <svg ref={barcodeRef} className="max-w-full"></svg>
              </div>

              <div className="text-base text-gray-700 font-mono">
                <p className="font-semibold">{codigoBarrasTexto}</p>
              </div>

              <div className="text-base text-gray-700 font-mono">
                <p>{codigoPedido}</p>
              </div>

              {/* Detalles centrados */}
              <div className="flex flex-col items-center space-y-1 text-sm text-gray-800">
                <p><span className="font-semibold">Cliente:</span> {pedido.Usuario?.nombre || 'N/A'}</p>
                <p><span className="font-semibold">Fecha:</span> {fechaFormateada}</p>
                <p className="font-semibold text-lg text-gray-900 mt-2">Importe: ${Number(pedido.precio_total).toFixed(3)}</p>
              </div>
            </div>
          </div>

          {/* Botones de acción */}
          <div className="flex gap-3">
            <button
              onClick={handleImprimir}
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Imprimir Etiqueta
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>

      {/* Etiqueta para imprimir (oculta hasta que se imprima) */}
      <div id="etiqueta-print" className="hidden">
        <div className="text-center space-y-4" style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
          {/* Número del pedido rotado 180 grados */}
          <div style={{ transform: 'rotate(180deg)', marginBottom: '10px' }}>
            <h3 className="text-xl font-bold text-gray-900 uppercase">
              Pedido #{codigoPedido}
            </h3>
          </div>
          
          <div className="flex justify-center py-2" style={{ marginBottom: '10px' }}>
            <svg ref={barcodePrintRef} style={{ maxWidth: '100%' }}></svg>
          </div>

          <div className="text-base text-gray-700 font-mono" style={{ marginBottom: '5px', fontSize: '12px' }}>
            <p className="font-semibold">{codigoBarrasTexto}</p>
          </div>

          <div className="text-base text-gray-700 font-mono" style={{ marginBottom: '15px', fontSize: '14px' }}>
            <p>{codigoPedido}</p>
          </div>

          {/* Detalles centrados */}
          <div className="flex flex-col items-center space-y-1 text-sm text-gray-800" style={{ marginBottom: '10px' }}>
            <p><span className="font-semibold">Cliente:</span> {pedido.Usuario?.nombre || 'N/A'}</p>
            <p><span className="font-semibold">Fecha:</span> {fechaFormateada}</p>
            <p className="font-semibold text-lg text-gray-900" style={{ marginTop: '8px' }}>
              Importe: ${Number(pedido.precio_total).toFixed(3)}
            </p>
          </div>
        </div>
      </div>

      {/* Estilos para impresión */}
      <style>{`
        @media print {
          @page {
            size: A4;
            margin: 20mm;
          }
          
          body * {
            visibility: hidden;
          }
          
          #etiqueta-print,
          #etiqueta-print * {
            visibility: visible;
          }
          
          #etiqueta-print {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            background: white;
          }
          
          .fixed {
            display: none !important;
          }
        }
      `}</style>
    </>
  )
}

export default EtiquetaPedido

