const router = require("express").Router();
const auth = require("../middlewares/auth");
const c = require("../controllers/portada.controller");

router.get("/", c.publicos);
router.get("/admin/todos", auth, c.todos);
router.post("/", auth, c.crear);
router.put("/:id", auth, c.editar);
router.delete("/:id", auth, c.borrar);

module.exports = router;