const crypto = require("crypto");
const db = require("../config/db");
const { EXT, esImagenValida } = require("../utils/imagen");

exports.subir = async (req, res, next) => {
  try {
    if (!esImagenValida(req.file)) {
      return res.status(400).json({ error: "Imagen no válida (JPG, PNG o WebP, hasta 5 MB)" });
    }
    const nombre = `${crypto.randomUUID()}.${EXT[req.file.mimetype]}`;

    const { error } = await db.storage
      .from("referencias")
      .upload(nombre, req.file.buffer, { contentType: req.file.mimetype });
    if (error) throw error;

    const { data } = db.storage.from("referencias").getPublicUrl(nombre);
    res.status(201).json({ url: data.publicUrl });
  } catch (err) { next(err); }
};