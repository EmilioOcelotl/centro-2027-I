# Sesión 07 · Encuadre, montaje y datamosh

**Código Creativo 3 · Cine · 2027-I**

Tres archivos para pegar en [hydra.ojack.xyz](https://hydra.ojack.xyz/):

- **[`encuadre.js`](encuadre.js)**: el encuadre con las manos.
- **[`montaje.js`](montaje.js)**: una lista de sketches que pasan uno tras
  otro con corte o con fundido. Ver [Montaje](#montaje).
- **[`datamosh.js`](datamosh.js)**: la cámara pasa por un codificador de
  video y se derrite. Ver [Datamosh](#datamosh).

## Encuadre con las manos

Hydra hace la imagen y ml5 lee las manos en la misma cámara. Con las dos manos
se arma un encuadre, como el del director, y dentro del encuadre el sketch pasa
por un filtro. Con una sola mano el filtro es un círculo entre el pulgar y el
índice. Los puntos de las manos se ven siempre.

Todo está en un archivo: **[`encuadre.js`](encuadre.js)**. Se copia completo
(el botón de copiar arriba a la derecha del archivo en GitHub) y se pega en
[hydra.ojack.xyz](https://hydra.ojack.xyz/), en lugar del código que trae el
editor.

## Cómo está armado

```
cámara ──► s0 ──────────────────────────────► camara()
   │                                             │
   └──► ml5 ──► manos ──► p5 (no se ve)          │
                          ├─► s1: los puntos ────┤ .layer(src(s1))
                          └─► s2: la máscara ────┘ .mask(src(s2))
```

p5 no se pinta encima de Hydra: dibuja en dos lienzos que Hydra lee como
fuentes. `s1` trae los puntos sobre fondo transparente y `s2` trae el encuadre
en blanco sobre negro. Así el filtro es una operación de Hydra y recorta de
verdad el sketch.

El archivo tiene dos bloques. El **arranque** carga ml5, la cámara y p5, y no
hace falta tocarlo. **El sketch** es lo único que se modifica:

```js
camara = () => src(s0).scale(1, -1, 1)   // en espejo, igual que los puntos

camara()
  .layer(camara().kaleid(4).mask(src(s2)))   // el filtro, sólo dentro del encuadre
  .layer(src(s1))                            // los puntos, siempre al frente
  .out()
```

## Las perillas

Todas van de 0 a 1 y se usan dentro de Hydra con `() =>`:

| variable | qué es |
|---|---|
| `cuadro.x`, `cuadro.y` | la esquina superior izquierda del encuadre |
| `cuadro.w`, `cuadro.h` | el ancho y el alto del encuadre |
| `pinza` | qué tan abiertos están el pulgar y el índice de la primera mano |
| `hayManos` | 0, 1 o 2 |
| `suavizado` | qué tan rápido sigue el encuadre a las manos |

```js
camara().kaleid(() => 2 + pinza * 10)
```

El final del archivo tiene más variaciones: otros filtros, el filtro afuera
del encuadre, una imagen de Hydra en lugar de la cámara y el micrófono de la S4.

## Cuatro cosas que suelen confundir

**Tarda en arrancar.** ml5 trae TensorFlow adentro y el modelo se descarga
aparte: la primera vez son de 10 a 30 segundos. Mientras tanto se ve la cámara
sola y un aviso arriba a la izquierda. Si la cámara no llega, el aviso lo dice:
es permiso del navegador, no del código.

**"[Device] is lost".** Si la consola dice `Failed to execute 'mapAsync' on
'GPUBuffer': [Device] is lost`, TensorFlow intentó usar WebGPU y chocó con
Hydra por la GPU. El arranque ya lo evita con `ml5.setBackend("webgl")`; si
aparece de todos modos, hay que recargar la página, porque la detección ya no
se recupera.

**`camara` es una función.** En Hydra cada `.algo()` modifica la cadena que lo
recibe. Si `camara` fuera una variable, `camara.kaleid(4)` le pegaría el
caleidoscopio también a la imagen de fondo. Con `camara()` cada uso es una
cadena nueva.

**El espejo va en los dos lados.** Los puntos se calculan en espejo y la cámara
se voltea con `.scale(1, -1, 1)`. Si se quita el `scale`, la mano derecha sale
a la izquierda y el encuadre cae donde no está.

Volver a correr todo (`Ctrl+Shift+Enter`) no duplica la cámara ni el modelo:
el arranque sólo corre la primera vez.

## Referencia

- [Funciones de Hydra](https://hydra.ojack.xyz/api/) ·
  [p5 dentro de Hydra](https://hydra.ojack.xyz/docs/docs/learning/extending-hydra/extending-hydra/)
- [ml5 · handPose](https://docs.ml5js.org/#/reference/handpose): los 21 puntos,
  la punta del pulgar es el 4 y la del índice el 8

---

## Montaje

**[`montaje.js`](montaje.js)** pasa por una lista de escenas de Hydra, cada
una durante `duracion` segundos, y al terminar vuelve a empezar. Entre una y
otra hay un fundido de `fundido` segundos; con `fundido = 0` el cambio es un
corte directo. Se copia y se pega igual que el encuadre.

### Cómo está armado

```
escena 1, 3, 5… ──► o1 ──┐
                         ├─► blend(mezcla) ──► o0 (la pantalla)
escena 2, 4, 6… ──► o2 ──┘
```

Hay dos buffers y la pantalla es la mezcla de los dos. En cada cambio la escena
nueva entra al buffer que quedó libre y `mezcla` pasa de uno a otro. Con dos
buffers alcanza para cualquier número de escenas.

El reloj es el `update` de Hydra, la función que corre en cada cuadro. Como es
una sola, volver a correr todo la reemplaza y no se acumulan relojes. Volver a
correr todo también reinicia en la escena 1.

### Las escenas

Cada escena es una función que devuelve una cadena **sin `.out()`**. El
arranque decide a qué buffer va:

```js
escenas = [
  () => osc(20, 0.05, 1.2).kaleid(5),
  () => noise(3, 0.1).color(1, 0.3, 0.6),
  (yo) => src(yo).scale(1.01).blend(osc(8), 0.1),   // feedback
]
```

Para agregar una escena se agrega una línea a la lista. Con el cursor dentro de
la lista y `Ctrl+Enter` se cambian las escenas sin reiniciar el ciclo, y el
cambio se ve en el siguiente corte.

### Las perillas

| variable | qué es |
|---|---|
| `duracion` | segundos por escena. Una lista, `[15, 4, 4, 20]`, da una duración a cada una |
| `fundido` | segundos de la disolvencia. `0` es corte directo |
| `siguiente()` | escrita sola y con `Ctrl+Enter`, salta a la siguiente escena |

Las perillas se leen en cada cuadro: `fundido = 0` con `Ctrl+Enter` cambia el
siguiente corte sin reiniciar.

### Tres cosas que suelen confundir

**El feedback va con `yo`, no con `o0`.** `o0` es la mezcla, no la escena. Una
escena con feedback recibe su buffer como argumento y lo lee con `src(yo)`. Al
entrar, el buffer todavía trae la escena de hace dos cortes, y por un momento
se deja ver.

**Una escena con un error se salta.** Si una escena tiene un error, el ciclo
pasa a la siguiente y el error aparece en la consola. Si una escena nunca
aparece, hay que revisarla.

**`hush()` detiene todo.** Borra los buffers y también el reloj. Para volver a
empezar se corre todo otra vez.

---

## Datamosh

**[`datamosh.js`](datamosh.js)** pasa la cámara por un codificador de video
con la librería [hydra-datamosh](https://emptyfla.sh/hydra-datamosh/). Se
copia y se pega igual que los otros dos. Funciona en Chrome.

### Qué es

Un video comprimido casi no guarda imágenes completas. Guarda un cuadro limpio
(*keyframe*) y después, cuadro por cuadro, sólo lo que se movió y hacia dónde.
El datamosh rompe esa cadena: aquí cada cuadro de movimiento se aplica dos
veces o más. El movimiento se suma sobre sí mismo, lo que se mueve arrastra
los pixeles y lo que está quieto se queda. Un cuadro limpio borra todo.

```
cámara ──► s0 ──► lienzo 640 ──► VP8 ──► cada cuadro × rapidez ──► mosh
                                  ▲
                          limpiar(): cuadro limpio
```

### Las perillas

| variable | qué es |
|---|---|
| `rapidez` | cuántas veces se aplica cada cuadro de movimiento. `1` es limpio, `2` ya se derrite |
| `cada` | segundos entre cuadros limpios. `0` es nunca |
| `limpiar()` | escrita sola y con `Ctrl+Enter`, mete un cuadro limpio al momento |
| `pacman` | `true` para trabajar sin cámara: un pacman que va y viene entra en `s0`. Para cambiarla hay que recargar la página |

Para ver el efecto hay que moverse: con la cámara quieta no pasa nada.
Moverse lento y dejar el fondo quieto funciona mejor que moverse mucho.

### El sketch

`derretida()` es la cámara ya derretida y `camara()` es la cámara limpia. Las
dos van en espejo y se combinan como cualquier fuente de Hydra:

```js
derretida().diff(camara())                      // lo que se separó de la cámara
camara().modulate(derretida(), 0.2)             // el mosh como desplazamiento
camara().layer(derretida().mask(shape(4, 0.5, 0.01)))   // sólo dentro de un cuadro
```

### Cuatro cosas que suelen confundir

**Tarda en arrancar.** La primera vez espera el permiso de la cámara y la
librería. Mientras tanto la pantalla no cambia.

**Sin cámara.** Con `pacman = true` todo funciona igual, y `camara()` es el
pacman limpio. El arranque corre una sola vez: para pasar de la cámara al
pacman, o al revés, hay que recargar la página y pegar de nuevo.

**Después de `hush()` hay que recargar.** `hush()` apaga la cámara y la fuente
del mosh, y el arranque no se repite porque ya corrió una vez. Recargar la
página y pegar de nuevo.

**No se derrite.** Con `rapidez = 1` la imagen sale limpia, y con `cada = 1`
no alcanza a derretirse. Si no se ve nada, probar `rapidez = 3` y `cada = 0`.

