const crud = require("./crud");

module.exports = crud("portada", {
  orden: "orden",
  campos: ["imagen", "descripcion", "visible", "orden"]
});