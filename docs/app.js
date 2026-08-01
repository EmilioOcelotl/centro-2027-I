// Código Creativo 2027 — mapa del curso.
// Una sola fuente de verdad: este arreglo alimenta la cinta y las tarjetas.
// La forma no se calcula por sesión: son cuatro diamantes rectos (dos por
// iteración) que se cierran en los picos de convergencia S4·S8·S12·S16.

const SESSIONS = [
  // Iteración 1 — ensayo del método (S1–S8)
  { n: 1,  it: 1, title: "Encuadre y arranque",   desc: "Presentación del curso y del método. Repaso relámpago de Processing y se plantea el reto.", tool: "Processing" },
  { n: 2,  it: 1, title: "Mirar el problema",     desc: "Observar la situación desde la disciplina. Técnicas rápidas y bocetos en papel.", tool: "Papel · Processing" },
  { n: 3,  it: 1, title: "Enfocar el reto",       desc: "Se llena la plantilla en su versión ligera: a quién responde la pieza y qué hace en una oración.", tool: "Processing" },
  { n: 4,  it: 1, title: "Cerrar la pregunta",    desc: "Repaso aplicado de for y arreglos sobre la idea ya enfocada. Queda claro qué se va a prototipar.", tool: "Processing" },
  { n: 5,  it: 1, title: "Divergir en imagen",    desc: "Hydra como ideación visual rápida: texturas, síntesis, resultado inmediato. Divergir mucho.", tool: "Hydra" },
  { n: 6,  it: 1, title: "Primer prototipo",      desc: "Primer prototipo funcional en la herramienta que elige el equipo.", tool: "Elegida por equipo" },
  { n: 7,  it: 1, title: "Prueba y ajuste",       desc: "Retro rápida entre equipos. Integrar interacción o sonido básico si aplica; afinar.", tool: "Elegida por equipo" },
  { n: 8,  it: 1, title: "Entrega parcial",       desc: "Presentación del prototipo y la plantilla. Retro colectiva. Cierra el primer ciclo del método.", tool: "—", deliverable: "Parcial" },

  // Iteración 2 — proyecto iterado (S9–S16)
  { n: 9,  it: 2, title: "Reabrir con ambición",  desc: "Retro del parcial. Se eleva la apuesta y se reexamina el problema con más recorrido.", tool: "—" },
  { n: 10, it: 2, title: "Ampliar el horizonte",  desc: "Referencias e imagen del proyecto real. Vistazo acotado a TouchDesigner como paréntesis cultural.", tool: "TouchDesigner (demo)" },
  { n: 11, it: 2, title: "Plantilla final",       desc: "Versión completa de la plantilla: superficie, audio, interacción y riesgos.", tool: "Elegida por equipo" },
  { n: 12, it: 2, title: "Fijar el alcance",      desc: "Resolver el mayor riesgo técnico de cada equipo. Se fija qué se construye.", tool: "Elegida por equipo" },
  { n: 13, it: 2, title: "Construir e integrar",  desc: "Integración de partes: visual, audio e interacción en una sola pieza.", tool: "Elegida por equipo" },
  { n: 14, it: 2, title: "Afinar",                desc: "Afinación técnica. Preparar el montaje y la presentación.", tool: "Elegida por equipo" },
  { n: 15, it: 2, title: "Ensayo de montaje",     desc: "Montaje real: proyección, instalación o corte según carrera.", tool: "En sitio" },
  { n: 16, it: 2, title: "Entrega final",         desc: "Presentación final del proyecto iterado y montado.", tool: "—", deliverable: "Final" },
];

const ITERATIONS = {
  1: { name: "Ensayo del método", note: "Un recorrido completo a escala pequeña." },
  2: { name: "Proyecto iterado",  note: "El mismo camino, con más ambición." },
};

// Cada iteración es un doble diamante simétrico de 8 sesiones (por índice
// 0-based). Se parte a la mitad: la cintura cae entre S4-S5 y S12-S13.
// H = medio-alto; la iteración 2 es más alta = más ambición.
// H = medio-alto de cada lóbulo [izquierdo, derecho]. 127 ≈ medio-ancho
// del rombo => cuadrado perfecto (los cuatro lados iguales).
const ITER_SHAPE = [
  { start: 0, end: 7,  H: [127, 127] },   // S1–S8,  cierra en el parcial
  { start: 8, end: 15, H: [127, 127] },   // S9–S16, cierra en el final
];

/* ---------- cinta / ribbon ---------- */

const SVG_NS = "http://www.w3.org/2000/svg";
const VB_W = 1200, VB_H = 380;
const PAD_X = 56;
const CENTER_Y = 175;
const NUM_Y = 352;      // baseline de los números
const LABEL_Y = 24;     // baseline de PARCIAL / FINAL

function x(i) { return PAD_X + i * (VB_W - 2 * PAD_X) / (SESSIONS.length - 1); }
function el(name, attrs) {
  const e = document.createElementNS(SVG_NS, name);
  for (const k in attrs) e.setAttribute(k, attrs[k]);
  return e;
}

