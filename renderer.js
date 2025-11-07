// --- REFERENCIAS DOM (PESTAÑA REGISTRO/CRUD) ---
// ... (código existente sin cambios)
const formVenta = document.getElementById("form-venta")
const tablaVentasBody = document.querySelector("#tabla-ventas tbody")
// ... (el resto de las referencias DOM)
const clienteInput = document.getElementById("cliente")
const metodoPagoSelect = document.getElementById("metodo-pago")
const btnSeleccionarAdjunto = document.getElementById("btn-seleccionar-adjunto")
const nombreAdjuntoEl = document.getElementById("nombre-adjunto")
const perfumesContainer = document.getElementById("perfumes-container")
const btnAnadirPerfumeGrupo = document.getElementById("btn-anadir-perfume-grupo")
const gananciaMesEl = document.getElementById("ganancia-mes")
const decantsMesEl = document.getElementById("decants-mes")
const tablaVentasResumenBody = document.querySelector("#tabla-ventas-resumen tbody")
const costoMesEl = document.getElementById("costo-mes")
const gananciaNetaMesEl = document.getElementById("ganancia-neta-mes")
const resumenTituloEl = document.getElementById("resumen-titulo");
const filtroMesInput = document.getElementById("filtro-mes");
const btnVerTotal = document.getElementById("btn-ver-total");
const btnExportarExcel = document.getElementById("btn-exportar-excel");
const tablaRentabilidadBody = document.getElementById("tabla-rentabilidad-body");
const modalEdicion = document.getElementById("modal-edicion")
const formEdicion = document.getElementById("form-edicion")
const closeBtnModal = document.querySelector(".close-btn")
const editPerfumeSelect = document.getElementById("edit-perfume")
const editLoteSelect = document.getElementById("edit-lote")
const editVolumenSelect = document.getElementById("edit-volumen")
const editPrecioVendidoInput = document.getElementById("edit-precio-vendido")
const editClienteInput = document.getElementById("edit-cliente")
const editMetodoPagoSelect = document.getElementById("edit-metodo-pago")
const btnSeleccionarAdjuntoEdit = document.getElementById("btn-seleccionar-adjunto-edit")
const editNombreAdjuntoEl = document.getElementById("edit-nombre-adjunto")

// --- NUEVO: Referencias Pestaña Pedidos ---
const tablaPedidosBody = document.querySelector("#tabla-pedidos-body");
const modalDetalle = document.getElementById("modal-detalle-pedido");
const modalDetalleBody = document.getElementById("modal-detalle-body");
const modalDetalleClose = document.querySelector("#modal-detalle-pedido .close-btn");


// --- CAMBIO: Selectores de Navegación (antes Tabs) ---
const navMenu = document.getElementById("nav-menu") // CAMBIADO
const navButtons = document.querySelectorAll(".nav-button") // CAMBIADO
const tabContents = document.querySelectorAll(".tab-content")

// Referencias DOM (Configuración CRUD Perfumes)
// ... (código existente sin cambios)
const formPerfumeCrud = document.getElementById("form-perfume-crud")
const crudFormTitulo = document.getElementById("crud-form-titulo")
// ... (el resto de las referencias de config)
const crudSubmitBtn = document.getElementById("crud-submit-btn")
const crudCancelarBtn = document.getElementById("crud-cancelar-btn")
const crudOriginalNombreInput = document.getElementById("crud-original-nombre")
const crudNombreInput = document.getElementById("crud-nombre")
const crudPrecio3mlInput = document.getElementById("crud-precio-3ml")
const crudPrecio5mlInput = document.getElementById("crud-precio-5ml")
const crudPrecio10mlInput = document.getElementById("crud-precio-10ml")
const tablaPerfumesBody = document.getElementById("tabla-perfumes-body")
const formLoteCrud = document.getElementById("form-lote-crud");
const loteFormTitulo = document.getElementById("lote-form-titulo");
const lotePerfumeSelect = document.getElementById("lote-perfume-select");
const loteFechaInput = document.getElementById("lote-fecha");
const loteCostoFrascoInput = document.getElementById("lote-costo-frasco");
const loteVolumenFrascoInput = document.getElementById("lote-volumen-frasco");
const tablaLotesBody = document.getElementById("tabla-lotes-body");
const loteEditIdInput = document.getElementById("lote-edit-id");
const loteCancelarBtn = document.getElementById("lote-cancelar-btn");
const loteSubmitBtn = document.getElementById("lote-submit-btn");


// --- Variables Globales ---
// ... (código existente sin cambios)
let ventas = []
let perfumes = {}
let adjuntoTemporalPath = null
let editAdjuntoTemporalPath = null


// ----------------------
// LÓGICA DE NAVEGACIÓN (Antes Tabs)
// ----------------------

navMenu.addEventListener("click", (e) => { // CAMBIADO de tabMenu a navMenu
  const navBtn = e.target.closest('.nav-button'); // CAMBIADO: Buscar el botón padre
  if (!navBtn) return; // Si no se hizo clic en un botón, salir

  const targetTab = navBtn.dataset.tab; // CAMBIADO: Obtener dataset del botón

  navButtons.forEach((btn) => btn.classList.remove("active")); // CAMBIADO de tabButtons a navButtons
  tabContents.forEach((content) => content.classList.remove("active"));

  navBtn.classList.add("active"); // CAMBIADO: Activar el botón clickeado
  document.getElementById(targetTab).classList.add("active");

  if (targetTab === "tab-resumen") {
      const filtroActual = resumenTituloEl.textContent.includes("Total") ? "total" : filtroMesInput.value
      mostrarResumenYTabla(ventas, perfumes, filtroActual)
  } else if (targetTab === "tab-rentabilidad") {
      actualizarPestañaRentabilidad();
  } else if (targetTab === "tab-pedidos") { // --- MODIFICADO ---
      actualizarPestañaPedidos(); // --- MODIFICADO ---
  }
})

