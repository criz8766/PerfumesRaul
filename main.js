const { app, BrowserWindow, ipcMain, shell, dialog } = require("electron") // 'dialog' ya estaba, nos aseguramos
const path = require("path")
const fs = require("fs")
const crypto = require("crypto")
const exceljs = require("exceljs")
const PDFDocument = require("pdfkit") // --- REQUERIDO ---
const printer = require("pdf-to-printer") // --- REQUERIDO ---
const os = require("os") // --- REQUERIDO ---

// --- NUEVO: Imports para Auto-Update ---
const { autoUpdater } = require("electron-updater")
const log = require("electron-log")

// --- RUTAS DE DATOS ---
const DATA_PATH = app.getPath("userData")
const VENTAS_FILE = path.join(DATA_PATH, "ventas.json")
const PERFUMES_FILE = path.join(DATA_PATH, "perfumes.json")
const ATTACHMENTS_PATH = path.join(DATA_PATH, "attachments")

// --- NUEVO: Configuración de Logs ---
// Esto guardará los logs en la carpeta de datos del usuario
// (AppData en Win, Application Support en Mac)
// Podrás ver 'main.log' para depurar problemas.
log.transports.file.resolvePath = () => path.join(DATA_PATH, "logs/main.log")
log.info("App iniciando...")


// Logo path (para el PDF)
const LOGO_PATH = path.join(__dirname, "ONE_FRAGANCE.png")

// --- NUEVO: Lógica de Auto-Updater ---
/**
 * Inicializa el proceso de auto-update.
 * Comprueba si hay actualizaciones en GitHub.
 * Descarga en segundo plano.
 * Pregunta al usuario si desea reiniciar e instalar.
 */
function inicializarActualizaciones() {
  autoUpdater.logger = log; // Usar el logger que configuramos
  log.info("Buscando actualizaciones...");

  // (Opcional) Escuchar eventos para depurar
  autoUpdater.on("checking-for-update", () => {
    log.info("Revisando actualizaciones...");
  });
  autoUpdater.on("update-available", (info) => {
    log.info("Actualización disponible:", info.version);
  });
  autoUpdater.on("update-not-available", () => {
    log.info("No hay actualizaciones disponibles.");
  });
  autoUpdater.on("error", (err) => {
    log.error("Error en auto-updater:", err);
  });
  autoUpdater.on("download-progress", (progressObj) => {
    let log_message = "Velocidad: " + progressObj.bytesPerSecond;
    log_message = log_message + ' - Descargado ' + progressObj.percent + '%';
    log.info(log_message);
  });
  autoUpdater.on("update-downloaded", (info) => {
    log.info("Actualización descargada:", info.version);
    // Notificar al usuario que la actualización está lista
    dialog.showMessageBox({
      type: "info",
      title: "Actualización Lista",
      message: `Hay una nueva versión (${info.version}) de Contador Decants lista para instalar. ¿Deseas reiniciar y actualizar ahora?`,
      buttons: ["Sí, reiniciar ahora", "Más tarde"],
      defaultId: 0,
      cancelId: 1
    }).then(({ response }) => {
      if (response === 0) {
        autoUpdater.quitAndInstall();
      }
    });
  });

  // ¡La línea mágica! Comprueba si hay una actualización.
  autoUpdater.checkForUpdates();
}


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

  // --- NUEVO: Llamar al inicializador de actualizaciones ---
  // Lo llamamos después de crear la ventana
  // Se ejecutará en producción, no en desarrollo (start)
  if (!process.env.ELECTRON_DEV) {
    inicializarActualizaciones();
  }
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
    log.error("Error al leer o parsear ventas.json:", error) // Log de error
    return []
  }
}

function escribirVentas(ventas) {
  try {
    fs.writeFileSync(VENTAS_FILE, JSON.stringify(ventas, null, 2), "utf8")
  } catch (error) {
    log.error("Error al escribir ventas.json:", error) // Log de error
  }
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
    log.error("Error al leer o parsear perfumes.json:", error) // Log de error
    return {}
  }
}

function escribirPerfumes(perfumes) {
   try {
    fs.writeFileSync(PERFUMES_FILE, JSON.stringify(perfumes, null, 2), "utf8")
   } catch (error) {
     log.error("Error al escribir perfumes.json:", error) // Log de error
   }
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
    log.error("Error al guardar adjunto:", error) // Log de error
    return null
  }
}

