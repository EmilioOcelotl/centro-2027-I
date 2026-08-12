---
# ─────────────────────────────────────────────────────────────
#  Código Creativo · Diseño Textil y Moda — configuración del sitio.
#  Todo lo que ve el alumno sale de este frontmatter.
#  Guía completa de campos: ../../../plantilla-curso/plantilla.md
#
#  (3 ago 2026) Volcado del programa "Cómputo físico e interacción" en la
#  estructura de dos iteraciones del semestre. El corte entre iteraciones cae
#  justo antes del receso de octubre. La segunda iteración ya estaba pensada
#  por iteraciones de prototipo (S13–S15), así que se respetó tal cual.
# ─────────────────────────────────────────────────────────────

# 1 · IDENTIDAD
universidad: "CENTRO"
programa: "Diseño Textil y Moda"
titulo: "Código Creativo 4"
edicion: "2027-I"
imparte: "Emilio Ocelotl"
grupos: []                          # ["Grupo A", "Grupo B"] si hay más de uno

intro: "Cómputo físico e interacción. Herramientas y métodos de implementación técnica para prendas interactivas y tecnología vestible: programación de microcontroladores, simulación de circuitos e interacciones físicas a partir de datos corporales y ambientales. Cada sesión resuelve un bloque técnico de los proyectos del semestre y debe servir de inmediato en Diseño de moda y tecnología portable, la asignatura complementaria con la que se comparte el proyecto final."
caption: ""                         # vacío = sin frase bajo el diagrama; borra la línea para la de por defecto

# 2 · ACUERDO SOBRE EL USO DE IA — sale en la portada, bajo el objetivo.
#     'texto' admite una cadena o una lista de puntos. Sin 'ia' —o con 'texto'
#     vacío— el recuadro no aparece.
ia:
  titulo: "Uso de inteligencia artificial"
  texto: "En este curso usamos inteligencia artificial generativa como herramienta para acelerar la escritura de código y poder enfocarnos en la integración física. La condición es poder describir y probar lo que el programa hace."

# 3 · CALENDARIO
calendario:
  inicio: 2026-08-03                # primer día del semestre: la 1ª sesión es el
                                    # primer miercoles a partir de esta fecha
  dias: [miercoles]                 # [lunes, miercoles] si son dos por semana
  festivos: [2026-09-16]            # Independencia
  descansos:
    - {de: 2026-10-05, a: 2026-10-09, etiqueta: "Receso"}

# 4 · ESTRUCTURA — define la forma del diagrama y la evaluación
estructura:
  iteraciones:
    - {nombre: "Circuitos, simulación y movimiento", sesiones: [1, 8],  nota: "De la simulación en Wokwi al circuito físico: componentes, sensores, servos, motores de pasos y alimentación."}
    - {nombre: "Datos, interfaz y proyecto final",   sesiones: [9, 16], nota: "Comunicación serial, calibración y prototipado web, e iteración del proyecto compartido con Diseño de moda y tecnología portable."}
  entregas:                         # caen en una sesión y cierran la iteración
    - {sesion: 8,  etiqueta: "Proyecto parcial", peso: 30}
    - {sesion: 16, etiqueta: "Proyecto final",                   peso: 40}
  continuas:                        # se califican sin fecha fija
    - {etiqueta: "Ejercicios de electrónica y código en Arduino", peso: 30}