function buildRibbon() {
  const svg = document.getElementById("ribbon");
  svg.setAttribute("viewBox", `0 0 ${VB_W} ${VB_H}`);
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  // espina / eje del proceso
  svg.appendChild(el("line", { class: "spine", x1: PAD_X - 24, y1: CENTER_Y, x2: VB_W - PAD_X + 24, y2: CENTER_Y }));

  // cuatro diamantes iguales: dos por iteración, tocándose en la cintura
  let d = 0;
  ITER_SHAPE.forEach(seg => {
    const mid = (seg.start + seg.end) / 2;
    [[seg.start, mid], [mid, seg.end]].forEach(([L, R], lobe) => {
      const H = seg.H[lobe];
      const xL = x(L), xR = x(R), xP = (xL + xR) / 2;
      const dpath = `M ${xL} ${CENTER_Y} L ${xP} ${CENTER_Y - H} L ${xR} ${CENTER_Y} L ${xP} ${CENTER_Y + H} Z`;
      const dia = el("path", { class: "diamond", d: dpath });
      if (!reduce) {
        dia.classList.add("animate");
        dia.style.setProperty("--delay", (d * 0.16) + "s");
      }
      svg.appendChild(dia);
      d++;
    });
  });

  // nodos, números e interacción
  SESSIONS.forEach((s, i) => {
    const g = el("g", { class: "session-node", "data-n": s.n, tabindex: "0",
      role: "button", "aria-label": `Sesión ${s.n}: ${s.title}` });

    if (s.deliverable) {
      // entrega: nodo macizo + etiqueta arriba
      svg.appendChild(el("line", { class: "deliver-stem", x1: x(i), y1: LABEL_Y + 6, x2: x(i), y2: CENTER_Y }));
      const lab = el("text", { class: "deliver-label", x: x(i), y: LABEL_Y });
      lab.textContent = s.deliverable.toUpperCase();
      svg.appendChild(lab);
      g.appendChild(el("circle", { class: "node deliver", cx: x(i), cy: CENTER_Y, r: 9 }));
    } else {
      g.appendChild(el("circle", { class: "node", cx: x(i), cy: CENTER_Y, r: 6 }));
    }

    const num = el("text", { class: "node-num", x: x(i), y: NUM_Y });
    num.textContent = String(s.n).padStart(2, "0");
    g.appendChild(num);
    svg.appendChild(g);
  });
}

/* ---------- tarjetas / sessions ---------- */

function buildSessions() {
  const root = document.getElementById("sessions");
  for (const it of [1, 2]) {
    const section = document.createElement("section");
    section.className = "iteration";

    const head = document.createElement("div");
    head.className = "iteration-head";
    head.innerHTML = `
      <span class="iteration-index">0${it}</span>
      <div class="iteration-name">
        <h2>Iteración — ${ITERATIONS[it].name}</h2>
        <p>${ITERATIONS[it].note}</p>
      </div>`;
    section.appendChild(head);

    const grid = document.createElement("div");
    grid.className = "cards";
    SESSIONS.filter(s => s.it === it).forEach(s => grid.appendChild(makeCard(s)));
    section.appendChild(grid);
    root.appendChild(section);
  }
}

function makeCard(s) {
  const card = document.createElement("article");
  card.className = "card" + (s.deliverable ? " deliverable" : "");
  card.id = `s${s.n}`;
  card.dataset.n = s.n;
  if (s.deliverable) {
    card.innerHTML = `
      <div class="card-top"><span class="card-num">S${String(s.n).padStart(2, "0")}</span>
        <span class="badge">${s.deliverable}</span></div>
      <h3>${s.title}</h3>
      <p>${s.desc}</p>`;
  } else {
    card.innerHTML = `
      <div class="card-top"><span class="card-num">S${String(s.n).padStart(2, "0")}</span>
        <span>Sesión</span></div>
      <h3>${s.title}</h3>
      <p>${s.desc}</p>
      <span class="tool">${s.tool}</span>`;
  }
  return card;
}

/* ---------- vínculo cinta <-> tarjetas ---------- */

function link() {
  const nodes = [...document.querySelectorAll(".session-node")];
  const cards = [...document.querySelectorAll(".card")];
  const byN = n => ({
    node: nodes.find(el => el.dataset.n == n),
    card: cards.find(el => el.dataset.n == n),
  });

  const setActive = (n, on) => {
    const { node, card } = byN(n);
    node && node.classList.toggle("is-active", on);
    card && card.classList.toggle("is-active", on);
  };

  nodes.forEach(node => {
    const n = node.dataset.n;
    node.addEventListener("mouseenter", () => setActive(n, true));
    node.addEventListener("mouseleave", () => setActive(n, false));
    node.addEventListener("focus", () => setActive(n, true));
    node.addEventListener("blur", () => setActive(n, false));
    const go = () => byN(n).card.scrollIntoView({ behavior: "smooth", block: "center" });
    node.addEventListener("click", go);
    node.addEventListener("keydown", e => {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); go(); }
    });
  });

  cards.forEach(card => {
    const n = card.dataset.n;
    card.addEventListener("mouseenter", () => setActive(n, true));
    card.addEventListener("mouseleave", () => setActive(n, false));
  });
}

buildRibbon();
buildSessions();
link();