// ----------------------------------------------------
// INICIALIZACIÓN Y LÓGICA DE REGISTRO DE VENTA (NUEVO)
// ----------------------------------------------------
// ... (código existente sin cambios)
function populateSelect(selectElement, placeholder) {
// ... (código existente sin cambios)
  const perfumesOrdenados = Object.keys(perfumes).sort()
  selectElement.innerHTML = ""
  if (placeholder) {
    const option = document.createElement("option")
    option.value = ""
    option.textContent = placeholder
    selectElement.appendChild(option)
  }
  perfumesOrdenados.forEach((perfume) => {
    const option = document.createElement("option")
    option.value = perfume
    option.textContent = perfume
    selectElement.appendChild(option)
  })
}
function llenarSelectPerfumes() {
// ... (código existente sin cambios)
  populateSelect(editPerfumeSelect)
  populateSelect(lotePerfumeSelect, "Selecciona un perfume...")
}
function actualizarSelectLote(perfumeNombre, selectLoteElement) {
// ... (código existente sin cambios)
    selectLoteElement.innerHTML = "";
    if (!perfumeNombre || !perfumes[perfumeNombre] || !perfumes[perfumeNombre].lotes || perfumes[perfumeNombre].lotes.length === 0) {
        selectLoteElement.innerHTML = '<option value="">Crea un lote en Configuración</option>';
        return;
    }
    const lotes = perfumes[perfumeNombre].lotes;
    lotes.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
    lotes.forEach(lote => {
        const costoMl = (lote.costo > 0 && lote.volumen > 0) ? (lote.costo / lote.volumen).toFixed(0) : "0";
        const option = document.createElement("option");
        option.value = lote.id;
        option.textContent = `Lote ${lote.fecha} ($${costoMl}/ml)`;
        selectLoteElement.appendChild(option);
    });
}
function crearYAnadirGrupoPerfume() {
// ... (código existente sin cambios)
    const groupId = Date.now();
    const groupEl = document.createElement('div');
    groupEl.className = 'perfume-form-group';
    groupEl.dataset.id = groupId;
    groupEl.innerHTML = `
        <button type="button" class="btn-remover-grupo">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M18 6L6 18"></path>
                <path d="M6 6l12 12"></path>
            </svg>
        </button>
        
        <label for="perfume-${groupId}">Perfume</label>
        <select id="perfume-${groupId}" class="select-perfume" required>
            </select>
        
        <label for="lote-${groupId}">Lote / Frasco (Inventario)</label>
        <select id="lote-${groupId}" class="select-lote" required>
            <option value="">Selecciona un perfume primero...</option>
        </select>
        
        <div class="form-grid">
            <div>
                <label for="volumen-${groupId}">Volumen (ml)</label>
                <select id="volumen-${groupId}" class="select-volumen" required>
                    <option value="3">3ml</option>
                    <option value="5">5ml</option>
                    <option value="10">10ml</option>
                </select>
            </div>
            <div>
                <label for="precio-${groupId}">Precio Vendido ($)</label>
                <input type="number" id="precio-${groupId}" class="input-precio" min="0" required placeholder="Ej: 4990">
            </div>
        </div>
    `;
    perfumesContainer.appendChild(groupEl);
    const newPerfumeSelect = document.getElementById(`perfume-${groupId}`);
    const newLoteSelect = document.getElementById(`lote-${groupId}`);
    const newVolumenSelect = document.getElementById(`volumen-${groupId}`);
    const newPrecioInput = document.getElementById(`precio-${groupId}`);
    populateSelect(newPerfumeSelect, "Selecciona un perfume...");
    newPerfumeSelect.addEventListener("change", () => {
      actualizarPrecio(newPerfumeSelect, newVolumenSelect, newPrecioInput)
      actualizarSelectLote(newPerfumeSelect.value, newLoteSelect);
    });
    newVolumenSelect.addEventListener("change", () => {
      actualizarPrecio(newPerfumeSelect, newVolumenSelect, newPrecioInput)
    });
}
btnAnadirPerfumeGrupo.addEventListener("click", crearYAnadirGrupoPerfume);
perfumesContainer.addEventListener("click", (e) => {
    // Buscar el botón más cercano, ya sea que se haga clic en el SVG o en el botón mismo
    const removeButton = e.target.closest('.btn-remover-grupo');
    if (removeButton) {
        removeButton.closest('.perfume-form-group').remove();
    }
});
async function cargarDatosIniciales() {
// ... (código existente sin cambios)
  try {
    let perfumesCargados = await window.api.cargarPerfumes()
    let ventasCargadas = await window.api.cargarVentas()
    const primerPerfumeKey = Object.keys(perfumesCargados)[0];
    if (primerPerfumeKey && perfumesCargados[primerPerfumeKey].costoFrasco !== undefined) {
      alert("Detectando estructura de datos antigua... Realizando migración una única vez.");
      console.log("Iniciando migración de datos...");
      const perfumesMigrados = {};
      const loteIdMap = {};
      Object.keys(perfumesCargados).forEach((nombre, index) => {
          const old = perfumesCargados[nombre];
          const newId = `lote_${Date.now() + index}`; 
          perfumesMigrados[nombre] = {
              precios: {
                  "3ml": old.precio3ml || 0,
                  "5ml": old.precio5ml || 0,
                  "10ml": old.precio10ml || 0
              },
              lotes: [
                  {
                      id: newId,
                      costo: old.costoFrasco || 0,
                      volumen: old.volumenFrasco || 100,
                      fecha: new Date().toISOString().substring(0, 10)
                  }
              ]
          };
          loteIdMap[nombre] = newId;
      });
      const ventasMigradas = ventasCargadas.map(venta => {
          if (!venta.loteId && loteIdMap[venta.perfume]) {
              venta.loteId = loteIdMap[venta.perfume];
          }
          return venta;
      });
      await window.api.guardarPerfumes(perfumesMigrados);
      console.warn("Migración de perfumes completada. La migración de ventas fue omitida porque 'guardarVentas' (plural) no está definida en preload.js.");
      console.log("Migración completada.");
      perfumes = perfumesMigrados;
      ventas = ventasMigradas;
    } else {
      perfumes = perfumesCargados;
      ventas = ventasCargadas;
    }
    const mesActual = new Date().toISOString().substring(0, 7)
    filtroMesInput.value = mesActual
    document.getElementById("fecha-venta").valueAsDate = new Date()
    llenarSelectPerfumes()
    poblarTablaPerfumes()
    poblarTablaLotes()
    mostrarResumenYTabla(ventas, perfumes, mesActual)
    mostrarTablaCRUD(ventas)
    actualizarPestañaRentabilidad()
    actualizarPestañaPedidos(); // --- NUEVA LÍNEA ---
    crearYAnadirGrupoPerfume();
  } catch (error) {
    console.error("Error al cargar datos:", error)
    alert("Error al cargar datos de ventas o perfumes.")
  }
}
formVenta.addEventListener("submit", async (e) => {
// ... (código existente sin cambios)
  e.preventDefault()
  const ventasAGuardar = [];
  const grupos = perfumesContainer.querySelectorAll('.perfume-form-group');
  const fecha = document.getElementById("fecha-venta").value;
  const cliente = clienteInput.value || 'N/A';
  const metodoPago = metodoPagoSelect.value;
  const adjunto = adjuntoTemporalPath;
  
  // --- NUEVO: ID de Grupo de Venta ---
  const saleGroupId = `sale_${Date.now()}`;

  let isValid = true;
  let errorMsg = "";
  if (grupos.length === 0) {
      isValid = false;
      errorMsg = "❌ Debes añadir al menos un perfume a la venta.";
  }
  if (!fecha) {
      isValid = false;
      errorMsg = "❌ Por favor, selecciona una fecha de venta.";
  }
  for (const groupEl of grupos) {
      if (!isValid) break;
      const perfume = groupEl.querySelector('.select-perfume').value;
      const loteId = groupEl.querySelector('.select-lote').value;
      const volumen = groupEl.querySelector('.select-volumen').value;
      const precio = groupEl.querySelector('.input-precio').value;
      if (!perfume || !loteId || !precio || Number(precio) <= 0) {
          isValid = false;
          errorMsg = `❌ Revisa los datos del perfume "${perfume || '??'}". Todos los campos son obligatorios.`;
          break;
      }
      ventasAGuardar.push({
          saleGroupId: saleGroupId, // --- NUEVA LÍNEA ---
          perfume: perfume,
          loteId: loteId,
          volumen: Number.parseInt(volumen),
          precioVendido: Number.parseInt(precio),
          adjuntoTemporalPath: adjunto,
          adjuntoPath: null,
          fecha: fecha,
          cliente: cliente,
          metodoPago: metodoPago,
      });
  }
  if (!isValid) {
      alert(errorMsg);
      return;
  }
  const resultado = await window.api.guardarMultiplesVentas(ventasAGuardar);
  if (resultado.success) {
    alert(`✅ ¡${resultado.message}`);
    ventas = await window.api.cargarVentas()
    mostrarTablaCRUD(ventas)
    const filtroActual = resumenTituloEl.textContent.includes("Total") ? "total" : filtroMesInput.value
    mostrarResumenYTabla(ventas, perfumes, filtroActual)
    actualizarPestañaRentabilidad()
    actualizarPestañaPedidos(); // --- NUEVA LÍNEA ---
    formVenta.reset()
    document.getElementById("fecha-venta").valueAsDate = new Date()
    adjuntoTemporalPath = null;
    nombreAdjuntoEl.textContent = "No se ha seleccionado un archivo.";
    perfumesContainer.innerHTML = '';
    crearYAnadirGrupoPerfume();
  } else {
    alert("❌ Error al guardar las ventas: " + resultado.message)
  }
})

