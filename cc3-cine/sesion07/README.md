# Sesión 07 · Encuadre con las manos y montaje

**Código Creativo 3 · Cine · 2027-I**

Dos archivos para pegar en [hydra.ojack.xyz](https://hydra.ojack.xyz/):
**[`encuadre.js`](encuadre.js)**, el encuadre con las manos, y
**[`montaje.js`](montaje.js)**, una lista de sketches que pasan uno tras otro
con corte o con fundido. El montaje está [al final](#montaje).

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

