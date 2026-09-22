// Sesión 07 · Encuadre con las manos — Código Creativo 3 · Cine
//
// Hydra hace la imagen y ml5 lee las manos en la misma cámara. Con las dos
// manos se arma un encuadre, como el del director, y dentro del encuadre el
// sketch pasa por un filtro. Con una sola mano el filtro es un círculo entre
// el pulgar y el índice: abrir y cerrar los dedos lo agranda y lo achica.
//
// Correr todo: Ctrl+Shift+Enter. Después basta con volver a correr el bloque
// del sketch: el cursor adentro y Ctrl+Enter.
// La primera vez el modelo tarda en llegar (10 a 30 s). Mientras tanto se ve
// la cámara sola y un aviso arriba a la izquierda.


// ── ARRANQUE · no hace falta tocarlo ────────────────────────────────
//
// s0 es la cámara, s1 los puntos de las manos y s2 la máscara del encuadre.
// Para el sketch quedan estas variables, todas de 0 a 1:
//   cuadro.x, cuadro.y, cuadro.w, cuadro.h   el encuadre de las dos manos
//   pinza                                    pulgar e índice de la primera mano
// y hayManos, que vale 0, 1 o 2.

PULGAR = 4                     // la punta de cada dedo entre los 21 puntos de ml5
INDICE = 8
suavizado = 0.3                // 1 sigue a la mano en seco; 0.1 la sigue lento

if (!window.arranque) {        // volver a correr todo no duplica cámara ni modelo
  arranque = true
  manos = []
  cuadro = { x: 0, y: 0, w: 0, h: 0 }
  pinza = 0
  hayManos = 0
  aviso = "cargando la cámara…"

  s0.initCam()
  lienzo = new P5()            // no se llama p5 porque ese nombre ya es la librería
  lienzo.pixelDensity(1)
  lienzo.hide()                // p5 no se ve: entra a Hydra como s1 y s2
  mascara = lienzo.createGraphics(lienzo.width / 4, lienzo.height / 4)
  mascara.pixelDensity(1)
  s1.init({ src: lienzo.canvas })
  s2.init({ src: mascara.elt })

  cargarManos()                // sin await: el sketch corre mientras llega el modelo
}

async function cargarManos () {
  try {
    if (!window.ml5) await loadScript("https://unpkg.com/ml5@1/dist/ml5.min.js")
    for (let t = 0; !(s0.src && s0.src.videoWidth); t++) {
      if (t > 300) throw new Error("no llegó la cámara. ¿Tiene permiso el navegador?")
      await new Promise(listo => setTimeout(listo, 100))
    }
    const video = s0.src
    video.width = video.videoWidth     // ml5 lee el tamaño de estos dos atributos
    video.height = video.videoHeight
    aviso = "cargando el modelo de manos…"
    // Sin esta línea TensorFlow elige WebGPU cuando el navegador lo tiene, y
    // junto con Hydra la GPU se pierde: "mapAsync … [Device] is lost".
    await ml5.setBackend("webgl")
    const modelo = await new Promise(listo => {
      const m = ml5.handPose({ maxHands: 2, modelType: "lite" }, () => listo(m))
    })
    modelo.detectStart(video, resultado => { manos = resultado })
    aviso = ""
  } catch (error) {
    aviso = "no cargó: " + error.message
    arranque = false           // así volver a correr todo lo intenta de nuevo
  }
}

