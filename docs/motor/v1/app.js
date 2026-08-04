// Motor de plantilla de curso — v1
// Lee un .md con frontmatter (config del curso), calcula fechas y dibuja
// la portada, la cinta de doble diamante y las tarjetas de sesión.
// Estático, sin build. Una sola fuente de verdad: el .md del curso.

/* =========================================================
   1 · Mini-parser de YAML (subconjunto del frontmatter)
   Soporta: mapas por indentación, secuencias de bloque cuyos
   items van en una línea (escalar o mapa/lista "de flujo"),
   mapas/listas de flujo {a: 1, b: [x, y]}, comillas y comentarios.
   ========================================================= */

function stripComment(line) {
  let inS = false, inD = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === "'" && !inD) inS = !inS;
    else if (c === '"' && !inS) inD = !inD;
    else if (c === "#" && !inS && !inD && (i === 0 || /\s/.test(line[i - 1]))) return line.slice(0, i);
  }
  return line;
}

function splitTop(s) {
  const parts = []; let depth = 0, inS = false, inD = false, buf = "";
  for (const c of s) {
    if (c === "'" && !inD) inS = !inS;
    else if (c === '"' && !inS) inD = !inD;
    if (!inS && !inD) {
      if (c === "{" || c === "[") depth++;
      else if (c === "}" || c === "]") depth--;
      else if (c === "," && depth === 0) { parts.push(buf); buf = ""; continue; }
    }
    buf += c;
  }
  if (buf.trim() !== "") parts.push(buf);
  return parts;
}

function topColon(s) {
  let depth = 0, inS = false, inD = false;
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (c === "'" && !inD) inS = !inS;
    else if (c === '"' && !inS) inD = !inD;
    else if (!inS && !inD) {
      if (c === "{" || c === "[") depth++;
      else if (c === "}" || c === "]") depth--;
      else if (c === ":" && depth === 0) return i;
    }
  }
  return -1;
}

function parseScalar(v) {
  v = v.trim();
  if (v === "") return null;
  if ((v[0] === '"' && v.slice(-1) === '"') || (v[0] === "'" && v.slice(-1) === "'")) return v.slice(1, -1);
  if (v === "true") return true;
  if (v === "false") return false;
  if (/^-?\d+$/.test(v)) return parseInt(v, 10);
  if (/^-?\d+\.\d+$/.test(v)) return parseFloat(v);
  return v; // incluye fechas YYYY-MM-DD como string
}

