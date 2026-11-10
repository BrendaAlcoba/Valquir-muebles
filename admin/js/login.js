if (token()) location.href = "panel.html";

$("#f").addEventListener("submit", async e => {
  e.preventDefault();
  const b = $("#b"), aviso = $("#aviso");
  aviso.textContent = "";
  b.disabled = true;
  try {
    const r = await pedir("/auth/login", {
      method: "POST",
      body: { email: $("#email").value.trim(), password: $("#pass").value }
    });
    if (!r || !r.token) throw new Error("Respuesta inválida del servidor");
    localStorage.setItem("adminToken", r.token);
    location.href = "panel.html";
  } catch (err) {
    aviso.textContent = err.message;
    b.disabled = false;
  }
});