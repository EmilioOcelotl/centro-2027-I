// 01 · Color sólido
// Código Creativo 3 · Cine · Sesión 03
//
// Pintar todo el canvas de un color, pixel por pixel.
// Existe background(), pero aquí lo hacemos a mano: la idea es ver
// que una imagen es una lista de pixeles y que podemos escribir en ella.

color relleno = color(255, 60, 90);   // el color que vamos a escribir

void setup() {
  size(600, 400);
  noLoop();                 // el dibujo no cambia: basta con hacerlo una vez
}

void draw() {

  loadPixels();             // abre pixels[]: la lista de pixeles de la ventana

  // Dos iteraciones, una dentro de la otra:
  //   y recorre los renglones (0 .. height-1)
  //   x recorre las columnas  (0 .. width-1)
  // El for de adentro se completa entero por cada vuelta del de afuera.
  for (int y = 0; y < height; y++) {
    for (int x = 0; x < width; x++) {

      // pixels[] es una sola fila larga, no una rejilla.
      // Este es el número que le pusimos a cada cuadro en la rejilla de papel:
      // saltamos y renglones completos (y * width) y avanzamos x columnas.
      int i = x + y * width;

      pixels[i] = relleno;
    }
  }

  updatePixels();           // cierra pixels[] y manda el resultado a pantalla
}

// ─────────────────────────────────────────────────────────────
// Para probar (cambiar la línea de pixels[i] por alguna de estas):
//
//   pixels[i] = color(x, y, 100);              // el color depende del lugar
//   pixels[i] = color(random(255));            // ruido
//   if (x % 20 < 10) pixels[i] = relleno;      // franjas verticales
//   if ((x + y) % 2 == 0) pixels[i] = relleno; // tablero de ajedrez
//
// Existe también set(x, y, relleno), que escribe un pixel sin abrir la lista.
// Es más corto de escribir y bastante más lento: para recorrer todo el
// canvas conviene loadPixels() / pixels[] / updatePixels().
