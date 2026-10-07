/* =========================================================
   CONFIGURACIÓN: lo único que necesitas editar
   ========================================================= */
const CONFIG = {
  // Número con código de país, sin "+", espacios ni guiones (México = 52)
  whatsapp: "5651300206",
  mensaje: "¡Hola! Confirmo mi asistencia a los XV años de Janet Jahdai.",

  // Sábado 12 de diciembre de 2026, 6:30 p.m. hora del centro de México (UTC-6).
  // Se expresa en UTC para que la cuenta sea exacta desde cualquier país.
  fechaEvento: Date.UTC(2026, 11, 13, 0, 30, 0)
};

/* ===== WhatsApp ===== */
(function () {
  const boton = document.getElementById("botonWhatsapp");
  if (!boton) return;
  boton.href = "https://wa.me/" + CONFIG.whatsapp + "?text=" + encodeURIComponent(CONFIG.mensaje);
})();

/* ===== Cuenta regresiva ===== */
(function () {
  const campos = {
    dias: document.getElementById("dias"),
    horas: document.getElementById("horas"),
    minutos: document.getElementById("minutos"),
    segundos: document.getElementById("segundos")
  };
  if (!campos.dias) return;

  const dosDigitos = (n) => String(n).padStart(2, "0");
  let intervalo;

  function actualizar() {
    // Si la fecha ya pasó, todo queda en cero
    const restante = Math.max(0, CONFIG.fechaEvento - Date.now());
    const s = Math.floor(restante / 1000);

    campos.dias.textContent = dosDigitos(Math.floor(s / 86400));
    campos.horas.textContent = dosDigitos(Math.floor((s % 86400) / 3600));
    campos.minutos.textContent = dosDigitos(Math.floor((s % 3600) / 60));
    campos.segundos.textContent = dosDigitos(s % 60);

    if (restante === 0 && intervalo) clearInterval(intervalo);
  }

  actualizar();
  intervalo = setInterval(actualizar, 1000);
})();

/* ===== Música =====
   Los navegadores móviles bloquean el audio automático,
   así que solo empieza cuando la persona toca el botón. */
(function () {
  const audio = document.getElementById("musica");
  const boton = document.getElementById("botonMusica");
  const flotante = document.getElementById("musicaFlotante");
  const portada = document.getElementById("portada");
  if (!audio || !boton) return;

  const icono = boton.querySelector(".ti");
  const texto = boton.querySelector("span");
  const iconoFlotante = flotante ? flotante.querySelector(".ti") : null;
  let disponible = true;
  let portadaVisible = true;

  function pintar(sonando) {
    if (!disponible) return;
    boton.setAttribute("aria-pressed", String(sonando));
    icono.className = sonando ? "ti ti-player-pause" : "ti ti-music";
    texto.textContent = sonando ? "Pausar música" : "Clic para reproducir";

    if (flotante) {
      flotante.setAttribute("aria-pressed", String(sonando));
      flotante.setAttribute("aria-label", sonando ? "Pausar música" : "Reproducir música");
      iconoFlotante.className = sonando ? "ti ti-player-pause" : "ti ti-music";
    }
    mostrarFlotante();
  }

  function marcarNoDisponible() {
    disponible = false;
    boton.setAttribute("aria-pressed", "false");
    icono.className = "ti ti-music-off";
    texto.textContent = "Música no disponible";
    if (flotante) flotante.hidden = true;
  }

  function alternar() {
    if (!disponible) return;
    if (audio.paused) {
      const intento = audio.play();
      if (intento && typeof intento.catch === "function") {
        intento.catch(function (error) {
          // NotAllowedError: el navegador pidió otro toque. Cualquier otro error: falta el archivo.
          if (error && error.name === "NotAllowedError") pintar(false);
          else marcarNoDisponible();
        });
      }
    } else {
      audio.pause();
    }
  }

  // El botón flotante aparece solo cuando la portada ya no se ve y la música se activó alguna vez
  let activada = false;
  function mostrarFlotante() {
    if (!flotante || !disponible) return;
    flotante.hidden = portadaVisible || !activada;
  }

  boton.addEventListener("click", alternar);
  if (flotante) flotante.addEventListener("click", alternar);

  audio.addEventListener("play", function () { activada = true; pintar(true); });
  audio.addEventListener("pause", function () { pintar(false); });
  audio.addEventListener("error", marcarNoDisponible);

  if (portada && "IntersectionObserver" in window) {
    new IntersectionObserver(function (entradas) {
      portadaVisible = entradas[0].isIntersecting;
      mostrarFlotante();
    }, { threshold: 0.15 }).observe(portada);
  }
})();
