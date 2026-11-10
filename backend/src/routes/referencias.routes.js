const router = require("express").Router();
const multer = require("multer");
const rateLimit = require("express-rate-limit");
const { subir } = require("../controllers/referencias.controller");

const limite = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  message: { error: "Demasiados intentos, probá de nuevo más tarde" }
});

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }
});

router.post("/", limite, upload.single("imagen"), subir);

module.exports = router;