// 05b · Slitscan sin cámara (respaldo)
// Código Creativo 3 · Cine · Sesión 03
//
// Exactamente el mismo código, pero leyendo de una imagen fija en vez de la
// cámara. Sirve si la cámara no funciona, y también es un efecto por su cuenta:
// la columna que se lee la mueve el mouse.
//
// Antes de correr: arrastrar cualquier .jpg o .png sobre la ventana del editor
// de Processing (o Sketch > Add File). El archivo se copia a la carpeta data/
// del sketch. Escribir su nombre aquí abajo.

PImage img;
String archivo = "imagen.jpg";

float contador = 0;
float velocidad = 1;

void setup() {
  size(1000, 300);
  img = loadImage(archivo);
  background(0);
}

void draw() {

  if (img == null) return;   // el nombre del archivo no coincide

  img.loadPixels();
  loadPixels();

  // Qué columna de la imagen leemos: la que señala el mouse
  int xImg = int(map(mouseX, 0, width, 0, img.width - 1));
  xImg = constrain(xImg, 0, img.width - 1);

  int xVentana = int(contador);

  for (int y = 0; y < height; y++) {
    int yImg = int(map(y, 0, height, 0, img.height));
    color c = img.pixels[xImg + yImg * img.width];
    pixels[xVentana + y * width] = c;
  }

  updatePixels();

  contador = contador + velocidad;
  if (contador >= width) {
    contador = 0;
  }
}

// ─────────────────────────────────────────────────────────────
// Para probar: que la columna de lectura avance sola en vez de seguir al mouse.
//
//   int xImg = int(map(contador, 0, width, 0, img.width - 1));
//
// Si las dos avanzan al mismo ritmo, la imagen se reconstruye tal cual.
// Si una avanza más rápido que la otra, se estira o se comprime.
