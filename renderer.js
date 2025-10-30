// --- DATOS HARDCODEADOS ELIMINADOS ---
// const PRECIOS_VENTA = { ... } // ¡Eliminado!
// const COSTOS_BASE = { ... } // ¡Eliminado!

// Referencias DOM (Pestaña Registro/CRUD)
const perfumeSelect = document.getElementById("perfume")
const formVenta = document.getElementById("form-venta")
const tablaVentasBody = document.querySelector("#tabla-ventas tbody")
const volumenSelect = document.getElementById("volumen")
const precioVendidoInput = document.getElementById("precio-vendido")

// Referencias DOM (Pestaña Resumen)
const gananciaMesEl = document.getElementById("ganancia-mes")
const decantsMesEl = document.getElementById("decants-mes")
const tablaVentasResumenBody = document.querySelector("#tabla-ventas-resumen tbody")
const costoMesEl = document.getElementById("costo-mes")
const gananciaNetaMesEl = document.getElementById("ganancia-neta-mes")

// Referencias DOM (Modal Edición Venta)
const modalEdicion = document.getElementById("modal-edicion")
const formEdicion = document.getElementById("form-edicion")
const closeBtnModal = document.querySelector(".close-btn")
const editPerfumeSelect = document.getElementById("edit-perfume")
const editVolumenSelect = document.getElementById("edit-volumen")
const editPrecioVendidoInput = document.getElementById("edit-precio-vendido")

// Referencias DOM (Tabs)
const tabMenu = document.getElementById("tab-menu")
const tabButtons = document.querySelectorAll(".tab-button")
const tabContents = document.querySelectorAll(".tab-content")

// NUEVO: Referencias DOM (Configuración CRUD)
const formPerfumeCrud = document.getElementById("form-perfume-crud")
const crudFormTitulo = document.getElementById("crud-form-titulo")
const crudSubmitBtn = document.getElementById("crud-submit-btn")
const crudCancelarBtn = document.getElementById("crud-cancelar-btn")
const crudOriginalNombreInput = document.getElementById("crud-original-nombre")
const crudNombreInput = document.getElementById("crud-nombre")
const crudPrecio3mlInput = document.getElementById("crud-precio-3ml")
const crudPrecio5mlInput = document.getElementById("crud-precio-5ml")
const crudPrecio10mlInput = document.getElementById("crud-precio-10ml")
const crudCostoFrascoInput = document.getElementById("crud-costo-frasco")
const crudVolumenFrascoInput = document.getElementById("crud-volumen-frasco")
const tablaPerfumesBody = document.getElementById("tabla-perfumes-body")

// --- Variables Globales ---
let ventas = []
let perfumes = {} // NUEVO: ¡La única fuente de verdad para perfumes!

// ----------------------
// LÓGICA DE TABS
// ----------------------

tabMenu.addEventListener("click", (e) => {
  if (e.target.classList.contains("tab-button")) {
    const targetTab = e.target.dataset.tab

    tabButtons.forEach((btn) => btn.classList.remove("active"))
    tabContents.forEach((content) => content.classList.remove("active"))

    e.target.classList.add("active")
    document.getElementById(targetTab).classList.add("active")

    if (targetTab === "tab-resumen") {
      mostrarResumenYTabla(ventas, perfumes)
    }
  }
})

// ----------------------
// INICIALIZACIÓN Y CRUD
// ----------------------

// (ACTUALIZADO) Llena los <select> usando la variable global 'perfumes'
function llenarSelectPerfumes() {
  const perfumesOrdenados = Object.keys(perfumes).sort()

  const populateSelect = (selectElement) => {
    selectElement.innerHTML = "" // Limpiar
    // Añadir opción por defecto al select de registro
    if (selectElement.id === "perfume") {
      const option = document.createElement("option")
      option.value = ""
      option.textContent = "Selecciona un perfume..."
      selectElement.appendChild(option)
    }

    perfumesOrdenados.forEach((perfume) => {
      const option = document.createElement("option")
      option.value = perfume
      option.textContent = perfume
      selectElement.appendChild(option)
    })
  }

  populateSelect(perfumeSelect)
  populateSelect(editPerfumeSelect)
}

