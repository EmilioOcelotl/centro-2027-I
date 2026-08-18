// 06 · El atajo: copy()
// Código Creativo 3 · Cine · Sesión 03
//
// Processing ya trae una función que mueve un pedazo de imagen a otro lugar.
// Hace en una línea el for completo del sketch anterior, y de paso lo estira.
// Vale la pena usarla, pero conviene saber qué está haciendo por dentro:
// leer un índice, escribir otro índice, uno por uno.

import processing.video.*;

Capture cam;
float contador;

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

  int w = cam.width;
  int h = cam.height;

  // copy(origen, x, y, ancho, alto, x, y, ancho, alto)
  //      ↑              de dónde              a dónde
  // Tomamos una tira de 1 pixel de ancho y h de alto del centro de la cámara,
  // y la pegamos en la columna 'contador', estirada a todo el alto.
  copy(cam, w/2, 0, 1, h, int(contador), 0, 1, height);

  // Vista previa de la cámara encima
  image(cam, 0, 0, cam.width/2, cam.height/2);

  contador = contador + 1;
  if (contador > width) {
    contador = 0;
  }

  // saveFrame("cuadros/########.png");
}
