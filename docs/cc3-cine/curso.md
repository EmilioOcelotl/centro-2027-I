---
# ─────────────────────────────────────────────────────────────
#  Código Creativo · Cine — configuración del sitio.
#  Todo lo que ve el alumno sale de este frontmatter.
#  Guía completa de campos: ../../../plantilla-curso/plantilla.md
# ─────────────────────────────────────────────────────────────

# 1 · IDENTIDAD
universidad: "CENTRO"
programa: "Cine"
titulo: "Código Creativo 3"
edicion: "2027-I"
imparte: "Emilio Ocelotl"
grupos: []                          # ["Grupo A", "Grupo B"] si hay más de uno

intro: ""                           # una o dos frases de portada
caption: ""                         # vacío = sin frase bajo el diagrama; borra la línea para la de por defecto

# 2 · ACUERDO SOBRE EL USO DE IA — sale en la portada, bajo el objetivo.
#     'texto' admite una cadena o una lista de puntos. Sin 'ia' —o con 'texto'
#     vacío— el recuadro no aparece.
ia:
  titulo: "Uso de inteligencia artificial"
  texto: "Como parte de la metodología del curso es necesario llegar a un acuerdo claro para el uso de inteligencia artificial."

# 3 · CALENDARIO
calendario:
  inicio: 2026-08-03                # primer día del semestre: la 1ª sesión es el
                                    # primer martes a partir de esta fecha
  dias: [martes]                    # [lunes, miercoles] si son dos por semana
  festivos: []                      # fechas sueltas sin clase (empujan el calendario)
  descansos:
    - {de: 2026-10-05, a: 2026-10-09, etiqueta: "Receso"}

# 4 · ESTRUCTURA — define la forma del diagrama y la evaluación
estructura:
  iteraciones:
    - {nombre: "Primera parte", sesiones: [1, 8],  nota: ""}
    - {nombre: "Segunda parte", sesiones: [9, 16], nota: ""}
  entregas:                         # caen en una sesión y cierran la iteración
    - {sesion: 8,  etiqueta: "Parcial", peso: 30}
    - {sesion: 16, etiqueta: "Final",   peso: 40}
  continuas:                        # se califican sin fecha fija
    - {etiqueta: "Actividades", peso: 30}

# 5 · SESIONES — el número de sesiones define la duración del curso.
sesiones:
  - {n: 1,  titulo: "Sesión 1",         tool: "", desc: ""}
  - {n: 2,  titulo: "Sesión 2",         tool: "", desc: ""}
  - {n: 3,  titulo: "Sesión 3",         tool: "", desc: ""}
  - {n: 4,  titulo: "Sesión 4",         tool: "", desc: ""}
  - {n: 5,  titulo: "Sesión 5",         tool: "", desc: ""}
  - {n: 6,  titulo: "Sesión 6",         tool: "", desc: ""}
  - {n: 7,  titulo: "Sesión 7",         tool: "", desc: ""}
  - {n: 8,  titulo: "Entrega parcial",  tool: "", desc: ""}
  - {n: 9,  titulo: "Sesión 9",         tool: "", desc: ""}
  - {n: 10, titulo: "Sesión 10",        tool: "", desc: ""}
  - {n: 11, titulo: "Sesión 11",        tool: "", desc: ""}
  - {n: 12, titulo: "Sesión 12",        tool: "", desc: ""}
  - {n: 13, titulo: "Sesión 13",        tool: "", desc: ""}
  - {n: 14, titulo: "Sesión 14",        tool: "", desc: ""}
  - {n: 15, titulo: "Sesión 15",        tool: "", desc: ""}
  - {n: 16, titulo: "Entrega final",    tool: "", desc: ""}

# 6 · REFERENCIAS — lista al final del documento, antes del colofón.
#     Cada entrada es una cadena, o un mapa {texto, url} si hay a dónde ir.
#     Sin 'referencias' —o con la lista vacía— la sección no aparece.
referencias: []
# referencias:
#   - "Autor, A. (2020). Título. Editorial."
#   - {texto: "Nombre del recurso", url: "https://ejemplo.org"}

# 7 · COLOFÓN — columnas del pie de página. Sin 'colofon' ni 'grupos' el pie no
#     aparece en pantalla; impreso conserva la URL del sitio.
# colofon:
#   - {titulo: "Herramientas", texto: "…"}
#   - titulo: "Criterios"
#     texto:
#       - "…"
---

<!-- El motor v1 sólo usa el frontmatter de arriba. -->
