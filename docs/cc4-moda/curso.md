---
# ─────────────────────────────────────────────────────────────
#  Código Creativo 4 · Moda — configuración del sitio.
#  Todo lo que ve el alumno sale de este frontmatter.
#  Guía completa de campos: ../../../plantilla-curso/plantilla.md
# ─────────────────────────────────────────────────────────────

# 1 · IDENTIDAD
universidad: "CENTRO"
programa: "Moda"
titulo: "Código Creativo 4"
edicion: "2027-I"
imparte: "Emilio Ocelotl"
grupos: []                          # ["Grupo A", "Grupo B"] si hay más de uno

intro: ""                           # una o dos frases de portada
caption: ""                         # frase corta bajo el diagrama (hay una por defecto)

# 2 · CALENDARIO — descomenta y llena cuando tengas las fechas.
#     Sin este bloque el sitio funciona igual, pero sin fechas ni marca de "hoy".
# calendario:
#   inicio: 2027-01-19                # primer día de clase
#   dias: [martes]                    # [lunes, miercoles] si son dos por semana
#   festivos: []                      # fechas sueltas sin clase (empujan el calendario)
#   descansos:
#     - {de: 2027-03-23, a: 2027-03-27, etiqueta: "Semana de receso"}

# 3 · ESTRUCTURA — define la forma del diagrama y las entregas
estructura:
  iteraciones:
    - {nombre: "Primera parte", sesiones: [1, 8],  nota: ""}
    - {nombre: "Segunda parte", sesiones: [9, 16], nota: ""}
  entregas:
    - {sesion: 8,  etiqueta: "Parcial"}   # añade  peso: 40  para publicar el %
    - {sesion: 16, etiqueta: "Final"}     # añade  peso: 60

# 4 · SESIONES — el número de sesiones define la duración del curso.
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

# 5 · COLOFÓN — columnas del pie de página. Descomenta las que uses.
# colofon:
#   - {titulo: "Herramientas", texto: "…"}
#   - {titulo: "Evaluación",   texto: "…"}
---

<!-- El motor v1 sólo usa el frontmatter de arriba. -->