// -------------------------------------------
// OTRAS FUNCIONES (Sin cambios de tu solicitud)
// -------------------------------------------
// ... (código existente sin cambios)
function mostrarTablaCRUD(ventasData) {
// ... (código existente sin cambios)
  tablaVentasBody.innerHTML = "";
  const ventasRecientes = ventasData.slice().reverse();
  ventasRecientes.forEach((venta) => {
    const rowCRUD = tablaVentasBody.insertRow();
    rowCRUD.insertCell(0).textContent = venta.fecha;
    rowCRUD.insertCell(1).textContent = venta.perfume;
    rowCRUD.insertCell(2).textContent = venta.volumen + "ml";
    rowCRUD.insertCell(3).textContent = `$${venta.precioVendido.toLocaleString("es-CL")}`;
    rowCRUD.insertCell(4).textContent = venta.cliente || 'N/A';
    rowCRUD.insertCell(5).textContent = venta.metodoPago || 'N/A';
    let adjuntoBtn = '';
    // --- MODIFICACIÓN: Comprobar si el adjunto es de esta venta o del grupo ---
    // (No es necesario, el adjunto se guarda en cada item)
    if (venta.adjuntoPath) {
      const safePath = venta.adjuntoPath.replace(/\\/g, '\\\\');
      adjuntoBtn = `<button class="btn-ver" onclick="abrirArchivo('${safePath}')">📄 Ver</button>`;
    }
    const cellAcciones = rowCRUD.insertCell(6);
    cellAcciones.innerHTML = `
      <div class="action-buttons">
          <button class="btn-editar" onclick="abrirModalEdicion(${JSON.stringify(venta).replace(/"/g, "&quot;")})">Editar</button>
          <button class="btn-eliminar" onclick="eliminarVenta(${venta.id})">Eliminar</button>
          ${adjuntoBtn}
      </div>
    `;
  });
  if (ventasRecientes.length === 0) {
    tablaVentasBody.innerHTML =
      '<tr><td colspan="7" style="text-align: center; padding: 48px; color: var(--color-text-muted);">📭 No hay ventas registradas aún</td></tr>';
  }
}
function mostrarResumenYTabla(ventasData, perfumesData, filtro) {
// ... (código existente sin cambios)
  tablaVentasResumenBody.innerHTML = "";
  let ganancia = 0;
  let decants = 0;
  let costo = 0;
  let ventasFiltradas = [];
  const ventasRecientes = ventasData.slice().reverse();
  if (filtro === "total") {
    ventasFiltradas = ventasRecientes;
    resumenTituloEl.textContent = "Resumen Financiero (Total Histórico)";
  } else {
    ventasFiltradas = ventasRecientes.filter(v => v.fecha.substring(0, 7) === filtro);
    resumenTituloEl.textContent = `Resumen Financiero (Mes: ${filtro})`;
  }
  ventasFiltradas.forEach((venta) => {
    ganancia += venta.precioVendido;
    decants++;
    let costoVenta = 0;
    const perfume = perfumesData[venta.perfume];
    if (perfume) {
        const lotes = perfume.lotes || [];
        const lote = lotes.find(l => l.id === venta.loteId);
        const loteUsado = lote || (lotes.length > 0 ? lotes[0] : null); 
        if (loteUsado && loteUsado.costo > 0 && loteUsado.volumen > 0) {
            const costoPorMl = loteUsado.costo / loteUsado.volumen;
            costoVenta = costoPorMl * venta.volumen;
        }
    }
    costo += costoVenta;
    const rowResumen = tablaVentasResumenBody.insertRow(0);
    rowResumen.insertCell(0).textContent = venta.fecha;
    rowResumen.insertCell(1).textContent = venta.perfume;
    rowResumen.insertCell(2).textContent = venta.volumen + "ml";
    rowResumen.insertCell(3).textContent = `$${venta.precioVendido.toLocaleString("es-CL")}`;
  });
  const gananciaNeta = ganancia - costo;
  gananciaMesEl.textContent = `$${ganancia.toLocaleString("es-CL")}`;
  decantsMesEl.textContent = decants;
  costoMesEl.textContent = `$${Math.round(costo).toLocaleString("es-CL")}`;
  gananciaNetaMesEl.textContent = `$${Math.round(gananciaNeta).toLocaleString("es-CL")}`;
  if (decants === 0) {
    tablaVentasResumenBody.innerHTML =
      `<tr><td colspan="4" style="text-align: center; padding: 48px; color: var(--color-text-muted);">📭 No hay ventas para este periodo</td></tr>`;
  }
}
async function eliminarVenta(id) {
// ... (código existente sin cambios)
  if (!confirm("⚠️ ¿Estás seguro de que quieres eliminar este ítem de venta? Esta acción no se puede deshacer.")) return
  const resultado = await window.api.eliminarVenta(id)
  if (resultado.success) {
    alert("✅ Ítem de venta eliminado con éxito.")
    ventas = ventas.filter((v) => v.id !== id)
    mostrarTablaCRUD(ventas);
    const filtroActual = resumenTituloEl.textContent.includes("Total") ? "total" : filtroMesInput.value
    mostrarResumenYTabla(ventas, perfumes, filtroActual)
    actualizarPestañaRentabilidad()
    actualizarPestañaPedidos(); // --- NUEVA LÍNEA ---
  } else {
    alert("❌ Error al eliminar el ítem: " + resultado.message)
  }
}
function abrirModalEdicion(venta) {
  document.getElementById("edit-id").value = venta.id
  editClienteInput.value = venta.cliente || ''
  editMetodoPagoSelect.value = venta.metodoPago || 'Efectivo'
  populateSelect(editPerfumeSelect);
  editPerfumeSelect.value = venta.perfume
  editVolumenSelect.value = venta.volumen
  editPrecioVendidoInput.value = venta.precioVendido
  document.getElementById("edit-fecha-venta").value = venta.fecha
  editAdjuntoTemporalPath = null
  actualizarSelectLote(venta.perfume, editLoteSelect);
  editLoteSelect.value = venta.loteId;
  if (venta.adjuntoPath) {
    editNombreAdjuntoEl.textContent = `Actual: ${venta.adjuntoPath.split(/[\\/]/).pop()}`
  } else {
    editNombreAdjuntoEl.textContent = "No hay archivo adjunto."
  }
  
  // --- NUEVO: Deshabilitar campos de grupo ---
  // La edición desde la tabla principal solo edita el ÍTEM, no el pedido completo.
  editClienteInput.disabled = true;
  editMetodoPagoSelect.disabled = true;
  // editFechaInput.disabled = true; // edit-fecha-venta
  document.getElementById("edit-fecha-venta").disabled = true;
  
  modalEdicion.classList.add("active")
}

