const db = require("../config/db");

// Solo se aceptan los campos permitidos de cada tabla
const limpiar = (body = {}, campos) =>
  Object.fromEntries(Object.entries(body).filter(([k]) => campos.includes(k)));

module.exports = (tabla, { pk = "id", orden, campos }) => ({
  publicos: async (req, res, next) => {
    try {
      const { data, error } = await db.from(tabla).select("*").eq("visible", true).order(orden);
      if (error) throw error;
      res.json(data);
    } catch (err) { next(err); }
  },

  todos: async (req, res, next) => {
    try {
      const { data, error } = await db.from(tabla).select("*").order(orden);
      if (error) throw error;
      res.json(data);
    } catch (err) { next(err); }
  },

  crear: async (req, res, next) => {
    try {
      const { data, error } = await db.from(tabla).insert(limpiar(req.body, campos)).select().single();
      if (error) throw error;
      res.status(201).json(data);
    } catch (err) { next(err); }
  },

  editar: async (req, res, next) => {
    try {
      const { data, error } = await db.from(tabla).update(limpiar(req.body, campos))
        .eq(pk, req.params.id).select();
      if (error) throw error;
      if (!data || !data.length) return res.status(404).json({ error: "Registro no encontrado" });
      res.json(data[0]);
    } catch (err) { next(err); }
  },

  borrar: async (req, res, next) => {
    try {
      const { data, error } = await db.from(tabla).delete().eq(pk, req.params.id).select();
      if (error) throw error;
      if (!data || !data.length) return res.status(404).json({ error: "Registro no encontrado" });
      res.status(204).end();
    } catch (err) { next(err); }
  }
});