function eliminarAdjunto(adjuntoPath) {
    if (adjuntoPath && fs.existsSync(adjuntoPath)) {
        try {
            fs.unlinkSync(adjuntoPath)
        } catch (error) {
            log.error("Error al eliminar adjunto:", error) // Log de error
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
    log.error("Error al guardar la venta:", error)
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
    log.error("Error al guardar múltiples ventas:", error);
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
    log.error("Error al actualizar la venta:", error)
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
    log.error("Error al eliminar la venta:", error)
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
    log.error("Error al guardar perfumes.json:", error)
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
    log.error("No se pudo abrir el archivo:", error)
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
    log.error("Error al exportar Excel:", error);
    return { success: false, message: "Error al generar el archivo Excel." };
  }
});

// ----------------------
// --- NUEVO: FUNCIONES Y HANDLERS PARA PDF Y TICKET ---
// ----------------------

/**
 * Función auxiliar para crear el PDF del ticket.
 * Recibe el objeto del pedido y la ruta donde se guardará.
 * Devuelve una promesa que se resuelve cuando el PDF se ha escrito.
 */
function crearPDF(pedido, rutaDestino) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: [226, 600], // Ancho de ticket (80mm) y un alto variable
        margins: { top: 15, bottom: 15, left: 15, right: 15 }
      });

      const stream = fs.createWriteStream(rutaDestino);
      doc.pipe(stream);

      // --- márgenes y coordenadas ---
      const pageMargin = 15;
      const contentWidth = 226 - (pageMargin * 2); // 196
      const leftColumnX = pageMargin; // 15
      const rightColumnX = 161; // 15 (margen) + 146 (ancho izq)
      const leftColumnWidth = 146;
      const rightColumnWidth = 50;


      // Logo
      if (fs.existsSync(LOGO_PATH)) {
        doc.image(LOGO_PATH, {
          fit: [100, 100], // Ajustar a 100px de ancho
          align: 'center'
        });
        doc.moveDown(0.5);
      }

      // Título
      doc.font('Helvetica-Bold').fontSize(12).text('Comprobante de Venta', { align: 'center' });
      doc.moveDown(1);

      // Info
      doc.font('Helvetica').fontSize(9);
      doc.text(`Fecha: ${pedido.fecha}`);
      doc.text(`Cliente: ${pedido.cliente || 'N/A'}`);
      doc.text(`Pago: ${pedido.metodoPago || 'N/A'}`);
      doc.moveDown(1);

      // Línea divisoria
      doc.strokeColor("#aaaaaa").lineWidth(0.5).moveTo(pageMargin, doc.y).lineTo(pageMargin + contentWidth, doc.y).stroke();
      doc.moveDown(0.5);

      // Cabecera de ítems (usando coordenadas explícitas)
      doc.font('Helvetica-Bold');
      doc.text('Perfume', leftColumnX, doc.y); // (texto, x, y)
      doc.text('Total', rightColumnX, doc.y, { width: rightColumnWidth, align: 'right' });
      doc.font('Helvetica');
      doc.moveDown(0.5);

      
      // --- ÍTEMS (LÓGICA ACTUALIZADA) ---
      pedido.items.forEach(item => {
        // Guardar la posición Y actual antes de dibujar la fila
        const startY = doc.y;

        // --- SOLUCIÓN 2: Formatear el nombre del ítem ---
        // Si es reparto, no mostrar "(0ml)".
        // Si es un perfume, mostrar (xml).
        let itemName;
        if (item.perfume === "Costo de Reparto") {
            itemName = "Costo de Reparto";
        } else {
            // No mostrar (0ml) si el volumen es 0
            const volText = item.volumen > 0 ? `(${item.volumen}ml)` : '';
            itemName = `${item.perfume} ${volText}`;
        }

        // --- SOLUCIÓN 1: Dibujar la columna izquierda (Nombre) ---
        // (texto, x, y, opciones)
        doc.fontSize(8).text(itemName, leftColumnX, startY, {
          width: leftColumnWidth,
          align: 'left',
          ellipsis: true
        });

        // Guardar la altura Y *después* de dibujar el nombre (podría ocupar varias líneas)
        const endOfNameY = doc.y;

        // --- SOLUCIÓN 1: Dibujar la columna derecha (Precio) ---
        // Usamos el 'startY' original para que se alinee con la parte superior del nombre
        doc.fontSize(9).text(
          `$${item.precioVendido.toLocaleString("es-CL")}`,
          rightColumnX,
          startY, // Alinear con el tope de la fila
          {
            width: rightColumnWidth,
            align: 'right'
          }
        );

        // Guardar la altura Y *después* de dibujar el precio
        const endOfPriceY = doc.y;

        // Mover la posición Y del documento al punto MÁS BAJO de las dos columnas
        // (para que la siguiente fila no se sobreponga si el nombre era muy largo)
        doc.y = Math.max(endOfNameY, endOfPriceY) + (doc.currentLineHeight() * 0.5);
      });
      // --- FIN DE ÍTEMS ---


      doc.moveDown(0.5);
      // Línea divisoria
      doc.strokeColor("#aaaaaa").lineWidth(0.5).moveTo(pageMargin, doc.y).lineTo(pageMargin + contentWidth, doc.y).stroke();
      doc.moveDown(0.5);

      // Total
      doc.font('Helvetica-Bold').fontSize(12);
      // Usar la misma lógica de coordenadas para el total
      doc.text('TOTAL:', leftColumnX, doc.y);
      doc.text(`$${pedido.totalVenta.toLocaleString("es-CL")}`, rightColumnX, doc.y, {
        width: rightColumnWidth,
        align: 'right'
      });
      doc.moveDown(1);

      // Pie de página
      doc.font('Helvetica').fontSize(8).text('¡Gracias por tu compra!', { align: 'center' });

      // Finalizar PDF
      doc.end();

      stream.on('finish', resolve);
      stream.on('error', reject);

    } catch (error) {
      log.error("Error al crear PDF:", error); // Log de error
      reject(error);
    }
  });
}