closeBtnModal.onclick = () => {
  modalEdicion.classList.remove("active")
}
// --- MODIFICADO: Cierre de ambos modales ---
window.onclick = (event) => {
  if (event.target == modalEdicion) {
    modalEdicion.classList.remove("active")
  }
  if (event.target == modalDetalle) { // --- NUEVA LÍNEA ---
    modalDetalle.classList.remove("active") // --- NUEVA LÍNEA ---
  }
}

// --- NUEVO: Cierre del modal de detalle ---
modalDetalleClose.onclick = () => {
  modalDetalle.classList.remove("active")
}

formEdicion.addEventListener("submit", async (e) => {
// ... (código existente sin cambios)
  e.preventDefault()
  
  const ventaId = Number.parseInt(document.getElementById("edit-id").value);
  const ventaOriginal = ventas.find(v => v.id === ventaId);
  
  const ventaEditada = {
    id: ventaId,
    // --- MODIFICADO: Usar los valores originales del grupo ---
    cliente: ventaOriginal.cliente,
    metodoPago: ventaOriginal.metodoPago,
    fecha: ventaOriginal.fecha,
    saleGroupId: ventaOriginal.saleGroupId, // Mantener el group ID
    
    // --- Campos que sí se editan ---
    perfume: editPerfumeSelect.value,
    loteId: editLoteSelect.value,
    volumen: Number.parseInt(editVolumenSelect.value),
    precioVendido: Number.parseInt(editPrecioVendidoInput.value),
    
    adjuntoTemporalPath: editAdjuntoTemporalPath,
  }
  
  // Si se adjuntó un nuevo archivo, usamos ese. Si no, mantenemos el original.
  if (!editAdjuntoTemporalPath) {
      ventaEditada.adjuntoPath = ventaOriginal.adjuntoPath;
  }
  
  const resultado = await window.api.actualizarVenta(ventaEditada)
  if (resultado.success) {
    alert("✅ Ítem de venta actualizado con éxito.")
    ventas = await window.api.cargarVentas()
    mostrarTablaCRUD(ventas);
    const filtroActual = resumenTituloEl.textContent.includes("Total") ? "total" : filtroMesInput.value
    mostrarResumenYTabla(ventas, perfumes, filtroActual)
    actualizarPestañaRentabilidad()
    actualizarPestañaPedidos(); // --- NUEVA LÍNEA ---
    modalEdicion.classList.remove("active")
  } else {
    alert("❌ Error al actualizar el ítem: " + resultado.message)
  }
})

// --- NUEVAS FUNCIONES PARA PESTAÑA PEDIDOS ---

// Agrupa las ventas por 'saleGroupId'.
// Las ventas antiguas sin ID de grupo se tratarán como un pedido de un solo ítem.
function agruparPedidos(ventasData) {
    const pedidosMap = {};
    
    ventasData.forEach(venta => {
        // --- ★★★ ESTA ES LA LÍNEA MODIFICADA ★★★ ---
        // Los datos nuevos se agrupan por saleGroupId.
        // Los datos antiguos (sin saleGroupId) se agrupan por una combinación
        // de fecha, cliente y adjunto. Esto asume que todos los ítems
        // de un pedido antiguo se registraron con estos 3 datos idénticos.
        const groupId = venta.saleGroupId || `legacy_${venta.fecha}_${(venta.cliente || 'N/A')}_${(venta.adjuntoPath || 'null')}`;
        // --- ★★★ FIN DE LA MODIFICACIÓN ★★★ ---
        
        if (!pedidosMap[groupId]) {
            pedidosMap[groupId] = {
                groupId: groupId,
                cliente: venta.cliente,
                fecha: venta.fecha,
                metodoPago: venta.metodoPago,
                adjuntoPath: venta.adjuntoPath, // Tomar el adjunto (será el mismo para todos)
                items: [],
                totalVenta: 0
            };
        }
        
        pedidosMap[groupId].items.push(venta);
        pedidosMap[groupId].totalVenta += venta.precioVendido;
    });
    
    // Convertir el mapa a un array y ordenar por fecha (más reciente primero)
    return Object.values(pedidosMap).sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
}

