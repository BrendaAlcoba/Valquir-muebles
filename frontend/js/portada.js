function iniciarPortada(slides) {
  const hero = $("#portada");
  if (!slides.length) return; // sin fotos: queda el fondo liso

  hero.classList.remove("sin-fotos");
  $("#slides").innerHTML = slides.map((s, i) =>
    `<img src="${esc(s.imagen)}" alt="${esc(s.descripcion || "Mueble de MDF")}"
      ${i === 0 ? 'class="activa" fetchpriority="high"' : 'loading="lazy"'}>`).join("");

  if (slides.length < 2) { $("#dots").hidden = true; return; }

  const imgs = [...$("#slides").children];
  $("#dots").innerHTML = imgs.map((_, i) =>
    `<button type="button" class="${i === 0 ? "on" : ""}" aria-label="Ver foto ${i + 1}"></button>`).join("");
  const puntos = [...$("#dots").children];

  let actual = 0, timer = null;

  function ir(n) {
    imgs[actual].classList.remove("activa");
    puntos[actual].classList.remove("on");
    actual = (n + imgs.length) % imgs.length;
    imgs[actual].classList.add("activa");
    puntos[actual].classList.add("on");
  }
  const iniciar = () => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    detener();
    timer = setInterval(() => ir(actual + 1), 6000);
  };
  const detener = () => { clearInterval(timer); timer = null; };

  puntos.forEach((p, i) => p.addEventListener("click", () => { ir(i); iniciar(); }));

  hero.addEventListener("mouseenter", detener);
  hero.addEventListener("mouseleave", iniciar);
  hero.addEventListener("focusin", detener);
  hero.addEventListener("focusout", iniciar);
  document.addEventListener("visibilitychange", () => document.hidden ? detener() : iniciar());

  // Deslizar con el dedo en el celular
  let x0 = null;
  hero.addEventListener("touchstart", e => { x0 = e.touches[0].clientX; }, { passive: true });
  hero.addEventListener("touchend", e => {
    if (x0 === null) return;
    const dx = e.changedTouches[0].clientX - x0;
    if (Math.abs(dx) > 50) { ir(actual + (dx < 0 ? 1 : -1)); iniciar(); }
    x0 = null;
  });

  iniciar();
}