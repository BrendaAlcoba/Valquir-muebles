const EXT = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" };

const firmas = {
  "image/jpeg": b => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff,
  "image/png": b => b.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])),
  "image/webp": b => b.subarray(0, 4).toString() === "RIFF" && b.subarray(8, 12).toString() === "WEBP"
};

const esImagenValida = f => Boolean(f && firmas[f.mimetype] && firmas[f.mimetype](f.buffer));

module.exports = { EXT, esImagenValida };