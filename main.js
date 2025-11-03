const { app, BrowserWindow, ipcMain, shell, dialog } = require("electron") // 'dialog' ya estaba, nos aseguramos
const path = require("path")
const fs = require("fs")
const crypto = require("crypto")
const exceljs = require("exceljs") // --- NUEVA LÍNEA ---

// --- RUTAS DE DATOS ---
const DATA_PATH = app.getPath("userData")
const VENTAS_FILE = path.join(DATA_PATH, "ventas.json")
const PERFUMES_FILE = path.join(DATA_PATH, "perfumes.json")
const ATTACHMENTS_PATH = path.join(DATA_PATH, "attachments")

function createWindow() {
  if (!fs.existsSync(ATTACHMENTS_PATH)) {
    fs.mkdirSync(ATTACHMENTS_PATH)
  }

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
// FUNCIONES DE MANEJO DE ARCHIVOS (Sin cambios)
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

// --- PERFUMES ---
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

// --- ADJUNTOS ---
function guardarAdjunto(tempPath) {
  try {
    const extension = path.extname(tempPath)
    const hash = crypto.randomBytes(8).toString('hex')
    const nuevoNombre = `${Date.now()}-${hash}${extension}`
    const nuevoPath = path.join(ATTACHMENTS_PATH, nuevoNombre)
    fs.copyFileSync(tempPath, nuevoPath)
    return nuevoPath
  } catch (error) {
    console.error("Error al guardar adjunto:", error)
    return null
  }
}

function eliminarAdjunto(adjuntoPath) {
    if (adjuntoPath && fs.existsSync(adjuntoPath)) {
        try {
            fs.unlinkSync(adjuntoPath)
        } catch (error) {
            console.error("Error al eliminar adjunto:", error)
        }
    }
}

// ----------------------
// IPC Handlers para VENTAS (ACTUALIZADO)
// ----------------------

ipcMain.handle("cargar-ventas", async () => {
  return leerVentas()
})

// Guardar una sola venta (sigue existiendo, pero no se usa en el form principal)
ipcMain.handle("guardar-venta", async (event, nuevaVenta) => {
  try {
    const ventas = leerVentas()
    if (nuevaVenta.adjuntoTemporalPath) {
      const nuevoPath = guardarAdjunto(nuevaVenta.adjuntoTemporalPath)
      if (nuevoPath) {
        nuevaVenta.adjuntoPath = nuevoPath
      }
      delete nuevaVenta.adjuntoTemporalPath
    }
    ventas.push(nuevaVenta)
    escribirVentas(ventas)
    return { success: true, message: "Venta registrada." }
  } catch (error) {
    console.error("Error al guardar la venta:", error)
    return { success: false, message: "Error al registrar la venta." }
  }
})

// --- NUEVO HANDLER PARA GUARDADO MÚLTIPLE ---
ipcMain.handle("guardar-multiples-ventas", async (event, ventasAGuardar) => {
  try {
    const ventas = leerVentas();
    const timestampBase = Date.now();
    let adjuntoPathFinal = null;

    // Guardar el adjunto UNA SOLA VEZ (si existe)
    // Asumimos que todas las ventas del array comparten el mismo adjunto temporal
    if (ventasAGuardar.length > 0 && ventasAGuardar[0].adjuntoTemporalPath) {
      adjuntoPathFinal = guardarAdjunto(ventasAGuardar[0].adjuntoTemporalPath);
    }
    
    ventasAGuardar.forEach((nuevaVenta, index) => {
      // 1. Asignar el path del adjunto guardado (si existe)
      if (adjuntoPathFinal) {
        nuevaVenta.adjuntoPath = adjuntoPathFinal;
      }
      // 2. Limpiar el path temporal
      delete nuevaVenta.adjuntoTemporalPath;
      
      // 3. Asignar un ID único y final
      nuevaVenta.id = timestampBase + index; 
      
      // 4. Añadir a la lista
      ventas.push(nuevaVenta);
    });

    // 5. Escribir en el archivo UNA SOLA VEZ
    escribirVentas(ventas);
    return { success: true, message: `Se registraron ${ventasAGuardar.length} perfumes en la venta.` };
  } catch (error) {
    console.error("Error al guardar múltiples ventas:", error);
    return { success: false, message: "Error al registrar las ventas." };
  }
});


ipcMain.handle("actualizar-venta", async (event, ventaActualizada) => {
  try {
    const ventas = leerVentas()
    const index = ventas.findIndex((v) => v.id === ventaActualizada.id)
    if (index === -1) {
      return { success: false, message: "Venta no encontrada." }
    }
    if (ventaActualizada.adjuntoTemporalPath) {
      const nuevoPath = guardarAdjunto(ventaActualizada.adjuntoTemporalPath)
      if (nuevoPath) {
        eliminarAdjunto(ventas[index].adjuntoPath)
        ventaActualizada.adjuntoPath = nuevoPath
      }
      delete ventaActualizada.adjuntoTemporalPath
    }
    ventas[index] = { ...ventas[index], ...ventaActualizada }
    escribirVentas(ventas)
    return { success: true, message: "Venta actualizada." }
  } catch (error) {
    console.error("Error al actualizar la venta:", error)
    return { success: false, message: "Error al actualizar la venta." }
  }
})

ipcMain.handle("eliminar-venta", async (event, ventaId) => {
  try {
    const ventas = leerVentas()
    const ventaAEliminar = ventas.find(v => v.id === ventaId)
    if (ventaAEliminar && ventaAEliminar.adjuntoPath) {
      eliminarAdjunto(ventaAEliminar.adjuntoPath)
    }
    const ventasFiltradas = ventas.filter((v) => v.id !== ventaId)
    escribirVentas(ventasFiltradas)
    return { success: true, message: "Venta eliminada." }
  } catch (error) {
    console.error("Error al eliminar la venta:", error)
    return { success: false, message: "Error al eliminar la venta." }
  }
})

// ----------------------
// IPC Handlers para PERFUMES (Sin cambios)
// ----------------------

ipcMain.handle("cargar-perfumes", async () => {
  return leerPerfumes()
})

ipcMain.handle("guardar-perfumes", async (event, perfumes) => {
  try {
    escribirPerfumes(perfumes)
    return { success: true, message: "Lista de perfumes actualizada." }
  } catch (error) {
    console.error("Error al guardar perfumes.json:", error)
    return { success: false, message: "Error al guardar perfumes." }
  }
})

// ----------------------
// IPC Handlers para Archivos y Shell (Sin cambios)
// ----------------------

ipcMain.handle("seleccionar-archivo", async () => {
  const { canceled, filePaths } = await dialog.showOpenDialog({
    title: "Seleccionar Comprobante",
    properties: ["openFile"],
    filters: [
      { name: 'Imágenes', extensions: ['jpg', 'png', 'jpeg', 'gif'] },
      { name: 'Documentos', extensions: ['pdf'] },
      { name: 'Todos los Archivos', extensions: ['*'] }
    ]
  })
  if (canceled) {
    return null
  } else {
    return filePaths[0]
  }
})

ipcMain.handle("abrir-archivo", async (event, path) => {
  try {
    await shell.openPath(path)
    return { success: true }
  } catch (error) {
    console.error("No se pudo abrir el archivo:", error)
    return { success: false, message: "No se pudo abrir el archivo." }
  }
})

// ----------------------
// --- NUEVO: IPC HANDLER PARA EXPORTAR A EXCEL ---
// ----------------------

ipcMain.handle("exportar-excel", async (event, datos) => {
  // 1. Pedir al usuario dónde guardar
  const { canceled, filePath } = await dialog.showSaveDialog({
    title: 'Guardar Reporte de Ganancias',
    defaultPath: `Reporte_Ganancias_${datos.titulo}.xlsx`,
    filters: [{ name: 'Excel', extensions: ['xlsx'] }]
  });

  if (canceled || !filePath) {
    return { success: false, message: "Exportación cancelada." };
  }

  // 2. Crear el archivo Excel
  try {
    const workbook = new exceljs.Workbook();
    const worksheet = workbook.addWorksheet('Ganancias');

    // Definir columnas
    worksheet.columns = [
      { header: 'Fecha', key: 'fecha', width: 15 },
      { header: 'Cliente', key: 'cliente', width: 25 },
      { header: 'Perfume', key: 'perfume', width: 30 },
      { header: 'Volumen (ml)', key: 'volumen', width: 15, style: { alignment: { horizontal: 'center' } } },
      { header: 'Precio Venta', key: 'precioVendido', width: 15, style: { numFmt: '$#,##0' } },
      { header: 'Costo Venta', key: 'costoVenta', width: 15, style: { numFmt: '$#,##0' } },
      { header: 'Ganancia Neta', key: 'gananciaNetaVenta', width: 15, style: { numFmt: '$#,##0' } }
    ];

    // Poner cabecera en negrita
    worksheet.getRow(1).font = { bold: true };

    // Añadir filas de datos
    worksheet.addRows(datos.ventas);

    // Añadir filas de resumen al final
    worksheet.addRow([]); // Fila vacía
    const filaTituloResumen = worksheet.addRow(['RESUMEN DEL PERIODO']);
    filaTituloResumen.font = { bold: true, size: 14 };
    worksheet.addRow(['Ganancia Bruta', datos.resumen.gananciaBruta]).getCell(2).numFmt = '$#,##0';
    worksheet.addRow(['Costo Total', datos.resumen.costoTotal]).getCell(2).numFmt = '$#,##0';
    const filaNeta = worksheet.addRow(['GANANCIA NETA TOTAL', datos.resumen.gananciaNeta]);
    filaNeta.font = { bold: true };
    filaNeta.getCell(2).numFmt = '$#,##0';
    
    // Auto-ajustar columnas (opcional, pero se ve bien)
    worksheet.columns.forEach(column => {
        if (column.width < (column.header.length + 2)) {
            column.width = column.header.length + 2;
        }
    });

    // 3. Escribir el archivo en disco
    await workbook.xlsx.writeFile(filePath);

    return { success: true, message: "¡Reporte exportado con éxito!" };

  } catch (error) {
    console.error("Error al exportar Excel:", error);
    return { success: false, message: "Error al generar el archivo Excel." };
  }
});


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