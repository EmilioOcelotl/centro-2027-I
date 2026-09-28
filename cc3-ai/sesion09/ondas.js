// Sesión 09 · Un número que cambia — Código Creativo 3 · Arquitectura de Interiores
//
// En Hydra casi cualquier número se puede cambiar por una función: () => algo.
// Hydra la llama en cada cuadro, y si lo que devuelve cambia con el tiempo, la
// imagen se mueve. El seno, el azar, una lista y el micrófono son cuatro formas
// de darle ese número.
//
// Cada bloque es un sketch completo y reemplaza al anterior en la pantalla.
//   un bloque       el cursor adentro y Alt+Enter
//   una línea       Ctrl+Enter
//   todo            Ctrl+Shift+Enter (se queda en pantalla el último bloque)
//   esconder texto  Ctrl+Shift+H
//
// Al abrir el archivo conviene correr todo una vez: así quedan definidas las
// señales del bloque 3, que usan los bloques que siguen.


// ── 1 · REGRESO A HYDRA ─────────────────────────────────────────────
//
// osc(frecuencia, velocidad, color) ya es una onda: franjas que suben y bajan
// de brillo como un seno. Frecuencia es cuántas franjas; velocidad, qué tan
// rápido corren.

osc(10, 0.1, 0)
  .out()

osc(10, 0.1, 1.5)
  .modulate(noise(3), 0.2)
  .out()

shape(4, 0.3, 0.01)
  .rotate(0.4)
  .out()


// ── 2 · UN NÚMERO QUE CAMBIA ────────────────────────────────────────
//
// El tamaño del cuadrado era 0.3, fijo. Ahora es una función del tiempo:
//
//   centro + amplitud · sen(2π · (frecuencia · tiempo + fase))
//
//   centro      alrededor de qué valor se mueve
//   amplitud    cuánto se aleja del centro, para arriba y para abajo
//   frecuencia  cuántas vueltas completas da en un segundo
//   fase        en qué punto de la vuelta empieza: 0.5 es media vuelta, al revés
//
// Las cuatro perillas se leen en cada cuadro: cambiar una y Ctrl+Enter sobre
// esa línea la cambia sin volver a correr el sketch.

centro = 0.3
amplitud = 0.15
frecuencia = 0.5
fase = 0
onda = () => centro + amplitud * Math.sin(2 * Math.PI * (frecuencia * time + fase))
shape(4, onda, 0.01)
  .out()

// La misma onda en otro lugar: ahora mueve la rotación.
shape(4, 0.3, 0.01)
  .rotate(onda)
  .out()

// La fase se ve con dos: el mismo seno, uno media vuelta atrás del otro.
// Cuando uno crece el otro se encoge. Probar con 0.25 y con 0.
desfase = 0.5
shape(4, onda, 0.01).scrollX(-0.25)
  .add(shape(4, () => centro + amplitud * Math.sin(2 * Math.PI * (frecuencia * time + desfase)), 0.01).scrollX(0.25))
  .out()


// ── 3 · OTRAS FORMAS DE CAMBIAR ─────────────────────────────────────
//
// Cinco señales, todas de 0 a 1. Hay que correr este bloque una vez antes
// de usarlas. Con f = 1 dan una vuelta por segundo.
//
//   seno(f)     sube y baja suave
//   sierra(f)   sube despacio y cae de golpe
//   escalon(f)  prendido y apagado, sin punto medio
//   azar()      un número nuevo en cada cuadro: tiembla
//   salto(f)    un número al azar nuevo f veces por segundo, y se queda

seno    = (f = 1, fase = 0) => 0.5 + 0.5 * Math.sin(2 * Math.PI * (f * time + fase))
sierra  = (f = 1, fase = 0) => (f * time + fase) % 1
escalon = (f = 1, fase = 0) => seno(f, fase) > 0.5 ? 1 : 0
azar    = () => Math.random()
salto   = (f = 1) => {
  const n = Math.sin(Math.floor(f * time) * 12.9898) * 43758.5453
  return n - Math.floor(n)
}

// Para llevarlas a otro rango: mínimo + (máximo - mínimo) · señal.
// Aquí el tamaño va de 0.1 a 0.5. Cambiar seno por sierra, escalon, azar o salto.
shape(4, () => 0.1 + 0.4 * seno(0.5), 0.01)
  .out()

