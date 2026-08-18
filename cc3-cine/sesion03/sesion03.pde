// Sesión 03 · Iteraciones y pixeles
// Código Creativo 3 · Cine · 2027-I
//
// Tres ejercicios en un solo sketch. Son EL MISMO código: dos iteraciones que
// recorren la ventana y escriben un pixel. Lo único que cambia es de dónde
// sale el color.
//
//   1 · sólido      el color es una constante
//   2 · gradiente   el color se calcula a partir de la posición
//   3 · slitscan    el color se lee de otra imagen (la cámara)
//
// Para cambiar de ejercicio hay que comentar y descomentar líneas: son los dos
// bloques en MAYÚSCULAS, allá abajo. En Processing, Ctrl+/ (Cmd+/ en Mac)
// comenta y descomenta la línea del cursor, o todas las que estén seleccionadas.
//
// Antes de correr: Sketch > Import Library > Manage Libraries… > "Video".
// Sin esa librería el sketch no compila y marca error en el import de aquí abajo.

import processing.video.*;

// ── Los dos colores del gradiente, uno de cada lado del canvas ──
// Cambiar estas dos líneas cambia la pieza completa.
color izquierda = color(255, 60, 90);
color derecha   = color(0, 90, 255);

// ── Perillas del slitscan ──
float posicionLectura = 0.5;   // qué columna de la cámara leemos: 0 izq, 1 der
float contador  = 0;           // en qué columna de la ventana escribimos
float velocidad = 1;           // cuánto avanza el contador en cada cuadro

Capture cam;
PImage  img;

void setup() {
  size(1000, 300);
  background(0);

  // La cámara. Si no hay ninguna, la consola lo dice y los ejercicios 1 y 2
  // siguen funcionando igual.
  String[] camaras = Capture.list();
  printArray(camaras);
  if (camaras.length > 0) {
    cam = new Capture(this, camaras[0]);
    cam.start();
  }

  // Una imagen fija, para trabajar sin cámara. Arrastrar cualquier .jpg sobre
  // la ventana del editor: se copia a la carpeta data/ del sketch.
  img = loadImage("imagen.jpg");
  if (img != null) img.loadPixels();
}

// Esta función no la llamamos nosotros: Processing la llama sola cada vez que
// llega un cuadro nuevo de la cámara.
void captureEvent(Capture cam) {
  cam.read();
  cam.loadPixels();
}

void draw() {

  loadPixels();   // abre pixels[]: la lista de pixeles de la ventana

  // ── QUÉ COLUMNAS SE PINTAN EN ESTE CUADRO · descomentar una sola ──────────
  int desde = 0, hasta = width;                     // 1 y 2 · el canvas entero
  //int desde = int(contador), hasta = desde + 1;   // 3 · sólo una columna

  // Dos iteraciones, una dentro de la otra:
  //   y recorre los renglones y x recorre las columnas.
  // El for de adentro se completa entero en cada vuelta del de afuera.
  for (int y = 0; y < height; y++) {
    for (int x = desde; x < hasta; x++) {

      // pixels[] es una sola fila larga, no una rejilla. Este es el número que
      // le pusimos a cada cuadro en la rejilla de papel: saltamos y renglones
      // completos (y * width) y avanzamos x columnas.
      int i = x + y * width;

      // ── DE DÓNDE SALE EL COLOR · descomentar una sola ────────────────────
      pixels[i] = izquierda;                                                    // 1 · sólido
      //pixels[i] = lerpColor(izquierda, derecha, map(x, 0, width - 1, 0, 1));  // 2 · gradiente
      //pixels[i] = pixelDeCamara(posicionLectura, y);                          // 3 · slitscan
      //pixels[i] = pixelDeImagen(map(mouseX, 0, width, 0, 1), y);              // 3b · sin cámara
    }
  }

  updatePixels();   // cierra pixels[] y manda el resultado a pantalla

  // El contador avanza y vuelve al principio al llegar al borde.
  // Sólo lo usa el ejercicio 3; en los otros dos no estorba.
  contador = contador + velocidad;
  if (contador >= width) {
    contador = 0;
  }
}

// Lee un pixel de la cámara.
// 'columna' va de 0 (borde izquierdo) a 1 (derecho) y 'y' es el renglón de la
// ventana. Hay que traducirlo al renglón de la cámara: son dos rejillas de
// distinto tamaño y cada índice se calcula con su propio ancho.
color pixelDeCamara(float columna, int y) {
  if (cam == null || cam.pixels == null) return color(0);
  int xCam = int(constrain(columna, 0, 1) * (cam.width - 1));
  int yCam = int(map(y, 0, height, 0, cam.height));
  return cam.pixels[xCam + yCam * cam.width];
}

// Lo mismo, leyendo de la imagen fija en vez de la cámara.
color pixelDeImagen(float columna, int y) {
  if (img == null) return color(0);
  int xImg = int(constrain(columna, 0, 1) * (img.width - 1));
  int yImg = int(map(y, 0, height, 0, img.height));
  return img.pixels[xImg + yImg * img.width];
}

// ─────────────────────────────────────────────────────────────────────────────
// PARA PROBAR
//
// Ejercicio 1 — cambiar la línea del color sólido por alguna de estas:
//   pixels[i] = color(x, y, 100);              // el color depende del lugar
//   pixels[i] = color(random(255));            // ruido
//   if (x % 20 < 10) pixels[i] = izquierda;    // franjas verticales
//   if ((x + y) % 2 == 0) pixels[i] = izquierda;  // tablero de ajedrez
//
// Ejercicio 2 — la dirección del gradiente está en el último argumento de
// lerpColor(), que es "qué tan a la derecha estamos", de 0 a 1:
//   map(y, 0, height - 1, 0, 1)                          // vertical
//   map(x + y, 0, width + height - 2, 0, 1)              // diagonal
//   map(dist(x, y, width/2, height/2), 0, width/2, 0, 1) // radial
//
// Lo que lerpColor() hace por dentro, escrito a mano. Un color son tres
// números y cada uno se mezcla por su cuenta:
//   float t = map(x, 0, width - 1, 0, 1);
//   float r = lerp(red(izquierda),   red(derecha),   t);
//   float g = lerp(green(izquierda), green(derecha), t);
//   float b = lerp(blue(izquierda),  blue(derecha),  t);
//   pixels[i] = color(r, g, b);
//
// Ejercicio 3 — las perillas de arriba:
//   velocidad = 0.25;        // más lento: cada columna dura varios cuadros
//   velocidad = 4;           // más rápido: se salta columnas y deja huecos
//   posicionLectura = 0;     // leer el borde izquierdo de la cámara
//
// Ver la cámara encima del slitscan. La vista previa tapa lo ya pintado y se
// recupera cuando el contador vuelve a pasar por ahí. Va al final de draw():
//   image(cam, 0, 0, cam.width/4, cam.height/4);
//
// Guardar la secuencia para montarla como video, también al final de draw():
//   saveFrame("cuadros/########.png");
//
// EL ATAJO. Processing ya trae copy(), que hace en una línea el for completo
// del ejercicio 3 y de paso estira la tira. Con esto se puede borrar todo lo
// demás de draw(); conviene saber que por dentro está haciendo justo lo que
// acabamos de escribir: leer un índice y escribir otro, uno por uno.
//   copy(cam, cam.width/2, 0, 1, cam.height, int(contador), 0, 1, height);
//        └── de dónde: una tira de 1 pixel de ancho, en medio de la cámara