function parseValue(v) {
  v = v.trim();
  if (v[0] === "{") {
    const obj = {};
    for (const part of splitTop(v.slice(1, -1))) {
      const i = topColon(part);
      if (i < 0) continue;
      obj[part.slice(0, i).trim().replace(/^["']|["']$/g, "")] = parseValue(part.slice(i + 1));
    }
    return obj;
  }
  if (v[0] === "[") {
    return splitTop(v.slice(1, -1)).map(p => parseValue(p));
  }
  return parseScalar(v);
}

function parseYAML(text) {
  const lines = [];
  for (const raw of text.split(/\r?\n/)) {
    const s = stripComment(raw).replace(/\s+$/, "");
    if (s.trim() !== "") lines.push(s);
  }
  let idx = 0;
  const indentOf = s => s.match(/^ */)[0].length;

  function parseNode(minIndent) {
    const first = lines[idx];
    const result = first.slice(indentOf(first)).startsWith("- ") ? [] : {};
    while (idx < lines.length) {
      const line = lines[idx];
      const ind = indentOf(line);
      if (ind < minIndent) break;
      const content = line.slice(ind);
      if (content === "-" || content.startsWith("- ")) {
        const rest = content.slice(1), pos = rest.search(/\S/);
        if (pos < 0) {                                 // «-» solo: el nodo va debajo
          idx++;
          result.push(idx < lines.length ? parseNode(indentOf(lines[idx])) : null);
          continue;
        }
        const off = 1 + pos, item = rest.trim();
        // Un ítem que abre un mapa en bloque —«- n: 1» y sus claves hermanas
        // sangradas a la misma columna— no cabe en una línea. Se reescribe el
        // guion como espacios y se parsea desde ahí como un mapa cualquiera:
        // la columna del ítem hace de sangría mínima, así que el siguiente
        // guion (que va más a la izquierda) corta el mapa por sí solo.
        if (item[0] !== "{" && item[0] !== "[" && topColon(item) >= 0) {
          lines[idx] = " ".repeat(ind + off) + item;
          result.push(parseNode(ind + off));
          continue;
        }
        idx++;
        result.push(parseValue(item));
      } else {
        const i = topColon(content);
        const key = content.slice(0, i).trim();
        const val = content.slice(i + 1);
        idx++;
        if (val.trim() === "") {
          result[key] = (idx < lines.length && indentOf(lines[idx]) > minIndent) ? parseNode(indentOf(lines[idx])) : null;
        } else {
          result[key] = parseValue(val);
        }
      }
    }
    return result;
  }
  return lines.length ? parseNode(indentOf(lines[0])) : {};
}

function parseFrontmatter(text) {
  const m = text.match(/^﻿?---\r?\n([\s\S]*?)\r?\n---\s*(?:\r?\n([\s\S]*))?$/);
  if (!m) return { data: {}, body: text };
  return { data: parseYAML(m[1]), body: m[2] || "" };
}

/* =========================================================
   2 · Fechas: caminar el calendario saltando festivos/descansos
   ========================================================= */

const WEEKDAYS = { domingo: 0, lunes: 1, martes: 2, miercoles: 3, "miércoles": 3, jueves: 4, viernes: 5, sabado: 6, "sábado": 6 };
const FMT = new Intl.DateTimeFormat("es-MX", { day: "numeric", month: "short" });
const FMT_LONG = new Intl.DateTimeFormat("es-MX", { weekday: "long", day: "numeric", month: "long" });
const FMT_MONTH = new Intl.DateTimeFormat("es-MX", { month: "short" });

function parseDate(s) {
  const [y, m, d] = String(s).split("-").map(Number);
  return new Date(y, m - 1, d, 12);
}
function keyOf(dt) {
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(dt.getDate()).padStart(2, "0")}`;
}
function fmtDate(dt) { return FMT.format(dt).replace(".", ""); }
function fmtMonth(dt) { return FMT_MONTH.format(dt).replace(".", ""); }
function fmtRange(a, b) {
  const ma = fmtMonth(a), mb = fmtMonth(b);
  return ma === mb ? `${a.getDate()}–${b.getDate()} ${ma}` : `${a.getDate()} ${ma} – ${b.getDate()} ${mb}`;
}

function computeDates(cal, n) {
  if (!cal || !cal.inicio || !cal.dias) return [];
  const meetDays = (Array.isArray(cal.dias) ? cal.dias : [cal.dias])
    .map(d => WEEKDAYS[String(d).toLowerCase()]).filter(x => x !== undefined);
  if (!meetDays.length) return [];
  const holidays = new Set((cal.festivos || []).map(String));
  const breaks = (cal.descansos || []).map(b => ({ from: parseDate(b.de), to: parseDate(b.a) }));
  const inBreak = dt => breaks.some(b => dt >= b.from && dt <= b.to);
  const dates = [];
  let cur = parseDate(cal.inicio), guard = 0;
  while (dates.length < n && guard++ < 3000) {
    if (meetDays.includes(cur.getDay()) && !holidays.has(keyOf(cur)) && !inBreak(cur)) dates.push(new Date(cur));
    cur.setDate(cur.getDate() + 1);
  }
  return dates;
}

// índice de la sesión "de hoy o la próxima"; -1 si el curso ya terminó
function todayIndex(dates) {
  if (!dates.length) return -1;
  const today = new Date(); today.setHours(0, 0, 0, 0);
  for (let i = 0; i < dates.length; i++) {
    const d = new Date(dates[i]); d.setHours(0, 0, 0, 0);
    if (d >= today) return i;
  }
  return -1;
}

// ubica cada descanso en el hueco entre las dos sesiones que lo rodean
function computeBreaks(cal, sessions, dates) {
  if (!cal || !cal.descansos || !dates.length) return [];
  const out = [];
  (cal.descansos || []).forEach(b => {
    const from = parseDate(b.de), to = parseDate(b.a);
    for (let i = 0; i < dates.length - 1; i++) {
      if (dates[i] < from && dates[i + 1] > to) {
        out.push({
          etiqueta: b.etiqueta || "Receso", dateLabel: fmtRange(from, to),
          gapIndex: i, beforeN: sessions[i].n, afterN: sessions[i + 1].n
        });
        break;
      }
    }
  });
  return out;
}

/* =========================================================
   3 · Utilidades DOM
   ========================================================= */

const SVG_NS = "http://www.w3.org/2000/svg";
function svgEl(name, attrs) {
  const e = document.createElementNS(SVG_NS, name);
  for (const k in attrs) e.setAttribute(k, attrs[k]);
  return e;
}
function h(tag, attrs, html) {
  const e = document.createElement(tag);
  if (attrs) for (const k in attrs) { if (k === "class") e.className = attrs[k]; else e.setAttribute(k, attrs[k]); }
  if (html != null) e.innerHTML = html;
  return e;
}
const pad2 = n => String(n).padStart(2, "0");
const esc = s => String(s == null ? "" : s).replace(/[&<>]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]));

// esc() no toca las comillas porque su destino normal es texto, no atributos.
// Una URL sí va dentro de un atributo, y ahí una comilla la sacaría de él.
const escAttr = s => esc(s).replace(/"/g, "&quot;");

// Un punto de prosa es una cadena, o —igual que en las referencias— un mapa
// {texto, url} cuando hay a dónde ir. Es la única forma de marcado que el
// frontmatter puede pedir: no escribe HTML, nombra un destino y el motor arma
// la etiqueta. Texto y URL siguen escapándose.
function proseItem(x) {
  if (x != null && typeof x === "object" && !Array.isArray(x)) {
    const texto = x.texto || x.url;
    if (texto == null || texto === "") return "";
    return x.url ? `<a href="${escAttr(x.url)}" rel="noopener">${esc(texto)}</a>` : esc(texto);
  }
  return esc(x);
}

// Todo campo de prosa del frontmatter —desc, nota, texto del colofón— acepta
// una cadena o una lista. La lista sale como <ul>; la cadena, como párrafo.
// El .md nunca inyecta marcado: lo que llega se escapa y el motor decide la
// etiqueta, que es lo que mantiene el frontmatter como contenido y no como HTML.
function prose(v) {
  if (v == null || v === "") return "";
  if (Array.isArray(v)) {
    const items = v.filter(x => x != null && x !== "").map(proseItem).filter(s => s !== "");
    return items.length ? `<ul class="prose-list">${items.map(x => `<li>${x}</li>`).join("")}</ul>` : "";
  }
  return `<p>${proseItem(v)}</p>`;
}

/* =========================================================
   4 · Render principal
   ========================================================= */

function render(cfg) {
  const app = document.getElementById("app");
  app.innerHTML = "";

  const sessions = (cfg.sesiones || []).slice().sort((a, b) => a.n - b.n);
  const iteraciones = (cfg.estructura && cfg.estructura.iteraciones) || [];
  const entregas = (cfg.estructura && cfg.estructura.entregas) || [];
  // Lo que se califica sin caer en una sesión —actividades, participación—:
  // cuenta para la calificación pero no cierra ninguna iteración, así que no
  // llega a la cinta ni a las tarjetas, sólo a la tabla de la portada.
  const continuas = (cfg.estructura && cfg.estructura.continuas) || [];
  // El peso (% de la calificación) es opcional. Se resuelve aquí, con todas las
  // entregas a la vista, para que el nodo de cierre de la cinta pueda escalar con
  // él: la entrega que más pesa cierra más grueso.
  const pesoMax = Math.max(0, ...entregas.map(e => Number(e.peso) || 0));
  const entregaDe = {};
  entregas.forEach(e => {
    const peso = Number(e.peso) || 0;
    entregaDe[e.sesion] = { etiqueta: e.etiqueta, peso: peso || null,
      nodeR: pesoMax ? 7 + 5 * (peso / pesoMax) : 9 };
  });
  const dates = computeDates(cfg.calendario, sessions.length);
  const tIdx = todayIndex(dates);
  const breaks = computeBreaks(cfg.calendario, sessions, dates);

  document.title = [cfg.titulo, cfg.edicion].filter(Boolean).join(" · ") || "Curso";

  app.appendChild(h("div", { class: "grain", "aria-hidden": "true" }));
  app.appendChild(masthead(cfg, sessions, entregas, continuas, dates, tIdx));
  app.appendChild(iterationsSection(cfg, sessions, iteraciones, entregaDe, dates, tIdx, breaks));
  const refs = references(cfg.referencias);
  if (refs) app.appendChild(refs);
  app.appendChild(colophon(cfg));

  link();
}

// «¿en qué punto del semestre vamos?» es la pregunta que un curso recibe todo el
// ciclo. Se responde arriba, con el calendario que ya está calculado; sin fechas
// no hay nada que decir.
function progress(dates, tIdx, n) {
  if (!dates.length) return null;
  const el = h("div", { class: "progress" });
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const first = new Date(dates[0]); first.setHours(0, 0, 0, 0);

  let done, line;
  if (tIdx < 0) {                                   // el curso ya terminó
    done = n;
    line = `<strong>Curso concluido</strong> · ${n} de ${n} sesiones`;
  } else if (today < first) {                        // aún no empieza
    done = 0;
    line = `<strong>Comienza el ${fmtDate(dates[0])}</strong> · ${n} sesiones`;
  } else {
    done = tIdx;                                     // sesiones ya cursadas
    const falta = n - tIdx;
    const next = new Date(dates[tIdx]); next.setHours(0, 0, 0, 0);
    // todayIndex apunta a la sesión de hoy o a la próxima: nombrar cuál de las dos
    // evita leer «sesión 12» como una sesión que ya ocurrió
    const cuando = next.getTime() === today.getTime() ? "Hoy" : `Próxima el ${fmtDate(dates[tIdx])}`;
    line = `<strong>${cuando} · sesión ${pad2(tIdx + 1)} de ${n}</strong> · `
      + (falta === 1 ? "es la última" : `${falta} por cursar`);
  }
  el.appendChild(h("p", { class: "progress-line" }, line));
  const bar = h("div", { class: "progress-bar", "aria-hidden": "true" });
  bar.appendChild(h("span", { style: `width: ${(done / n * 100).toFixed(1)}%` }));
  el.appendChild(bar);
  return el;
}

// La ponderación es el dato que más se busca en un programa, y vivía al final
// del documento, detrás de dieciséis tarjetas. Aquí cierra la portada: mismo
// registro mono que la meta y el avance, y el mapa no se desplaza.
function evaluation(entregas, continuas, sessions, dates) {
  if (!entregas.length && !continuas.length) return null;
  const dateByN = {};
  sessions.forEach((s, i) => { if (dates[i]) dateByN[s.n] = dates[i]; });
  const rows = entregas.slice().sort((a, b) => a.sesion - b.sesion);
  // Una columna que no tiene nada que decir no se dibuja: sin calendario no hay
  // fechas, y sin 'peso' no hay porcentajes ni total que cuadrar.
  const conFecha = rows.some(e => dateByN[e.sesion]);
  const suma = rows.concat(continuas).reduce((t, e) => t + (Number(e.peso) || 0), 0);

  // Las columnas de en medio ubican cada rubro en el tiempo: por sesión y fecha
  // si se entrega un día concreto, o de una sola vez —«Cuándo»— si el curso
  // sólo califica cosas que corren a lo largo del semestre.
  const mid = rows.length ? ["Sesión"].concat(conFecha ? ["Fecha"] : []) : ["Cuándo"];
  // «Entrega» deja de ser exacto en cuanto la tabla mezcla lo que se entrega un
  // día con lo que se califica todo el semestre
  const cols = [[continuas.length ? "Concepto" : "Entrega", ""]].concat(mid.map(m => [m, ""]));
  if (suma) cols.push(["Peso", "peso"]);

  const celdaPeso = e => {
    const peso = Number(e.peso) || 0;
    return suma ? `<td class="peso">${peso ? peso + "%" : "—"}</td>` : "";
  };
  const body = rows.map(e => {
    const dt = dateByN[e.sesion];
    return `<tr><th scope="row">${esc(e.etiqueta)}</th><td>S${pad2(e.sesion)}</td>`
      + (conFecha ? `<td>${dt ? fmtDate(dt) : "—"}</td>` : "") + celdaPeso(e) + "</tr>";
  }).concat(continuas.map(e =>
    // sin sesión ni fecha que dar: las celdas de en medio se funden en el
    // «cuándo», que por defecto es todo el semestre
    `<tr><th scope="row">${esc(e.etiqueta)}</th>`
    + `<td class="cuando" colspan="${mid.length}">${esc(e.cuando || "Todo el semestre")}</td>`
    + celdaPeso(e) + "</tr>")).join("");
  // el total es el control que quien imparte necesita ver antes de publicar
  const foot = suma
    ? `<tfoot><tr><th scope="row">Total</th><td colspan="${cols.length - 2}"></td>`
      + `<td class="peso">${suma}%</td></tr></tfoot>`
    : "";

  const el = h("section", { class: "evaluation" });
  el.appendChild(h("h2", null, "Evaluación"));
  el.appendChild(h("table", { class: "evaluation-table" },
    `<thead><tr>${cols.map(([c, k]) => `<th scope="col"${k ? ` class="${k}"` : ""}>${c}</th>`).join("")}</tr></thead>`
    + `<tbody>${body}</tbody>${foot}`));
  // el total ya dice cuánto suman: la nota sólo hace falta cuando no cuadra
  if (suma && suma !== 100) el.appendChild(h("p", { class: "fine" },
    `Los pesos suman ${suma}%, no 100%.`));
  return el;
}

// El acuerdo sobre el uso de IA es parte de la metodología del curso, no una
// nota al pie: va donde va en los temarios en papel —título, objetivo, acuerdo—,
// antes de la meta y del avance. Acepta las dos formas del colofón: una cadena
// suelta («ia: "…"») o un mapa con su propio rótulo y una lista de puntos.
function aiPact(ia) {
  if (!ia) return null;
  const isMap = typeof ia === "object" && !Array.isArray(ia);
  const texto = isMap ? ia.texto : ia;
  if (texto == null || texto === "") return null;
  const el = h("section", { class: "ia-pact" });
  el.appendChild(h("h2", null, esc((isMap && ia.titulo) || "Uso de inteligencia artificial")));
  el.appendChild(h("div", { class: "ia-pact-body" }, prose(texto)));
  return el;
}

function masthead(cfg, sessions, entregas, continuas, dates, tIdx) {
  const n = sessions.length;
  const el = h("header", { class: "masthead" });
  const eyebrow = [cfg.programa, cfg.edicion].filter(Boolean).join(" · ") || cfg.universidad || "";
  el.appendChild(h("p", { class: "eyebrow" }, esc(eyebrow)));
  el.appendChild(h("h1", { class: "title" }, esc(cfg.titulo || "Curso")));
  if (cfg.intro) el.appendChild(h("p", { class: "lede" }, esc(cfg.intro)));
  const ia = aiPact(cfg.ia);
  if (ia) el.appendChild(ia);

  const meta = h("ul", { class: "meta", role: "list" });
  const bits = [`${n} sesiones`];
  if ((cfg.estructura && cfg.estructura.iteraciones || []).length) bits.push(`${cfg.estructura.iteraciones.length} iteraciones`);
  if (cfg.universidad) bits.push(cfg.universidad);
  if (cfg.imparte) bits.push(cfg.imparte);
  if (cfg.grupos && cfg.grupos.length) bits.push(cfg.grupos.join(" · "));
  bits.forEach(b => meta.appendChild(h("li", null, esc(b))));
  el.appendChild(meta);
  const prog = progress(dates, tIdx, n);
  if (prog) el.appendChild(prog);
  const ev = evaluation(entregas, continuas, sessions, dates);
  if (ev) el.appendChild(ev);
  return el;
}

/* ---------- cintas / diamantes ---------- */

// Gradiente compartido por todas las cintas: claro en la apertura → denso en
// el cierre. Con objectBoundingBox cada cinta se oscurece hacia su propio
// borde derecho (su entrega). Se define una sola vez para no duplicar ids.
function gradientDefs() {
  const svg = svgEl("svg", { class: "defs-only", width: "0", height: "0", "aria-hidden": "true" });
  const defs = svgEl("defs", {});
  const grad = svgEl("linearGradient", { id: "ribbon-fill", x1: "0", y1: "0", x2: "1", y2: "0" });
  grad.appendChild(svgEl("stop", { class: "grad-open", offset: "0" }));
  grad.appendChild(svgEl("stop", { class: "grad-close", offset: "1" }));
  defs.appendChild(grad);
  svg.appendChild(defs);
  return svg;
}

// Una cinta por iteración, en su propio sistema de coordenadas local. Abre en
// punto (exploración), converge a una CINTURA a media iteración —no a cero— y
// CIERRA en punto sobre la entrega: el único pellizco total es la decisión. El
// relleno se densifica hacia el cierre (gradiente compartido, ver CSS). El
// viewBox crece con el número de sesiones para que la letra conserve su tamaño
// en cualquier iteración; el min/max-width del render sigue esa proporción, de
// modo que a tamaño natural todas las cintas tienen el mismo alto.
//
// EN EL SVG SÓLO VA GEOMETRÍA. Todo rótulo —números de sesión, fechas, HOY, la
// entrega, el receso— se devuelve como HTML posicionado sobre la cinta. Dentro
// del SVG el cuerpo de letra se mide en unidades del viewBox, así que sigue al
// ancho del dibujo y no al tamaño de fuente del navegador: en cuanto la cinta
// topa con su piso —siempre en teléfono, en escritorio a partir de ~175%— el
// texto se congela y no llega al 200% que pide WCAG 1.4.4. Fuera del SVG los
// rótulos van en rem como el resto de la página, y el piso de la cinta también,
// de modo que al agrandar la letra crece la pieza entera.
function buildIterRibbon(local, idxByN, entregaDe, dates, tIdx, breaks, H, STEP, VB_W) {
  const n = local.length;
  const TOP = 20, SEAM = 16;
  // Constantes que también viven en el CSS: si allá cambian, aquí también.
  const FOCUS_R = 13, FOCUS_SW = 2;   // .focus-ring
  const NODE_SW = 2.5;                // el trazo más grueso: .session-node.is-today .node
  // El viewBox es común a todas las cintas (lo fija la iteración más larga) y el
  // CSS lo acota a la columna de lectura: la cinta abre en el eje izquierdo del
  // masthead y cierra donde cierran las tarjetas. La sangría es lo que mide el
  // círculo más gordo que se va a dibujar, para que apertura y cierre caigan
  // sobre esos ejes sin salirse; el paso se estira para llenar la columna, de
  // modo que toda iteración —corta o larga— cierra en el mismo lugar.
  //
  // Era una constante de 10, tomada del radio de un nodo normal. Pero el de una
  // entrega se calcula con su peso (ver entregaDe: 7 a 12), así que toda entrega
  // que pesara 60% o más del máximo se salía del viewBox y el SVG la recortaba:
  // la entrega que más pesa —la final de cualquier curso— perdía 2.75 unidades
  // de su lado derecho y se dibujaba con un canto plano. Ahora sale del dibujo,
  // no de un número escrito a mano.
  const maxNodeR = Math.max(7, ...local.map(s => (entregaDe[s.n] || {}).nodeR || 0));
  const PAD_X = Math.ceil(Math.max(maxNodeR + NODE_SW / 2, FOCUS_R + FOCUS_SW / 2));
  const STEP_L = (VB_W - 2 * PAD_X) / Math.max(1, n - 1);
  const xi = k => PAD_X + k * STEP_L;               // k = índice local (0..n-1)
  const CY = TOP + H, VB_H = CY + H + 8;
  // Rótulos: los de los extremos se anclan al canto de la columna para cerrar a
  // ras con las tarjetas; los de en medio van centrados sobre su nodo. En HTML
  // el ancla es una clase y el desplazamiento lo hace el CSS con un translate,
  // así que no hay que medir la caja de texto a mano —era lo que hacía labelX,
  // adivinando el ancho del glifo a partir del cuerpo en px—.
  const anchorOf = k => k === 0 ? " at-start" : k === n - 1 ? " at-end" : "";
  const leftOf = k => k === 0 ? "0%" : k === n - 1 ? "100%" : (xi(k) / VB_W * 100).toFixed(3) + "%";

  // El piso de escala evita que la cinta se comprima hasta lo ilegible: por
  // debajo de él desborda y .map-scroll la recorre. Va en rem —no en px— para
  // que suba con el tamaño de fuente del usuario: es lo que hace que los
  // rótulos de HTML tengan siempre el espacio que su cuerpo pide.
  const ESCALA_MIN = 0.9;
  const wrap = h("div", { class: "ribbon-wrap" });
  wrap.style.minWidth = (VB_W * ESCALA_MIN / 16).toFixed(2) + "rem";
  // el ancho máximo lo pone el CSS (--readw): mismo eje derecho que las tarjetas

  const marks = h("div", { class: "ribbon-marks", "aria-hidden": "true" });
  const axis = h("div", { class: "ribbon-axis", "aria-hidden": "true" });
  const brks = h("div", { class: "ribbon-breaks", "aria-hidden": "true" });
  // Las tres tiras duplican en pantalla lo que el lector de pantalla ya recibe
  // por otro lado: cada nodo es un botón con su aria-label —sesión, título y
  // fecha larga— y los recesos salen además como banda entre las tarjetas.

  const svg = svgEl("svg", { class: "ribbon", viewBox: `0 0 ${VB_W} ${VB_H}`, role: "img",
    "aria-label": "Doble diamante de la iteración: dos veces se abre para explorar y se cierra para decidir." });

  // Recesos de esta iteración, ubicados antes de dibujar nada: la espina se
  // traza por tramos para dejarles la muesca. Los recesos entre iteraciones no
  // llegan aquí, los pinta la banda entre bloques.
  const cortes = (breaks || []).map(br => {
    const k = local.findIndex(s => s.n === br.beforeN);
    if (k < 0 || k + 1 >= n || local[k + 1].n !== br.afterN) return null;
    return { br, bx: (xi(k) + xi(k + 1)) / 2 };
  }).filter(Boolean).sort((a, b) => a.bx - b.bx);

  // La espina recorre la columna completa —mismos cantos que las tarjetas— y se
  // interrumpe en cada receso.
  //
  // Antes el receso se restaba de la figura: una máscara de papel del alto del
  // relleno, con los cantos rematados. Pero un receso es un hecho del
  // calendario y el rombo es un modelo de fases, así que el corte caía donde no
  // significaba nada y hacía estragos según dónde tocara —en el hueco real de
  // cc3-ai dejaba una cuña suelta de 37 unidades; un hueco más al centro partía
  // el rombo en dos triángulos—. Y la etiqueta medía cuatro veces la costura,
  // así que la máscara nunca la cubrió: se montaba sobre la espina y sobre el
  // número de sesión, mordiendo el contorno con su halo.
  //
  // Ahora el receso vive donde vive el tiempo: una muesca en la espina, las dos
  // barras, y la etiqueta abajo del todo, bajo la fila de fechas. El relleno no
  // se toca, así que no hay nada que restar ni cantos que rematar.
  let xTramo = 0;
  cortes.forEach(({ bx }) => {
    svg.appendChild(svgEl("line", { class: "spine", x1: xTramo, y1: CY, x2: bx - SEAM / 2, y2: CY }));
    xTramo = bx + SEAM / 2;
  });
  svg.appendChild(svgEl("line", { class: "spine", x1: xTramo, y1: CY, x2: VB_W, y2: CY }));

  // Doble diamante: dos rombos que se tocan en un vértice a media iteración.
  //
  // La figura ya no cuelga de las sesiones. Antes abría en el centro de la
  // primera y cerraba en el de la última —forma y calendario eran el mismo
  // objeto—, y a media iteración no cerraba: se estrechaba a una cintura del
  // 35% de la altura, que es lo que impedía leerla como dos diamantes. Ahora
  // abre y cierra en los cantos del viewBox: el timeline es literal —los nodos
  // son las fechas, y no se mueven— y el diamante es la figura que lo acompaña,
  // así que arranca antes de la primera clase y cierra después de la última. El
  // voladizo son las 14 unidades que PAD_X ya reservaba para el círculo de la
  // entrega, de modo que no cuesta ni una sesión de espacio.
  //
  // El vértice de en medio cae en el punto medio del viewBox, que es también el
  // punto medio del tramo de sesiones: en una iteración de ocho, entre la 4ª y
  // la 5ª.
  const xA = 0, xE = VB_W, xM = (xA + xE) / 2;
  const xP1 = (xA + xM) / 2, xP2 = (xM + xE) / 2;
  if (n >= 2) {
    // Dos paths y no un contorno corrido: el degradado va por elemento
    // (objectBoundingBox), así que cada rombo se densifica hacia su propio
    // cierre —divergir y converger, dos veces— en vez de una sola rampa de
    // punta a punta. Y cada uno florece a su tiempo con el --delay que el CSS
    // ya leía sin que nadie lo definiera.
    [[xA, xP1, xM, 0], [xM, xP2, xE, 0.18]].forEach(([x0, xc, x1, delay]) => {
      const dia = svgEl("path", { class: "diamond",
        d: `M ${x0} ${CY} L ${xc} ${CY - H} L ${x1} ${CY} L ${xc} ${CY + H} Z` });
      if (!matchMedia("(prefers-reduced-motion: reduce)").matches) {
        dia.classList.add("animate");
        dia.style.setProperty("--delay", delay + "s");
      }
      svg.appendChild(dia);
    });
  }

  local.forEach((s, k) => {
    const gi = idxByN[s.n];                          // índice global (fechas y hoy)
    const isDeliver = entregaDe[s.n] != null;
    const isToday = gi === tIdx;
    const g = svgEl("g", { class: "session-node" + (isToday ? " is-today" : ""), "data-n": s.n, tabindex: "0",
      role: "button", "aria-label": `Sesión ${s.n}: ${s.titulo || ""}${dates[gi] ? " — " + FMT_LONG.format(dates[gi]) : ""}` });

    const nodeR = isDeliver ? entregaDe[s.n].nodeR : (isToday ? 7 : 6);

    // Área de clic: el <g> ya no contiene el número ni la fecha, así que su
    // caja se reduciría al círculo —seis unidades de radio, un blanco diminuto
    // para el dedo—. Esta banda transparente le devuelve la altura que tenía y
    // le da además todo el ancho de su columna, sin pisar la de al lado.
    g.appendChild(svgEl("rect", { class: "node-hit", x: xi(k) - STEP_L / 2, y: CY - 17, width: STEP_L, height: 34 }));

    // El foco se dibuja como anillo concéntrico al nodo, no como outline del
    // <g>: el outline abarcaría también la banda de clic y daría un rectángulo
    // ancho y bajo ajeno al diagrama. Radio constante y no relativo a nodeR: el
    // indicador de foco mide siempre lo mismo, y enfocar activa además
    // .is-active (que lleva el nodo a r:8), así que hace falta holgura para que
    // el anillo no lo roce.
    g.appendChild(svgEl("circle", { class: "focus-ring", cx: xi(k), cy: CY, r: FOCUS_R }));

    // El plumón sube desde la espina hasta el canto de arriba, donde arranca el
    // rótulo de HTML: dentro del SVG queda la línea, que es dibujo; fuera, la
    // palabra, que es prosa.
    if (isToday && !isDeliver) {
      svg.appendChild(svgEl("line", { class: "today-stem", x1: xi(k), y1: 0, x2: xi(k), y2: CY }));
      const m = h("span", { class: "mark mark-today" + anchorOf(k) }, "Hoy");
      m.style.left = leftOf(k);
      marks.appendChild(m);
    }
    if (isDeliver) {
      const ent = entregaDe[s.n];
      svg.appendChild(svgEl("line", { class: "deliver-stem", x1: xi(k), y1: 0, x2: xi(k), y2: CY }));
      const m = h("span", { class: "mark mark-deliver" + anchorOf(k) },
        esc(ent.etiqueta) + (ent.peso ? ` · ${ent.peso}%` : ""));
      m.style.left = leftOf(k);
      marks.appendChild(m);
    }
    g.appendChild(svgEl("circle", { class: "node" + (isDeliver ? " deliver" : ""), cx: xi(k), cy: CY, r: nodeR }));
    svg.appendChild(g);

    const item = h("span", { class: "axis-item" + anchorOf(k) + (isToday ? " is-today" : ""), "data-n": s.n },
      `<b>${pad2(s.n)}</b>` + (dates[gi] ? `<i>${esc(fmtDate(dates[gi]))}</i>` : ""));
    item.style.left = leftOf(k);
    axis.appendChild(item);
  });

  // Recesos dentro de la iteración: la muesca ya está hecha —la espina se trazó
  // por tramos—, así que aquí sólo van las dos barras que la rematan, que son
  // dibujo. El nombre y las fechas son prosa: bajan a su propia tira de HTML,
  // debajo de la fila de sesiones, donde no pisan ni la espina ni un número.
  cortes.forEach(({ br, bx }) => {
    // Las barras necesitan despegarse del relleno del rombo o dejan de leerse
    // como un eje interrumpido —parecen una raya sobre el dibujo—, pero un
    // rectángulo de papel detrás enseña sus cuatro cantos y mete una caja donde
    // no hay ninguna. Así que cada barra lleva su propio halo: la misma diagonal
    // trazada gruesa en papel, debajo. El hueco toma la forma del símbolo, no la
    // de una ventana, y al no depender del alto del relleno tampoco recorta la
    // cuña que dejaba la máscara vieja cuando el receso caía cerca del extremo.
    const barras = [-3, 3].map(off => [bx + off - 3.5, CY + 8, bx + off + 3.5, CY - 8]);
    ["break-slash-halo", "break-slash"].forEach(cls =>
      barras.forEach(([x1, y1, x2, y2]) =>
        svg.appendChild(svgEl("line", { class: cls, x1, y1, x2, y2 }))));
    const b = h("span", { class: "break-item" },
      `<b>${esc(br.etiqueta)}</b><i>${esc(br.dateLabel)}</i>`);
    b.style.left = (bx / VB_W * 100).toFixed(3) + "%";
    brks.appendChild(b);
  });

  // Orden de apilado: los rótulos que cuelgan de arriba, el dibujo, la fila de
  // sesiones y al final los recesos. Las tiras vacías no ocupan renglón.
  if (marks.children.length) wrap.appendChild(marks);
  wrap.appendChild(svg);
  wrap.appendChild(axis);
  if (brks.children.length) wrap.appendChild(brks);
  return wrap;
}

/* ---------- tarjetas ---------- */

function breakBand(br, inGrid) {
  const el = h("div", { class: "break-band" + (inGrid ? " in-grid" : "") });
  el.innerHTML = `<span>${esc(br.etiqueta)} · ${esc(br.dateLabel)} · sin clase</span>`;
  return el;
}

function iterationsSection(cfg, sessions, iteraciones, entregaDe, dates, tIdx, breaks) {
  const root = h("main", { id: "iterations" });
  root.appendChild(gradientDefs());

  // Sin 'caption' va la frase por defecto; con 'caption' vacío no va ninguna.
  // Antes no había forma de quitarla: una cadena en blanco pasaba el || y
  // dejaba un renglón vacío entre la portada y la primera cinta.
  const cap = cfg.caption == null
    ? "Dos veces se abre para explorar y se cierra para decidir. Las fechas de abajo son literales; la figura las desborda porque el trabajo empieza antes de la primera clase y no se acaba en la última."
    : String(cfg.caption).trim();
  if (cap) root.appendChild(h("p", { class: "map-caption" }, esc(cap)));

  const dateByN = {}, idxByN = {};
  sessions.forEach((s, i) => { idxByN[s.n] = i; if (dates[i]) dateByN[s.n] = dates[i]; });

  const groups = iteraciones.length ? iteraciones : [{ nombre: "Sesiones", sesiones: [1, sessions.length] }];
  const iterOf = n => groups.findIndex(it => n >= it.sesiones[0] && n <= it.sesiones[1]);

  // Alto de cinta compartido → bloques apilados de altura uniforme, sin
  // importar cuántas sesiones tenga cada iteración. Se acota al lóbulo más
  // chico para que ningún diamante quede más alto que ancho.
  const STEP = 76;
  let H = Infinity;
  groups.forEach(it => { H = Math.min(H, (it.sesiones[1] - it.sesiones[0]) * STEP / 4); });
  H = Math.max(60, Math.min(H, 120));

  // Un solo viewBox para todas las cintas: lo dicta la iteración más larga (más
  // 56 de sangría mínima). Compartir ancho y alto de viewBox es lo que hace que
  // todas rindan a la misma escala aunque el CSS las acote a la columna de
  // lectura, y que ninguna quede comprimida.
  const longest = groups.reduce((m, it) => Math.max(m, it.sesiones[1] - it.sesiones[0]), 0);
  const VB_W = 2 * 56 + Math.max(1, longest) * STEP;

  groups.forEach((it, gi) => {
    const [s0, s1] = it.sesiones;
    const local = sessions.filter(s => s.n >= s0 && s.n <= s1);
    const sec = h("section", { class: "iteration" });

    const head = h("div", { class: "iteration-head" });
    head.innerHTML = `<span class="iteration-index">${pad2(gi + 1)}</span>
      <div class="iteration-name"><h2>${iteraciones.length ? "Iteración — " : ""}${esc(it.nombre)}</h2>
      ${prose(it.nota)}</div>`;
    sec.appendChild(head);

    // mini-cinta de esta iteración
    const scroll = h("div", { class: "map-scroll" });
    scroll.appendChild(buildIterRibbon(local, idxByN, entregaDe, dates, tIdx, breaks, H, STEP, VB_W));
    sec.appendChild(scroll);

    // tarjetas de esta iteración
    const grid = h("div", { class: "cards" });
    local.forEach(s => {
      grid.appendChild(makeCard(s, entregaDe[s.n], dateByN[s.n], sessions[tIdx] && sessions[tIdx].n === s.n));
      // receso a media iteración → divisor a lo ancho de la rejilla
      const mid = (breaks || []).find(b => b.beforeN === s.n && iterOf(b.afterN) === gi);
      if (mid) grid.appendChild(breakBand(mid, true));
    });
    sec.appendChild(grid);
    root.appendChild(sec);

    // receso entre iteraciones → banda entre bloques
    const seam = (breaks || []).find(b => iterOf(b.beforeN) === gi && iterOf(b.afterN) === gi + 1);
    if (seam) root.appendChild(breakBand(seam, false));
  });
  return root;
}

function makeCard(s, entrega, date, isToday) {
  const card = h("article", { class: "card" + (entrega ? " deliverable" : "") + (isToday ? " is-today" : ""), id: "s" + s.n });
  card.dataset.n = s.n;
  const dateStr = date ? fmtDate(date) : "";
  const topRight = entrega
    ? `<span class="badge">${esc(entrega.etiqueta)}</span>`
    : `<span>${dateStr || "Sesión"}${isToday ? ' · <span class="hoy">hoy</span>' : ""}</span>`;
  const numLine = entrega && dateStr ? `S${pad2(s.n)} · ${dateStr}` : `S${pad2(s.n)}`;
  card.innerHTML = `
    <div class="card-top"><span class="card-num">${numLine}</span>${topRight}</div>
    <h3>${esc(s.titulo)}</h3>
    ${entrega && entrega.peso ? `<p class="peso"><strong>${entrega.peso}%</strong> de la calificación</p>` : ""}
    ${prose(s.desc)}
    ${s.tool && !entrega ? `<span class="tool">${esc(s.tool)}</span>` : ""}`;
  return card;
}

/* ---------- referencias ---------- */

// Cierra el documento, después de la última sesión y antes del colofón: es
// material de consulta, no parte del recorrido. Siempre es una lista numerada
// —una referencia se cita por su número— y cada entrada admite dos formas:
// una cadena suelta, o un mapa {texto, url} cuando hay a dónde ir.
function references(refs) {
  const items = (Array.isArray(refs) ? refs : [refs]).filter(r => r != null && r !== "");
  if (!items.length) return null;
  const el = h("section", { class: "references" });
  el.appendChild(h("h2", null, "Referencias"));
  const list = h("ol", { class: "ref-list" });
  items.forEach(r => {
    const isMap = typeof r === "object" && !Array.isArray(r);
    const texto = isMap ? (r.texto || r.url) : r;
    const url = isMap ? r.url : null;
    if (texto == null || texto === "") return;
    // por nodos y no por innerHTML: el frontmatter es contenido, nunca marcado,
    // y así ni el texto ni la URL pueden inyectar etiquetas ni salirse del
    // atributo (esc() no toca las comillas)
    const li = h("li");
    if (url) {
      const a = h("a", { href: url, rel: "noopener" });
      a.textContent = texto;
      li.appendChild(a);
    } else {
      li.textContent = texto;
    }
    list.appendChild(li);
  });
  if (!list.children.length) return null;
  el.appendChild(list);
  return el;
}

/* ---------- colofón ---------- */

// Las entregas ya no bajan aquí: se dicen en la portada (ver evaluation) y
// repetirlas al pie sería decir dos veces el mismo dato.
function colophon(cfg) {
  const foot = h("footer", { class: "colophon" });
  // rejilla interna: el colofón cierra en la misma columna que las tarjetas
  const grid = h("div", { class: "colophon-grid" });
  foot.appendChild(grid);

  let onScreen = 0;
  (cfg.colofon || []).forEach(c => {
    grid.appendChild(h("div", { class: "col" }, `<h2>${esc(c.titulo)}</h2>${prose(c.texto)}`));
    onScreen++;
  });
  if (cfg.grupos && cfg.grupos.length) {
    const col = h("div", { class: "col" });
    col.appendChild(h("h2", null, "Grupos"));
    col.appendChild(h("p", null, esc(cfg.grupos.join(" · ")) + (cfg.calendario ? " — mismo calendario." : "")));
    grid.appendChild(col);
    onScreen++;
  }
  // sólo en papel: de dónde salió la hoja que el alumno tiene en la mano
  grid.appendChild(h("div", { class: "col print-only" }, `<h2>Programa en línea</h2>
    <p>${esc(location.href.split("?")[0])}</p>`));
  // un curso sin colofón ni grupos dejaría en pantalla una regla huérfana bajo
  // la última tarjeta: el pie entero pasa a ser cosa del papel
  if (!onScreen) foot.classList.add("print-only");
  return foot;
}

/* ---------- vínculo cinta <-> tarjetas ---------- */

function link() {
  const nodes = [...document.querySelectorAll(".session-node")];
  const cards = [...document.querySelectorAll(".card")];
  // El número y la fecha ya no viven dentro del <g> del nodo, así que se
  // enteran por su cuenta: llevan el mismo data-n y entran al mismo diálogo.
  const items = [...document.querySelectorAll(".axis-item")];
  const byN = n => ({
    node: nodes.find(e => e.dataset.n == n),
    card: cards.find(e => e.dataset.n == n),
    item: items.find(e => e.dataset.n == n),
  });
  const setActive = (n, on) => {
    const { node, card, item } = byN(n);
    node && node.classList.toggle("is-active", on);
    card && card.classList.toggle("is-active", on);
    item && item.classList.toggle("is-active", on);
  };
  nodes.forEach(node => {
    const n = node.dataset.n;
    node.addEventListener("mouseenter", () => setActive(n, true));
    node.addEventListener("mouseleave", () => setActive(n, false));
    node.addEventListener("focus", () => setActive(n, true));
    node.addEventListener("blur", () => setActive(n, false));
    const go = () => byN(n).card.scrollIntoView({ behavior: "smooth", block: "center" });
    node.addEventListener("click", go);
    node.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); go(); } });
  });
  cards.forEach(card => {
    const n = card.dataset.n;
    card.addEventListener("mouseenter", () => setActive(n, true));
    card.addEventListener("mouseleave", () => setActive(n, false));
  });
}

/* =========================================================
   5 · Arranque
   ========================================================= */

(async function () {
  const src = window.CURSO_CONFIG || "curso.md";
  const app = document.getElementById("app");
  try {
    const res = await fetch(src);
    if (!res.ok) throw new Error(`No se pudo leer ${src} (${res.status})`);
    const { data } = parseFrontmatter(await res.text());
    if (!data || !data.sesiones) throw new Error("El archivo no tiene un frontmatter válido con 'sesiones'.");
    render(data);
  } catch (e) {
    app.innerHTML = `<div class="load-error"><h1>No se pudo cargar el curso</h1><p>${esc(e.message)}</p>
      <p class="fine">Revisa que <code>${esc(src)}</code> exista y tenga frontmatter <code>--- … ---</code>.</p></div>`;
  }
})();