// --- NUEVO: Handler para PREVISUALIZAR Ticket ---
ipcMain.handle("preview-ticket", async (event, pedido) => {
  // 1. Crear una ruta temporal para el PDF
  const tempPath = path.join(os.tmpdir(), `ticket_preview_${Date.now()}.pdf`)

  try {
    // 2. Usar tu función existente para crear el PDF en esa ruta
    await crearPDF(pedido, tempPath)

    // 3. Crear una nueva ventana de previsualización
    const parentWindow = BrowserWindow.getFocusedWindow()
    const previewWindow = new BrowserWindow({
      width: 400, // Un poco más ancho que el ticket (80mm) para el visor
      height: 700,
      title: "Previsualización de Ticket",
      parent: parentWindow, // Esta ventana es "hija" de la principal
      modal: true, // Bloquea la interacción con la ventana principal
      autoHideMenuBar: true, // Oculta la barra de menú (File, Edit...)
    })

    // 4. Cargar el archivo PDF temporal en la nueva ventana
    // Usamos 'file://' para asegurarnos de que cargue el archivo local
    await previewWindow.loadURL(`file://${tempPath}`)

    // 5. Configurar la limpieza
    // Cuando la ventana de preview se cierre, borramos el PDF temporal
    previewWindow.on("closed", () => {
      if (fs.existsSync(tempPath)) {
        fs.unlinkSync(tempPath)
      }
    })

    return { success: true }
  } catch (error) {
    log.error("Error al previsualizar PDF:", error)
    // Si algo falla, asegurarse de borrar el temporal
    if (fs.existsSync(tempPath)) {
      fs.unlinkSync(tempPath)
    }
    return { success: false, message: `Error al previsualizar: ${error.message}` }
  }
})

// Handler para GUARDAR el ticket
ipcMain.handle("guardar-ticket", async (event, pedido) => {
  try {
    const { canceled, filePath } = await dialog.showSaveDialog({
      title: 'Guardar Ticket de Venta',
      defaultPath: `Ticket_${pedido.cliente}_${pedido.fecha}.pdf`,
      filters: [{ name: 'PDF', extensions: ['pdf'] }]
    });

    if (canceled || !filePath) {
      return { success: false, message: "Guardado cancelado." };
    }

    await crearPDF(pedido, filePath);
    
    // Abrir el PDF guardado
    shell.openPath(filePath);

    return { success: true, message: "Ticket guardado con éxito." };

  } catch (error) {
    log.error("Error al guardar PDF:", error);
    return { success: false, message: `Error al guardar: ${error.message}` };
  }
});

// Handler para IMPRIMIR el ticket
ipcMain.handle("imprimir-ticket", async (event, pedido) => {
  const tempPath = path.join(os.tmpdir(), `ticket_temp_${Date.now()}.pdf`);
  try {
    // 1. Crear el PDF en una ruta temporal
    await crearPDF(pedido, tempPath);
    
    // 2. Enviar a la impresora
    await printer.print(tempPath, {
      // Opciones de impresión (opcional)
      // printer: 'NOMBRE_DE_TU_IMPRESORA_TERMICA', // Descomenta si sabes el nombre
      // silent: true, // Imprimir sin diálogo
    });
    
    return { success: true, message: "Ticket enviado a la impresora." };
  } catch (error)
 {
    log.error("Error al imprimir:", error);
    return { success: false, message: `Error al imprimir: ${error.message}` };
  } finally {
    // 3. Limpiar el archivo temporal
    if (fs.existsSync(tempPath)) {
      fs.unlinkSync(tempPath);
    }
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