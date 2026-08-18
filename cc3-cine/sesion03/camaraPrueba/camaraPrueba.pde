// 03 · ¿La cámara funciona?
// Código Creativo 3 · Cine · Sesión 03
//
// Antes de cualquier efecto: comprobar que Processing ve la cámara.
// Requiere la librería Video: Sketch > Import Library > Manage Libraries > "Video"

import processing.video.*;

Capture cam;

void setup() {
  size(640, 480);

  // Qué cámaras hay disponibles. La lista aparece en la consola de abajo.
  String[] camaras = Capture.list();
  printArray(camaras);

  // Tomamos la primera de la lista. Si no es la que queremos, cambiar el 0
  // por el número que aparezca en la consola.
  cam = new Capture(this, camaras[0]);

  cam.start();
}

// Processing avisa por su cuenta cada vez que llega un cuadro nuevo.
// Esta función no la llamamos nosotros: se llama sola.
void captureEvent(Capture cam) {
  cam.read();
}

void draw() {
  image(cam, 0, 0, width, height);

  // La resolución real de la cámara. No siempre es la que pedimos.
  fill(0);
  rect(0, 0, 200, 26);
  fill(255);
  text("cámara: " + cam.width + " x " + cam.height, 10, 18);
}