// Cada cuadro, p5 dibuja dos cosas: los puntos en el lienzo (s1) y el encuadre
// en blanco sobre negro en la máscara (s2). Hydra hace el resto.
lienzo.draw = () => {
  const w = lienzo.width, h = lienzo.height
  const mw = mascara.width, mh = mascara.height
  const video = s0.src
  lienzo.clear()
  mascara.background(0)

  if (aviso) {
    lienzo.noStroke()
    lienzo.fill(255)
    lienzo.textSize(18)
    lienzo.text(aviso, 20, 34)
  }
  if (!video || !video.videoWidth) return

  // de pixeles de la cámara a 0–1, y en espejo como la imagen del sketch
  const punto = p => ({ x: 1 - p.x / video.videoWidth, y: p.y / video.videoHeight })
  hayManos = manos.length

  // los puntos, siempre
  lienzo.noStroke()
  for (const mano of manos) {
    mano.keypoints.forEach((p, i) => {
      const q = punto(p)
      const punta = i === PULGAR || i === INDICE
      lienzo.fill(punta ? lienzo.color(255, 60, 90) : 255)
      lienzo.circle(q.x * w, q.y * h, punta ? 16 : 8)
    })
  }

  if (hayManos === 0) {
    cuadro.w = cuadro.h = pinza = 0
    return
  }

  // la pinza de la primera mano: la distancia entre pulgar e índice
  const t = punto(manos[0].keypoints[PULGAR])
  const i = punto(manos[0].keypoints[INDICE])
  const d = Math.hypot(t.x - i.x, t.y - i.y)
  pinza = Math.min(d / 0.3, 1)

  if (hayManos === 1) {
    // una mano: un círculo entre los dos dedos
    cuadro.w = cuadro.h = 0
    mascara.noStroke()
    mascara.fill(255)
    mascara.circle((t.x + i.x) / 2 * mw, (t.y + i.y) / 2 * mh, d * mw)
    return
  }

  // dos manos: el rectángulo que cierran las cuatro puntas
  const puntas = manos.slice(0, 2).flatMap(m => [m.keypoints[PULGAR], m.keypoints[INDICE]]).map(punto)
  const xs = puntas.map(p => p.x), ys = puntas.map(p => p.y)
  const meta = {
    x: Math.min(...xs), y: Math.min(...ys),
    w: Math.max(...xs) - Math.min(...xs), h: Math.max(...ys) - Math.min(...ys),
  }
  const k = cuadro.w === 0 ? 1 : suavizado   // si el encuadre es nuevo, aparece en su lugar
  for (const c of ["x", "y", "w", "h"]) cuadro[c] += (meta[c] - cuadro[c]) * k

  mascara.noStroke()
  mascara.fill(255)
  mascara.rect(cuadro.x * mw, cuadro.y * mh, cuadro.w * mw, cuadro.h * mh)

  lienzo.noFill()
  lienzo.stroke(255)
  lienzo.strokeWeight(2)
  lienzo.rect(cuadro.x * w, cuadro.y * h, cuadro.w * w, cuadro.h * h)
}


// ── EL SKETCH · esto sí se toca ─────────────────────────────────────
//
// camara es una función y no una variable porque en Hydra cada .algo()
// modifica la cadena que lo recibe: con una variable, el filtro se le
// pegaría también a la imagen de fondo.

camara = () => src(s0).scale(1, -1, 1)   // en espejo, igual que los puntos

camara()
  .layer(camara().kaleid(4).mask(src(s2)))   // el filtro, sólo dentro del encuadre
  .layer(src(s1))                            // los puntos, siempre al frente
  .out()


// ── VARIACIONES ─────────────────────────────────────────────────────
//
// Otro filtro: cambiar sólo lo que va antes de .mask(src(s2))
//   camara().invert()
//   camara().pixelate(20, 15)
//   camara().colorama(0.3)
//   camara().modulate(noise(3), 0.1)
//   osc(10, 0.1, 1.2)                     dentro del cuadro, otra imagen
//
// Al revés, la cámara limpia adentro y el filtro afuera:
//   .mask(src(s2).invert())
//
// Las manos como perillas, con () => para que cambien en cada cuadro:
//   camara().kaleid(() => 2 + pinza * 10)
//   camara().rotate(() => cuadro.x * 6)
//   camara().pixelate(() => 5 + cuadro.w * 100, () => 5 + cuadro.h * 100)
//
// El micrófono de la S4 junto con las manos:
//   camara().kaleid(() => 2 + a.fft[0] * 8)
