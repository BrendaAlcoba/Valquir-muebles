// --- SISTEMA DE NOTIFICACIONES (TOASTS) ---
function mostrarToast(mensaje, tipo = "exito") {
  let contenedor = document.getElementById("toast-container");
  if (!contenedor) {
    contenedor = document.createElement("div");
    contenedor.id = "toast-container";
    contenedor.className = "toast-container";
    document.body.appendChild(contenedor);
  }
  const toast = document.createElement("div");
  toast.className = `toast ${tipo}`;
  toast.innerHTML = `<span>${tipo === 'exito' ? '✓' : '⚠️'}</span> <span>${esc(mensaje)}</span>`;
  contenedor.appendChild(toast);

  setTimeout(() => {
    toast.classList.add("saliendo");
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

if (!token()) location.href = "index.html";

let CATS = [], actual = "dashboard", datos = [];

// --- MENÚ MÓVIL ---
const sidebar = $("#sidebar");
const overlay = $("#overlay");
const menuToggle = $("#menu-toggle");

function toggleMenu() {
  sidebar.classList.toggle("abierto");
  overlay.classList.toggle("visible");
}

menuToggle.addEventListener("click", toggleMenu);
overlay.addEventListener("click", toggleMenu);

$("#tabs").addEventListener("click", (e) => {
  if (e.target.closest("button") && window.innerWidth <= 900) {
    toggleMenu();
  }
});

// Helpers
const pesos = n => n == null || isNaN(n) ? "Consultar precio" : "$ " + Number(n).toLocaleString("es-AR");
const nomCat = id => (CATS.find(c => c.id === id) || {}).nombre || id;
const corto = s => (s || "").length > 70 ? s.slice(0, 70) + "…" : (s || "");

const ENT = {
  dashboard: { nombre: "Dashboard", sinNuevo: true },
  ventas: {
    nombre: "Finanzas y Ventas", ruta: "ventas", pk: "id", borrar: true,
    t1: x => x.nombre_producto + (x.cliente ? ` (${x.cliente})` : ""),
    t2: x => `Venta: ${pesos(x.precio_venta)} | Costo: ${pesos(x.costo_materiales)} | Ganancia: ${pesos(x.ganancia_neta)}`,
    campos: [
      { k: "nombre_producto", l: "Nombre del mueble o trabajo", req: 1 },
      { k: "precio_venta", t: "num", l: "Precio de venta total ($)", req: 1 },
      { k: "costo_materiales", t: "num", l: "Costo total de materiales ($)", req: 1 },
      { k: "cliente", l: "Nombre del cliente (opcional)" },
      { k: "notas", t: "area", l: "Notas o detalles de la venta (opcional)" }
    ]
  },
  productos: {
    nombre: "Muebles", ruta: "productos", pk: "id", img: "imagen", borrar: true,
    t1: x => x.nombre, t2: x => nomCat(x.categoria_id) + " · " + pesos(x.precio),
    campos: [
      { k: "imagenes", t: "imgs", l: "Fotos del mueble", max: 5 },
      { k: "nombre", l: "Nombre", req: 1 },
      { k: "categoria_id", t: "cat", l: "Categoría", req: 1 },
      { k: "descripcion", t: "area", l: "Descripción" },
      { k: "precio", t: "num", l: "Precio (vacío = consultar precio)" },
      { k: "medidas", l: "Medidas" },
      { k: "entrega", l: "Tiempo de entrega (opcional)" },
      { k: "visible", t: "check", l: "Visible en la página" }
    ]
  },
  categorias: {
    nombre: "Categorías", ruta: "categorias", pk: "id", img: "imagen", borrar: true, slug: true,
    t1: x => x.nombre, t2: x => "Orden " + x.orden,
    campos: [
      { k: "imagen", t: "img", l: "Foto de la categoría" },
      { k: "nombre", l: "Nombre", req: 1 },
      { k: "orden", t: "int", l: "Orden (1 va primero)" },
      { k: "visible", t: "check", l: "Visible en la página" }
    ]
  },
  portada: {
    nombre: "Portada", ruta: "portada", pk: "id", img: "imagen", borrar: true,
    t1: x => x.descripcion || "Foto de portada", t2: x => "Orden " + x.orden,
    campos: [
      { k: "imagen", t: "img", l: "Foto", req: 1 },
      { k: "descripcion", l: "Descripción corta de la foto" },
      { k: "orden", t: "int", l: "Orden (1 va primero)" },
      { k: "visible", t: "check", l: "Visible en la página" }
    ]
  },
  faq: {
    nombre: "Preguntas", ruta: "faq", pk: "id", borrar: true,
    t1: x => x.pregunta, t2: x => corto(x.respuesta) + " · Orden " + x.orden,
    campos: [
      { k: "pregunta", l: "Pregunta", req: 1 },
      { k: "respuesta", t: "area", l: "Respuesta", req: 1 },
      { k: "orden", t: "int", l: "Orden (1 va primero)" },
      { k: "visible", t: "check", l: "Visible en la página" }
    ]
  },
  secciones: {
    nombre: "Secciones", ruta: "secciones", pk: "clave", sinNuevo: true,
    t1: x => x.titulo, t2: x => corto(x.texto),
    campos: [
      { k: "titulo", l: "Título", req: 1 },
      { k: "texto", t: "area", l: "Texto" },
      { k: "visible", t: "check", l: "Mostrar en la página" }
    ]
  }
};

/* ---------- Pestañas ---------- */
$("#tabs").innerHTML = Object.entries(ENT).map(([k, e]) =>
  `<button type="button" data-t="${k}">${esc(e.nombre)}</button>`).join("");

$("#tabs").addEventListener("click", e => {
  const b = e.target.closest("button");
  if (b) ir(b.dataset.t);
});

$("#salir").addEventListener("click", () => {
  localStorage.removeItem("adminToken");
  location.href = "index.html";
});

$("#nuevo").addEventListener("click", () => abrirForm(null));

async function ir(k) {
  actual = k;
  const E = ENT[k];

  $("#bienvenida").style.display = (k === "dashboard") ? "flex" : "none";

  [...$("#tabs").children].forEach(b => b.setAttribute("aria-selected", String(b.dataset.t === k)));
  $("#titulo").textContent = E.nombre;
  $("#nuevo").hidden = !!E.sinNuevo;
  $("#msg").textContent = "";

  const listaEl = $("#lista");
  listaEl.classList.remove("animar-entrada");
  void listaEl.offsetWidth;
  listaEl.classList.add("animar-entrada");

  // Skeletons
  listaEl.innerHTML = Array(3).fill(0).map(() =>
    `<div class="fila" style="height:80px;background:linear-gradient(90deg,var(--surface) 25%,var(--surface-2) 50%,var(--surface) 75%);background-size:200% 100%;animation:shimmer 1.5s infinite;"></div>`
  ).join("");

  try {
    CATS = await pedir("/categorias/admin/todos");

    if (k === "dashboard") {
      const [prods, ventas] = await Promise.all([
        pedir("/productos/admin/todos"),
        pedir("/ventas/admin/todos")
      ]);
      renderDashboard(prods, ventas);
      return;
    }

    datos = k === "categorias" ? CATS : await pedir(`/${E.ruta}/admin/todos`);
    pintar();
  } catch (err) {
    listaEl.innerHTML = "";
    $("#msg").textContent = err.message;
  }
}

/* ---------- Dashboard ---------- */
async function renderDashboard(prods, ventas) {
  const totalProds = prods.length;
  const visibles = prods.filter(p => p.visible).length;

  const totalVentas = ventas.reduce((acc, v) => acc + Number(v.precio_venta || 0), 0);
  const totalCostos = ventas.reduce((acc, v) => acc + Number(v.costo_materiales || 0), 0);
  const gananciaNetaTotal = ventas.reduce((acc, v) => acc + Number(v.ganancia_neta || 0), 0);
  const margenPct = totalVentas ? ((gananciaNetaTotal / totalVentas) * 100).toFixed(1) : null;

  const catConteo = {};
  CATS.forEach(c => catConteo[c.nombre] = 0);
  prods.forEach(p => {
    const cObj = CATS.find(c => c.id === p.categoria_id);
    if (cObj) catConteo[cObj.nombre] = (catConteo[cObj.nombre] || 0) + 1;
  });

  $("#lista").innerHTML = `
    <div class="dash-grid">
      <div class="dash-card">
        <h3>Ingresos Totales</h3>
        <p class="dash-num">${pesos(totalVentas)}</p>
        <span>Facturación acumulada</span>
      </div>
      <div class="dash-card">
        <h3>Costos de Producción</h3>
        <p class="dash-num cobre">${pesos(totalCostos)}</p>
        <span>Materiales + insumos</span>
      </div>
      <div class="dash-card">
        <h3>Margen Neto</h3>
        <p class="dash-num ok">${pesos(gananciaNetaTotal)}</p>
        <span>${margenPct !== null ? margenPct + '% sobre ventas' : 'Sin ventas registradas'}</span>
      </div>
      <div class="dash-card">
        <h3>Pedidos Activos</h3>
        <p class="dash-num">${ventas.length}</p>
        <span>${visibles} de ${totalProds} muebles publicados</span>
      </div>
    </div>

    <div class="dash-charts">
      <div class="chart-box">
        <h3>Distribución de Muebles por Categoría</h3>
        <canvas id="chartCat"></canvas>
      </div>
      <div class="chart-box">
        <h3>Resumen Financiero (Ventas vs Costos)</h3>
        <canvas id="chartFinanzas"></canvas>
      </div>
    </div>
  `;

  if (typeof Chart === "undefined") {
    $("#msg").textContent = "No se pudo cargar Chart.js (verificá tu conexión).";
    return;
  }

  Chart.defaults.color = "#1a2421";
  Chart.defaults.borderColor = "rgba(26,20,16,0.08)";

  const ctxCat = document.getElementById("chartCat").getContext("2d");
  new Chart(ctxCat, {
    type: "doughnut",
    data: {
      labels: Object.keys(catConteo),
      datasets: [{
        data: Object.values(catConteo),
        backgroundColor: ["#a07448", "#b8926a", "#8a908d", "#1f8a4c", "#2563eb"],
        borderColor: "#ffffff",
        borderWidth: 3
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: {
        legend: { position: "bottom", labels: { color: "#1a2421", padding: 14, font: { size: 12 } } }
      }
    }
  });

  const ctxFin = document.getElementById("chartFinanzas").getContext("2d");
  new Chart(ctxFin, {
    type: "bar",
    data: {
      labels: ["Ventas Totales", "Costo Materiales", "Ganancia Neta"],
      datasets: [{
        label: "Montos en ARS",
        data: [totalVentas, totalCostos, gananciaNetaTotal],
        backgroundColor: ["#a07448", "#9a3b2e", "#1f8a4c"],
        borderRadius: 8
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        y: { beginAtZero: true, ticks: { color: "#1a2421" }, grid: { color: "rgba(26,20,16,0.08)" } },
        x: { ticks: { color: "#1a2421" }, grid: { display: false } }
      }
    }
  });
}

/* ---------- Listado ---------- */
function pintar() {
  const E = ENT[actual];
  $("#lista").innerHTML = datos.length ? datos.map(x => {
    const id = esc(x[E.pk]);
    return `<div class="fila">
      ${E.img ? `<div class="mini">${x[E.img] ? `<img src="${esc(x[E.img])}" alt="">` : ""}</div>` : ""}

      <div class="info">
        <b>${esc(E.t1(x))}</b>
        <span>${esc(E.t2(x))}</span>
      </div>

      ${actual !== "ventas" ? `
        <div class="badge-container">
          <span class="badge ${x.visible ? 'activo' : 'inactivo'}">${x.visible ? '● Visible' : '○ Oculto'}</span>
          <label class="sw" title="Cambiar visibilidad">
            <input type="checkbox" data-v="${id}" ${x.visible ? "checked" : ""}>
          </label>
        </div>
      ` : ""}

      <div style="display: flex; gap: 0.5rem;">
        <button class="btn" style="padding: 0.5rem 1rem; font-size: 0.85rem;" type="button" data-e="${id}">Editar</button>
        ${E.borrar ? `<button class="link peligro" type="button" data-d="${id}">Borrar</button>` : ""}
      </div>
    </div>`;
  }).join("") : `
    <div class="empty-state">
      <div class="empty-icon">${actual === 'productos' ? '🪑' : actual === 'ventas' ? '💰' : '📁'}</div>
      <h3>No hay registros todavía</h3>
      <p>Empezá agregando tu primer ${ENT[actual].nombre.toLowerCase().slice(0, -1)}.</p>
      <button class="btn" onclick="abrirForm(null)">+ Agregar ahora</button>
    </div>
  `;
}

const buscar = id => datos.find(x => String(x[ENT[actual].pk]) === id);
const rutaItem = x => `/${ENT[actual].ruta}/${encodeURIComponent(x[ENT[actual].pk])}`;

$("#lista").addEventListener("click", async e => {
  const b = e.target.closest("button");
  if (!b) return;
  if (b.dataset.e) return abrirForm(buscar(b.dataset.e));
  if (b.dataset.d) {
    const x = buscar(b.dataset.d);
    if (!confirm("¿Seguro que querés borrar este registro?")) return;
    try {
      await pedir(rutaItem(x), { method: "DELETE" });
      mostrarToast("Registro borrado correctamente", "exito");
      ir(actual);
    } catch {
      mostrarToast("No se pudo borrar el registro", "error");
    }
  }
});

$("#lista").addEventListener("change", async e => {
  const c = e.target.closest("input[data-v]");
  if (!c) return;
  try {
    await pedir(rutaItem(buscar(c.dataset.v)), { method: "PUT", body: { visible: c.checked } });
    buscar(c.dataset.v).visible = c.checked;
    pintar();
  } catch (err) {
    c.checked = !c.checked;
    mostrarToast(err.message, "error");
  }
});

/* ---------- Formularios ---------- */
function campo(c, v) {
  const id = "c_" + c.k, l = esc(c.l);
  if (c.t === "check") return `<label class="chk"><input type="checkbox" id="${id}" ${v ? "checked" : ""}> ${l}</label>`;
  if (c.t === "area") return `<label>${l}<textarea id="${id}" rows="4">${esc(v)}</textarea></label>`;
  if (c.t === "cat") return `<label>${l}<select id="${id}">${CATS.map(x =>
    `<option value="${esc(x.id)}" ${x.id === v ? "selected" : ""}>${esc(x.nombre)}</option>`).join("")}</select></label>`;
  if (c.t === "img") return `<label class="img">${l}
    <input type="file" id="${id}" accept="image/*" data-img="single">
    <div id="${id}_prev">${v ? `<img src="${esc(v)}" alt="">` : ""}</div>
  </label>`;
  if (c.t === "imgs") {
    const arr = Array.isArray(v) ? v : (v ? [v] : []);
    return `<div class="imgs">
      <label>${l} (máximo ${c.max})</label>
      <input type="file" id="${id}" accept="image/*" multiple data-img="multi" data-max="${c.max}">
      <div class="imgs-lista" id="${id}_lista">
        ${arr.map((src, i) => `<div class="foto">
          ${i === 0 ? '<span class="princ">Principal</span>' : ''}
          <img src="${esc(src)}" alt="">
          <div class="foto-acc">
            <button type="button" data-quitar="${i}" title="Quitar">✕</button>
          </div>
        </div>`).join("")}
      </div>
    </div>`;
  }
  const num = c.t === "num" || c.t === "int";
  return `<label>${l}<input id="${id}" type="${num ? "number" : "text"}" ${num ? 'min="0" step="any"' : ""} value="${esc(v)}"></label>`;
}

function leer(c) {
  const e = $("#c_" + c.k);
  if (!e) return null;
  if (c.t === "check") return e.checked;
  if (c.t === "img") {
    const prev = $("#c_" + c.k + "_prev img");
    return prev ? prev.getAttribute("src") : null;
  }
  if (c.t === "imgs") {
    const imgs = $$(`#c_${c.k}_lista .foto img`);
    return [...imgs].map(img => img.getAttribute("src"));
  }
  const v = e.value.trim();
  if (c.t === "int" || c.t === "num") return v === "" ? 0 : Number(v);
  return v === "" && !c.req ? null : v;
}

async function subirImagen(file) {
  const fd = new FormData();
  fd.append("archivo", file);
  const r = await pedir("/upload", { method: "POST", form: fd });
  if (!r || !r.url) throw new Error("Respuesta de subida inválida");
  return r.url;
}

function abrirForm(item) {
  const E = ENT[actual];
  $("#form").innerHTML = `<h2>${item ? "Editar" : "Registrar"}</h2>` +
    E.campos.map(c => campo(c, item ? item[c.k] : (c.k === "visible" ? true : ""))).join("") +
    `<p id="faviso" class="aviso" role="alert"></p>
    <div class="acc">
      <button type="button" class="link" id="cancelar">Cancelar</button>
      <button class="btn" id="guardar" type="submit">Guardar</button>
    </div>`;

  $("#cancelar").onclick = () => $("#dlg").close();

  $("#form").addEventListener("change", async e => {
    const input = e.target;
    if (input.dataset.img === "single") {
      const file = input.files[0];
      if (!file) return;
      try {
        const url = await subirImagen(file);
        $("#c_" + input.id.slice(2) + "_prev").innerHTML = `<img src="${esc(url)}" alt="">`;
      } catch (err) {
        $("#faviso").textContent = "Error subiendo imagen: " + err.message;
      }
    }
    if (input.dataset.img === "multi") {
      const max = Number(input.dataset.max) || 5;
      const lista = $("#c_" + input.id.slice(2) + "_lista");
      const actuales = lista.querySelectorAll(".foto").length;
      const disponibles = max - actuales;
      const files = [...input.files].slice(0, disponibles);
      for (const file of files) {
        try {
          const url = await subirImagen(file);
          const div = document.createElement("div");
          div.className = "foto";
          div.innerHTML = `<img src="${esc(url)}" alt="">
            <div class="foto-acc"><button type="button" data-quitar="0">✕</button></div>`;
          lista.appendChild(div);
        } catch (err) {
          $("#faviso").textContent = "Error subiendo imagen: " + err.message;
        }
      }
      input.value = "";
    }
  });

  $("#form").addEventListener("click", e => {
    const btn = e.target.closest("button[data-quitar]");
    if (!btn) return;
    btn.closest(".foto").remove();
  });

  $("#form").onsubmit = async ev => {
    ev.preventDefault();
    const body = {};
    E.campos.forEach(c => { body[c.k] = leer(c); });
    const falta = E.campos.find(c => c.req && (body[c.k] === "" || body[c.k] == null));
    if (falta) {
      $("#faviso").textContent = `Completá: ${falta.l}.`;
      return;
    }

    $("#guardar").disabled = true;
    try {
      await pedir(item ? rutaItem(item) : `/${E.ruta}`, {
        method: item ? "PUT" : "POST",
        body
      });
      $("#dlg").close();
      mostrarToast(item ? "Registro actualizado" : "Registro creado", "exito");
      ir(actual);
    } catch (err) {
      $("#faviso").textContent = err.message;
      $("#guardar").disabled = false;
    }
  };

  $("#dlg").showModal();
}

ir("dashboard");