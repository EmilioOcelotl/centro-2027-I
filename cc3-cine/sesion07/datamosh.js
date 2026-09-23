// Sesión 07 · Datamosh — Código Creativo 3 · Cine
//
// La cámara pasa por un codificador de video (VP8, como en un archivo .webm)
// y cada cuadro de movimiento se decodifica dos veces o más. El movimiento se
// suma sobre sí mismo: lo que se mueve arrastra los pixeles y la imagen se
// derrite. Lo que está quieto se queda. Un cuadro limpio (keyframe) borra todo
// y vuelve a empezar.
//
// Correr todo: Ctrl+Shift+Enter. La primera vez espera a la cámara y a la
// librería; después basta con volver a correr el bloque del sketch: el cursor
// adentro y Ctrl+Enter. Funciona en Chrome.
//
// Librería: https://emptyfla.sh/hydra-datamosh/


// ── ARRANQUE · no hace falta tocarlo ────────────────────────────────
//
// s0 es la cámara y mosh es la cámara ya derretida.
//
// Sin cámara: pacman = true y un pacman que va y viene toma el lugar de la
// cámara en s0. Todo lo demás funciona igual. Para cambiar entre cámara y
// pacman hay que recargar la página, porque el arranque corre una sola vez.

pacman = false

// Las perillas se pueden cambiar en cualquier momento, con Ctrl+Enter sobre
// la línea:

rapidez = 2        // cuántas veces se repite cada cuadro de movimiento; 1 es limpio
cada = 6           // segundos entre cuadros limpios; 0 es nunca

// limpiar(), escrita sola y con Ctrl+Enter, mete un cuadro limpio al momento.
limpiar = () => {
  ajustes.keyFrame = true
  ultimaLimpieza = performance.now()
}

if (!window.mosh) {              // volver a correr todo no duplica cámara ni codificador
  let imagen                     // lo que entra: el video de la cámara o el lienzo del pacman
  if (pacman) {
    imagen = crearPacman()
    s0.init({ src: imagen })
  } else {
    s0.initCam()
    for (let t = 0; !(s0.src && s0.src.videoWidth); t++) {
      if (t > 300) throw new Error("no llegó la cámara. ¿Tiene permiso el navegador? Sin cámara: pacman = true")
      await new Promise(listo => setTimeout(listo, 100))
    }
    imagen = s0.src
  }
  const ancho = imagen.videoWidth || imagen.width
  const alto = imagen.videoHeight || imagen.height

  // La librería codifica un lienzo a 640 de ancho: más chico es más rápido y
  // los bloques del mosh se ven más.
  const entrada = document.createElement("canvas")
  entrada.width = 640
  entrada.height = Math.round(640 * alto / ancho / 2) * 2
  const ctx = entrada.getContext("2d")

  ajustes = { speed: rapidez }   // la librería lee speed y keyFrame de aquí en cada cuadro
  ultimaLimpieza = performance.now()

  const dibujar = () => {
    requestAnimationFrame(dibujar)
    ctx.drawImage(imagen, 0, 0, entrada.width, entrada.height)
    ajustes.speed = rapidez
    if (cada > 0 && performance.now() - ultimaLimpieza > cada * 1000) limpiar()
  }
  dibujar()

  // Si la computadora no alcanza a decodificar, la librería acumula cuadros y
  // lo que se ve llega segundos tarde: limpiar() parece no hacer nada. Con más
  // de 6 en espera se tiran cuadros de movimiento, nunca los limpios. Tirarlos
  // también es mosh.
  const decodificar = VideoDecoder.prototype.decode
  VideoDecoder.prototype.decode = function (cuadro) {
    if (cuadro.type === "delta" && this.decodeQueueSize > 6) return
    return decodificar.call(this, cuadro)
  }

  const { datamosh } = await import("https://emptyfla.sh/hydra-datamosh/datamosh.js")
  mosh = await datamosh({ src: entrada }, ajustes)
}

// Un pacman que va y viene sobre una fila de puntos, en un lienzo de 640×480.
// Se dibuja al revés porque el sketch voltea s0 en espejo, como a la cámara.
function crearPacman () {
  const lienzo = document.createElement("canvas")
  lienzo.width = 640
  lienzo.height = 480
  const c = lienzo.getContext("2d")
  const pintar = ms => {
    requestAnimationFrame(pintar)
    const s = ms / 1000
    c.setTransform(-1, 0, 0, 1, 640, 0)                // el espejo
    c.fillStyle = "#006400"
    c.fillRect(0, 0, 640, 480)
    c.fillStyle = "#c8ffb0"
    for (let x = 40; x < 640; x += 60) c.fillRect(x - 6, 234, 12, 12)
    const x = 320 + Math.sin(s * 0.7) * 230            // va y viene
    const mira = Math.cos(s * 0.7) >= 0 ? 1 : -1       // hacia donde avanza
    const boca = Math.abs(Math.sin(s * 9)) * 0.8       // abre y cierra
    c.translate(x, 240)
    c.scale(mira, 1)
    c.fillStyle = "#b4ff32"
    c.beginPath()
    c.moveTo(0, 0)
    c.arc(0, 0, 80, boca, 2 * Math.PI - boca)
    c.fill()
    c.setTransform(-1, 0, 0, 1, 640, 0)
    c.fillStyle = "#b4ff32"
    c.font = "bold 40px monospace"
    c.fillText(s.toFixed(1).padStart(6, "0"), 40, 70)  // un reloj: el texto también se derrite
  }
  pintar(0)
  return lienzo
}


// ── EL SKETCH · esto sí se toca ─────────────────────────────────────
//
// camara y derretida son funciones y no variables porque en Hydra cada
// .algo() modifica la cadena que lo recibe. Las dos van en espejo. Con
// pacman = true, camara() es el pacman limpio.

camara = () => src(s0).scale(1, -1, 1)
derretida = () => src(mosh).scale(1, -1, 1)

derretida()
  .out()


// ── VARIACIONES ─────────────────────────────────────────────────────
//
// Cambiar la última cadena y Ctrl+Enter.
//
// Lo que se movió: negro donde el mosh coincide con la cámara, color donde
// se separó.
//   derretida().diff(camara())
//
// El mosh como desplazamiento de la cámara limpia:
//   camara().modulate(derretida(), 0.2)
//
// Estelas: la imagen anterior se queda debajo.
//   derretida().blend(src(o0), 0.7)
//
// Sólo dentro de un cuadro, la cámara limpia alrededor:
//   camara().layer(derretida().mask(shape(4, 0.5, 0.01)))
//
// Más color para que el arrastre se note:
//   derretida().saturate(3).contrast(1.4)
//
// Las perillas en el tiempo:
//   rapidez = 4        se derrite más rápido
//   cada = 0           nunca se limpia sola; limpiar() a mano
//   cada = 1           un cuadro limpio por segundo, casi no alcanza a derretirse
//
// El micrófono de la S4 limpia la imagen cuando hay un golpe:
//   cada = 0
//   update = () => { if (a.fft[0] > 0.8) limpiar() }