function actualizarPestañaPedidos() {
    tablaPedidosBody.innerHTML = "";
    const pedidosAgrupados = agruparPedidos(ventas);

    if (pedidosAgrupados.length === 0) {
        tablaPedidosBody.innerHTML =
          '<tr><td colspan="5" style="text-align: center; padding: 48px; color: var(--color-text-muted);">📭 No hay pedidos registrados aún</td></tr>';
        return;
    }

    pedidosAgrupados.forEach(pedido => {
        const row = tablaPedidosBody.insertRow();
        row.insertCell(0).textContent = pedido.fecha;
        row.insertCell(1).textContent = pedido.cliente || 'N/A';
        row.insertCell(2).textContent = pedido.items.length;
        row.insertCell(3).textContent = `$${pedido.totalVenta.toLocaleString("es-CL")}`;
        
        // Convertir el groupId a un string seguro para HTML
        const safeGroupId = JSON.stringify(pedido.groupId).replace(/"/g, "&quot;");
        
        const cellAcciones = row.insertCell(4);
        cellAcciones.innerHTML = `
            <div class="action-buttons">
                <button class="btn-ver" onclick="mostrarDetallePedido(${safeGroupId})">Ver Detalle</button>
                </div>
        `;
    });
}

function mostrarDetallePedido(groupId) {
    const pedidosAgrupados = agruparPedidos(ventas);
    const pedido = pedidosAgrupados.find(p => p.groupId === groupId);

    if (!pedido) {
        modalDetalleBody.innerHTML = "<p>Error: No se encontró el pedido.</p>";
        modalDetalle.classList.add("active");
        return;
    }

    // Construir el HTML del modal
    let html = `
        <div class="resumen" style="grid-template-columns: 1fr; margin-bottom: 24px;">
            <div class="resumen-card">
                <div>
                    <div class="resumen-label">Cliente</div>
                    <div class="resumen-value" style="font-size: 18px;">${pedido.cliente}</div>
                </div>
            </div>
            <div class="resumen-card">
                <div>
                    <div class="resumen-label">Método de Pago</div>
                    <div class="resumen-value" style="font-size: 18px;">${pedido.metodoPago}</div>
                </div>
            </div>
        </div>
    `;

    // Comprobante
    if (pedido.adjuntoPath) {
        const safePath = pedido.adjuntoPath.replace(/\\/g, '\\\\');
        html += `
            <label>Comprobante de Pago</label>
            <button type="button" class="btn-adjuntar" style="width: 100%;" onclick="abrirArchivo('${safePath}')">
                📄 Ver Comprobante
            </button>
            <hr>
        `;
    } else {
        html += `<hr>`;
    }

    // Tabla de ítems
    html += '<h3>Ítems del Pedido</h3>';
    html += '<div class="table-container" style="margin-top: 16px;"><table>';
    html += `
        <thead>
            <tr>
                <th>Perfume</th>
                <th>Volumen</th>
                <th>Precio</th>
            </tr>
        </thead>
    `;
    html += '<tbody>';
    pedido.items.forEach(item => {
        html += `
            <tr>
                <td>${item.perfume}</td>
                <td>${item.volumen}ml</td>
                <td>$${item.precioVendido.toLocaleString("es-CL")}</td>
            </tr>
        `;
    });
    html += '</tbody></table></div>';
    
    // Total
    html += `
        <h3 style="text-align: right; margin-top: 24px; border: none; padding: 0;">
            Total Pedido: 
            <span style="color: var(--color-success);">$${pedido.totalVenta.toLocaleString("es-CL")}</span>
        </h3>
    `;

    modalDetalleBody.innerHTML = html;
    modalDetalle.classList.add("active");
}

// Opcional: Función para eliminar un pedido completo (requiere bucle)
async function eliminarPedido(groupId) {
    if (!confirm("⚠️ ¿Estás seguro de que quieres eliminar este PEDIDO COMPLETO? Todos sus ítems serán borrados.")) return;
    
    const pedidosAgrupados = agruparPedidos(ventas);
    const pedido = pedidosAgrupados.find(p => p.groupId === groupId);
    
    if (!pedido) {
        alert("Error al encontrar el pedido.");
        return;
    }
    
    let todosExitosos = true;
    
    for (const item of pedido.items) {
        const resultado = await window.api.eliminarVenta(item.id);
        if (!resultado.success) {
            todosExitosos = false;
        }
    }

    if (todosExitosos) {
        alert("✅ Pedido completo eliminado con éxito.");
    } else {
        alert("⚠️ Algunos ítems no se pudieron eliminar. Refresca la aplicación.");
    }

    // Recargar datos
    ventas = await window.api.cargarVentas();
    mostrarTablaCRUD(ventas);
    const filtroActual = resumenTituloEl.textContent.includes("Total") ? "total" : filtroMesInput.value
    mostrarResumenYTabla(ventas, perfumes, filtroActual)
    actualizarPestañaRentabilidad()
    actualizarPestañaPedidos();
}

// -------------------------------------------

function actualizarPestañaRentabilidad() {
// ... (código existente sin cambios)
  tablaRentabilidadBody.innerHTML = "";
  if (Object.keys(perfumes).length === 0) {
    tablaRentabilidadBody.innerHTML =
      '<tr><td colspan="7" style="text-align: center; padding: 48px; color: var(--color-text-muted);">📭 No hay perfumes configurados.</td></tr>';
    return
  }
  let hayLotes = false;
  Object.keys(perfumes).sort().forEach(nombre => {
    const perfumeData = perfumes[nombre];
    if (perfumeData.lotes && perfumeData.lotes.length > 0) {
        hayLotes = true;
        perfumeData.lotes.sort((a, b) => new Date(b.fecha) - new Date(a.fecha)).forEach(lote => {
            const ventasDeEsteLote = ventas.filter(v => v.loteId === lote.id);
            const ingresosTotales = ventasDeEsteLote.reduce((sum, v) => sum + v.precioVendido, 0);
            const mlTotalesVendidos = ventasDeEsteLote.reduce((sum, v) => sum + v.volumen, 0);
            const costoLote = lote.costo || 0;
            let costoOperativo = 0;
            if (lote.costo > 0 && lote.volumen > 0) {
                costoOperativo = (lote.costo / lote.volumen) * mlTotalesVendidos;
            }
            const valorRestanteLote = costoLote - costoOperativo;
            const gananciaOperativa = ingresosTotales - costoOperativo;
            const row = tablaRentabilidadBody.insertRow();
            row.insertCell(0).textContent = nombre;
            row.insertCell(1).textContent = `Lote ${lote.fecha}`;
            row.insertCell(2).textContent = `$${costoLote.toLocaleString("es-CL")}`;
            const cellCostoOp = row.insertCell(3);
            cellCostoOp.textContent = `$${Math.round(costoOperativo).toLocaleString("es-CL")}`;
            cellCostoOp.style.color = 'var(--color-text-muted)';
            const cellValorRestante = row.insertCell(4);
            cellValorRestante.textContent = `$${Math.round(valorRestanteLote).toLocaleString("es-CL")}`;
            cellValorRestante.style.color = valorRestanteLote < 0 ? 'var(--color-success)' : 'var(--color-warning)';
            row.insertCell(5).textContent = `$${ingresosTotales.toLocaleString("es-CL")}`;
            const cellGananciaOp = row.insertCell(6);
            cellGananciaOp.textContent = `$${Math.round(gananciaOperativa).toLocaleString("es-CL")}`;
            cellGananciaOp.style.color = gananciaOperativa < 0 ? 'var(--color-danger)' : 'var(--color-success)';
        });
    }
  });
  if (!hayLotes) {
      tablaRentabilidadBody.innerHTML =
        '<tr><td colspan="7" style="text-align: center; padding: 48px; color: var(--color-text-muted);">📭 No has añadido ningún lote (inventario) en Configuración.</td></tr>';
  }
}
function poblarTablaPerfumes() {
// ... (código existente sin cambios)
  tablaPerfumesBody.innerHTML = ""
  if (Object.keys(perfumes).length === 0) {
    tablaPerfumesBody.innerHTML =
      '<tr><td colspan="3" style="text-align: center; padding: 48px; color: var(--color-text-muted);">📭 No hay perfumes configurados. ¡Añade uno!</td></tr>'
    return
  }
  Object.keys(perfumes).sort().forEach(nombre => {
    const data = perfumes[nombre];
    const precios = data.precios;
    const row = tablaPerfumesBody.insertRow()
    row.insertCell(0).textContent = nombre
    row.insertCell(1).textContent = `$${precios["3ml"]} / $${precios["5ml"]} / $${precios["10ml"]}`
    const cellAcciones = row.insertCell(2)
    cellAcciones.innerHTML = `
            <div class="action-buttons">
                <button class="btn-editar" onclick="modoEditarPerfume('${nombre.replace(/'/g, "\\'")}')">Editar Precios</button>
                <button class="btn-eliminar" onclick="eliminarPerfume('${nombre.replace(/'/g, "\\'")}')">Eliminar</button>
            </div>
        `
  })
}
function modoEditarPerfume(nombre) {
// ... (código existente sin cambios)
  const data = perfumes[nombre]
  if (!data) return
  crudFormTitulo.textContent = "Editando Perfume"
  crudSubmitBtn.textContent = "Guardar Cambios"
  crudCancelarBtn.style.display = "block"
  crudOriginalNombreInput.value = nombre
  crudNombreInput.value = nombre
  crudPrecio3mlInput.value = data.precios["3ml"]
  crudPrecio5mlInput.value = data.precios["5ml"]
  crudPrecio10mlInput.value = data.precios["10ml"]
  crudFormTitulo.scrollIntoView({ behavior: "smooth" })
}
function resetFormularioCrud() {
// ... (código existente sin cambios)
  crudFormTitulo.textContent = "Añadir Nuevo Perfume"
  crudSubmitBtn.textContent = "💾 Guardar Perfume"
  crudCancelarBtn.style.display = "none"
  formPerfumeCrud.reset()
  crudOriginalNombreInput.value = ""
}
crudCancelarBtn.addEventListener("click", resetFormularioCrud)
formPerfumeCrud.addEventListener("submit", async (e) => {
// ... (código existente sin cambios)
  e.preventDefault()
  const originalNombre = crudOriginalNombreInput.value
  const nombre = crudNombreInput.value.trim()
  if (!nombre) {
    alert("❌ El nombre del perfume no puede estar vacío.")
    return
  }
  if (originalNombre !== nombre && perfumes[nombre]) {
    alert("❌ Ya existe un perfume con ese nombre. Por favor, elige otro.")
    return
  }
  const perfumeData = perfumes[originalNombre] || { lotes: [] };
  perfumeData.precios = {
    "3ml": Number.parseInt(crudPrecio3mlInput.value) || 0,
    "5ml": Number.parseInt(crudPrecio5mlInput.value) || 0,
    "10ml": Number.parseInt(crudPrecio10mlInput.value) || 0,
  }
  if (originalNombre && originalNombre !== nombre) {
    delete perfumes[originalNombre];
    let ventasActualizadas = false;
    ventas.forEach(v => {
        if (v.perfume === originalNombre) {
            v.perfume = nombre;
            ventasActualizadas = true;
        }
    });
    if (ventasActualizadas) {
        ventas = await window.api.cargarVentas();
        mostrarTablaCRUD(ventas);
        console.warn("Se renombró un perfume, pero las ventas antiguas no se actualizarán masivamente (función 'guardarVentas' (plural) no implementada).");
    }
  }
  perfumes[nombre] = perfumeData;
  const resultado = await window.api.guardarPerfumes(perfumes)
  if (resultado.success) {
    alert(`✅ Perfume "${nombre}" guardado con éxito.`)
    resetFormularioCrud()
    llenarSelectPerfumes()
    poblarTablaPerfumes()
    poblarTablaLotes()
    actualizarPestañaRentabilidad()
  } else {
    alert("❌ Error al guardar el perfume: " + resultado.message)
    delete perfumes[nombre]
    if (originalNombre) {
      perfumes[originalNombre] = perfumeData;
      let ventasRevertidas = false;
      ventas.forEach(v => {
        if (v.perfume === nombre) {
            v.perfume = originalNombre;
            ventasRevertidas = true;
        }
      });
      if (ventasRevertidas) {
          ventas = await window.api.cargarVentas();
          mostrarTablaCRUD(ventas);
      }
    }
  }
})
async function eliminarPerfume(nombre) {
// ... (código existente sin cambios)
  const ventasAsociadas = ventas.filter(v => v.perfume === nombre).length;
  if (ventasAsociadas > 0) {
      alert(`❌ No se puede eliminar "${nombre}" porque tiene ${ventasAsociadas} ventas asociadas. Primero elimina las ventas.`);
      return;
  }
  if (!confirm(`⚠️ ¿Estás seguro de que quieres eliminar "${nombre}"? Esta acción no se puede deshacer.`)) return
  const dataBackup = perfumes[nombre]
  delete perfumes[nombre]
  const resultado = await window.api.guardarPerfumes(perfumes)
  if (resultado.success) {
    alert(`✅ Perfume "${nombre}" eliminado con éxito.`)
    llenarSelectPerfumes()
    poblarTablaPerfumes()
    poblarTablaLotes()
    actualizarPestañaRentabilidad()
  } else {
    alert("❌ Error al eliminar el perfume: " + resultado.message)
    perfumes[nombre] = dataBackup
  }
}
function poblarTablaLotes() {
// ... (código existente sin cambios)
    tablaLotesBody.innerHTML = "";
    let hayLotes = false;
    Object.keys(perfumes).sort().forEach(nombre => {
        if (perfumes[nombre].lotes && perfumes[nombre].lotes.length > 0) {
            hayLotes = true;
            perfumes[nombre].lotes.sort((a, b) => new Date(b.fecha) - new Date(a.fecha)).forEach(lote => {
                const costoPorMl = (lote.costo > 0 && lote.volumen > 0) ? (lote.costo / lote.volumen).toFixed(0) : "N/A";
                const row = tablaLotesBody.insertRow();
                row.insertCell(0).textContent = nombre;
                row.insertCell(1).textContent = lote.fecha;
                row.insertCell(2).textContent = `$${lote.costo.toLocaleString("es-CL")}`;
                row.insertCell(3).textContent = `${lote.volumen} ml`;
                row.insertCell(4).textContent = `$${costoPorMl} / ml`;
                row.insertCell(5).innerHTML = `
                    <div class="action-buttons">
                        <button class="btn-editar" onclick="modoEditarLote('${nombre.replace(/'/g, "\\'")}', '${lote.id}')">Editar</button>
                        <button class="btn-eliminar" onclick="eliminarLote('${nombre.replace(/'/g, "\\'")}', '${lote.id}')">Eliminar</button>
                    </div>
                `;
            });
        }
    });
    if (!hayLotes) {
        tablaLotesBody.innerHTML =
          '<tr><td colspan="6" style="text-align: center; padding: 48px; color: var(--color-text-muted);">📭 No has añadido ningún lote (inventario) a ningún perfume.</td></tr>';
    }
}
function modoEditarLote(nombrePerfume, loteId) {
// ... (código existente sin cambios)
    const lote = perfumes[nombrePerfume]?.lotes.find(l => l.id === loteId);
    if (!lote) return;
    loteFormTitulo.textContent = "Editando Lote";
    loteSubmitBtn.textContent = "Guardar Cambios";
    loteCancelarBtn.style.display = "block";
    loteEditIdInput.value = lote.id;
    lotePerfumeSelect.value = nombrePerfume;
    lotePerfumeSelect.disabled = true;
    loteFechaInput.value = lote.fecha;
    loteCostoFrascoInput.value = lote.costo;
    loteVolumenFrascoInput.value = lote.volumen;
    loteFormTitulo.scrollIntoView({ behavior: "smooth" });
}
function resetFormularioLote() {
// ... (código existente sin cambios)
    loteFormTitulo.textContent = "Gestión de Lotes (Inventario)";
    loteSubmitBtn.textContent = "➕ Añadir Lote al Inventario";
    loteCancelarBtn.style.display = "none";
    lotePerfumeSelect.disabled = false;
    formLoteCrud.reset();
    loteEditIdInput.value = "";
}
loteCancelarBtn.addEventListener("click", resetFormularioLote);
formLoteCrud.addEventListener("submit", async (e) => {
// ... (código existente sin cambios)
    e.preventDefault();
    const nombrePerfume = lotePerfumeSelect.value;
    const costo = Number.parseInt(loteCostoFrascoInput.value);
    const volumen = Number.parseInt(loteVolumenFrascoInput.value);
    const fecha = loteFechaInput.value;
    const editId = loteEditIdInput.value;
    if (!nombrePerfume) {
        alert("❌ Debes seleccionar un perfume.");
        return;
    }
    if (!costo || costo <= 0 || !volumen || volumen <= 0 || !fecha) {
        alert("❌ Debes completar todos los campos del lote con valores válidos.");
        return;
    }
    if (!perfumes[nombrePerfume].lotes) {
        perfumes[nombrePerfume].lotes = [];
    }
    let loteBackup = null;
    let loteIndex = -1;
    if (editId) {
        loteIndex = perfumes[nombrePerfume].lotes.findIndex(l => l.id === editId);
        if (loteIndex === -1) {
            alert("Error: No se encontró el lote a editar.");
            return;
        }
        loteBackup = { ...perfumes[nombrePerfume].lotes[loteIndex] };
        perfumes[nombrePerfume].lotes[loteIndex] = {
            id: editId,
            fecha,
            costo,
            volumen
        };
    } else {
        const nuevoLote = {
            id: `lote_${Date.now()}`,
            fecha,
            costo,
            volumen
        };
        perfumes[nombrePerfume].lotes.push(nuevoLote);
    }
    const resultado = await window.api.guardarPerfumes(perfumes);
    if (resultado.success) {
        alert(editId ? "✅ Lote actualizado con éxito." : "✅ Lote añadido con éxito.");
        resetFormularioLote();
        poblarTablaLotes();
        actualizarPestañaRentabilidad();
    } else {
        alert("❌ Error al guardar el lote: " + resultado.message);
        if (editId && loteBackup) {
            perfumes[nombrePerfume].lotes[loteIndex] = loteBackup;
        } else {
            perfumes[nombrePerfume].lotes.pop();
        }
    }
});
async function eliminarLote(nombrePerfume, loteId) {
// ... (código existente sin cambios)
    const ventasAsociadas = ventas.filter(v => v.loteId === loteId).length;
    if (ventasAsociadas > 0) {
        alert(`❌ No se puede eliminar este lote porque tiene ${ventasAsociadas} ventas asociadas. Primero elimina o reasigna esas ventas (editándolas).`);
        return;
    }
    if (!confirm(`⚠️ ¿Estás seguro de que quieres eliminar este lote? Esta acción no se puede deshacer.`)) return;
    const loteIndex = perfumes[nombrePerfume].lotes.findIndex(l => l.id === loteId);
    if (loteIndex === -1) return;
    const loteBackup = perfumes[nombrePerfume].lotes[loteIndex];
    perfumes[nombrePerfume].lotes.splice(loteIndex, 1);
    const resultado = await window.api.guardarPerfumes(perfumes);
    if (resultado.success) {
        alert(`✅ Lote eliminado de "${nombrePerfume}" con éxito.`);
        poblarTablaLotes();
        actualizarPestañaRentabilidad();
    } else {
        alert("❌ Error al eliminar el lote: " + resultado.message);
        perfumes[nombrePerfume].lotes.splice(loteIndex, 0, loteBackup);
    }
}
function actualizarPrecio(perfumeElem, volumenElem, precioElem) {
// ... (código existente sin cambios)
  const perfume = perfumeElem.value
  const volumen = Number.parseInt(volumenElem.value)
  if (perfume && volumen && perfumes[perfume]) {
    let precioSugerido = 0;
    const precios = perfumes[perfume].precios;
    if (volumen === 3) precioSugerido = precios["3ml"]
    else if (volumen === 5) precioSugerido = precios["5ml"]
    else if (volumen === 10) precioSugerido = precios["10ml"]
    if (precioSugerido > 0) {
      precioElem.value = precioSugerido
    }
  }
}
editPerfumeSelect.addEventListener("change", () => {
// ... (código existente sin cambios)
  actualizarPrecio(editPerfumeSelect, editVolumenSelect, editPrecioVendidoInput)
  actualizarSelectLote(editPerfumeSelect.value, editLoteSelect);
})
editVolumenSelect.addEventListener("change", () => {
// ... (código existente sin cambios)
  actualizarPrecio(editPerfumeSelect, editVolumenSelect, editPrecioVendidoInput)
})
btnSeleccionarAdjunto.addEventListener("click", async () => {
// ... (código existente sin cambios)
  const path = await window.api.seleccionarArchivo()
  if (path) {
    adjuntoTemporalPath = path
    nombreAdjuntoEl.textContent = path.split(/[\\/]/).pop()
  }
})
btnSeleccionarAdjuntoEdit.addEventListener("click", async () => {
// ... (código existente sin cambios)
  const path = await window.api.seleccionarArchivo()
  if (path) {
    editAdjuntoTemporalPath = path
    editNombreAdjuntoEl.textContent = `Nuevo: ${path.split(/[\\/]/).pop()}`
  }
})
async function abrirArchivo(path) {
// ... (código existente sin cambios)
  const resultado = await window.api.abrirArchivo(path)
  if (!resultado.success) {
    alert("Error al abrir el archivo. Es posible que haya sido movido o eliminado.")
  }
}
filtroMesInput.addEventListener("input", () => {
// ... (código existente sin cambios)
  const mesSeleccionado = filtroMesInput.value;
  if (!mesSeleccionado) {
    const mesActual = new Date().toISOString().substring(0, 7)
    filtroMesInput.value = mesActual
    mostrarResumenYTabla(ventas, perfumes, mesActual);
    return;
  }
  mostrarResumenYTabla(ventas, perfumes, mesSeleccionado);
});
btnVerTotal.addEventListener("click", () => {
// ... (código existente sin cambios)
  mostrarResumenYTabla(ventas, perfumes, "total");
  filtroMesInput.value = "";
});
function prepararDatosExportacion(filtro) {
// ... (código existente sin cambios)
  let ganancia = 0;
  let decants = 0;
  let costo = 0;
  let ventasFiltradas = [];
  const ventasRecientes = ventas.slice();
  let titulo = "";
  if (filtro === "total") {
    ventasFiltradas = ventasRecientes;
    titulo = "Total_Historico";
  } else {
    ventasFiltradas = ventasRecientes.filter(v => v.fecha.substring(0, 7) === filtro);
    titulo = filtro;
  }
  const ventasExportar = [];
  ventasFiltradas.forEach((venta) => {
    let costoVenta = 0;
    const perfume = perfumes[venta.perfume];
    if (perfume) {
        const lotes = perfume.lotes || [];
        const lote = lotes.find(l => l.id === venta.loteId);
        const loteUsado = lote || (lotes.length > 0 ? lotes[0] : null);
        if (loteUsado && loteUsado.costo > 0 && loteUsado.volumen > 0) {
            const costoPorMl = loteUsado.costo / loteUsado.volumen;
            costoVenta = Math.round(costoPorMl * venta.volumen);
        }
    }
    const gananciaNetaVenta = venta.precioVendido - costoVenta;
    ganancia += venta.precioVendido;
    costo += costoVenta;
    decants++;
    ventasExportar.push({
      fecha: venta.fecha,
      cliente: venta.cliente || 'N/A',
      perfume: venta.perfume,
      volumen: venta.volumen,
      precioVendido: venta.precioVendido,
      costoVenta: costoVenta,
      gananciaNetaVenta: gananciaNetaVenta
    });
  });
  const gananciaNeta = ganancia - costo;
  return {
    titulo: titulo,
    ventas: ventasExportar.sort((a, b) => a.fecha.localeCompare(b.fecha)),
    resumen: {
      gananciaBruta: ganancia,
      costoTotal: Math.round(costo),
      gananciaNeta: Math.round(gananciaNeta),
      totalDecants: decants
    }
  };
}
btnExportarExcel.addEventListener("click", async () => {
// ... (código existente sin cambios)
  const filtroActual = resumenTituloEl.textContent.includes("Total") ? "total" : filtroMesInput.value;
  if (!filtroActual) {
    alert("Por favor, selecciona un mes válido o presiona 'Ver Total' primero.");
    return;
  }
  const datos = prepararDatosExportacion(filtroActual);
  if (datos.ventas.length === 0) {
    alert("No hay ventas para exportar en este periodo.");
    return;
  }
  alert("Preparando exportación... Se abrirá una ventana para guardar.");
  const resultado = await window.api.exportarExcel(datos);
  if (resultado.success) {
    alert(resultado.message);
  } else {
    if (resultado.message !== "Exportación cancelada.") {
        alert(`Error al exportar: ${resultado.message}`);
    }
  }
});
document.getElementById("close-btn").addEventListener("click", () => {
// ... (código existente sin cambios)
  window.api.closeApp()
})
document.getElementById("minimize-btn").addEventListener("click", () => {
// ... (código existente sin cambios)
  window.api.minimizeApp()
})
document.getElementById("maximize-btn").addEventListener("click", () => {
// ... (código existente sin cambios)
  window.api.maximizeApp()
})
cargarDatosIniciales()
window.abrirModalEdicion = abrirModalEdicion
// ... (código existente sin cambios)
window.eliminarVenta = eliminarVenta
window.modoEditarPerfume = modoEditarPerfume
window.eliminarPerfume = eliminarPerfume
window.abrirArchivo = abrirArchivo
window.eliminarLote = eliminarLote
window.modoEditarLote = modoEditarLote
// --- NUEVO: Exponer funciones de pedidos ---
window.mostrarDetallePedido = mostrarDetallePedido;
window.eliminarPedido = eliminarPedido; // Exponer la función de eliminar pedido completo