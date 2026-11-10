const TITULO_BASE = document.title;
let vistaClave = null;      // qué pantalla del catálogo se está mostrando
let vistaCat = null;        // categoría actual (null = todos los muebles)
let hashCatalogo = "#/catalogo";
let errorCatalogo = false;
let cargado = false;        // ya llegaron los datos del servidor
let hayFaq = false;         // hay preguntas frecuentes para mostrar
let haySobre = false;       // la sección "Sobre nosotros" está activada
let filtros = { q: "", min: "", max: "", orden: "" };

// Listener persistente del slider (se limpia antes de recrear)
let _sliderListeners = { scroll: null, resize: null };

/* ---------- Migas de pan ---------- */
const migas = items => `<nav class="migas" aria-label="Migas de pan">` +
  items.map(([t, h]) => h
    ? `<a href="${h}">${esc(t)}</a><span aria-hidden="true">›</span>`
    : `<span aria-current="page">${esc(t)}</span>`).join("") + `</nav>`;

/* ---------- Pantalla 1: categorías con flechas ---------- */
function vistaCategorias() {
  vistaCat = null;
  hashCatalogo = "#/catalogo";
  const tarjetas = CATEGORIAS.map(c => {
    return `<a class="cat-card" href="#/categoria/${esc(c.id)}">
      <div class="cat-bg">${c.imagen ? `<img src="${esc(c.imagen)}" alt="" loading="lazy">` : ""}</div>
      <div class="cat-overlay"></div>
      <div class="cat-content">
        <h3 class="cat-title">${esc(c.nombre)}</h3>
        <span class="cat-btn">Ver más</span>
      </div>
    </a>`;
  }).join("");

  $("#catalogo-contenido").innerHTML = `
    <div class="slider-container">
      <button id="btn-scroll-izq" class="slider-btn slider-btn-izq" aria-label="Anterior">&#10094;</button>
      <div id="cat-slider" class="cat-slider">
        ${tarjetas}
        <a class="cat-card todos" href="#/todos">
          <div class="cat-bg"></div>
          <div class="cat-overlay"></div>
          <div class="cat-content">
            <h3 class="cat-title">Ver todos</h3>
            <span class="cat-btn">Ver catálogo</span>
          </div>
        </a>
      </div>
      <button id="btn-scroll-der" class="slider-btn slider-btn-der" aria-label="Siguiente">&#10095;</button>
    </div>`;

  const slider = $("#cat-slider");
  const btnIzq = $("#btn-scroll-izq");
  const btnDer = $("#btn-scroll-der");

  function evaluarFlechas() {
    const scrollMaximo = slider.scrollWidth - slider.clientWidth;
    btnIzq.disabled = slider.scrollLeft <= 2;
    btnDer.disabled = slider.scrollLeft >= scrollMaximo - 2;
  }

  // Limpiar listeners viejos antes de agregar nuevos
  if (_sliderListeners.scroll && _sliderListeners.scroll.el) {
    _sliderListeners.scroll.el.removeEventListener("scroll", _sliderListeners.scroll.fn);
  }
  if (_sliderListeners.resize) {
    window.removeEventListener("resize", _sliderListeners.resize);
  }

  const onScroll = () => evaluarFlechas();
  slider.addEventListener("scroll", onScroll);
  _sliderListeners.scroll = { el: slider, fn: onScroll };

  const onResize = () => evaluarFlechas();
  window.addEventListener("resize", onResize);
  _sliderListeners.resize = onResize;

  setTimeout(evaluarFlechas, 100);

  btnIzq.addEventListener("click", () => slider.scrollBy({ left: -340, behavior: "smooth" }));
  btnDer.addEventListener("click", () => slider.scrollBy({ left: 340, behavior: "smooth" }));
}

