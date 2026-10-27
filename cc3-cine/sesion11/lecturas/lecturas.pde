// =====================================================
//  Análisis de sonido: Amplitud vs Forma de onda vs FFT
//  Processing + biblioteca Sound
//  (Sketch > Importar biblioteca > Sound)
//
//  El MISMO sonido entra a tres analizadores distintos.
//  Cada franja muestra una forma diferente de "leerlo":
//    1. Amplitud    -> ¿qué tan fuerte suena?   (un solo número)
//    2. Forma onda  -> ¿cómo se mueve en el tiempo? (muchos números)
//    3. FFT         -> ¿qué frecuencias contiene?  (graves a agudos)
// =====================================================

import processing.sound.*;

// ---- Fuente de sonido ----
// true  = micrófono de la computadora
// false = archivo de audio (ponlo en la carpeta "data" del sketch)
boolean usarMicrofono = true;
String archivo = "sonido.wav";

SoundObject fuente;   // puede ser AudioIn o SoundFile

// ---- Analizadores ----
Amplitude amplitud;
Waveform  forma;
FFT       fft;

int muestras = 2048;   // cuántos puntos de la forma de onda leemos
int bandas   = 512;   // bandas de la FFT (debe ser potencia de 2)

float ampSuave = 0;   // amplitud suavizada para que no "tiemble"

void setup() {
  size(900, 600);

  // 1. Elegir la fuente
  if (usarMicrofono) {
    AudioIn mic = new AudioIn(this, 0);
    mic.start();
    fuente = mic;
  } else {
    SoundFile sf = new SoundFile(this, archivo);
    sf.loop();
    fuente = sf;
  }

  // 2. Crear los tres analizadores y conectarles la misma fuente
  amplitud = new Amplitude(this);
  amplitud.input(fuente);

  forma = new Waveform(this, muestras);
  forma.input(fuente);

  fft = new FFT(this, bandas);
  fft.input(fuente);

  textFont(createFont("Monospaced", 14));
}

void draw() {
  background(15);

  float h = height / 3.0;
  dibujarAmplitud(0, 0, width, h);
  dibujarFormaDeOnda(0, h, width, h);
  dibujarFFT(0, h * 2, width, h);
}

// -----------------------------------------------------
// 1. AMPLITUD: un solo valor entre 0 y ~1
//    Ideal para: tamaño, brillo, opacidad, velocidad...
// -----------------------------------------------------
void dibujarAmplitud(float x, float y, float w, float h) {
  float a = amplitud.analyze();          // un número
  ampSuave = lerp(ampSuave, a, 0.2);     // suavizado

  // Círculo que crece con el volumen
  float diametro = map(ampSuave, 0, 0.5, 10, h * 0.9);
  noStroke();
  fill(255, 120, 80);
  ellipse(x + w * 0.75, y + h / 2, diametro, diametro);

  // Barra horizontal
  float largo = constrain(map(ampSuave, 0, 0.5, 0, w * 0.5), 0, w * 0.5);
  fill(255, 120, 80, 150);
  rect(x + 20, y + h / 2 - 10, largo, 20);

  etiqueta(x, y, w, h, "1. AMPLITUD", "valor: " + nf(a, 1, 3), color(255, 120, 80));
}

// -----------------------------------------------------
// 2. FORMA DE ONDA: la señal en el tiempo
//    Cada punto va de -1 a 1 (vibración del aire)
// -----------------------------------------------------
void dibujarFormaDeOnda(float x, float y, float w, float h) {
  forma.analyze();   // llena el arreglo forma.data

  stroke(100, 220, 160);
  strokeWeight(2);
  noFill();
  beginShape();
  for (int i = 0; i < muestras; i++) {
    float px = map(i, 0, muestras - 1, x, x + w);
    float py = y + h / 2 + forma.data[i] * (h / 2) * 0.9;
    vertex(px, py);
  }
  endShape();

  // Línea de cero (silencio)
  stroke(255, 40);
  strokeWeight(1);
  line(x, y + h / 2, x + w, y + h / 2);

  etiqueta(x, y, w, h, "2. FORMA DE ONDA", muestras + " muestras  |  eje x = tiempo", color(100, 220, 160));
}

// -----------------------------------------------------
// 3. FFT: el sonido descompuesto en frecuencias
//    Izquierda = graves, derecha = agudos
// -----------------------------------------------------
void dibujarFFT(float x, float y, float w, float h) {
  fft.analyze();   // llena el arreglo fft.spectrum

  float anchoBarra = w / bandas;
  noStroke();
  for (int i = 0; i < bandas; i++) {
    // sqrt hace visibles las bandas débiles
    float alto = constrain(sqrt(fft.spectrum[i]) * h * 2, 0, h - 30);
    fill(map(i, 0, bandas, 80, 255), 140, 255);
    rect(x + i * anchoBarra, y + h - alto, anchoBarra, alto);
  }

  etiqueta(x, y, w, h, "3. FFT (espectro)", bandas + " bandas  |  graves <-----> agudos", color(140, 140, 255));
}

// Separador y texto de cada franja
void etiqueta(float x, float y, float w, float h, String titulo, String info, color c) {
  stroke(255, 30);
  line(x, y, x + w, y);
  noStroke();
  fill(c);
  text(titulo, x + 15, y + 22);
  fill(200);
  text(info, x + 15, y + 42);
}
