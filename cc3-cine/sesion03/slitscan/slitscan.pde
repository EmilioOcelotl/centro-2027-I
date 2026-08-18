// 05 · Slitscan
// Código Creativo 3 · Cine · Sesión 03
//
// El mismo código de la columna, con una diferencia: la posición de escritura
// ya no la pone el mouse, avanza sola. Cada columna de la ventana guarda un
// instante distinto: el eje horizontal deja de ser espacio y se vuelve tiempo.

import processing.video.*;

Capture cam;

float posicionLectura = 0.5;   // qué columna de la cámara leemos (0 a 1)
float contador = 0;            // en qué columna de la ventana escribimos
float velocidad = 1;           // cuántos pixeles avanza el contador por cuadro

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

  // El contador avanza y regresa al principio al llegar al borde
  contador = contador + velocidad;
  if (contador >= width) {
    contador = 0;
  }
}

// ─────────────────────────────────────────────────────────────
// Para probar:
//
//   velocidad = 0.25;   // más lento: cada columna dura varios cuadros
//   velocidad = 4;      // más rápido: se salta columnas y deja huecos
//
// Ver la cámara además del slitscan (la vista previa tapa lo ya pintado,
// se recupera cuando el contador vuelve a pasar por ahí):
//   image(cam, 0, 0, cam.width/4, cam.height/4);   // al final de draw()
//
// Guardar la secuencia para montarla como video:
//   saveFrame("cuadros/########.png");             // al final de draw()
//
// Escribir en renglones en vez de columnas: leer una fila de la cámara y
// recorrer x en lugar de y. El tiempo corre entonces de arriba a abajo.
