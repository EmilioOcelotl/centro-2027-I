---
# ─────────────────────────────────────────────────────────────
#  Código Creativo · Arquitectura de Interiores — configuración del sitio.
#  Todo lo que ve el alumno sale de este frontmatter.
#  Guía completa de campos: ../../../plantilla-curso/plantilla.md
# ─────────────────────────────────────────────────────────────

# 1 · IDENTIDAD
universidad: "CENTRO"
programa: "Arquitectura de Interiores"
titulo: "CC-3"        # ¿lleva número de semestre? (Código Creativo 2 / 3…)
edicion: "2027-I"
imparte: "Emilio Ocelotl"
grupos: []                          # ["Grupo A", "Grupo B"] si hay más de uno

intro: "Código Creativo 3 - Arquitectura de Interiores. Este curso se realiza a partir de iteraciones. Vamos a partir de un motivo: la malla"
caption: ""                         # vacío = sin frase bajo el diagrama; borra la línea para la de por defecto

# 2 · CALENDARIO
calendario:
  inicio: 2026-08-03                # primer día del semestre: la 1ª sesión es el
                                    # primer lunes a partir de esta fecha
  dias: [lunes]                     # [lunes, miercoles] si son dos por semana
  festivos: [2026-11-16]            # Revolución (se recorre al 3er lunes)
  # - 2026-11-02 (Día de Muertos) también cae en lunes: añádelo si no hay clase
  descansos:
    - {de: 2026-10-05, a: 2026-10-09, etiqueta: "Receso"}

# 3 · ESTRUCTURA — define la forma del diagrama y la evaluación
estructura:
  iteraciones:
    - {nombre: "Primera parte", sesiones: [1, 8],  nota: ""}
    - {nombre: "Segunda parte", sesiones: [9, 16], nota: ""}
  entregas:                         # caen en una sesión y cierran la iteración
    - {sesion: 8,  etiqueta: "Parcial", peso: 30}
    - {sesion: 16, etiqueta: "Final",   peso: 40}
  continuas:                        # se califican sin fecha fija
    - {etiqueta: "Actividades", peso: 30}

# 4 · SESIONES — el número de sesiones define la duración del curso.
sesiones:
  # 'desc' admite una lista. Con varios puntos conviene la forma en bloque:
  # las claves de la sesión van sangradas a la columna que abre el guion.
  - n: 1
    titulo: "Sesión 1"
    tool: ""
    desc:
      - "Presentaciones: curso, profesor, alumnxs"
      - "Evaluación"
      - "Uso de IA en el salón"
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

# 5 · COLOFÓN — columnas del pie de página. Sin 'colofon' ni 'grupos' el pie no
#     aparece en pantalla; impreso conserva la URL del sitio.
# colofon:
#   - {titulo: "Herramientas", texto: "…"}
#   - titulo: "Criterios"
#     texto:
#       - "…"
---

<!-- El motor v1 sólo usa el frontmatter de arriba. -->
