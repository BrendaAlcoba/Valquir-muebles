let carrito = [];
try { carrito = JSON.parse(localStorage.getItem("carrito")) || []; } catch { carrito = []; }
const guardarCarrito = () => { try { localStorage.setItem("carrito", JSON.stringify(carrito)); } catch {} };

const panelCarrito = $("#carrito");
panelCarrito.inert = true; // cerrado: no se puede enfocar con el teclado

function agregar(id) {
  const it = carrito.find(x => x.id === id);
  it ? it.n++ : carrito.push({ id, n: 1 });
  guardarCarrito();
  pintarCarrito();
}

function pintarCarrito() {
  // Si un mueble ya no existe en el catálogo, se quita del carrito
  if (PRODUCTOS.length) carrito = carrito.filter(i => PRODUCTOS.some(p => p.id === i.id));
  const total = carrito.reduce((s, i) => s + i.n, 0);
  document.querySelectorAll("[data-cuenta]").forEach(el => {
    const cambio = el.textContent !== String(total);
    el.textContent = total;
    el.hidden = total === 0;
    if (cambio) { el.classList.remove("pop"); void el.offsetWidth; el.classList.add("pop"); }
  });
  $("#items").innerHTML = carrito.length ? carrito.map(i => {
    const p = PRODUCTOS.find(x => x.id === i.id);
    if (!p) return "";
    return `<div class="it">
      <div><b>${esc(p.nombre)}</b><br><span class="precio">${money(p.precio)}</span></div>
      <div class="qty">
        <button type="button" data-a="-" data-id="${esc(i.id)}" aria-label="Quitar uno">−</button>${i.n}
        <button type="button" data-a="+" data-id="${esc(i.id)}" aria-label="Agregar uno">+</button>
      </div></div>`;
  }).join("") : `<p class="nota">Todavía no agregaste muebles. Elegí uno del catálogo.</p>`;
}

function abrirCarrito() {
  panelCarrito.inert = false;
  panelCarrito.classList.add("abierto");
  $("#velo").hidden = false;
  $("#cerrarCarrito").focus();
}
function cerrarCarrito() {
  panelCarrito.classList.remove("abierto");
  panelCarrito.inert = true;
  $("#velo").hidden = true;
}

$("#items").addEventListener("click", e => {
  const b = e.target.closest("button[data-a]");
  if (!b) return;
  const it = carrito.find(x => x.id === b.dataset.id);
  if (!it) return;
  it.n += b.dataset.a === "+" ? 1 : -1;
  if (it.n <= 0) carrito = carrito.filter(x => x !== it);
  guardarCarrito();
  pintarCarrito();
});

$("#abrirCarrito").addEventListener("click", abrirCarrito);
$("#cerrarCarrito").addEventListener("click", cerrarCarrito);
$("#velo").addEventListener("click", cerrarCarrito);
document.addEventListener("keydown", e => { if (e.key === "Escape") cerrarCarrito(); });

$("#enviar").addEventListener("click", () => {
  const aviso = $("#cAviso");
  if (!carrito.length) { aviso.textContent = "Agregá al menos un mueble al carrito."; return; }
  aviso.textContent = "";

  const lineas = carrito.map(i => {
    const p = PRODUCTOS.find(x => x.id === i.id);
    return p ? `• ${i.n} x ${p.nombre}` : "";
  }).filter(Boolean);
  const nombre = $("#cNombre").value.trim();
  const nota = $("#cNota").value.trim();

  const txt = ["Hola! Quiero hacer este pedido:", ...lineas,
    nota ? "Color y aclaraciones: " + nota : "",
    nombre ? "Nombre: " + nombre : ""].filter(Boolean).join("\n");

  window.open(waLink(txt), "_blank", "noopener");
});