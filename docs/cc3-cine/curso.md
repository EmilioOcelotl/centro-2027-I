---
# ─────────────────────────────────────────────────────────────
#  Código Creativo · Cine — configuración del sitio.
#  Todo lo que ve el alumno sale de este frontmatter.
#  Guía completa de campos: ../../../plantilla-curso/plantilla.md
#
#  PROVISIONAL (3 ago 2026): mismo programa oficial de CENTRO que cc3-ai
#  —"Programación orientada a objetos en el diseño"—, con los ejercicios
#  aterrizados en cine. Los 8 temas del contenido temático van en las sesiones
#  impares y las 8 asesorías en las pares. Está pendiente releer las 16 como
#  doble diamante, igual que en cc3-ai.
# ─────────────────────────────────────────────────────────────

# 1 · IDENTIDAD
universidad: "CENTRO"
programa: "Cine"
titulo: "Código Creativo 3"
edicion: "2027-I"
imparte: "Emilio Ocelotl"
grupos: []                          # ["Grupo A", "Grupo B"] si hay más de uno

intro: "Programación orientada a objetos en el diseño. Al finalizar el curso el alumno aplicará conocimientos de programación orientada a objetos en Processing para realizar manipulación de imágenes fijas y composiciones animadas. Podemos usar otras plataformas y explorar otros paradigmas, se resuelve sobre la marcha."
caption: ""                         # vacío = sin frase bajo el diagrama; borra la línea para la de por defecto

# 2 · ACUERDO SOBRE EL USO DE IA — sale en la portada, bajo el objetivo.
#     'texto' admite una cadena o una lista de puntos. Sin 'ia' —o con 'texto'
#     vacío— el recuadro no aparece.
ia:
  titulo: "Uso de inteligencia artificial"
  texto: "Punto de partida: una discusión sobre el uso de IA en general. En este curso está permitido usar Inteligencia Artificial generativa para la escritura de código. Las ideas y planeación deberán realizarse con escritura convencional, están permitidos archivos digitales o analógicos. "

# 3 · CALENDARIO
calendario:
  inicio: 2026-08-03                # primer día del semestre: la 1ª sesión es el
                                    # primer martes a partir de esta fecha
  dias: [martes]                    # [lunes, miercoles] si son dos por semana
  festivos: []                      # ningún festivo cae en martes este semestre
  descansos:
    - {de: 2026-10-05, a: 2026-10-09, etiqueta: "Receso"}

# 4 · ESTRUCTURA — define la forma del diagrama y la evaluación
estructura:
  iteraciones:
    - {nombre: "Objetos e imagen fija", sesiones: [1, 8],  nota: "Transformaciones, vectores, programación orientada a objetos y manipulación de imagen fija."}
    - {nombre: "Composición animada",   sesiones: [9, 16], nota: "Trigonometría, ruido y sonido aplicados a la animación."}
  entregas:                         # caen en una sesión y cierran la iteración
    - {sesion: 8,  etiqueta: "Trabajo parcial", peso: 30}
    - {sesion: 16, etiqueta: "Trabajo final",             peso: 40}
  continuas:                        # se califican sin fecha fija
    - {etiqueta: "Ejercicios de objetos y trigonometría", peso: 30}

