// 04 · Leer una columna de la cámara
// Código Creativo 3 · Cine · Sesión 03
//
// Hasta ahora inventamos el color. Ahora lo leemos de otra imagen.
// La cámara también es una lista de pixeles: cam.pixels[].
//
// Ojo: son DOS rejillas de distinto tamaño. La de la cámara usa cam.width
// y la de la ventana usa width. Cada índice se calcula con su propio ancho.

import processing.video.*;

Capture cam;

// De dónde leemos: 0 es el borde izquierdo de la cámara, 1 el derecho.
float posicionLectura = 0.5;   // 0.5 = la columna de en medio

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

  // El primer cuadro tarda en llegar. Sin esto el sketch truena al arrancar.
  if (cam.width <= 1) return;

  cam.loadPixels();   // abre los pixeles de la cámara (para leer)
  loadPixels();       // abre los pixeles de la ventana (para escribir)

  // Qué columna de la cámara vamos a leer
  int xCam = int(posicionLectura * (cam.width - 1));

  // Dónde la vamos a escribir: donde esté el mouse
  int xVentana = constrain(mouseX, 0, width - 1);

  // Una sola iteración: recorremos la columna de arriba a abajo
  for (int y = 0; y < height; y++) {

    // La cámara y la ventana tienen distinta altura: traducimos.
    int yCam = int(map(y, 0, height, 0, cam.height));

    // Leer de la rejilla de la cámara (ancho cam.width)
    color c = cam.pixels[xCam + yCam * cam.width];

    // Escribir en la rejilla de la ventana (ancho width)
    pixels[xVentana + y * width] = c;
  }

  updatePixels();
}

// ─────────────────────────────────────────────────────────────
// Mover el mouse deja un rastro: nunca borramos el fondo, así que la ventana
// va guardando columnas de distintos momentos. Eso ya es un slitscan hecho
// a mano. Lo único que falta es que la columna avance sola.
//
// Para probar: cambiar posicionLectura a 0.0 o a 1.0, o hacerla depender del
// mouse con  posicionLectura = map(mouseY, 0, height, 0, 1);