// Una señal para cada cosa.
osc(() => 5 + 30 * sierra(0.1), 0.1, () => 3 * salto(1))
  .rotate(() => seno(0.05) * Math.PI)
  .mask(shape(4, () => 0.2 + 0.3 * escalon(1), 0.01))
  .out()

// Elevar una señal a una potencia la vuelve un pulso: casi siempre abajo y
// un golpe arriba. Probar con 2, 8 y 30.
shape(100, () => 0.1 + 0.3 * Math.pow(seno(1), 8), 0.2)
  .out()


// ── 4 · UNA LISTA DE NÚMEROS ────────────────────────────────────────
//
// Una lista entre corchetes también cambia sola: Hydra pasa de un número al
// siguiente y al terminar vuelve a empezar. Por omisión avanza uno cada dos
// segundos (bpm = 30).
//
//   .fast(2)     al doble de rápido; .fast(0.5), a la mitad
//   .smooth()    se desliza de un número al otro en vez de saltar
//   .offset(0.5) empieza media vuelta después

shape([3, 4, 5, 6], 0.3, 0.01)
  .out()

shape([3, 4, 5, 6].fast(4), 0.3, 0.01)
  .out()

shape(4, [0.1, 0.4, 0.2, 0.5].smooth(), 0.01)
  .out()

// Dos listas con distinta longitud se desfasan solas y tardan en repetirse.
osc([10, 20, 40].fast(0.5), 0.1, [0, 1, 2, 3, 4].smooth())
  .kaleid([3, 4, 6, 8].fast(0.25))
  .out()

// El pulso de todo: bpm. Afecta a todas las listas a la vez.
//   bpm = 120


// ── 5 · EL MICRÓFONO ────────────────────────────────────────────────
//
// a.fft es una lista que se llena sola con lo que oye el micrófono: a.fft[0]
// son los graves, el último son los agudos. Cada número va más o menos de 0 a
// 1. Si el navegador pregunta por el micrófono, hay que dar permiso.
//
//   a.show()           las barras abajo a la derecha, para ver qué oye
//   a.setBins(4)       en cuántas partes se divide el sonido
//   a.setSmooth(0.8)   0 salta con cada ruido, 0.99 casi no se mueve
//   a.setCutoff(2)     lo que queda abajo de este nivel cuenta como silencio
//   a.setScale(8)      cuánto sonido hace falta para llegar a 1
//   a.hide()           esconde las barras

a.show()
a.setBins(4)
a.setSmooth(0.8)
shape(4, () => 0.1 + a.fft[0] * 0.5, 0.01)
  .out()

// Cada parte del sonido mueve otra cosa.
osc(10, 0.1, () => a.fft[3] * 4)
  .kaleid(() => 3 + a.fft[1] * 6)
  .scale(() => 1 + a.fft[0])
  .out()

// El micrófono junto con el seno: la onda sigue sola y el sonido la empuja.
shape(4, () => 0.2 + 0.1 * seno(0.5) + 0.3 * a.fft[0], 0.01)
  .repeat(3, 3)
  .rotate(() => seno(0.1) + a.fft[2])
  .out()


// ── 6 · UN ESTADO COMO SEÑAL ────────────────────────────────────────
//
// Elegir un estado y buscar la señal que lo dice: respira, late, tiembla, se
// sobresalta, se cansa, se distrae. Tres para empezar; después, uno propio.

// respira: lento y suave
shape(100, () => 0.15 + 0.2 * seno(0.15), 0.4)
  .color(0.6, 0.8, 1)
  .out()

// late: un golpe por segundo y casi todo el tiempo quieto
shape(100, () => 0.2 + 0.2 * Math.pow(seno(1.2), 12), 0.05)
  .color(1, 0.2, 0.3)
  .out()

// tiembla: el azar rápido, poquito
shape(4, 0.3, 0.01)
  .scrollX(() => (azar() - 0.5) * 0.02)
  .scrollY(() => (azar() - 0.5) * 0.02)
  .out()

// Con un dibujo propio: la dirección de una imagen en línea (clic derecho >
// copiar dirección de la imagen). Algunas páginas no dejan que Hydra la lea;
// si se queda en negro, probar con otra.
//   s0.initImage("https://...")
//   src(s0)
//     .scale(() => 1 + 0.1 * seno(0.15))
//     .out()
