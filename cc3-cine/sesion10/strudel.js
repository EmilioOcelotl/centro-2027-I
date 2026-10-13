// Sesión 10 · Strudel — Código Creativo 3 · Cine
//
// Cada bloque se pega en strudel.cc y se corre con Ctrl+Enter.
// Ctrl+. detiene el sonido.


// ── 1 · UN CICLO ─────────────────────────────────────────────────────

// Todo lo que está entre comillas dura un ciclo.
s("bd sd")

// Más sonidos en el mismo ciclo: van más rápido.
s("bd sd hh sd")

// Ciclos por minuto. Con 30, un ciclo dura 2 segundos.
setcpm(30)
s("bd sd hh sd")


// ── 2 · MININOTACIÓN ─────────────────────────────────────────────────

s("bd ~ sd ~")            // ~ es silencio
s("bd [sd sd] hh sd")     // [ ] divide un lugar en partes
s("bd sd hh*4")           // * repite dentro del mismo lugar
s("bd <sd cp>")           // < > alterna: uno por ciclo
s("bd sd, hh*8")          // la coma toca al mismo tiempo
s("hh:0 hh:1 hh:2 hh:3")  // :n elige otra muestra del mismo sonido

// Otra caja de ritmos.
s("bd sd, hh*8").bank("RolandTR909")


// ── 3 · EFECTOS ──────────────────────────────────────────────────────

s("bd sd, hh*8").gain(0.5)       // volumen
s("bd sd, hh*8").speed(0.5)      // más lento y más grave
s("bd sd, hh*8").speed(-1)       // al revés
s("bd sd, hh*8").lpf(400)        // filtro: deja pasar los graves
s("bd sd, hh*8").hpf(2000)       // filtro: deja pasar los agudos
s("bd sd, hh*8").room(0.8)       // reverberación
s("bd sd, hh*8").delay(0.5)      // eco
s("bd sd, hh*8").crush(4)        // menos bits, más sucio
s("hh*8").pan("0 1")             // izquierda, derecha

// Los efectos también aceptan mininotación.
s("hh*8").speed("1 2 0.5 <1 4>")

// Y se suman.
s("bd sd, hh*8").speed(0.5).room(0.8).lpf(800)


// ── 4 · STACK ────────────────────────────────────────────────────────

// Como la coma, pero cada capa lleva sus propios efectos.
stack(
  s("bd ~ bd ~"),
  s("~ sd").room(0.6),
  s("hh*8").gain(0.4).pan("0 1"),
)


// ── 5 · ARRANGE ──────────────────────────────────────────────────────

// Secciones una tras otra. El número es cuántos ciclos dura cada una.
arrange(
  [4, s("bd sd")],            // 4 ciclos de intro
  [8, s("bd sd, hh*8")],      // 8 ciclos parte A
  [4, s("cp ~ bd ~")]         // 4 ciclos parte B
)


// ── EJERCICIO · TRES ESCENAS ─────────────────────────────────────────

// Cada escena es un stack. Con setcpm(30) un ciclo dura 2 segundos:
// 4 ciclos son 8 segundos.
setcpm(30)

const escena1 = stack(
  s("hh*4").speed(0.5).room(0.9).gain(0.4),
)

const escena2 = stack(
  s("bd ~ bd ~"),
  s("~ sd").room(0.5),
  s("hh*8").gain(0.4),
)

const escena3 = stack(
  s("bd*4").crush(4),
  s("cp*2").delay(0.5),
)

arrange(
  [4, escena1],
  [8, escena2],
  [4, escena3],
)
