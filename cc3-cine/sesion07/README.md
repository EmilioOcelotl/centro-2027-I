# Sesión 07 · Encuadre con las manos

**Código Creativo 3 · Cine · 2027-I**

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
