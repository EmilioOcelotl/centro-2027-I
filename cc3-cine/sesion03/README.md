# Sesión 03 · Iteraciones y pixeles

**Código Creativo 3 · Cine · 2027-I**

Ejercicio de color sólido y gradiente, leyendo y escribiendo pixeles
directamente. A dónde vamos a llegar: un **slitscan**.

Todo está en un solo archivo: **[`sesion03.pde`](sesion03.pde)**. Los tres
ejercicios son el mismo código —dos iteraciones que recorren la ventana y
escriben un pixel—; lo único que cambia es de dónde sale el color:

| | de dónde sale el color |
|---|---|
| 1 · sólido | es una constante |
| 2 · gradiente | se calcula a partir de la posición |
| 3 · slitscan | se lee de otra imagen (la cámara) |

Para cambiar de ejercicio se comentan y descomentan líneas. Hay dos bloques
marcados en mayúsculas dentro de `draw()` y en cada uno va **una sola línea
activa**. Con `Ctrl+/` (`Cmd+/` en Mac) Processing comenta y descomenta la
línea del cursor, o todas las que estén seleccionadas.

```java
// ── QUÉ COLUMNAS SE PINTAN EN ESTE CUADRO · descomentar una sola ──────────
int desde = 0, hasta = width;                     // 1 y 2 · el canvas entero
//int desde = int(contador), hasta = desde + 1;   // 3 · sólo una columna
```

```java
// ── DE DÓNDE SALE EL COLOR · descomentar una sola ────────────────────
pixels[i] = izquierda;                                                    // 1 · sólido
//pixels[i] = lerpColor(izquierda, derecha, map(x, 0, width - 1, 0, 1));  // 2 · gradiente
//pixels[i] = pixelDeCamara(posicionLectura, y);                          // 3 · slitscan
//pixels[i] = pixelDeImagen(map(mouseX, 0, width, 0, 1), y);              // 3b · sin cámara
```

Los ejercicios 1 y 2 pintan el canvas entero en cada cuadro. El 3 pinta una
sola columna y deja las anteriores donde estaban: por eso cada columna guarda
un instante distinto y el eje horizontal deja de ser espacio para volverse
tiempo. Esa es toda la diferencia entre un gradiente y un slitscan.

## Plan de la sesión

| min | bloque |
|---|---|
| 0–10 | Ver el slitscan corriendo. Retomar Processing: `setup`, `draw`, `size` |
| 10–40 | **Color sólido** — el doble `for`, `pixels[]`, el índice `i = x + y*width` |
| 40–70 | **Gradiente** — dos colores en variables, horizontal, vertical, diagonal |
| 70–75 | respiro |
| 75–105 | **Cámara** — leer una columna, el contador, slitscan |
| 105–120 | `copy()` como atajo. ¿Qué podríamos hacer con esto? |

## Antes de empezar

El sketch necesita la librería **Video**:
`Sketch > Import Library > Manage Libraries…`, buscar **Video** (la de The
Processing Foundation) e instalar. Sin ella el sketch no compila y marca error
en el `import` de la primera línea, aunque no se esté usando la cámara.

Si la consola imprime una lista de cámaras vacía es permiso del sistema y no
del código: en macOS, `Preferencias del Sistema > Privacidad y seguridad >
Cámara`, dando permiso a Processing. Los ejercicios 1 y 2 funcionan igual sin
cámara, y el 3 tiene la variante `3b`, que lee de una imagen fija: arrastrar
cualquier `.jpg` sobre la ventana del editor para copiarlo a la carpeta `data/`
del sketch, y nombrarlo `imagen.jpg`.

## Las perillas

Están todas juntas hasta arriba del archivo:

```java
color izquierda = color(255, 60, 90);   // los dos colores del gradiente
color derecha   = color(0, 90, 255);

float posicionLectura = 0.5;   // qué columna de la cámara leemos: 0 izq, 1 der
float contador  = 0;           // en qué columna de la ventana escribimos
float velocidad = 1;           // cuánto avanza el contador en cada cuadro
```

El final del archivo tiene una lista de variaciones para probar en cada
ejercicio: franjas, tablero de ajedrez, gradiente vertical, diagonal y radial,
`lerpColor()` escrito a mano, velocidades del slitscan, `saveFrame()` para
montar la secuencia como video, y `copy()` como atajo de todo el `for`.

## Referencia

- [`pixels[]`](https://processing.org/reference/pixels.html) ·
  [`loadPixels()`](https://processing.org/reference/loadPixels_.html) ·
  [`updatePixels()`](https://processing.org/reference/updatePixels_.html)
- [`map()`](https://processing.org/reference/map_.html) ·
  [`lerpColor()`](https://processing.org/reference/lerpColor_.html)
- [`copy()`](https://processing.org/reference/copy_.html) ·
  [Librería Video](https://processing.org/reference/libraries/video/index.html)