// (ACTUALIZADO) Carga ventas y perfumes. Incluye migración de datos.
async function cargarDatosIniciales() {
  try {
    // 1. Cargar perfumes
    let perfumesCargados = await window.api.cargarPerfumes()

    // --- INICIO: MIGRACIÓN DE DATOS ÚNICA ---
    // Si el archivo está vacío, lo poblamos con los datos hardcodeados
    if (Object.keys(perfumesCargados).length === 0) {
      console.log("Archivo 'perfumes.json' vacío. Ejecutando migración de datos...")
      // Datos de respaldo por si acaso (los que teníamos antes)
      const PRECIOS_VENTA_MIGRACION = {
        "Haramain amber oud gold": { 3: 3490, 5: 4990, 10: 8490 }, "Hawas ice": { 3: 2990, 5: 4490, 10: 6990 }, "Mandarin Sky": { 3: 2990, 5: 4490, 10: 6990 }, "9 pm Rebel": { 3: 2990, 5: 4490, 10: 7990 }, "Azzaro The most wanted intense": { 3: 4990, 5: 8490, 10: 14990 }, "Aqcua di Gio profondo EDP": { 3: 3990, 5: 7990, 10: 13990 }, "Invictus Victory Elixir": { 3: 5490, 5: 8990, 10: 15490 }, "Stronger With You intensely": { 3: 5490, 5: 9490, 10: 15990 }, "Scandal Le parfum": { 3: 5490, 5: 9490, 10: 15990 }, "Jean Paul Gaultier le male elixir": { 3: 5490, 5: 8990, 10: 15490 }, "Jean Paul Gaultier le male le parfum": { 3: 5490, 5: 8990, 10: 15490 }, "Jean Paul Gaultier le beau le parfum": { 3: 5990, 5: 9490, 10: 16490 }, "Versace eros EDP": { 3: 4990, 5: 6490, 10: 10490 }, "Versace eros Flame": { 3: 4990, 5: 6490, 10: 10490 }, "Khamrah Qahwa": { 3: 2990, 5: 4490, 10: 6990 },
      }
      const COSTOS_BASE_MIGRACION = {
        "Haramain amber oud gold": { costo: 47990, volumen: 100 }, "Hawas ice": { costo: 25990, volumen: 100 }, "Mandarin Sky": { costo: 52990, volumen: 100 }, "9 pm Rebel": { costo: 32990, volumen: 100 }, "Azzaro The most wanted intense": { costo: 70990, volumen: 100 }, "Aqcua di Gio profondo EDP": { costo: 104990, volumen: 100 }, "Invictus Victory Elixir": { costo: 117000, volumen: 100 }, "Stronger With You intensely": { costo: 109990, volumen: 100 }, "Scandal Le parfum": { costo: 99990, volumen: 100 }, "Jean Paul Gaultier le male elixir": { costo: 109990, volumen: 100 }, "Jean Paul Gaultier le male le parfum": { costo: 93000, volumen: 100 }, "Jean Paul Gaultier le beau le parfum": { costo: 112990, volumen: 100 }, "Versace eros EDP": { costo: 96000, volumen: 100 }, "Versace eros Flame": { costo: 99000, volumen: 100 }, "Khamrah Qahwa": { costo: 38000, volumen: 100 },
      }

      const perfumesMigrados = {}
      Object.keys(PRECIOS_VENTA_MIGRACION).forEach(nombre => {
        const precios = PRECIOS_VENTA_MIGRACION[nombre]
        const costos = COSTOS_BASE_MIGRACION[nombre] || { costo: 0, volumen: 100 }
        
        perfumesMigrados[nombre] = {
          precio3ml: precios[3] || 0,
          precio5ml: precios[5] || 0,
          precio10ml: precios[10] || 0,
          costoFrasco: costos.costo || 0,
          volumenFrasco: costos.volumen || 100
        }
      })

      await window.api.guardarPerfumes(perfumesMigrados)
      perfumesCargados = perfumesMigrados
      console.log("Migración completada. Datos guardados en perfumes.json.")
    }
    // --- FIN: MIGRACIÓN DE DATOS ÚNICA ---

    perfumes = perfumesCargados // Asignar a la variable global

    // 2. Cargar ventas
    ventas = await window.api.cargarVentas()
    
    // 3. Poblar UI
    mostrarResumenYTabla(ventas, perfumes)
    llenarSelectPerfumes()
    poblarTablaPerfumes() // NUEVO: Poblar la tabla de CRUD
    
  } catch (error) {
    console.error("Error al cargar datos:", error)
    alert("Error al cargar datos de ventas o perfumes.")
  }
}