# 5 · SESIONES — el número de sesiones define la duración del curso.
sesiones:
  # 'desc' admite una lista. Con varios puntos conviene la forma en bloque:
  # las claves de la sesión van sangradas a la columna que abre el guion.
  - n: 1
    titulo: "Encuadre y contexto técnico"
    tool: "Tinkercad"
    desc:
      - "Presentaciones. Curso, profesor, alumnxs"
      - "Acuerdo sobre el uso de IA en la clase"
      - "Evaluación y resultados esperados"
      - "Puntualidad y tolerancia"
      - "Metodología y contenido que puede ser flexible"
      - "Flujo de trabajo conjunto con Diseño de moda y tecnología portable"
      - "Componentes con los que estaremos trabajando: software, placas, sensores y actuadores"
      - {texto: "Actividad: Generar cuenta en Tinkercad y explorar algún ejemplo", url: "https://www.tinkercad.com/"}
  - n: 2
    titulo: "Primeros pasos: placas, simulación y encendido de LED"
    tool: "Tinkercad"
    desc:
      - "¿Qué han revisado en la otra clase?"
      - "Componentes requeridos"
      - "Palabras clave que pueden servir para buscar referentes para esta clase"
      - "Placas con las que trabajaremos: Arduino, LilyPad y Nano"
      - "Arduino Uno en Tinkerpad"
      - "Encendido de LED"
      - "¿Podrían imaginar esto en un circuito suave, una prenda, o cualquier otro proyecto?"
  - n: 3
    titulo: "Arduino y circuitos"
    tool: "Wokwi"
    desc:
      - "Componentes básicos: LEDs, resistencias, protoboard y Arduino Nano"
      - "Repaso de color e intensidad"
      - "Programación de un circuito sencillo"
      - "Introducción a la escritura de programas con aplicaciones de IA generativa"
      - "Botones e interruptores"
  - n: 4
    titulo: "Sensores, rangos y umbrales"
    tool: "Wokwi"
    desc:
      - "Programación de sensores en Wokwi"
      - "Rangos, umbrales (if/else) y condiciones para la lectura de datos"
      - "Impresión en consola"
      - "Descripción y prueba de un programa hecho con IA generativa"
  - n: 5
    titulo: "Del simulador a la placa"
    tool: "Arduino IDE"
    desc:
      - "Implementación de circuitos físicos y sensores"
      - "Arduino IDE: configuración del flujo de trabajo y de las placas"
      - "Escritura de programas con aplicaciones de IA generativa"
  - n: 6
    titulo: "Cómputo físico y movimiento"
    tool: "Arduino IDE"
    desc:
      - "Servos y motores de pasos: activación con Arduino"
      - "Revisión de casos e implementaciones"
      - "Diferencias entre la simulación y el mundo físico"
  - n: 7
    titulo: "Servos, sensores y alimentación"
    tool: "Arduino IDE"
    desc:
      - "Servos, controladores y alimentación (fuentes externas y voltaje)"
      - "Sensores de movimiento"
      - "Controles para variar el comportamiento de los motores"
      - "Asesoría técnica"
  - n: 8
    titulo: "Motores de pasos y entrega parcial"
    tool: "Arduino IDE"
    desc:
      - "Motores de pasos, controladores y alimentación (baterías, pilas y voltaje)"
      - "Controles"
      - "Evaluación y diferencias entre motores"
      - "Asesoría técnica"
      - "Entrega parcial: ejercicio corto con microcontroladores y sensores en un prototipo de prenda interactiva"
  - n: 9
    titulo: "Asesoría"
    tool: ""
    desc:
      - "Regreso del receso: dónde quedó cada prototipo"
      - "Asesorías técnicas"
  - n: 10
    titulo: "Lectura, interpretación y estados"
    tool: "Arduino IDE"
    desc:
      - "Comunicación serial"
      - "Impresión de información en consola"
      - "Calibración y mapeo de valores"
      - "Umbrales II: estados complejos"
  - n: 11
    titulo: "Prototipado web para wearables"
    tool: "HTML · JavaScript"
    desc:
      - "Servidor web simple en Arduino (con WiFi o simulado)"
      - "Mostrar datos de sensores en una página local"
      - "Dashboard conceptual: estilo y resolución de problemas comunes"
  - n: 12
    titulo: "Dashboard y definición del proyecto final"
    tool: "HTML · JavaScript"
    desc:
      - "Demostraciones de los resultados"
      - "Reflexión técnica: el problema del cuello de botella (complejidad, viabilidad y tiempo)"
      - "Plan técnico del proyecto final compartido: componentes, flujo de datos y alimentación"
  - n: 13
    titulo: "Asesoría: primera iteración"
    tool: ""
    desc:
      - "Primera iteración de prototipos"
  - n: 14
    titulo: "Asesoría: segunda iteración"
    tool: ""
    desc:
      - "Segunda iteración de prototipos"
  - n: 15
    titulo: "Asesoría: última iteración"
    tool: ""
    desc:
      - "Última iteración: ajustes técnicos y preparación del montaje"
  - n: 16
    titulo: "Entrega final"
    tool: ""
    desc:
      - "Trabajo final que integra el diseño y desarrollo de prendas interactivas y tecnologías vestibles"
      - "Cierre y comentarios finales"

# 6 · REFERENCIAS — lista al final del documento, antes del colofón.
#     Cada entrada es una cadena, o un mapa {texto, url} si hay a dónde ir.
#     Sin 'referencias' —o con la lista vacía— la sección no aparece.
referencias:
  - {texto: "Wokwi — simulador de Arduino en el navegador", url: "https://wokwi.com"}
  - {texto: "Arduino — referencia del lenguaje", url: "https://docs.arduino.cc/language-reference/"}
  - {texto: "Unit Electronics (tienda)", url: "https://uelectronics.com"}
  - {texto: "Steren (tienda)", url: "https://www.steren.com.mx"}

# 7 · COLOFÓN — columnas del pie de página. Sin 'colofon' ni 'grupos' el pie no
#     aparece en pantalla; impreso conserva la URL del sitio.
colofon:
  - titulo: "Herramientas"
    texto:
      - "Wokwi para simular circuitos antes de armarlos."
      - "Arduino IDE para programar Arduino, LilyPad y Nano."
      - "Brightspace para la comunicación y la evaluación."
  - titulo: "Trabajo independiente"
    texto:
      - "Ejercicios modulares de electrónica y código entre sesiones."
      - "Consecución de componentes en tiendas en línea o físicas (Unit, Steren)."
      - "Avance del proyecto compartido con Diseño de moda y tecnología portable."
  - titulo: "Asistencia"
    texto: "Para acreditar el curso es necesario contar con el 80% de asistencia."
---

<!-- El motor v1 sólo usa el frontmatter de arriba. -->
