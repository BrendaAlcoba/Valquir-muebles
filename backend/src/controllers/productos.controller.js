const crud = require("./crud");
const db = require("../config/db");

const MAX_IMAGENES = 5;

const productos = crud("productos", {
  orden: "creado",
  campos: ["categoria_id", "nombre", "descripcion", "precio", "medidas", "entrega", "imagen", "imagenes", "visible"]
});

productos.publicos = async (req, res, next) => {
  try {
    const { data, error } = await db
      .from("productos")
      .select("*, categorias!inner(visible)")
      .eq("visible", true)
      .eq("categorias.visible", true)
      .order("creado", { ascending: false });
    if (error) throw error;
    res.json(data);
  } catch (err) { next(err); }
};

productos.normalizar = (req, res, next) => {
  const b = req.body;
  if (b && "imagenes" in b) {
    const lista = Array.isArray(b.imagenes) ? b.imagenes : [];
    const limpias = lista.filter(u => typeof u === "string" && /^https?:\/\//.test(u) && u.length <= 500);
    if (limpias.length > MAX_IMAGENES) {
      return res.status(400).json({ error: `Máximo ${MAX_IMAGENES} fotos por mueble` });
    }
    b.imagenes = limpias;
    b.imagen = limpias[0] || null;
  }
  next();
};

module.exports = productos;