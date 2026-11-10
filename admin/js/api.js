const API_URL = "http://localhost:3000/api"; // al publicar: la dirección de tu backend + /api
const $ = s => document.querySelector(s);
const $$ = s => document.querySelectorAll(s);
const esc = s => String(s ?? "").replace(/[&<>"']/g, c =>
  ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const token = () => localStorage.getItem("adminToken");

// Detectar si estamos abriendo el HTML con file:// (que rompe las peticiones)
if (location.protocol === "file:") {
  console.warn("⚠ Estás abriendo el panel con file://. Usá un servidor local (Live Server, npx serve, etc.) para que las peticiones al backend funcionen.");
}

async function pedir(ruta, { method = "GET", body, form } = {}) {
  const headers = {};
  if (token()) headers.Authorization = "Bearer " + token();
  if (body && !form) headers["Content-Type"] = "application/json";

  let res;
  try {
    res = await fetch(API_URL + ruta, {
      method,
      headers,
      body: form || (body ? JSON.stringify(body) : undefined)
    });
  } catch (err) {
    console.error("Error de red:", err);
    throw new Error("No hay conexión con el servidor. Verificá que el backend esté corriendo en " + API_URL);
  }

  if (res.status === 401 && !ruta.startsWith("/auth")) {
    localStorage.removeItem("adminToken");
    location.href = "index.html";
    throw new Error("Sesión vencida");
  }

  const datos = res.status === 204 ? null : await res.json().catch(() => null);
  if (!res.ok) throw new Error((datos && datos.error) || `Error ${res.status}: ${res.statusText}`);
  return datos;
}