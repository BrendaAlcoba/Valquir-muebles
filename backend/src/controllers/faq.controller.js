const crud = require("./crud");

module.exports = crud("faq", {
  orden: "orden",
  campos: ["pregunta", "respuesta", "visible", "orden"]
});