// CRUD: CREATE (Venta)
formVenta.addEventListener("submit", async (e) => {
  e.preventDefault()

  const nuevaVenta = {
    id: Date.now(),
    perfume: perfumeSelect.value,
    volumen: Number.parseInt(volumenSelect.value),
    precioVendido: Number.parseInt(precioVendidoInput.value),
    fecha: document.getElementById("fecha-venta").value,
  }

  if (!nuevaVenta.perfume) {
    alert("❌ Por favor, selecciona un perfume.")
    return
  }

  const resultado = await window.api.guardarVenta(nuevaVenta)
  if (resultado.success) {
    alert("✅ Venta registrada con éxito!")
    ventas.push(nuevaVenta)
    mostrarResumenYTabla(ventas, perfumes)
    formVenta.reset()
    document.getElementById("fecha-venta").valueAsDate = new Date()
  } else {
    alert("❌ Error al guardar: " + resultado.message)
  }
})

// CRUD: READ (Ventas y Resumen)
// (ACTUALIZADO) Usa 'perfumesData' para el cálculo de costos
function mostrarResumenYTabla(ventasData, perfumesData) {
  tablaVentasBody.innerHTML = ""
  tablaVentasResumenBody.innerHTML = ""

  const hoy = new Date()
  const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1).toISOString().substring(0, 10)

  let gananciaMes = 0
  let decantsMes = 0
  let costoMes = 0

  const ventasRecientes = ventasData.slice().reverse()

  ventasRecientes.forEach((venta) => {
    // Lógica de Resumen Mensual
    if (venta.fecha >= inicioMes) {
      gananciaMes += venta.precioVendido
      decantsMes++

      // Lógica de costo actualizada
      const perfumeData = perfumesData[venta.perfume]
      if (perfumeData && perfumeData.costoFrasco > 0 && perfumeData.volumenFrasco > 0) {
        const costoPorMl = perfumeData.costoFrasco / perfumeData.volumenFrasco
        const costoVenta = costoPorMl * venta.volumen
        costoMes += costoVenta
      }

      const rowResumen = tablaVentasResumenBody.insertRow(0)
      rowResumen.insertCell(0).textContent = venta.fecha
      rowResumen.insertCell(1).textContent = venta.perfume
      rowResumen.insertCell(2).textContent = venta.volumen + "ml"
      rowResumen.insertCell(3).textContent = `$${venta.precioVendido.toLocaleString("es-CL")}`
    }

    // Lógica de Tabla CRUD (todas las ventas)
    const rowCRUD = tablaVentasBody.insertRow()
    rowCRUD.insertCell(0).textContent = venta.fecha
    rowCRUD.insertCell(1).textContent = venta.perfume
    rowCRUD.insertCell(2).textContent = venta.volumen + "ml"
    rowCRUD.insertCell(3).textContent = `$${venta.precioVendido.toLocaleString("es-CL")}`

    const cellAcciones = rowCRUD.insertCell(4)
    cellAcciones.innerHTML = `
            <div class="action-buttons">
                <button class="btn-editar" onclick="abrirModalEdicion(${JSON.stringify(venta).replace(/"/g, "&quot;")})">✏️ Editar</button>
                <button class="btn-eliminar" onclick="eliminarVenta(${venta.id})">🗑️ Eliminar</button>
            </div>
        `
  })

  const gananciaNeta = gananciaMes - costoMes

  gananciaMesEl.textContent = `$${gananciaMes.toLocaleString("es-CL")}`
  decantsMesEl.textContent = decantsMes
  costoMesEl.textContent = `$${Math.round(costoMes).toLocaleString("es-CL")}`
  gananciaNetaMesEl.textContent = `$${Math.round(gananciaNeta).toLocaleString("es-CL")}`

  if (ventasRecientes.length === 0) {
    tablaVentasBody.innerHTML =
      '<tr><td colspan="5" style="text-align: center; padding: 48px; color: var(--color-text-muted);">📭 No hay ventas registradas aún</td></tr>'
  }

  if (decantsMes === 0) {
    tablaVentasResumenBody.innerHTML =
      '<tr><td colspan="4" style="text-align: center; padding: 48px; color: var(--color-text-muted);">📭 No hay ventas este mes</td></tr>'
  }
}

// CRUD: DELETE (Venta)
async function eliminarVenta(id) {
  if (!confirm("⚠️ ¿Estás seguro de que quieres eliminar esta venta? Esta acción no se puede deshacer.")) return

  const resultado = await window.api.eliminarVenta(id)

  if (resultado.success) {
    alert("✅ Venta eliminada con éxito.")
    ventas = ventas.filter((v) => v.id !== id)
    mostrarResumenYTabla(ventas, perfumes)
  } else {
    alert("❌ Error al eliminar la venta: " + resultado.message)
  }
}

