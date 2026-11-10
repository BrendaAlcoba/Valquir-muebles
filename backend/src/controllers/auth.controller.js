const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

// Comparación en tiempo constante para el email (evita timing attacks)
function igualdadSegura(a, b) {
  const ba = Buffer.from(String(a));
  const bb = Buffer.from(String(b));
  if (ba.length !== bb.length) return false;
  return crypto.timingSafeEqual(ba, bb);
}

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body || {};
    const emailOk = igualdadSegura(email || "", process.env.ADMIN_EMAIL || "");
    const hash = process.env.ADMIN_PASSWORD_HASH;

    if (!emailOk || !hash) {
      return res.status(401).json({ error: "Email o contraseña incorrectos" });
    }

    const passOk = await bcrypt.compare(String(password || ""), hash);
    if (!passOk) {
      return res.status(401).json({ error: "Email o contraseña incorrectos" });
    }

    const token = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: "8h" });
    res.json({ token });
  } catch (err) {
    console.error("Error en login:", err);
    res.status(500).json({ error: "Error del servidor" });
  }
};