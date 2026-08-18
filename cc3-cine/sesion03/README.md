# Sesión 03 · Iteraciones y pixeles

**Código Creativo 3 · Cine · 2027-I**

Ejercicio de color sólido y gradiente, leyendo y escribiendo pixeles
directamente. A dónde vamos a llegar: un **slitscan**.

Los seis sketches son el mismo código. Lo único que cambia es de dónde sale
el color de cada pixel:

| | de dónde sale el color |
|---|---|
| color sólido | es una constante |
| gradiente | se calcula a partir de la posición |
| columna / slitscan | se lee de otra imagen |

## Plan de la sesión

| min | bloque |
|---|---|
| 0–10 | Ver el slitscan corriendo. Retomar Processing: `setup`, `draw`, `size` |
| 10–40 | **Color sólido** — el doble `for`, `pixels[]`, el índice `i = x + y*width` |
| 40–70 | **Gradiente** — dos colores en variables, horizontal, vertical, diagonal |
| 70–75 | respiro |
| 75–105 | **Cámara** — leer una columna, moverla, slitscan |
| 105–120 | `copy()` como atajo. ¿Qué podríamos hacer con esto? |

## Antes de empezar

Los sketches con cámara necesitan la librería **Video**:
`Sketch > Import Library > Manage Libraries…`, buscar **Video** (la de The
Processing Foundation) e instalar.

Si la consola imprime una lista de cámaras vacía, o el sketch truena en
`camaras[0]`, es permiso del sistema y no del código: en macOS,
`Preferencias del Sistema > Privacidad y seguridad > Cámara`, dando permiso a
Processing. Mientras se resuelve, [`slitscanImagen/`](slitscanImagen/) hace el
mismo ejercicio leyendo una imagen fija.

---

## 01 · Color sólido

La rejilla de papel que dimensionamos y numeramos en la primera sesión es
`pixels[]`: una lista larga, no una cuadrícula. El número de cada cuadro es
`x + y * width`.

```java
color relleno = color(255, 60, 90);

void setup() {
  size(600, 400);
  noLoop();
}

void draw() {

  loadPixels();

  for (int y = 0; y < height; y++) {
    for (int x = 0; x < width; x++) {

      int i = x + y * width;
      pixels[i] = relleno;
    }
  }

  updatePixels();
}
```

Para probar, cambiando sólo la línea de `pixels[i]`:

```java
pixels[i] = color(x, y, 100);              // el color depende del lugar
pixels[i] = color(random(255));            // ruido
if (x % 20 < 10) pixels[i] = relleno;      // franjas verticales
if ((x + y) % 2 == 0) pixels[i] = relleno; // tablero de ajedrez
```

---

## 02 · Gradiente entre dos colores

Los dos colores se definen arriba, en variables: cambiar esas dos líneas
cambia la pieza completa.

```java
color izquierda = color(255, 60, 90);
color derecha   = color(0, 90, 255);

void setup() {
  size(600, 400);
  noLoop();
}

void draw() {

  loadPixels();

  for (int y = 0; y < height; y++) {
    for (int x = 0; x < width; x++) {

      int i = x + y * width;

      float t = map(x, 0, width - 1, 0, 1);
      pixels[i] = lerpColor(izquierda, derecha, t);
    }
  }

  updatePixels();
}
```

`t` es qué tan a la derecha estamos, de 0 a 1. Cambiando esa línea cambia la
dirección del gradiente:

```java
float t = map(y, 0, height - 1, 0, 1);                          // vertical
float t = map(x + y, 0, width + height - 2, 0, 1);              // diagonal
float t = map(dist(x, y, width/2, height/2), 0, width/2, 0, 1); // radial
```

Lo que `lerpColor()` hace por dentro, escrito a mano. Un color son tres
números y cada uno se mezcla por su cuenta:

```java
float r = lerp(red(izquierda),   red(derecha),   t);
float g = lerp(green(izquierda), green(derecha), t);
float b = lerp(blue(izquierda),  blue(derecha),  t);
pixels[i] = color(r, g, b);
```

---

## 03 · ¿La cámara funciona?

```java
import processing.video.*;

Capture cam;

void setup() {
  size(640, 480);
  String[] camaras = Capture.list();
  printArray(camaras);
  cam = new Capture(this, camaras[0]);
  cam.start();
}

void captureEvent(Capture cam) {
  cam.read();
}

void draw() {
  image(cam, 0, 0, width, height);
}
```

`captureEvent()` no la llamamos nosotros: Processing la llama sola cada vez
que llega un cuadro nuevo. Si la cámara que aparece no es la que queremos,
cambiar el `0` por el número que salga en la consola.

---

## 04 · Leer una columna de la cámara

