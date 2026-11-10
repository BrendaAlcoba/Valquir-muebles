const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  const token = (req.headers.authorization || "").replace("Bearer ", "");
  if (!token) return res.status(401).json({ error: "No autorizado" });
  try {
    req.admin = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch (err) {
    console.warn("JWT inválido:", err.message);
    res.status(401).json({ error: "No autorizado" });
  }
};