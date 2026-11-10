const router = require("express").Router();
const supabase = require("../config/db"); // ← unificado: ya no usa config/supabase
const verificarToken = require("../middlewares/auth");

// 1. Obtener todas las ventas (para uso general)
router.get("/", verificarToken, async (req, res, next) => {
  try {
    const { data, error } = await supabase.from("ventas").select("*").order("created_at", { ascending: false });
    if (error) throw error;
    res.json(data);
  } catch (err) { next(err); }
});

// 2. Dashboard del panel
router.get("/admin/todos", verificarToken, async (req, res, next) => {
  try {
    const { data, error } = await supabase.from("ventas").select("*").order("created_at", { ascending: false });
    if (error) throw error;
    res.json(data);
  } catch (err) { next(err); }
});

// 3. Registrar una nueva venta
router.post("/", verificarToken, async (req, res, next) => {
  try {
    const { producto_id, nombre_producto, precio_venta, costo_materiales, cliente, notas } = req.body || {};

    if (!nombre_producto || String(nombre_producto).trim() === "") {
      return res.status(400).json({ error: "Falta el nombre del producto" });
    }
    const ventaValida = Number(precio_venta);
    if (!Number.isFinite(ventaValida) || ventaValida < 0) {
      return res.status(400).json({ error: "precio_venta inválido" });
    }
    const costoValido = Number(costo_materiales) || 0;
    if (!Number.isFinite(costoValido) || costoValido < 0) {
      return res.status(400).json({ error: "costo_materiales inválido" });
    }
    const ganancia = ventaValida - costoValido;

    const { data, error } = await supabase.from("ventas").insert([{
      producto_id: producto_id || null,
      nombre_producto: String(nombre_producto).trim(),
      precio_venta: ventaValida,
      costo_materiales: costoValido,
      ganancia_neta: ganancia,
      cliente: cliente || null,
      notas: notas || null
    }]).select();

    if (error) throw error;
    res.status(201).json(data[0]);
  } catch (err) { next(err); }
});

// 4. Editar una venta
router.put("/:id", verificarToken, async (req, res, next) => {
  try {
    const { nombre_producto, precio_venta, costo_materiales, cliente, notas } = req.body || {};

    const ventaValida = Number(precio_venta);
    if (!Number.isFinite(ventaValida) || ventaValida < 0) {
      return res.status(400).json({ error: "precio_venta inválido" });
    }
    const costoValido = Number(costo_materiales) || 0;
    if (!Number.isFinite(costoValido) || costoValido < 0) {
      return res.status(400).json({ error: "costo_materiales inválido" });
    }
    const ganancia = ventaValida - costoValido;

    const { data, error } = await supabase.from("ventas").update({
      nombre_producto,
      precio_venta: ventaValida,
      costo_materiales: costoValido,
      ganancia_neta: ganancia,
      cliente: cliente || null,
      notas: notas || null
    }).eq("id", req.params.id).select();

    if (error) throw error;
    if (!data || !data.length) return res.status(404).json({ error: "Venta no encontrada" });
    res.json(data[0]);
  } catch (err) { next(err); }
});

// 5. Borrar una venta
router.delete("/:id", verificarToken, async (req, res, next) => {
  try {
    const { error } = await supabase.from("ventas").delete().eq("id", req.params.id);
    if (error) throw error;
    res.status(204).send();
  } catch (err) { next(err); }
});

module.exports = router;