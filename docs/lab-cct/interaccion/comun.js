// Lo que comparten las cinco páginas de interacción: la cámara (o un video de
// respaldo), el ciclo de cada cuadro, MediaPipe, la rampa y la gráfica.
// Cada página importa de aquí y sólo escribe lo suyo.

export const MP = "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@1.0.1"
export const MODELOS = "https://storage.googleapis.com/mediapipe-models"

let fileset = null
export async function mediapipe () {
  const vision = await import(MP + "/vision_bundle.mjs")
  if (!fileset) fileset = await vision.FilesetResolver.forVisionTasks(MP + "/wasm")
  return { vision, fileset }
}

// Crea una tarea de MediaPipe en la GPU; si la GPU no está, en la CPU.
export async function tarea (Clase, ruta, opciones = {}, delegate = "GPU") {
  const { fileset } = await mediapipe()
  const base = { baseOptions: { modelAssetPath: MODELOS + ruta, delegate }, runningMode: "VIDEO", ...opciones }
  try {
    return await Clase.createFromOptions(fileset, base)
  } catch (error) {
    if (delegate === "CPU") throw error
    base.baseOptions.delegate = "CPU"
    return await Clase.createFromOptions(fileset, base)
  }
}

// La rampa: con el evento encendido sube a 1 en `subida` segundos; apagado,
// baja a 0 en `bajada` segundos. Mientras el evento dura, se sostiene en 1.
export class Rampa {
  constructor (subida = 0.5, bajada = 1.5) {
    this.subida = subida
    this.bajada = bajada
    this.valor = 0
  }
  paso (evento, dt) {
    if (evento) this.valor += dt / Math.max(this.subida, 0.001)
    else this.valor -= dt / Math.max(this.bajada, 0.001)
    this.valor = Math.min(1, Math.max(0, this.valor))
    return this.valor
  }
}

// Acerca `actual` a `meta`. k = 1 la sigue en seco; k cerca de 0, lento.
// No depende de cuántos cuadros por segundo dé la computadora.
export const seguir = (actual, meta, k, dt) => actual + (meta - actual) * (1 - Math.pow(1 - k, dt * 60))

export const limitar = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x))

// Une un <input type=range> con su <output> y con una función.
export function deslizador (id, alCambiar, formato = v => v) {
  const input = document.getElementById(id)
  const salida = document.getElementById(id + "Out")
  const leer = () => {
    const v = parseFloat(input.value)
    if (salida) salida.textContent = formato(v)
    alCambiar(v)
  }
  input.addEventListener("input", leer)
  leer()
}

// Escribe un valor en un <output> o <span> por id.
export function mostrar (id, texto) {
  const el = document.getElementById(id)
  if (el && el.textContent !== texto) el.textContent = texto
}

// Gráfica de los últimos segundos: cada serie es { color, valor() } y `linea`
// es una línea horizontal fija, el umbral.
export function grafica (canvas, series, linea = () => null) {
  const ctx = canvas.getContext("2d")
  const historia = series.map(() => [])
  const N = 240
  return () => {
    const w = canvas.width = canvas.clientWidth * devicePixelRatio
    const h = canvas.height = canvas.clientHeight * devicePixelRatio
    ctx.clearRect(0, 0, w, h)
    const u = linea()
    if (u !== null) {
      ctx.setLineDash([6, 6])
      ctx.strokeStyle = "#8F8F8F"
      ctx.lineWidth = devicePixelRatio
      ctx.beginPath()
      ctx.moveTo(0, h - u * h)
      ctx.lineTo(w, h - u * h)
      ctx.stroke()
      ctx.setLineDash([])
    }
    series.forEach((s, i) => {
      const hist = historia[i]
      hist.push(limitar(s.valor()))
      if (hist.length > N) hist.shift()
      ctx.strokeStyle = s.color
      ctx.lineWidth = 2 * devicePixelRatio
      ctx.beginPath()
      hist.forEach((v, j) => {
        const x = (j + N - hist.length) / (N - 1) * w
        const y = h - v * (h - 4) - 2
        j ? ctx.lineTo(x, y) : ctx.moveTo(x, y)
      })
      ctx.stroke()
    })
  }
}

