// 02 · Gradiente entre dos colores
// Código Creativo 3 · Cine · Sesión 03
//
// Mismo recorrido que el color sólido. Lo único que cambia es que el color
// ya no es una constante: se calcula a partir de la posición del pixel.

// Los dos colores del gradiente, uno en cada lado del canvas.
// Cambiar estas dos líneas cambia la pieza completa.
color izquierda = color(255, 60, 90);    // rosa
color derecha   = color(0, 90, 255);     // azul

void setup() {
  size(600, 400);
  noLoop();
}

void draw() {

  loadPixels();

  for (int y = 0; y < height; y++) {
    for (int x = 0; x < width; x++) {

      int i = x + y * width;

      // t es "qué tan a la derecha estamos", de 0 a 1.
      // map() traduce un rango a otro: x va de 0 a width-1, t va de 0 a 1.
      float t = map(x, 0, width - 1, 0, 1);

      // lerpColor() mezcla dos colores: con t=0 devuelve izquierda,
      // con t=1 devuelve derecha, y en medio la mezcla proporcional.
      pixels[i] = lerpColor(izquierda, derecha, t);
    }
  }

  updatePixels();
}

// ─────────────────────────────────────────────────────────────
// Variaciones — cambiar solamente la línea de t:
//
//   float t = map(y, 0, height - 1, 0, 1);                  // vertical
//   float t = map(x + y, 0, width + height - 2, 0, 1);      // diagonal
//   float t = map(dist(x, y, width/2, height/2), 0, width/2, 0, 1);  // radial
//   float t = map(mouseX, 0, width, 0, 1);                  // pide loop()
//
// Lo que lerpColor() hace por dentro, escrito a mano.
// Sirve para ver que un color son tres números y que cada uno se mezcla solo:
//
//   float r = lerp(red(izquierda),   red(derecha),   t);
//   float g = lerp(green(izquierda), green(derecha), t);
//   float b = lerp(blue(izquierda),  blue(derecha),  t);
//   pixels[i] = color(r, g, b);