# 5 · SESIONES — el número de sesiones define la duración del curso.
sesiones:
  # 'desc' admite una lista. Con varios puntos conviene la forma en bloque:
  # las claves de la sesión van sangradas a la columna que abre el guion.
  - n: 1
    titulo: "Encuadre y pixeles"
    tool: "Hydra"
    desc:
      - "Presentaciones. Curso, profesor, alumnxs"
      - "Acuerdo sobre el uso de IA en la clase"
      - "Evaluación y resultados esperados"
      - "Puntualidad y tolerancia"
      - "Metodología y contenido que puede ser flexible"
      - "Actividad con Hydra e introducción a pixeles"
      - "Funciones con Hydra"
  - n: 2
    titulo: "Patrones dibujados, ideas divergentes sobre el proyecto parcial"
    tool: "Papel o dispositivo para dibujar"
    desc:
      - "Pixeles, fotogramas y texturas"
      - "Actividad: dibujar el patrón de una textura digital o de un fotograma. ¿Qué características tiene?"
      - "Conformación de equipos y primer acercamiento al proyecto parcial: el reto"
  - n: 3
    titulo: "Vectores"
    tool: "Processing"
    desc:
      - "¿Qué es un vector? Dirección y magnitud"
      - "Atributos: x, y, z"
      - "Traslación y dirección: suma y resta"
      - "Escala: multiplicación y división"
      - "Calcular la magnitud: teorema de Pitágoras"
      - "Normalización"
  - n: 4
    titulo: "Asesoría"
    tool: ""
    desc:
      - "Revisión de ejercicios con vectores"
  - n: 5
    titulo: "Introducción a la programación orientada a objetos"
    tool: "Processing"
    desc:
      - "Paradigma de la programación orientada a objetos"
      - "Estructura y sintaxis de una clase"
      - "Diagrama de clases"
      - "Atributos y variables"
      - "Constructor y constructor con argumentos"
      - "Métodos y funciones"
      - "Arreglos de objetos"
  - n: 6
    titulo: "Asesoría"
    tool: ""
    desc:
      - "Revisión de ejercicios con clases y arreglos de objetos"
      - "Ejercicios aplicados a conceptos de cine: encuadre, plano y punto de vista"
  - n: 7
    titulo: "Manipulación de imagen fija"
    tool: "Processing"
    desc:
      - "Algoritmo de ordenamiento"
      - "Manipulación de imágenes por hue, brillo y RGB"
      - "Pixels: loadPixels, pixels[], updatePixels"
  - n: 8
    titulo: "Entrega parcial"
    tool: ""
    desc:
      - "Ejercicios de programación orientada a objetos aplicada a la manipulación de imagen fija"
  - n: 9
    titulo: "Animación: trigonometría I"
    tool: "Processing"
    desc:
      - "Introducción a las funciones trigonométricas"
      - "Triángulo rectángulo y distancia euclidiana"
      - "Periodicidad"
      - "Oscilaciones: amplitud, frecuencia y fase"
  - n: 10
    titulo: "Asesoría"
    tool: ""
    desc:
      - "Revisión de ejercicios de oscilación"
  - n: 11
    titulo: "Animación: trigonometría II"
    tool: "Processing"
    desc:
      - "Coordenadas polares y cartesianas"
      - "Parametrización de un círculo"
      - "Seno y coseno"
      - "Lerp"
  - n: 12
    titulo: "Asesoría"
    tool: ""
    desc:
      - "Revisión de ejercicios de trigonometría"
      - "Ejercicios interactivos aplicados a conceptos de cine: movimiento de cámara, ritmo y montaje"
  - n: 13
    titulo: "Animación: ruido"
    tool: "Processing"
    desc:
      - "Introducción al ruido"
      - "Diferencia entre ruido y azar"
      - "Espacios de sampleo"
      - "Detalle de ruido y semilla"
  - n: 14
    titulo: "Asesoría"
    tool: ""
    desc:
      - "Revisión de ejercicios con ruido"
      - "Avances del trabajo final"
  - n: 15
    titulo: "Animación: sonido y análisis de audio"
    tool: "Processing · sound"
    desc:
      - "Ondas y codificación digital del sonido (sound file y audio sample)"
      - "Generación de audio: osciladores y ruido"
      - "Modificación de audio: efectos y filtros"
      - "Análisis de audio: FFT y amplitud"
  - n: 16
    titulo: "Entrega final"
    tool: ""
    desc:
      - "Trabajo final desarrollando procesos de composición animada"

# 6 · REFERENCIAS — lista al final del documento, antes del colofón.
#     Cada entrada es una cadena, o un mapa {texto, url} si hay a dónde ir.
#     Sin 'referencias' —o con la lista vacía— la sección no aparece.
referencias: []
# referencias:
#   - "Autor, A. (2020). Título. Editorial."
#   - {texto: "Nombre del recurso", url: "https://ejemplo.org"}

# 7 · COLOFÓN — columnas del pie de página. Sin 'colofon' ni 'grupos' el pie no
#     aparece en pantalla; impreso conserva la URL del sitio.
colofon:
  - titulo: "Herramientas"
    texto:
      - "Processing como entorno de desarrollo para la manipulación de imágenes fijas y composiciones animadas."
      - "Brightspace para la comunicación y la evaluación."
  - titulo: "Trabajo independiente"
    texto:
      - "Búsqueda y revisión de proyectos de referencia y de canales de YouTube."
      - "Ejercicios aplicados a conceptos de la carrera."
      - "Ejercicios interactivos aplicados a conceptos de la carrera."
  - titulo: "Asistencia"
    texto: "Para acreditar el curso es necesario contar con el 80% de asistencia."
---

<!-- El motor v1 sólo usa el frontmatter de arriba. -->
