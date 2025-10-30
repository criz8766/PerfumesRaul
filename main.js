const { app, BrowserWindow, ipcMain } = require("electron")
const path = require("path")
const fs = require("fs")

// --- RUTAS DE DATOS ---
const DATA_PATH = app.getPath("userData")
const VENTAS_FILE = path.join(DATA_PATH, "ventas.json")
const COSTOS_FILE = path.join(DATA_PATH, "costos.json") // Ya no se usa, pero se puede dejar
const PERFUMES_FILE = path.join(DATA_PATH, "perfumes.json") // NUEVO ARCHIVO MAESTRO

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1000,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    frame: false,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: false,
      contextIsolation: true,
    },
    backgroundColor: "#0f172a",
  })

  mainWindow.loadFile("index.html")
  mainWindow.setMenuBarVisibility(false)
  // mainWindow.webContents.openDevTools();
}

app.whenReady().then(() => {
  createWindow()
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit()
  }
})

// ----------------------
// FUNCIONES DE MANEJO DE ARCHIVOS
// ----------------------

// --- VENTAS ---
function leerVentas() {
  if (!fs.existsSync(VENTAS_FILE)) {
    fs.writeFileSync(VENTAS_FILE, "[]", "utf8")
    return []
  }
  try {
    const data = fs.readFileSync(VENTAS_FILE, "utf8")
    return JSON.parse(data)
  } catch (error) {
    console.error("Error al leer o parsear ventas.json:", error)
    return []
  }
}

function escribirVentas(ventas) {
  fs.writeFileSync(VENTAS_FILE, JSON.stringify(ventas, null, 2), "utf8")
}

// --- NUEVO: PERFUMES (CRUD) ---
function leerPerfumes() {
  if (!fs.existsSync(PERFUMES_FILE)) {
    fs.writeFileSync(PERFUMES_FILE, "{}", "utf8")
    return {}
  }
  try {
    const data = fs.readFileSync(PERFUMES_FILE, "utf8")
    return JSON.parse(data)
  } catch (error) {
    console.error("Error al leer o parsear perfumes.json:", error)
    return {}
  }
}

function escribirPerfumes(perfumes) {
  fs.writeFileSync(PERFUMES_FILE, JSON.stringify(perfumes, null, 2), "utf8")
}

// ----------------------
// IPC Handlers para VENTAS (Sin cambios)
// ----------------------

ipcMain.handle("cargar-ventas", async () => {
  return leerVentas()
})

ipcMain.handle("guardar-venta", async (event, nuevaVenta) => {
  try {
    const ventas = leerVentas()
    ventas.push(nuevaVenta)
    escribirVentas(ventas)
    return { success: true, message: "Venta registrada." }
  } catch (error) {
    console.error("Error al guardar la venta:", error)
    return { success: false, message: "Error al registrar la venta." }
  }
})

ipcMain.handle("actualizar-venta", async (event, ventaActualizada) => {
  try {
    const ventas = leerVentas()
    const index = ventas.findIndex((v) => v.id === ventaActualizada.id)
    if (index !== -1) {
      ventas[index] = ventaActualizada
      escribirVentas(ventas)
      return { success: true, message: "Venta actualizada." }
    }
    return { success: false, message: "Venta no encontrada." }
  } catch (error) {
    console.error("Error al actualizar la venta:", error)
    return { success: false, message: "Error al actualizar la venta." }
  }
})

ipcMain.handle("eliminar-venta", async (event, ventaId) => {
  try {
    const ventas = leerVentas()
    const ventasFiltradas = ventas.filter((v) => v.id !== ventaId)
    escribirVentas(ventasFiltradas)
    return { success: true, message: "Venta eliminada." }
  } catch (error) {
    console.error("Error al eliminar la venta:", error)
    return { success: false, message: "Error al eliminar la venta." }
  }
})

// ----------------------
// IPC Handlers para PERFUMES (NUEVO)
// ----------------------
// Nota: Ya no usamos 'cargar-costos' ni 'guardar-costo', todo se maneja en 'perfumes'

ipcMain.handle("cargar-perfumes", async () => {
  return leerPerfumes()
})

ipcMain.handle("guardar-perfumes", async (event, perfumes) => {
  try {
    escribirPerfumes(perfumes)
    return { success: true, message: "Lista de perfumes actualizada." }
  } catch (error)
 {
    console.error("Error al guardar perfumes.json:", error)
    return { success: false, message: "Error al guardar perfumes." }
  }
})

// ----------------------
// IPC Handlers (Control de Ventana Personalizado)
// ----------------------

ipcMain.on("app:close", () => {
  BrowserWindow.getFocusedWindow().close()
})

ipcMain.on("app:minimize", () => {
  BrowserWindow.getFocusedWindow().minimize()
})

ipcMain.on("app:maximize", () => {
  const currentWindow = BrowserWindow.getFocusedWindow()
  if (currentWindow.isMaximized()) {
    currentWindow.unmaximize()
  } else {
    currentWindow.maximize()
  }
})