// CRUD: UPDATE (Modal Logic)
function abrirModalEdicion(venta) {
  document.getElementById("edit-id").value = venta.id
  editPerfumeSelect.value = venta.perfume
  editVolumenSelect.value = venta.volumen
  editPrecioVendidoInput.value = venta.precioVendido
  document.getElementById("edit-fecha-venta").value = venta.fecha
  modalEdicion.style.display = "block"
}

closeBtnModal.onclick = () => {
  modalEdicion.style.display = "none"
}

window.onclick = (event) => {
  if (event.target == modalEdicion) {
    modalEdicion.style.display = "none"
  }
}

formEdicion.addEventListener("submit", async (e) => {
  e.preventDefault()

  const ventaEditada = {
    id: Number.parseInt(document.getElementById("edit-id").value),
    perfume: editPerfumeSelect.value,
    volumen: Number.parseInt(editVolumenSelect.value),
    precioVendido: Number.parseInt(editPrecioVendidoInput.value),
    fecha: document.getElementById("edit-fecha-venta").value,
  }

  const resultado = await window.api.actualizarVenta(ventaEditada)

  if (resultado.success) {
    alert("✅ Venta actualizada con éxito.")
    const index = ventas.findIndex((v) => v.id === ventaEditada.id)
    if (index !== -1) {
      ventas[index] = ventaEditada
    }
    mostrarResumenYTabla(ventas, perfumes)
    modalEdicion.style.display = "none"
  } else {
    alert("❌ Error al actualizar la venta: " + resultado.message)
  }
})

// -------------------------------------------
// NUEVO: LÓGICA COMPLETA DE CRUD DE PERFUMES
// -------------------------------------------

// Rellena la tabla en la pestaña de Configuración
function poblarTablaPerfumes() {
  tablaPerfumesBody.innerHTML = ""

  if (Object.keys(perfumes).length === 0) {
    tablaPerfumesBody.innerHTML =
      '<tr><td colspan="4" style="text-align: center; padding: 48px; color: var(--color-text-muted);">📭 No hay perfumes configurados. ¡Añade uno!</td></tr>'
    return
  }

  Object.keys(perfumes).sort().forEach(nombre => {
    const data = perfumes[nombre]
    const costoPorMl = (data.costoFrasco / data.volumenFrasco).toFixed(0)
    
    const row = tablaPerfumesBody.insertRow()
    row.insertCell(0).textContent = nombre
    row.insertCell(1).textContent = `$${data.precio3ml} / $${data.precio5ml} / $${data.precio10ml}`
    row.insertCell(2).textContent = `$${costoPorMl} / ml`
    
    const cellAcciones = row.insertCell(3)
    cellAcciones.innerHTML = `
            <div class="action-buttons">
                <button class="btn-editar" onclick="modoEditarPerfume('${nombre.replace(/'/g, "\\'")}')">✏️ Editar</button>
                <button class="btn-eliminar" onclick="eliminarPerfume('${nombre.replace(/'/g, "\\'")}')">🗑️ Eliminar</button>
            </div>
        `
  })
}

// Prepara el formulario para editar un perfume existente
function modoEditarPerfume(nombre) {
  const data = perfumes[nombre]
  if (!data) return

  crudFormTitulo.textContent = "✏️ Editando Perfume"
  crudSubmitBtn.textContent = "💾 Guardar Cambios"
  crudCancelarBtn.style.display = "block"

  crudOriginalNombreInput.value = nombre
  crudNombreInput.value = nombre
  crudPrecio3mlInput.value = data.precio3ml
  crudPrecio5mlInput.value = data.precio5ml
  crudPrecio10mlInput.value = data.precio10ml
  crudCostoFrascoInput.value = data.costoFrasco
  crudVolumenFrascoInput.value = data.volumenFrasco

  // Scroll al formulario
  crudFormTitulo.scrollIntoView({ behavior: "smooth" })
}

// Resetea el formulario de CRUD a su estado original (Añadir)
function resetFormularioCrud() {
  crudFormTitulo.textContent = "Añadir Nuevo Perfume"
  crudSubmitBtn.textContent = "💾 Guardar Perfume"
  crudCancelarBtn.style.display = "none"
  formPerfumeCrud.reset()
  crudOriginalNombreInput.value = ""
}

// Listener para el botón de cancelar edición
crudCancelarBtn.addEventListener("click", resetFormularioCrud)

