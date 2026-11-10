const crud = require("./crud");

module.exports = crud("categorias", {
  orden: "orden",
  campos: ["id", "nombre", "imagen", "visible", "orden"]
});