// El escenario: un <canvas id="escena">, los botones de cámara, video y
// pantalla completa, y el ciclo. `preparar()` carga el modelo (una sola vez);
// `cuadro(video, dt, t)` corre en cada cuadro con el video ya listo.
export function escenario ({ preparar = async () => {}, cuadro }) {
  const lienzo = document.getElementById("escena")
  const ctx = lienzo.getContext("2d")
  const estado = document.getElementById("estado")
  const video = document.createElement("video")
  video.muted = true
  video.playsInline = true
  video.loop = true

  const avisar = (texto, error = false) => {
    estado.textContent = texto
    if (error) estado.setAttribute("data-error", "")
    else estado.removeAttribute("data-error")
  }

  let listo = null
  const cargar = () => {
    if (!listo) {
      avisar("cargando el modelo… la primera vez tarda unos segundos")
      listo = preparar().catch(error => {
        listo = null
        throw error
      })
    }
    return listo
  }

  async function arrancar (fuente) {
    try {
      if (video.srcObject) video.srcObject.getTracks().forEach(t => t.stop())
      video.srcObject = null
      video.removeAttribute("src")
      if (fuente === "camara") {
        avisar("esperando el permiso de la cámara…")
        video.srcObject = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 }, audio: false })
      } else {
        video.src = fuente
      }
      await video.play()
      await cargar()
      avisar(fuente === "camara" ? "cámara encendida. Nada se graba ni se envía." : "video cargado. Nada se envía.")
    } catch (error) {
      const permiso = error && (error.name === "NotAllowedError" || error.name === "NotFoundError")
      avisar(permiso
        ? "no hay cámara o el navegador no dio permiso. Prueba con un video."
        : "no cargó: " + (error && error.message || error), true)
    }
  }

  document.getElementById("btnCamara").addEventListener("click", () => arrancar("camara"))
  const archivo = document.getElementById("archivo")
  archivo.addEventListener("change", () => {
    if (archivo.files[0]) arrancar(URL.createObjectURL(archivo.files[0]))
  })
  document.getElementById("btnCompleta").addEventListener("click", () => {
    if (document.fullscreenElement) document.exitFullscreen()
    else lienzo.requestFullscreen().catch(() => {})
  })

  let antes = performance.now()
  function ciclo (ahora) {
    const dt = Math.min((ahora - antes) / 1000, 0.1)
    antes = ahora
    const caja = lienzo.getBoundingClientRect()
    const w = Math.round(caja.width * devicePixelRatio), h = Math.round(caja.height * devicePixelRatio)
    if (lienzo.width !== w || lienzo.height !== h) { lienzo.width = w; lienzo.height = h }
    const hayVideo = video.readyState >= 2 && video.videoWidth > 0
    try {
      cuadro({ video: hayVideo ? video : null, ctx, w, h, dt, t: ahora / 1000, listo: hayVideo && listo })
    } catch (error) {
      console.error(error)
    }
    requestAnimationFrame(ciclo)
  }
  requestAnimationFrame(ciclo)
  return { video, lienzo, ctx }
}

// Dibuja el video en espejo, cubriendo el lienzo. Devuelve cómo pasar un punto
// del video (0–1, sin espejo) a pixeles del lienzo.
export function encuadrar (video, w, h) {
  const vw = video.videoWidth, vh = video.videoHeight
  const s = Math.max(w / vw, h / vh)
  const dw = vw * s, dh = vh * s
  const ox = (w - dw) / 2, oy = (h - dh) / 2
  return {
    dibujar (ctx, fuente = video) {
      ctx.save()
      ctx.translate(w, 0)
      ctx.scale(-1, 1)
      ctx.drawImage(fuente, w - ox - dw, oy, dw, dh)
      ctx.restore()
    },
    punto: (x, y) => ({ x: ox + (1 - x) * dw, y: oy + y * dh }),
    escala: s,
  }
}