Ahora el color no lo inventamos: lo leemos. Son **dos rejillas de distinto
tamaño** y cada índice se calcula con su propio ancho — `cam.width` para leer,
`width` para escribir.

```java
import processing.video.*;

Capture cam;
float posicionLectura = 0.5;   // 0 = borde izquierdo de la cámara, 1 = derecho

void setup() {
  size(1000, 300);
  String[] camaras = Capture.list();
  printArray(camaras);
  cam = new Capture(this, camaras[0]);
  cam.start();
  background(0);
}

void captureEvent(Capture cam) {
  cam.read();
}

void draw() {

  if (cam.width <= 1) return;   // el primer cuadro tarda en llegar

  cam.loadPixels();
  loadPixels();

  int xCam     = int(posicionLectura * (cam.width - 1));
  int xVentana = constrain(mouseX, 0, width - 1);

  for (int y = 0; y < height; y++) {

    int yCam = int(map(y, 0, height, 0, cam.height));

    color c = cam.pixels[xCam + yCam * cam.width];
    pixels[xVentana + y * width] = c;
  }

  updatePixels();
}
```

Mover el mouse deja un rastro: nunca borramos el fondo, así que la ventana va
guardando columnas de distintos momentos. Eso ya es un slitscan hecho a mano.
Falta que la columna avance sola.

---

## 05 · Slitscan

Una sola diferencia con el anterior: la posición de escritura ya no la pone el
mouse, avanza sola. El eje horizontal deja de ser espacio y se vuelve tiempo.

```java
import processing.video.*;

Capture cam;

float posicionLectura = 0.5;
float contador = 0;
float velocidad = 1;

void setup() {
  size(1000, 300);
  String[] camaras = Capture.list();
  printArray(camaras);
  cam = new Capture(this, camaras[0]);
  cam.start();
  background(0);
}

void captureEvent(Capture cam) {
  cam.read();
}

void draw() {

  if (cam.width <= 1) return;

  cam.loadPixels();
  loadPixels();

  int xCam     = int(posicionLectura * (cam.width - 1));
  int xVentana = int(contador);

  for (int y = 0; y < height; y++) {
    int yCam = int(map(y, 0, height, 0, cam.height));
    color c = cam.pixels[xCam + yCam * cam.width];
    pixels[xVentana + y * width] = c;
  }

  updatePixels();

  contador = contador + velocidad;
  if (contador >= width) {
    contador = 0;
  }
}
```

Para probar:

```java
velocidad = 0.25;   // más lento: cada columna dura varios cuadros
velocidad = 4;      // más rápido: se salta columnas y deja huecos

image(cam, 0, 0, cam.width/4, cam.height/4);   // ver la cámara encima
saveFrame("cuadros/########.png");             // guardar la secuencia
```

Si no hay cámara: [`slitscanImagen/`](slitscanImagen/) hace lo mismo leyendo
una imagen fija, con la columna de lectura siguiendo al mouse.

---

## 06 · El atajo: `copy()`

Processing ya trae una función que hace en una línea el `for` completo, y de
paso estira la tira. Vale la pena usarla — y conviene saber que por dentro
está haciendo justo lo que acabamos de escribir.

```java
int w = cam.width;
int h = cam.height;

// copy(origen, x, y, ancho, alto,  x, y, ancho, alto)
//               ↑ de dónde          ↑ a dónde
copy(cam, w/2, 0, 1, h, int(contador), 0, 1, height);
```

---

## Archivos

| Carpeta | Qué es |
|---|---|
| [`colorSolido/`](colorSolido/) | Doble `for`, `pixels[]`, el índice |
| [`gradiente/`](gradiente/) | Dos colores en variables, `map()` y `lerpColor()` |
| [`camaraPrueba/`](camaraPrueba/) | Comprobar que Processing ve la cámara |
| [`camaraColumna/`](camaraColumna/) | Leer una columna de la cámara y escribirla |
| [`slitscan/`](slitscan/) | La columna avanza sola |
| [`slitscanImagen/`](slitscanImagen/) | Slitscan sin cámara, leyendo una imagen fija |
| [`slitscanCopy/`](slitscanCopy/) | La versión corta con `copy()` |

## Referencia

- [`pixels[]`](https://processing.org/reference/pixels.html) ·
  [`loadPixels()`](https://processing.org/reference/loadPixels_.html) ·
  [`updatePixels()`](https://processing.org/reference/updatePixels_.html)
- [`map()`](https://processing.org/reference/map_.html) ·
  [`lerpColor()`](https://processing.org/reference/lerpColor_.html)
- [`copy()`](https://processing.org/reference/copy_.html) ·
  [Librería Video](https://processing.org/reference/libraries/video/index.html)
