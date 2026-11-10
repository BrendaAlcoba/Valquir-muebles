// URL del backend: cambia automáticamente según el entorno
const API_URL = (
  location.hostname === "localhost" || location.hostname === "127.0.0.1"
    ? "http://localhost:3000/api"
    : "https://valquir-muebles.onrender.com/api" // <-- Acá va tu URL de Render
);

const WHATSAPP = "5492612715912";

// Estado global compartido (se define acá para que cart.js y portada.js
// puedan usarlo sin depender del orden de carga de app.js)
let PRODUCTOS = [];
let CATEGORIAS = [];

// Helpers
const $ = (selector) => document.querySelector(selector);
const esc = (str) => String(str ?? "").replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[m]);
const money = (num) => num != null && !isNaN(num) ? "$" + Number(num).toLocaleString('es-AR') : "Consultar precio";
const waLink = (txt) => `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(txt)}`;