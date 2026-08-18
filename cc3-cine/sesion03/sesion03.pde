// Sesión 03 · Iteraciones y pixeles — Código Creativo 3 · Cine
//
// Tres ejercicios, un solo código: dos iteraciones recorren la ventana y
// escriben un pixel. Lo único que cambia es la línea del ejercicio.
// Para cambiar de ejercicio, comentar y descomentar: Ctrl+/ (Cmd+/ en Mac).
//
// Antes de correr: Sketch > Import Library > Manage Libraries… > "Video"

import processing.video.*;

color izquierda = color(255, 60, 90);   // los dos colores del gradiente
color derecha   = color(0, 90, 255);

Capture cam;
PImage camara;      // el cuadro de la cámara, a la medida de la ventana
int contador = 0;   // en qué columna escribe el slitscan

void setup() {
  size(1000, 300);
  background(0);

  camara = createImage(width, height, RGB);   // negro hasta que llegue la cámara

  String[] camaras = Capture.list();
  printArray(camaras);
  if (camaras.length > 0) {          // sin cámara, los ejercicios 1 y 2 corren igual
    cam = new Capture(this, camaras[0]);
    cam.start();
  }
}

// Processing llama esta función sola cada vez que llega un cuadro nuevo
void captureEvent(Capture cam) {
  cam.read();
  camara.copy(cam, 0, 0, cam.width, cam.height, 0, 0, width, height);
  camara.loadPixels();
}

void draw() {

  loadPixels();                          // abre pixels[]: los pixeles de la ventana

  for (int y = 0; y < height; y++) {     // recorre los renglones
    for (int x = 0; x < width; x++) {    // y dentro de cada renglón, las columnas

      int i = x + y * width;             // el número de la rejilla de papel

      // ── EL EJERCICIO · descomentar una sola línea ───────────────────────
      pixels[i] = izquierda;                                                // 1 · sólido
      //pixels[i] = lerpColor(izquierda, derecha, map(x, 0, width, 0, 1));  // 2 · gradiente
      //if (x == contador) pixels[i] = camara.pixels[width/2 + y * width];  // 3 · slitscan
    }
  }

  updatePixels();                        // cierra pixels[] y lo manda a pantalla

  contador = contador + 1;               // el slitscan avanza una columna por cuadro
  if (contador >= width) contador = 0;
}

// ─────────────────────────────────────────────────────────────────────────────
// PARA PROBAR
//
// 1 · sólido — cambiar la línea del ejercicio por alguna de estas:
//   pixels[i] = color(x, y, 100);                 // el color depende del lugar
//   pixels[i] = color(random(255));               // ruido
//   if (x % 20 < 10) pixels[i] = izquierda;       // franjas verticales
//   if ((x + y) % 2 == 0) pixels[i] = izquierda;  // tablero de ajedrez
//
// 2 · gradiente — la dirección está en el último argumento de lerpColor(),
//     que es "qué tan lejos estamos", de 0 a 1:
//   map(y, 0, height, 0, 1)                       // vertical
//   map(x + y, 0, width + height, 0, 1)           // diagonal
//
// 3 · slitscan — la columna que se lee es el width/2 de adentro del corchete:
//   camara.pixels[100 + y * width]                     // otra columna fija
//   camara.pixels[constrain(mouseX, 0, width-1) + y * width]   // con el mouse
//
//   Se tarda medio minuto en llenar la ventana. Para ver la cámara mientras
//   tanto, al final de draw():   image(cam, 0, 0, 250, 100);
//   Para que avance más rápido:  contador = contador + 4;
//   Para guardar la secuencia y montarla como video, al final de draw():
//     saveFrame("cuadros/########.png");
//
// EL ATAJO — copy() hace en una línea el for completo del ejercicio 3, y de
// paso estira la tira. Por dentro está haciendo justo lo que escribimos:
// leer un índice y escribir otro, uno por uno.
//   copy(cam, cam.width/2, 0, 1, cam.height, contador, 0, 1, height);
