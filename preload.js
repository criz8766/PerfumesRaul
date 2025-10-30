const { contextBridge, ipcRenderer } = require("electron")

contextBridge.exposeInMainWorld("api", {
  // CRUD Ventas
  cargarVentas: () => ipcRenderer.invoke("cargar-ventas"),
  guardarVenta: (datosVenta) => ipcRenderer.invoke("guardar-venta", datosVenta),
  actualizarVenta: (datosVenta) => ipcRenderer.invoke("actualizar-venta", datosVenta),
  eliminarVenta: (ventaId) => ipcRenderer.invoke("eliminar-venta", ventaId),

  // --- NUEVO: CRUD Perfumes ---
  cargarPerfumes: () => ipcRenderer.invoke("cargar-perfumes"),
  guardarPerfumes: (perfumes) => ipcRenderer.invoke("guardar-perfumes", perfumes),
  // --- Antiguos 'cargar-costos' y 'guardar-costo' eliminados ---

  // Control de Ventana
  closeApp: () => ipcRenderer.send("app:close"),
  minimizeApp: () => ipcRenderer.send("app:minimize"),
  maximizeApp: () => ipcRenderer.send("app:maximize"),
})