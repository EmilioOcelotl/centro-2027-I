---
# ─────────────────────────────────────────────────────────────
#  Laboratorio de ciencia, creatividad y tecnología — configuración del sitio.
#  Todo lo que ve el alumno sale de este frontmatter.
#  Guía completa de campos: ../../../plantilla-curso/plantilla.md
#
#  LÓGICA DEL CURSO (3 ago 2026): dos iteraciones que responden a preguntas
#  distintas, no a dos mitades del mismo temario.
#    I1 (1–8)  Mapear     — minimapper: el ciclo completo con una herramienta
#                           que corre en cualquier navegador, sin cuenta ni
#                           licencia ni instalación.
#    I2 (9–16) Resolver   — TouchDesigner entra POR DEMANDA. En la sesión 9
#                           cada equipo nombra el aspecto que su proyecto
#                           necesita y minimapper no da; ESO fija el orden y
#                           el contenido de las sesiones 10 a 13.
#  Corrige lo aprendido en 2026-II: 16 sesiones de una sola herramienta pesada
#  se vuelven cuesta arriba; empezar por lo que da imagen inmediata engancha.
# ─────────────────────────────────────────────────────────────

# 1 · IDENTIDAD
universidad: "CENTRO"
programa: "Laboratorio"   # ¿es sólo de Interiores o abierto a varias carreras?
titulo: "Laboratorio de ciencia, creatividad y tecnología"
edicion: "2027-I"
imparte: "Emilio Ocelotl"
grupos: []                          # ["Grupo A", "Grupo B"] si hay más de uno

intro: "Iluminación y videomapping como materiales de proyecto. Al finalizar el curso proyectarás una pieza propia sobre un objeto y una superficie no plana. Primero mapeamos con minimapper y después abrimos TouchDesigner para resolver lo que cada proyecto pida: geometría compleja, detección de persona, audio reactivo o sistemas de partículas."
caption: ""                         # vacío = sin frase bajo el diagrama; borra la línea para la de por defecto

# 2 · ACUERDO SOBRE EL USO DE IA — sale en la portada, bajo el objetivo.
#     'texto' admite una cadena o una lista de puntos. Sin 'ia' —o con 'texto'
#     vacío— el recuadro no aparece.
ia:
  titulo: "Uso de inteligencia artificial"
  texto: "Como parte de la metodología del curso es necesario llegar a un acuerdo claro para el uso de inteligencia artificial. Punto de partida: está permitida para escribir código; el concepto, la definición del proyecto y las decisiones de montaje se sostienen con escritura y dibujo propios."

# 3 · CALENDARIO
calendario:
  inicio: 2026-08-03                # primer día del semestre: la 1ª sesión es el
                                    # primer viernes a partir de esta fecha
  dias: [viernes]                   # [lunes, miercoles] si son dos por semana
  festivos: []                      # sin festivos en viernes este semestre
  descansos:
    - {de: 2026-10-05, a: 2026-10-09, etiqueta: "Receso"}

# 4 · ESTRUCTURA — define la forma del diagrama y la evaluación
estructura:
  iteraciones:
    - {nombre: "Mapear",   sesiones: [1, 8],  nota: "Un ciclo completo con minimapper: síntesis visual, fuentes, superficie, montaje y proyección."}
    - {nombre: "Afinar", sesiones: [9, 16], nota: "Soluciones específicas: cada equipo nombra su aspecto no resuelto y de ahí sale el contenido."}
  entregas:                         # caen en una sesión y cierran la iteración
    - {sesion: 8,  etiqueta: "Proyección parcial", peso: 30}
    - {sesion: 16, etiqueta: "Proyección final",   peso: 40}
  continuas:                        # se califican sin fecha fija
    - {etiqueta: "Bitácora y ejercicios", peso: 30}