/* ---------- Pantalla 2: productos con filtros ---------- */
function vistaProductos(cat) {
  vistaCat = cat;
  hashCatalogo = cat ? "#/categoria/" + cat.id : "#/todos";

  $("#catalogo-contenido").innerHTML =
    migas([["Inicio", "#/"], ["Catálogo", "#/catalogo"], [cat ? cat.nombre : "Todos los muebles"]]) + `
    <div class="barra">
      <button class="btn-filtros" id="btnFiltros" type="button" aria-expanded="false" aria-controls="panelFiltros">Filtros</button>
      <span class="contador" id="contador" aria-live="polite"></span>
    </div>
    <div class="panel-filtros" id="panelFiltros" hidden>
      <label>Buscar<input id="fQ" type="search" placeholder="Ej: mesa, rack"></label>
      <label>Precio desde<input id="fMin" type="number" min="0" inputmode="numeric" placeholder="$"></label>
      <label>Precio hasta<input id="fMax" type="number" min="0" inputmode="numeric" placeholder="$"></label>
      <label>Ordenar por
        <select id="fOrden">
          <option value="">Sin orden</option>
          <option value="asc">Menor precio</option>
          <option value="desc">Mayor precio</option>
        </select></label>
      <button class="link" id="fLimpiar" type="button">Limpiar filtros</button>
    </div>
    <div class="grilla" id="grilla"></div>`;

  const panel = $("#panelFiltros"), btn = $("#btnFiltros");
  btn.addEventListener("click", () => {
    const abrir = panel.hidden;
    panel.hidden = !abrir;
    btn.setAttribute("aria-expanded", String(abrir));
  });
  [["fQ", "q"], ["fMin", "min"], ["fMax", "max"], ["fOrden", "orden"]].forEach(([id, k]) =>
    $("#" + id).addEventListener("input", e => { filtros[k] = e.target.value; actualizarGrilla(); }));
  $("#fLimpiar").addEventListener("click", () => {
    filtros = { q: "", min: "", max: "", orden: "" };
    ["fQ", "fMin", "fMax", "fOrden"].forEach(id => { $("#" + id).value = ""; });
    actualizarGrilla();
  });

  actualizarGrilla();
}

function productosFiltrados() {
  const q = filtros.q.trim().toLowerCase();
  const min = parseFloat(filtros.min), max = parseFloat(filtros.max);
  let r = PRODUCTOS.filter(p => !vistaCat || p.categoria_id === vistaCat.id);
  if (q) r = r.filter(p => (p.nombre + " " + (p.descripcion || "")).toLowerCase().includes(q));
  if (!isNaN(min)) r = r.filter(p => p.precio != null && p.precio >= min);
  if (!isNaN(max)) r = r.filter(p => p.precio != null && p.precio <= max);
  if (filtros.orden) {
    // Los "Consultar precio" quedan siempre al final
    r.sort((a, b) => a.precio == null ? 1 : b.precio == null ? -1
      : filtros.orden === "asc" ? a.precio - b.precio : b.precio - a.precio);
  }
  return r;
}

function actualizarGrilla() {
  const r = productosFiltrados();
  const hayFiltros = Object.values(filtros).some(Boolean);
  $("#contador").textContent = `Mostrando ${r.length} ${r.length === 1 ? "resultado" : "resultados"}`;

  $("#grilla").innerHTML = r.length ? r.map(p => `
    <button class="card" type="button" data-id="${esc(p.id)}">
      <div class="ph">${p.imagen ? `<img src="${esc(p.imagen)}" alt="${esc(p.nombre)}" loading="lazy">` : esc((p.nombre || "?")[0])}</div>
      <h3>${esc(p.nombre)}</h3><span class="precio">${money(p.precio)}</span>
    </button>`).join("")
    : hayFiltros
      ? `<p>No hay muebles con esos filtros. Probá limpiarlos.</p>`
      : `<p>Pronto vamos a sumar muebles acá. Mientras tanto, podés <a href="#/seccion/a-medida">pedir uno a medida</a>.</p>`;
}

$("#catalogo-contenido").addEventListener("click", e => {
  const b = e.target.closest(".card");
  if (b) location.hash = "#/mueble/" + b.dataset.id;
});

