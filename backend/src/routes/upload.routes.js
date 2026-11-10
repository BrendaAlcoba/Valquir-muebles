const router = require("express").Router();
const multer = require("multer");
const auth = require("../middlewares/auth");
const { subir } = require("../controllers/upload.controller");

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }
});

// El front (panel.js) manda el archivo en el campo "archivo"
router.post("/", auth, upload.single("archivo"), subir);

module.exports = router;