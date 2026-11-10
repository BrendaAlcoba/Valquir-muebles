const crud = require("./crud");

module.exports = crud("secciones", {
  pk: "clave",
  orden: "clave",
  campos: ["clave", "titulo", "texto", "visible"]
});