// Listener para el formulario de CRUD (Crear y Actualizar)
formPerfumeCrud.addEventListener("submit", async (e) => {
  e.preventDefault()

  const originalNombre = crudOriginalNombreInput.value
  const nombre = crudNombreInput.value.trim()

  if (!nombre) {
    alert("❌ El nombre del perfume no puede estar vacío.")
    return
  }

  // Si el nombre es nuevo y ya existe (y no es una edición del mismo)
  if (originalNombre !== nombre && perfumes[nombre]) {
    alert("❌ Ya existe un perfume con ese nombre. Por favor, elige otro.")
    return
  }

  const perfumeData = {
    precio3ml: Number.parseInt(crudPrecio3mlInput.value),
    precio5ml: Number.parseInt(crudPrecio5mlInput.value),
    precio10ml: Number.parseInt(crudPrecio10mlInput.value),
    costoFrasco: Number.parseInt(crudCostoFrascoInput.value),
    volumenFrasco: Number.parseInt(crudVolumenFrascoInput.value),
  }

  // Si es una edición y el nombre cambió, eliminamos la clave antigua
  if (originalNombre && originalNombre !== nombre) {
    delete perfumes[originalNombre]
  }

  // Añadimos/actualizamos el perfume
  perfumes[nombre] = perfumeData

  // Guardar el objeto de perfumes COMPLETO
  const resultado = await window.api.guardarPerfumes(perfumes)

  if (resultado.success) {
    alert(`✅ Perfume "${nombre}" guardado con éxito.`)
    resetFormularioCrud()
    poblarTablaPerfumes()
    llenarSelectPerfumes() // Actualizar todos los <select> en la app
  } else {
    alert("❌ Error al guardar el perfume: " + resultado.message)
    // Revertir el cambio local si falla el guardado
    delete perfumes[nombre]
    if (originalNombre) {
      // Si era una edición, restaurar los datos
      modoEditarPerfume(originalNombre) 
    }
  }
})

// Elimina un perfume (llamado desde el botón en la tabla)
async function eliminarPerfume(nombre) {
  if (!confirm(`⚠️ ¿Estás seguro de que quieres eliminar "${nombre}"? Esta acción no se puede deshacer.`)) return

  const dataBackup = perfumes[nombre] // Backup por si falla
  delete perfumes[nombre]

  const resultado = await window.api.guardarPerfumes(perfumes)

  if (resultado.success) {
    alert(`✅ Perfume "${nombre}" eliminado con éxito.`)
    poblarTablaPerfumes()
    llenarSelectPerfumes()
  } else {
    alert("❌ Error al eliminar el perfume: " + resultado.message)
    perfumes[nombre] = dataBackup // Restaurar desde el backup
  }
}

// ----------------------
// LÓGICA DE PRECIOS AUTOMÁTICOS (ACTUALIZADO)
// ----------------------

// (ACTUALIZADO) Usa la variable global 'perfumes'
function actualizarPrecio(perfumeElem, volumenElem, precioElem) {
  const perfume = perfumeElem.value
  const volumen = Number.parseInt(volumenElem.value)
  
  if (perfume && volumen && perfumes[perfume]) {
    let precioSugerido = 0
    if (volumen === 3) precioSugerido = perfumes[perfume].precio3ml
    else if (volumen === 5) precioSugerido = perfumes[perfume].precio5ml
    else if (volumen === 10) precioSugerido = perfumes[perfume].precio10ml
    
    if (precioSugerido > 0) {
      precioElem.value = precioSugerido
    }
  }
}

// Listeners para el formulario de NUEVA VENTA
perfumeSelect.addEventListener("change", () => {
  actualizarPrecio(perfumeSelect, volumenSelect, precioVendidoInput)
})
volumenSelect.addEventListener("change", () => {
  actualizarPrecio(perfumeSelect, volumenSelect, precioVendidoInput)
})

// Listeners para el formulario de EDICIÓN VENTA
editPerfumeSelect.addEventListener("change", () => {
  actualizarPrecio(editPerfumeSelect, editVolumenSelect, editPrecioVendidoInput)
})
editVolumenSelect.addEventListener("change", () => {
  actualizarPrecio(editPerfumeSelect, editVolumenSelect, editPrecioVendidoInput)
})

// ----------------------
// LÓGICA DE CONTROL DE VENTANA
// ----------------------

document.getElementById("close-btn").addEventListener("click", () => {
  window.api.closeApp()
})

document.getElementById("minimize-btn").addEventListener("click", () => {
  window.api.minimizeApp()
})

document.getElementById("maximize-btn").addEventListener("click", () => {
  window.api.maximizeApp()
})

// ----------------------
// INICIALIZACIÓN
// ----------------------
cargarDatosIniciales()

// Exponer funciones globales para los botones inline
window.abrirModalEdicion = abrirModalEdicion
window.eliminarVenta = eliminarVenta
window.modoEditarPerfume = modoEditarPerfume
window.eliminarPerfume = eliminarPerfume