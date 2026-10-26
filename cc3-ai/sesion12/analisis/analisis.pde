// Sesión 12 · Análisis de audio — Código Creativo 3 · Arquitectura de Interiores
//
// El sonido también es un número que cambia. Amplitude dice qué tan fuerte
// suena; FFT lo separa en bandas, de los graves a los agudos. Cada número
// puede mover un parámetro del dibujo, como en Hydra con el micrófono.
//
// Necesita la biblioteca Sound: Sketch > Importar biblioteca > Sound.
//
// Teclas
//   1  amplitud: un círculo que crece con el volumen
//   2  espectro: una barra por banda
//   3  tres bandas: graves, medios y agudos mueven tres cosas distintas

import processing.sound.*;

// true: micrófono. false: un archivo dentro de la carpeta data del sketch
// (Sketch > Añadir archivo…), con el nombre que va en ARCHIVO.
boolean MICROFONO = true;
String ARCHIVO = "sonido.mp3";

int BANDAS = 64;           // potencia de dos: 32, 64, 128, 256…
float SUAVIZADO = 0.2;     // 1 sigue cada cuadro; cerca de 0 se mueve lento
float GANANCIA = 4;        // si el dibujo apenas se mueve, súbela

Amplitude amplitud;
FFT fft;
float[] espectro = new float[BANDAS];
float volumen = 0;
int modo = 1;

void setup() {
  size(800, 600);
  pixelDensity(1);
  noStroke();

  amplitud = new Amplitude(this);
  fft = new FFT(this, BANDAS);

  if (MICROFONO) {
    AudioIn entrada = new AudioIn(this, 0);
    entrada.start();
    amplitud.input(entrada);
    fft.input(entrada);
  } else {
    SoundFile archivo = new SoundFile(this, ARCHIVO);
    archivo.loop();
    amplitud.input(archivo);
    fft.input(archivo);
  }
}

void draw() {
  background(20);

  // Leer: un número para el volumen y uno por banda, entre 0 y 1.
  // Se suavizan igual que en Hydra con a.setSmooth().
  volumen = lerp(volumen, amplitud.analyze() * GANANCIA, SUAVIZADO);
  fft.analyze();
  for (int i = 0; i < BANDAS; i++) {
    espectro[i] = lerp(espectro[i], fft.spectrum[i] * GANANCIA * 10, SUAVIZADO);
  }

  if (modo == 1) dibujarAmplitud();
  if (modo == 2) dibujarEspectro();
  if (modo == 3) dibujarTresBandas();
}

// ── 1 · AMPLITUD ────────────────────────────────────────────────────

void dibujarAmplitud() {
  float diametro = map(volumen, 0, 1, 20, height);
  fill(255);
  circle(width / 2, height / 2, diametro);
}

// ── 2 · ESPECTRO ────────────────────────────────────────────────────
//
// La banda 0 son los graves, a la izquierda; la última, los agudos.

void dibujarEspectro() {
  float ancho = width / float(BANDAS);
  for (int i = 0; i < BANDAS; i++) {
    float alto = espectro[i] * height;
    fill(map(i, 0, BANDAS, 80, 255), 120, 200);
    rect(i * ancho, height, ancho - 1, -alto);
  }
}

// ── 3 · TRES BANDAS ─────────────────────────────────────────────────
//
// Promediar grupos de bandas da tres números. Cada uno mueve algo distinto:
// los graves el tamaño, los medios el giro y los agudos el color.

void dibujarTresBandas() {
  float graves = promedio(0, 4);
  float medios = promedio(4, 16);
  float agudos = promedio(16, BANDAS);

  translate(width / 2, height / 2);
  rotate(medios * TWO_PI);
  fill(255, 255 - agudos * 255, 120 + agudos * 135);
  float lado = map(graves, 0, 1, 40, height * 0.8);
  rectMode(CENTER);
  rect(0, 0, lado, lado);
  rectMode(CORNER);
}

float promedio(int desde, int hasta) {
  float suma = 0;
  for (int i = desde; i < hasta; i++) suma += espectro[i];
  return constrain(suma / (hasta - desde), 0, 1);
}

void keyPressed() {
  if (key == '1') modo = 1;
  if (key == '2') modo = 2;
  if (key == '3') modo = 3;
}