/* ---------- Detalle del mueble ---------- */
const dialogo = $("#detalle");

function abrirDetalle(p) {
  dialogo.innerHTML = `<div class="det">
    <button class="link x" id="cerrarDet" type="button">Cerrar</button>
    <div class="ph">${p.imagen ? `<img src="${esc(p.imagen)}" alt="${esc(p.nombre)}" loading="lazy">` : esc((p.nombre || "?")[0])}</div>
    <div><h2>${esc(p.nombre)}</h2><p>${esc(p.descripcion || "")}</p>
      <dl><dt>Material</dt><dd>MDF</dd>
      ${p.medidas ? `<dt>Medidas</dt><dd>${esc(p.medidas)}</dd>` : ""}
      ${p.entrega ? `<dt>Tiempo de entrega</dt><dd>${esc(p.entrega)}</dd>` : ""}
      <dt>Precio</dt><dd>${money(p.precio)}</dd></dl>
      <button class="btn" id="sumar" type="button" data-id="${esc(p.id)}">Agregar al carrito</button>
      <p class="nota">Imagen ilustrativa. Se fabrica por encargo.</p></div></div>`;
  if (!dialogo.open) dialogo.showModal();
  document.title = p.nombre + " | Valquir";
}

function cerrarDetalle() {
  if (dialogo.open) dialogo.close();
}

dialogo.addEventListener("close", () => {
  document.title = TITULO_BASE;
  if (location.hash.startsWith("#/mueble/")) history.replaceState(null, "", hashCatalogo);
});
dialogo.addEventListener("click", e => {
  if (e.target.id === "cerrarDet" || e.target === dialogo) cerrarDetalle();
  if (e.target.id === "sumar") { agregar(e.target.dataset.id); cerrarDetalle(); abrirCarrito(); }
});

/* ---------- Rutas ---------- */
function aplicarPagina(esInicio) {
  ["#portada", "#como-pedir", "#a-medida"].forEach(s => { $(s).hidden = !esInicio; });
  $("#faq").hidden = !(esInicio && hayFaq);
  $("#sobre").hidden = !(esInicio && haySobre);
}

function mostrarVista(a, b) {
  if (a === "categoria" && !CATEGORIAS.some(x => x.id === b)) { a = "catalogo"; b = ""; }
  aplicarPagina(a === "catalogo");

  const clave = a + "/" + (b || "");
  if (clave === vistaClave) return;
  vistaClave = clave;
  filtros = { q: "", min: "", max: "", orden: "" };

  if (errorCatalogo) {
    $("#catalogo-contenido").innerHTML = `<p>No pudimos cargar el catálogo. Probá de nuevo en unos minutos.</p>`;
    return;
  }
  if (a === "categoria") vistaProductos(CATEGORIAS.find(x => x.id === b));
  else if (a === "todos") vistaProductos(null);
  else vistaCategorias();
}

