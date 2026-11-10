const express = require("express");
const path = require("path");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const errorHandler = require("./middlewares/errorHandler");

const app = express();
const origenes = (process.env.CORS_ORIGINS || "").split(",").map(s => s.trim()).filter(Boolean);

app.set("trust proxy", 1);

app.use(helmet());

app.use(cors({
  origin: origenes.length ? origenes : false,
  credentials: false
}));

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

app.use(express.static(path.join(__dirname, "../../frontend")));

app.get("/api/salud", (req, res) => res.json({ ok: true }));

const limiteLogin = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  validate: { xForwardedForHeader: false }
});

app.use("/api/auth", limiteLogin, require("./routes/auth.routes"));

app.use("/api/categorias", require("./routes/categorias.routes"));
app.use("/api/productos", require("./routes/productos.routes"));
app.use("/api/faq", require("./routes/faq.routes"));
app.use("/api/secciones", require("./routes/secciones.routes"));
app.use("/api/portada", require("./routes/portada.routes"));
app.use("/api/upload", require("./routes/upload.routes"));
app.use("/api/referencias", require("./routes/referencias.routes"));
app.use("/api/ventas", require("./routes/ventas.routes"));

app.use((req, res) => res.status(404).json({ error: "No encontrado" }));
app.use(errorHandler);

module.exports = app;