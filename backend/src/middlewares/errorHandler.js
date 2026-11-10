module.exports = (err, req, res, next) => {
  // Multer
  if (err.code === "LIMIT_FILE_SIZE") {
    return res.status(413).json({ error: "La imagen supera los 5 MB" });
  }

  // Supabase / Postgres
  if (err.code === "23505") return res.status(409).json({ error: "Ya existe un registro con ese valor único" });
  if (err.code === "23503") return res.status(409).json({ error: "No se puede borrar: tiene registros relacionados" });
  if (err.code === "PGRST116") return res.status(404).json({ error: "Registro no encontrado" });

  // Log con timestamp
  console.error(`[${new Date().toISOString()}]`, err.code || "", err.message || err);

  res.status(500).json({ error: "Error del servidor" });
};