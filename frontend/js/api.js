async function pedir(ruta, opciones = {}) {
  let res;
  try {
    res = await fetch(API_URL + ruta, opciones);
  } catch {
    throw new Error("No hay conexión con el servidor");
  }
  let datos = null;
  try { datos = await res.json(); } catch {}
  if (!res.ok) throw new Error((datos && datos.error) || "Ocurrió un error");
  return datos;
}

const api = {
  categorias: () => pedir("/categorias"),
  productos: () => pedir("/productos"),
  faq: () => pedir("/faq"),
  secciones: () => pedir("/secciones"),
  portada: () => pedir("/portada"),
  subirReferencia(archivo) {
    const fd = new FormData();
    fd.append("imagen", archivo);
    return pedir("/referencias", { method: "POST", body: fd });
  }
};