# 5 · SESIONES — el número de sesiones define la duración del curso.
sesiones:
  # 'desc' admite una lista. Con varios puntos conviene la forma en bloque:
  # las claves de la sesión van sangradas a la columna que abre el guion.
  - n: 1
    titulo: "Encuadre y primera imagen"
    tool: "Hydra"
    desc:
      - "Presentaciones. Curso, profesor, alumnxs"
      - "Acuerdo sobre el uso de IA en la clase"
      - "Evaluación, bitácora y resultados esperados"
      - "Puntualidad y tolerancia"
      - "Texturas y Hydra. Exploración de sketches existentes y generadores básicos"
      - "Siguiente paso: modulaciones"
      - "Actividad: Descripción de la textura ¿dónde la podríamos proyectar?"
  - n: 2
    titulo: "Cambio en clase 2"
    tool: ""
    desc:
      - "Pendiente reagendar o encontrar una solución"
  - n: 3
    titulo: "Cámara y caleidoscopio"
    tool: "Hydra"
    desc:
      - "¿Qué han hecho en la otra clase?" 
      - "Interfaz presentada la semana pasada"
      - "La cámara como una posible entrada al sistema"
      - "Modificaciones para la cámara y render final."
      - "Captura de pantalla y subir a brightspace"
      - "Investigación:¿Qué es videomapping?"
      - "Pensar en tres posibles proyectos"
  - n: 4
    titulo: "Fuentes y formas libres"
    tool: "minimapper"
    desc:
      - "Video, imagen, cámara y carrusel como fuente de un quad"
      - "Archivo local contra URL: qué se guarda y qué no"
      - "Formas libres: polígonos para superficies que no son rectángulos"
      - "Mapeo sobre un objeto traído a clase"
  - n: 5
    titulo: "Definir el proyecto parcial"
    tool: "Papel y plantilla"
    desc:
      - "Conformación de equipos"
      - "Plantilla de proyecto: concepto, superficie, fuente, interacción, riesgos"
      - "Divergir sobre la fotografía del espacio elegido"
      - "El reto: proyectar sobre una superficie real del campus"
  - n: 6
    titulo: "Tiempo y reacción"
    tool: "minimapper"
    desc:
      - "Escenas con duración y modos de reproducción"
      - "Micrófono: detección de aplauso y avance de imágenes"
      - "Audio reactivo con a.fft"
      - "Prototipo en clase"
      - "Ejercicio 2: una pieza de tres escenas"
  - n: 7
    titulo: "Ensayo con proyector"
    tool: "En sitio"
    desc:
      - "Montaje sobre la superficie elegida: distancia, encuadre, luz ambiente, cableado"
      - "Ajuste fino del mapeo con el proyector encendido"
      - "Retroalimentación cruzada entre equipos"
      - "Plan B por escrito para el día de la entrega"
  - n: 8
    titulo: "Proyección parcial"
    tool: ""
    desc:
      - "Proyección mapeada sobre una superficie plana o de bajo relieve"
      - "Mínimos: dos quads, dos tipos de fuente y una decisión de código explicada"
      - "Entrega de la plantilla y del archivo de sesión"
      - "Retroalimentación colectiva y primer corte de bitácora"
  - n: 9
    titulo: "Redefinir: ¿qué te falta?"
    tool: "Plantilla final"
    desc:
      - "Retrospectiva del parcial"
      - "Se sube la ambición: el final proyecta sobre un objeto y una superficie"
      - "Cada equipo nombra el aspecto que su proyecto necesita y no resolvió"
      - "Ese listado fija el contenido y el orden de las sesiones 10 a 13"
      - "Menú: geometría compleja, detección de persona, audio reactivo fino, partículas, varias salidas, control externo"
  - n: 10
    titulo: "TouchDesigner: traducción"
    tool: "TouchDesigner"
    desc:
      - "Red de operadores: TOP, CHOP, SOP, DAT"
      - "Movie File In, Noise, Feedback"
      - "Salida a proyector: Window COMP y perform mode"
      - "Ejercicio: rehacer en TD algo que ya funciona en minimapper"
  - n: 11
    titulo: "Geometría que minimapper no da"
    tool: "TouchDesigner · Kantan Mapper"
    desc:
      - "Mapeo sobre geometría compleja"
      - "Máscaras y curvas bezier"
      - "Varias superficies en un mismo proyecto"
      - "Comparación explícita con minimapper: qué gana y qué cuesta"
  - n: 12
    titulo: "Que reaccione a alguien"
    tool: "TouchDesigner · cámara"
    desc:
      - "Cámara y detección de persona con Mediapipe"
      - "CHOPs de control: filtros, lag y suavizado"
      - "Alternativa según lo pedido en la sesión 9: análisis de audio con Audio Device In y CHOP to TOP"
  - n: 13
    titulo: "Sistemas"
    tool: "TouchDesigner"
    desc:
      - "Sistemas de partículas e instancing"
      - "Retroalimentación de imagen"
      - "Sesión ya mixta: cada equipo en su técnica, con asesoría"
  - n: 14
    titulo: "Integración y decisión de herramienta"
    tool: "La que elija cada equipo"
    desc:
      - "minimapper, TouchDesigner o una combinación de ambos"
      - "Se ataca el mayor riesgo técnico de cada proyecto"
      - "Integración de imagen, sonido e interacción"
  - n: 15
    titulo: "Ensayo general"
    tool: "En sitio"
    desc:
      - "Montaje completo en el espacio de proyección: objeto y superficie"
      - "Luz, sonido, cableado y tiempos"
      - "Ensayo de la presentación"
  - n: 16
    titulo: "Proyección final"
    tool: ""
    desc:
      - "Proyección sobre un objeto y una superficie, ante público"
      - "Entrega de bitácora completa"

# 6 · REFERENCIAS — lista al final del documento, antes del colofón.
#     Cada entrada es una cadena, o un mapa {texto, url} si hay a dónde ir.
#     Sin 'referencias' —o con la lista vacía— la sección no aparece.
referencias:
  - {texto: "minimapper — videomapping generativo en el navegador", url: "https://emilioocelotl.github.io/minimapper/"}
  - {texto: "Hydra — síntesis visual en vivo", url: "https://hydra.ojack.xyz/"}
  - {texto: "Hydra: lista de funciones", url: "https://hydra.ojack.xyz/api/"}
  - {texto: "TouchDesigner (licencia no comercial)", url: "https://derivative.ca/download"}
  - {texto: "Kantan Mapper — mapeo de superficies en TouchDesigner", url: "https://derivative.ca/UserGuide/KantanMapper"}

# 7 · COLOFÓN — columnas del pie de página. Sin 'colofon' ni 'grupos' el pie no
#     aparece en pantalla; impreso conserva la URL del sitio.
colofon:
  - titulo: "Herramientas"
    texto:
      - "minimapper y Hydra en el navegador: sin instalación, sin cuenta y sin licencia."
      - "TouchDesigner en la segunda mitad, con licencia no comercial. Corre en Windows y macOS."
      - "Brightspace para la comunicación y la evaluación."
  - titulo: "Trabajo independiente"
    texto:
      - "Bitácora: una imagen y tres líneas por sesión."
      - "Búsqueda y revisión de proyectos de referencia."
      - "Observación de superficies y espacios como material de proyecto."
  - titulo: "Asistencia"
    texto: "Para acreditar el curso es necesario contar con el 80% de asistencia."
---

<!-- El motor v1 sólo usa el frontmatter de arriba. -->
