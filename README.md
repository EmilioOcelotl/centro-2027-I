# CENTRO 2027-I

Repositorio del semestre: notas de trabajo, material de clase y los sitios
públicos de las cuatro clases.

## Estructura

```
.
└── docs/               # ← esto es lo que publica GitHub Pages
    ├── index.html      # índice de las cuatro clases
    ├── motor/v1/       # motor del sitio (copia de ../plantilla-curso)
    └── <clase>/
        ├── index.html  # 20 líneas: apunta al motor
        └── curso.md    # ← todo el contenido de la clase vive aquí
```

El material de clase (sketches, `.pde`, `.ino`) va en carpetas propias en la
raíz, una por clase, como en `../cc-centro-2026-II`.

## Editar una clase

Todo el contenido que ve el alumno está en el frontmatter de su `curso.md`:
identidad, calendario, iteraciones, entregas y las 16 sesiones. La guía completa
de campos está en [`../plantilla-curso/plantilla.md`](../plantilla-curso/plantilla.md).

```bash
$EDITOR docs/cc3-cine/curso.md
git commit -am "cc3-cine: sesiones 1 a 4"
git push
```

GitHub Pages republica solo, en un minuto aprox.

## Ver el sitio localmente

El motor lee el `.md` con `fetch()`, así que **no funciona abriendo el archivo
directo**: hace falta un servidor.

```bash
python3 -m http.server 8000
# http://localhost:8000/docs/
```

## El motor

`docs/motor/v1/` es una **copia congelada** del motor de
[`plantilla-cursos`](https://github.com/EmilioOcelotl/plantilla-cursos). Las
cuatro clases lo comparten por ruta relativa: un arreglo al motor llega a las
cuatro a la vez, y el sitio de este semestre no se rompe si el motor cambia
más adelante.

Un semestre nuevo = repo nuevo con una copia nueva del motor; el sitio de
2027-I queda en línea tal como quedó.

## Publicar

En GitHub: **Settings → Pages → Source: Deploy from a branch → `main` / `/docs`**.
