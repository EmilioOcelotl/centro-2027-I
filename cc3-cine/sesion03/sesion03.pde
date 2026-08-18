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
  pixelDensity(1);   // la rejilla mide width * height en todas las máquinas
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
      //pixels[i] = izquierda;                                                // 1 · sólido
      //pixels[i] = lerpColor(izquierda, derecha, map(x, 0, width, 0, 1));  // 2 · gradiente
      //pixels[i] = camara.pixels[x + y * width];   // == camara.pixels[i]
      if (x == contador) {
        pixels[i] = camara.pixels[width/2 + y * width];  // 3 · slitscan
      }
    }
  }

  updatePixels();                        // cierra pixels[] y lo manda a pantalla

  contador = contador + 1;               // el slitscan avanza una columna por cuadro
  if (contador >= width) {
    contador = 0;
  }
}