function ruta({ scroll = true } = {}) {
  if (!cargado) return;
  const [a, b] = location.hash.replace(/^#\/?/, "").split("/");

  if (a === "mueble") {
    const p = PRODUCTOS.find(x => x.id === b);
    if (p) {
      if (!vistaClave) mostrarVista("categoria", p.categoria_id);
      abrirDetalle(p);
      return;
    }
  }
  cerrarDetalle();

  if (a === "categoria" || a === "todos") {
    mostrarVista(a, b);
    if (scroll) window.scrollTo({ top: 0, behavior: "smooth" });
    return;
  }

  mostrarVista("catalogo");
  if (!scroll) return;
  const destino = a === "seccion" ? document.getElementById(b) : a === "catalogo" ? $("#catalogo") : null;
  if (destino && !destino.hidden) {
    requestAnimationFrame(() => destino.scrollIntoView({ behavior: "smooth", block: "start" }));
  } else {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
}

window.addEventListener("hashchange", () => ruta());

document.addEventListener("click", e => {
  const a = e.target.closest('a[href^="#/"]');
  if (a && a.hash === location.hash) { e.preventDefault(); ruta(); }
});

/* ---------- Presupuesto a medida ---------- */
$("#mEnviar").addEventListener("click", () => {
  const aviso = $("#mAviso");
  const nombre = $("#mNombre").value.trim(), texto = $("#mTexto").value.trim();

  if (!texto) { aviso.textContent = "Contanos qué necesitás para armar el presupuesto."; return; }
  aviso.textContent = "";

  const txt = ["Hola! Quiero pedir presupuesto de un mueble a medida.",
    "Detalle: " + texto,
    nombre ? "Nombre: " + nombre : ""].filter(Boolean).join("\n");

  window.open(waLink(txt), "_blank", "noopener");
});

/* ---------- Preguntas frecuentes y "Sobre nosotros" ---------- */
function pintarFaq(lista) {
  hayFaq = lista.length > 0;
  if (!hayFaq) return;
  $("#faqLista").innerHTML = lista.map(f =>
    `<details name="faq-acordeon"><summary>${esc(f.pregunta)}</summary><p>${esc(f.respuesta)}</p></details>`).join("");
}

function pintarSobre(lista) {
  const s = lista.find(x => x.clave === "sobre");
  haySobre = !!s;
  if (!s) return;
  $("#sobre").innerHTML = `<h2>${esc(s.titulo)}</h2><p>${esc(s.texto || "")}</p>`;
}

/* ---------- Encabezado, menú del celular y WhatsApp ---------- */
const cabecera = $(".top");

const medirCabecera = () => document.documentElement.style.setProperty("--alto-header", cabecera.offsetHeight + "px");
medirCabecera();
new ResizeObserver(medirCabecera).observe(cabecera);

addEventListener("scroll", () => cabecera.classList.toggle("scrolled", scrollY > 8), { passive: true });

const menuBtn = $("#menuBtn"), menuNav = $("#menuNav");
function cerrarMenu() {
  menuNav.classList.remove("abierto");
  menuBtn.setAttribute("aria-expanded", "false");
}
menuBtn.addEventListener("click", () => {
  const abrir = !menuNav.classList.contains("abierto");
  menuNav.classList.toggle("abierto", abrir);
  menuBtn.setAttribute("aria-expanded", String(abrir));
});
menuNav.addEventListener("click", e => { if (e.target.closest("a")) cerrarMenu(); });
$("#abrirCarritoMenu").addEventListener("click", () => { cerrarMenu(); abrirCarrito(); });
document.addEventListener("keydown", e => { if (e.key === "Escape") cerrarMenu(); });

$("#wafloat").href = waLink("Hola! Quisiera hacer una consulta.");

/* ---------- Arranque ---------- */
async function iniciar() {
  const [cats, prods, faq, secs, portada] = await Promise.allSettled([
    api.categorias(), api.productos(), api.faq(), api.secciones(), api.portada()
  ]);
  const ok = r => r.status === "fulfilled" ? r.value : null;

  errorCatalogo = !ok(cats) || !ok(prods);

  // ⚠️ IMPORTANTE: mutar los arrays existentes, NO reasignarlos.
  // Si reasignás (CATEGORIAS = []), cart.js queda apuntando a la referencia vieja
  // y el carrito se vacía solo.
  CATEGORIAS.length = 0;
  CATEGORIAS.push(...(ok(cats) || []));

  PRODUCTOS.length = 0;
  PRODUCTOS.push(...(ok(prods) || []).map(p => ({
    ...p,
    precio: p.precio == null ? null : Number(p.precio)
  })));

  pintarFaq(ok(faq) || []);
  pintarSobre(ok(secs) || []);
  iniciarPortada(ok(portada) || []);
  pintarCarrito();

  cargado = true;
  const hayRuta = location.hash.replace(/^#\/?/, "") !== "";
  ruta({ scroll: hayRuta });
}

iniciar();