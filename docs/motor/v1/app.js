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
      if (content.startsWith("- ")) {
        const item = content.slice(2).trim();
        idx++;
        result.push(item === "" ? parseNode(indentOf(lines[idx])) : parseValue(item));
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

/* =========================================================
   4 · Render principal
   ========================================================= */

function render(cfg) {
  const app = document.getElementById("app");
  app.innerHTML = "";

  const sessions = (cfg.sesiones || []).slice().sort((a, b) => a.n - b.n);
  const iteraciones = (cfg.estructura && cfg.estructura.iteraciones) || [];
  const entregas = (cfg.estructura && cfg.estructura.entregas) || [];
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
  app.appendChild(masthead(cfg, sessions.length, dates, tIdx));
  app.appendChild(iterationsSection(cfg, sessions, iteraciones, entregaDe, dates, tIdx, breaks));
  app.appendChild(colophon(cfg, entregas, dates));

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

function masthead(cfg, n, dates, tIdx) {
  const el = h("header", { class: "masthead" });
  const eyebrow = [cfg.programa, cfg.edicion].filter(Boolean).join(" · ") || cfg.universidad || "";
  el.appendChild(h("p", { class: "eyebrow" }, esc(eyebrow)));
  el.appendChild(h("h1", { class: "title" }, esc(cfg.titulo || "Curso")));
  if (cfg.intro) el.appendChild(h("p", { class: "lede" }, esc(cfg.intro)));

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
function buildIterRibbon(local, idxByN, entregaDe, dates, tIdx, breaks, H, STEP, VB_W) {
  const n = local.length;
  const TOP = 46, WAIST = 0.35, SEAM = 16;
  // El viewBox es común a todas las cintas (lo fija la iteración más larga) y el
  // CSS lo acota a la columna de lectura: la cinta abre en el eje izquierdo del
  // masthead y cierra donde cierran las tarjetas. La sangría es sólo el radio del
  // nodo, para que apertura y cierre caigan sobre esos ejes; el paso se estira
  // para llenar la columna, de modo que toda iteración —corta o larga— cierra en
  // el mismo lugar.
  const PAD_X = 10;
  const STEP_L = (VB_W - 2 * PAD_X) / Math.max(1, n - 1);
  const xi = k => PAD_X + k * STEP_L;               // k = índice local (0..n-1)
  // Etiquetas: los extremos se anclan al eje (start/end) para cerrar a ras; las
  // de en medio van centradas sobre su nodo, con la caja dentro del viewBox.
  const edgeAnchor = k => k === 0 ? "at-start" : k === n - 1 ? "at-end" : null;
  const labelX = (k, text, fontPx, lsEm) => {
    if (k === 0) return 0;
    if (k === n - 1) return VB_W;
    const half = String(text).length * fontPx * (0.6 + lsEm) / 2, m = 6;
    return Math.max(m + half, Math.min(xi(k), VB_W - m - half));
  };
  const w = H * WAIST, CY = TOP + H;
  const NUM_Y = CY + H + 24, DATE_Y = NUM_Y + 17, LABEL_Y = 20, VB_H = DATE_Y + 14;

  const svg = svgEl("svg", { class: "ribbon", viewBox: `0 0 ${VB_W} ${VB_H}`, role: "img",
    "aria-label": "Diagrama de la iteración: el trazo se ensancha al explorar y se cierra sobre la entrega." });
  svg.style.minWidth = Math.round(VB_W * 0.47) + "px";
  // el ancho máximo lo pone el CSS (--readw): mismo eje derecho que las tarjetas

  // la espina recorre la columna completa: mismos cantos que las tarjetas
  svg.appendChild(svgEl("line", { class: "spine", x1: 0, y1: CY, x2: VB_W, y2: CY }));

  // cinta: punto → bulto → cintura → bulto → punto (arriba), y el espejo abajo
  const xL = xi(0), xR = xi(n - 1), xM = (xL + xR) / 2;
  const xP1 = (xL + xM) / 2, xP2 = (xM + xR) / 2;
  if (n >= 2) {
    const path =
      `M ${xL} ${CY} L ${xP1} ${CY - H} L ${xM} ${CY - w} L ${xP2} ${CY - H} ` +
      `L ${xR} ${CY} L ${xP2} ${CY + H} L ${xM} ${CY + w} L ${xP1} ${CY + H} Z`;
    const dia = svgEl("path", { class: "diamond", d: path });
    if (!matchMedia("(prefers-reduced-motion: reduce)").matches) dia.classList.add("animate");
    svg.appendChild(dia);
  }

  // media altura del relleno en un x dado (0 = espina desnuda)
  const fillHalfAt = x => {
    if (n < 2 || x < xL || x > xR) return 0;
    const pts = [[xL, 0], [xP1, H], [xM, w], [xP2, H], [xR, 0]];
    for (let i = 0; i < pts.length - 1; i++) {
      const [ax, ah] = pts[i], [bx2, bh] = pts[i + 1];
      if (x >= ax && x <= bx2) return ah + (bh - ah) * (x - ax) / (bx2 - ax);
    }
    return 0;
  };

  local.forEach((s, k) => {
    const gi = idxByN[s.n];                          // índice global (fechas y hoy)
    const isDeliver = entregaDe[s.n] != null;
    const isToday = gi === tIdx;
    const g = svgEl("g", { class: "session-node" + (isToday ? " is-today" : ""), "data-n": s.n, tabindex: "0",
      role: "button", "aria-label": `Sesión ${s.n}: ${s.titulo || ""}${dates[gi] ? " — " + FMT_LONG.format(dates[gi]) : ""}` });

    const anchor = edgeAnchor(k), cls = extra => extra + (anchor ? " " + anchor : "");

    if (isToday && !isDeliver) {
      svg.appendChild(svgEl("line", { class: "today-stem", x1: xi(k), y1: LABEL_Y + 6, x2: xi(k), y2: CY }));
      const lab = svgEl("text", { class: cls("today-label"), x: labelX(k, "HOY", 12, 0.16), y: LABEL_Y }); lab.textContent = "HOY";
      svg.appendChild(lab);
    }
    if (isDeliver) {
      const ent = entregaDe[s.n];
      svg.appendChild(svgEl("line", { class: "deliver-stem", x1: xi(k), y1: LABEL_Y + 6, x2: xi(k), y2: CY }));
      const etiqueta = String(ent.etiqueta).toUpperCase() + (ent.peso ? ` · ${ent.peso}%` : "");
      const lab = svgEl("text", { class: cls("deliver-label"), x: labelX(k, etiqueta, 13, 0.18), y: LABEL_Y });
      lab.textContent = etiqueta;
      svg.appendChild(lab);
      g.appendChild(svgEl("circle", { class: "node deliver", cx: xi(k), cy: CY, r: ent.nodeR }));
    } else {
      g.appendChild(svgEl("circle", { class: "node", cx: xi(k), cy: CY, r: isToday ? 7 : 6 }));
    }

    const num = svgEl("text", { class: cls("node-num"), x: labelX(k, "", 0, 0), y: NUM_Y });
    num.textContent = pad2(s.n);
    g.appendChild(num);
    if (dates[gi]) {
      const dt = svgEl("text", { class: cls("node-date"), x: labelX(k, fmtDate(dates[gi]), 12, 0), y: DATE_Y });
      dt.textContent = fmtDate(dates[gi]);
      g.appendChild(dt);
    }
    svg.appendChild(g);
  });

  // recesos dentro de la iteración → costura de altura completa (un canal de
  // papel interrumpe relleno y contorno; los cantos se rematan). Los recesos
  // entre iteraciones no llegan aquí: los pinta la banda entre bloques.
  (breaks || []).forEach(br => {
    const k = local.findIndex(s => s.n === br.beforeN);
    if (k < 0 || k + 1 >= n || local[k + 1].n !== br.afterN) return;
    const bx = (xi(k) + xi(k + 1)) / 2, xa = bx - SEAM / 2, xb = bx + SEAM / 2;
    const hL = fillHalfAt(xa), hR = fillHalfAt(xb), hM = Math.max(hL, hR, fillHalfAt(bx));
    svg.appendChild(svgEl("rect", { class: "break-mask", x: xa, y: CY - hM - 3, width: SEAM, height: 2 * hM + 6 }));
    if (hL > 1) svg.appendChild(svgEl("line", { class: "break-cap", x1: xa, y1: CY - hL, x2: xa, y2: CY + hL }));
    if (hR > 1) svg.appendChild(svgEl("line", { class: "break-cap", x1: xb, y1: CY - hR, x2: xb, y2: CY + hR }));
    [-3, 3].forEach(off => svg.appendChild(svgEl("line", { class: "break-slash",
      x1: bx + off - 3.5, y1: CY + 8, x2: bx + off + 3.5, y2: CY - 8 })));
    const eb = svgEl("text", { class: "break-eyebrow", x: bx, y: CY + 23 });
    eb.textContent = br.etiqueta;
    svg.appendChild(eb);
    const dl = svgEl("text", { class: "break-dates", x: bx, y: CY + 38 });
    dl.textContent = br.dateLabel;
    svg.appendChild(dl);
  });

  return svg;
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

  const cap = cfg.caption || "El trazo se ensancha al explorar y se cierra al decidir. Las entregas caen donde el tramo se afina del todo.";
  root.appendChild(h("p", { class: "map-caption" }, esc(cap)));

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
      ${it.nota ? `<p>${esc(it.nota)}</p>` : ""}</div>`;
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
    ${s.desc ? `<p>${esc(s.desc)}</p>` : ""}
    ${s.tool && !entrega ? `<span class="tool">${esc(s.tool)}</span>` : ""}`;
  return card;
}

/* ---------- colofón ---------- */

function colophon(cfg, entregas, dates) {
  const foot = h("footer", { class: "colophon" });
  // rejilla interna: el colofón cierra en la misma columna que las tarjetas
  const grid = h("div", { class: "colophon-grid" });
  foot.appendChild(grid);
  const sByN = {};
  (cfg.sesiones || []).slice().sort((a, b) => a.n - b.n).forEach((s, i) => { sByN[s.n] = dates[i]; });

  if (entregas.length) {
    const col = h("div", { class: "col" });
    col.appendChild(h("h2", null, "Entregas"));
    entregas.forEach(e => {
      const dt = sByN[e.sesion], peso = Number(e.peso) || 0;
      col.appendChild(h("p", null, `<strong>${esc(e.etiqueta)}</strong> — S${pad2(e.sesion)}`
        + (dt ? " · " + fmtDate(dt) : "") + (peso ? ` · <strong>${peso}%</strong>` : "")));
    });
    // la suma es el control que el docente necesita ver antes de publicar
    const suma = entregas.reduce((t, e) => t + (Number(e.peso) || 0), 0);
    if (suma) col.appendChild(h("p", { class: "fine" },
      suma === 100 ? "Suma 100% de la calificación." : `Los pesos suman ${suma}%.`));
    grid.appendChild(col);
  }
  (cfg.colofon || []).forEach(c => {
    const col = h("div", { class: "col" });
    col.appendChild(h("h2", null, esc(c.titulo)));
    col.appendChild(h("p", null, esc(c.texto)));
    grid.appendChild(col);
  });
  if (cfg.grupos && cfg.grupos.length) {
    const col = h("div", { class: "col" });
    col.appendChild(h("h2", null, "Grupos"));
    col.appendChild(h("p", null, esc(cfg.grupos.join(" · ")) + (cfg.calendario ? " — mismo calendario." : "")));
    grid.appendChild(col);
  }
  // sólo en papel: de dónde salió la hoja que el alumno tiene en la mano
  grid.appendChild(h("div", { class: "col print-only" }, `<h2>Programa en línea</h2>
    <p>${esc(location.href.split("?")[0])}</p>`));
  return foot;
}

/* ---------- vínculo cinta <-> tarjetas ---------- */

function link() {
  const nodes = [...document.querySelectorAll(".session-node")];
  const cards = [...document.querySelectorAll(".card")];
  const byN = n => ({ node: nodes.find(e => e.dataset.n == n), card: cards.find(e => e.dataset.n == n) });
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
