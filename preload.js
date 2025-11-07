const { contextBridge, ipcRenderer } = require("electron")

contextBridge.exposeInMainWorld("api", {
  // CRUD Ventas
  cargarVentas: () => ipcRenderer.invoke("cargar-ventas"),
  guardarVenta: (datosVenta) => ipcRenderer.invoke("guardar-venta", datosVenta),
  guardarMultiplesVentas: (ventas) => ipcRenderer.invoke("guardar-multiples-ventas", ventas),
  actualizarVenta: (datosVenta) => ipcRenderer.invoke("actualizar-venta", datosVenta),
  eliminarVenta: (ventaId) => ipcRenderer.invoke("eliminar-venta", ventaId),

  // CRUD Perfumes
  cargarPerfumes: () => ipcRenderer.invoke("cargar-perfumes"),
  guardarPerfumes: (perfumes) => ipcRenderer.invoke("guardar-perfumes", perfumes),
  
  // Handlers de Archivos
  seleccionarArchivo: () => ipcRenderer.invoke("seleccionar-archivo"),
  abrirArchivo: (path) => ipcRenderer.invoke("abrir-archivo", path),

  // Handler de Exportación
  exportarExcel: (datos) => ipcRenderer.invoke("exportar-excel", datos),

  // --- NUEVO: Handlers de Ticket PDF ---
  guardarTicket: (pedido) => ipcRenderer.invoke("guardar-ticket", pedido),
  imprimirTicket: (pedido) => ipcRenderer.invoke("imprimir-ticket", pedido),
  previewTicket: (pedido) => ipcRenderer.invoke("preview-ticket", pedido),

  // Control de Ventana
  closeApp: () => ipcRenderer.send("app:close"),
  minimizeApp: () => ipcRenderer.send("app:minimize"),
  maximizeApp: () => ipcRenderer.send("app:maximize"),
})