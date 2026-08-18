# Sesión 03 · Iteraciones y pixeles

**Código Creativo 3 · Cine · 2027-I**

Ejercicio de color sólido y gradiente, leyendo y escribiendo pixeles
directamente. A dónde vamos a llegar: un **slitscan**.

Todo está en un solo archivo: **[`sesion03.pde`](sesion03.pde)**, 34 líneas de
código. Los tres ejercicios son el mismo recorrido —dos iteraciones que van
renglón por renglón y columna por columna— y lo único que cambia es una línea:

```java
// ── EL EJERCICIO · descomentar una sola línea ───────────────────────
pixels[i] = izquierda;                                                // 1 · sólido
//pixels[i] = lerpColor(izquierda, derecha, map(x, 0, width, 0, 1));  // 2 · gradiente
//if (x == contador) pixels[i] = camara.pixels[width/2 + y * width];  // 3 · slitscan
```

Con `Ctrl+/` (`Cmd+/` en Mac) Processing comenta y descomenta la línea donde
está el cursor.

| | de dónde sale el color |
|---|---|
| 1 · sólido | es una constante |
| 2 · gradiente | se calcula a partir de la posición |
| 3 · slitscan | se lee de la cámara |

El recorrido nunca cambia. En el ejercicio 3 el `if` hace que sólo se escriba
la columna que marca `contador`, y como las demás se quedan donde estaban,
cada columna de la ventana guarda un instante distinto: el eje horizontal deja
de ser espacio y se vuelve tiempo. Esa es toda la diferencia entre un gradiente
y un slitscan.

`i = x + y * width` es el número que le pusimos a cada cuadro en la rejilla de
papel de la primera sesión: saltar `y` renglones completos y avanzar `x`
columnas. Para leer la cámara se usa la misma cuenta con la x fija:
`width/2 + y * width` es la columna de en medio.

## Plan de la sesión

| min | bloque |
|---|---|
| 0–10 | Ver el slitscan corriendo. Retomar Processing: `setup`, `draw`, `size` |
| 10–40 | **Color sólido** — el doble `for`, `pixels[]`, el índice |
| 40–70 | **Gradiente** — dos colores en variables, horizontal, vertical, diagonal |
| 70–75 | respiro |
| 75–105 | **Slitscan** — leer de la cámara, el contador |
| 105–120 | `copy()` como atajo. ¿Qué podríamos hacer con esto? |

## Antes de empezar

El sketch necesita la librería **Video**:
`Sketch > Import Library > Manage Libraries…`, buscar **Video** (la de The
Processing Foundation) e instalar. Sin ella el sketch no compila y marca error
en el `import` de la primera línea, aunque no se esté usando la cámara.

Si la consola imprime una lista de cámaras vacía es permiso del sistema y no
del código: en macOS, `Preferencias del Sistema > Privacidad y seguridad >
Cámara`, dando permiso a Processing. Los ejercicios 1 y 2 funcionan igual sin
cámara.

## Dos cosas que suelen confundir

**El slitscan tarda en llenarse.** Avanza una columna por cuadro sobre una
ventana de 1000 px: son unos 30 segundos hasta ver la pantalla completa, y los
primeros segundos parecen no hacer nada. Para ver la cámara mientras tanto,
agregar al final de `draw()`:

```java
image(cam, 0, 0, 250, 100);
```

**La cámara se copia al tamaño de la ventana** en cuanto llega cada cuadro:

```java
camara.copy(cam, 0, 0, cam.width, cam.height, 0, 0, width, height);
```

Eso es lo que permite leerla con la misma cuenta que usamos para escribir. Sin
esa línea habría que traducir cada renglón, porque la cámara no mide lo mismo
que la ventana.

## Las perillas

Están todas juntas hasta arriba del archivo:

```java
color izquierda = color(255, 60, 90);   // los dos colores del gradiente
color derecha   = color(0, 90, 255);

int contador = 0;   // en qué columna escribe el slitscan
```

El final del archivo tiene la lista de variaciones para probar en cada
ejercicio: franjas, tablero de ajedrez, gradiente vertical y diagonal, leer
otra columna o seguirla con el mouse, `saveFrame()` para montar la secuencia
como video, y `copy()` como atajo de todo el `for`.

## Referencia

- [`pixels[]`](https://processing.org/reference/pixels.html) ·
  [`loadPixels()`](https://processing.org/reference/loadPixels_.html) ·
  [`updatePixels()`](https://processing.org/reference/updatePixels_.html)
- [`map()`](https://processing.org/reference/map_.html) ·
  [`lerpColor()`](https://processing.org/reference/lerpColor_.html)
- [`copy()`](https://processing.org/reference/copy_.html) ·
  [Librería Video](https://processing.org/reference/libraries/video/index.html)
