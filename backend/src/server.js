require("dotenv").config();
const app = require("./app");

const port = process.env.PORT || 3000;

app.listen(port, err => {
  if (err) {
    console.error("No se pudo iniciar el servidor:", err.message);
    process.exit(1);
  }
  console.log(`API lista en http://localhost:${port}`);
});