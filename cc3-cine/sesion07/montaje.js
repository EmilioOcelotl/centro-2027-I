// Sesión 07 · Montaje — Código Creativo 3 · Cine
//
// Una lista de escenas de Hydra que pasan una tras otra y vuelven a empezar.
// Cada escena dura `duracion` segundos y entra con un fundido de `fundido`
// segundos; con fundido = 0 el cambio es un corte directo.
//
// Correr todo: Ctrl+Shift+Enter. Volver a correr todo reinicia en la escena 1.
// Para cambiar las escenas sin reiniciar: el cursor dentro del bloque de las
// escenas y Ctrl+Enter. El cambio se ve en el siguiente corte.


// ── ARRANQUE · no hace falta tocarlo ────────────────────────────────
//
// Las escenas se dibujan en dos buffers, o1 y o2, y o0 es la pantalla: la
// mezcla de los dos. En cada cambio la escena nueva entra al buffer que quedó
// libre y la mezcla pasa de uno a otro. Con dos buffers alcanza para
// cualquier número de escenas.

duracion = 15                  // segundos por escena; [15, 8, 20] da una duración a cada una
fundido = 2                    // segundos de la disolvencia; 0 es corte directo

buffers = [o1, o2]
escena = -1                    // -1: todavía no entra la primera
enPantalla = 0                 // cuál de los dos buffers trae la escena actual
inicioPlano = time
mezcla = 0                     // 0 se ve o1, 1 se ve o2

solid(0, 0, 0).out(o1)         // la primera escena entra desde negro
solid(0, 0, 0).out(o2)

segundos = i => Array.isArray(duracion) ? duracion[i % duracion.length] : duracion

// También se puede correr sola, con Ctrl+Enter, para saltar a la siguiente.
siguiente = () => {
  escena = (escena + 1) % escenas.length
  enPantalla = 1 - enPantalla
  const buffer = buffers[enPantalla]
  escenas[escena](buffer).out(buffer)
  inicioPlano = time
}

// Hydra llama a update en cada cuadro. Volver a correrlo lo reemplaza, no lo
// duplica, así que no se acumulan relojes.
update = () => {
  if (escena < 0 || time - inicioPlano >= segundos(escena)) siguiente()
  const f = fundido > 0 ? Math.min((time - inicioPlano) / fundido, 1) : 1
  mezcla = enPantalla === 1 ? f : 1 - f
}

src(o1).blend(src(o2), () => mezcla).out(o0)
render(o0)


// ── LAS ESCENAS · esto sí se toca ───────────────────────────────────
//
// Cada escena es una función que devuelve una cadena de Hydra sin .out():
// el arranque decide a qué buffer va. Si la escena usa feedback, recibe su
// buffer como argumento (aquí se llama yo) y lo lee con src(yo). src(o0)
// no sirve, porque o0 es la mezcla.

escenas = [
  () => osc(20, 0.05, 1.2)
    .kaleid(5),

  () => noise(3, 0.1)
    .color(1, 0.3, 0.6)
    .contrast(1.5),

  () => shape(4, 0.5, 0.01)
    .repeat(3, 3)
    .rotate(() => time * 0.1),

  (yo) => src(yo)
    .scale(1.01)
    .rotate(0.01)
    .blend(osc(8, 0.1, 0.8).mask(shape(3, 0.3)), 0.1),
]


// ── VARIACIONES ─────────────────────────────────────────────────────
//
// Montaje: cambiar las perillas y volver a correr todo.
//   fundido = 0                      corte directo
//   fundido = 8                      disolvencias largas, casi siempre hay dos escenas
//   duracion = [15, 4, 4, 20]        una duración para cada escena, en orden
//   duracion = 1                     con fundido = 0, un corte por segundo
//
// Saltar a la siguiente escena a mano: escribir esta línea sola y Ctrl+Enter
//   siguiente()
//
// Detener el ciclo: el botón de borrar del editor, o
//   hush()
//
// Una escena que recibe a la anterior: el buffer libre todavía trae la escena
// de hace dos cortes, y con feedback se deja ver al principio.
//   (yo) => src(yo).modulate(noise(2), 0.02).blend(osc(4), 0.02)
