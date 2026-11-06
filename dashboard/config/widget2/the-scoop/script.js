/* ============================================================
   Build an AI Agent — script.js
   State, rendering, canvas engine, tutorial, run orchestration.
   ============================================================ */

/* ---------- STATE ---------- */
const S = {
  levelIdx: 0,
  maxUnlocked: 0,
  nodes: {},           // partId -> {x, y}
  edges: [],           // [partIdA, partIdB]
  workspace: [],       // rule blocks: {uid, blockId, choices:{}, customText, multi:[]}
  selectedPart: null,
  category: "core",
  tab: "build",
  zoom: 0.8,
  running: false,
  phase: "build",      // build | running | done
  feed: [],
  shopView: null,
  activeTool: null,
  speed: 40,
  soundOn: false,
  verdict: null,
  aiMode: AI_MODE === "auto" ? "auto" : AI_MODE, // resolves to live|sim after first run
  tutStep: 0,
  brainTabSeen: false,
  ranOnce: false,
  failSeen: false,
  abort: false,
};

const NW = 150;
const CANVAS_W = 1500;
const CANVAS_H = 950;
const NODE_H = { core: 74, memory: 56, tool: 56, data: 56 };
const BRAIN_BOTTOMS = 5;

const $ = (id) => document.getElementById(id);
const level = () => LEVELS[S.levelIdx];

function el(tag, cls, html) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (html !== undefined) e.innerHTML = html;
  return e;
}
function edgeKey(a, b) { return [a, b].sort().join("|"); }
function nodeHeight(p) { return NODE_H[PARTS[p].kind] || 56; }
function nodePorts(p) {
  if (p === "brain") { const arr = ["left", "right"]; for (let i = 0; i < BRAIN_BOTTOMS; i++) arr.push("b" + i); return arr; }
  if (p === "chat_input") return ["right"];
  if (p === "chat_output") return ["left"];
  const k = PARTS[p].kind;
  if (k === "tool") return ["top", "bottom"];
  return ["top"]; // memory + data
}
function portPos(p, side) {
  const n = S.nodes[p];
  if (!n) return { x: 0, y: 0 };
  const h = nodeHeight(p);
  if (side === "left") return { x: n.x, y: n.y + h / 2 };
  if (side === "right") return { x: n.x + NW, y: n.y + h / 2 };
  if (side === "top") return { x: n.x + NW / 2, y: n.y };
  if (side[0] === "b" && side.length === 2) {
    const i = +side[1];
    return { x: n.x + (NW * (i + 1)) / (BRAIN_BOTTOMS + 1), y: n.y + h };
  }
  return { x: n.x + NW / 2, y: n.y + h };
}
function brainBottomPort(targetX) {
  let best = "b2", bestD = Infinity;
  for (let i = 0; i < BRAIN_BOTTOMS; i++) {
    const pos = portPos("brain", "b" + i);
    const d = Math.abs(pos.x - targetX);
    if (d < bestD) { bestD = d; best = "b" + i; }
  }
  return best;
}

/* ---------- WIRING DERIVATION ---------- */
function wiring() {
  const dataUnder = {}, connectedTools = [];
  let inputWired = false, outputWired = false, memoryWired = false;
  for (const [a, b] of S.edges) {
    if (!S.nodes[a] || !S.nodes[b]) continue;
    const pair = new Set([a, b]);
    if (pair.has("chat_input") && pair.has("brain")) inputWired = true;
    if (pair.has("chat_output") && pair.has("brain")) outputWired = true;
    if (pair.has("memory") && pair.has("brain")) memoryWired = true;
    const toolPart = [a, b].find((x) => PARTS[x] && PARTS[x].kind === "tool");
    const dataPart = [a, b].find((x) => PARTS[x] && PARTS[x].kind === "data");
    if (toolPart && pair.has("brain") && !connectedTools.includes(toolPart)) connectedTools.push(toolPart);
    if (toolPart && dataPart) dataUnder[toolPart] = dataPart;
  }
  return { dataUnder, connectedTools, inputWired, outputWired, memoryWired };
}
function compiledRules() { return S.workspace.map(compileBlock).filter((r) => r.length > 0); }

/* ---------- TTS ---------- */
function speak(text, who) {
  if (!S.soundOn || !window.speechSynthesis) return;
  const u = new SpeechSynthesisUtterance(text);
  u.pitch = who === "customer" ? 1.25 : 1.0;
  u.rate = who === "agent" ? 0.95 : 1.0;
  speechSynthesis.speak(u);
}

/* ============================================================
   RENDER — top bar, rail, palette, tabs
   ============================================================ */
function renderTopbar() {
  $("brand-icon").innerHTML = ICONS.icecream;
  $("level-chip").textContent = "Level " + level().id + ": " + level().title;
  const badge = $("ai-badge");
  badge.textContent = S.aiMode === "live" ? "LIVE AI" : S.aiMode === "sim" ? "SIM" : "AUTO";
  badge.classList.toggle("live", S.aiMode === "live");
  badge.title = S.aiMode === "live" ? "Powered by a live Claude call" : "Simulated agent — same lessons, no API needed";
  const sb = $("sound-btn");
  sb.innerHTML = (S.soundOn ? ICONS.vol_on : ICONS.vol_off) + "<span>Read aloud</span>";
  const pills = $("level-pills");
  pills.innerHTML = "";
  LEVELS.forEach((lv, i) => {
    const b = el("button", "level-pill" + (i === S.levelIdx ? " active" : ""));
    const locked = i > S.maxUnlocked;
    b.disabled = locked;
    b.innerHTML = locked ? ICONS.lock : String(lv.id);
    b.setAttribute("aria-label", locked ? "Level " + lv.id + " locked" : "Go to level " + lv.id);
    b.onclick = () => gotoLevel(i);
    pills.appendChild(b);
  });
  const tip = $("tip-strip");
  if (level().samTip) { tip.hidden = false; tip.textContent = level().samTip; } else tip.hidden = true;
}

function renderRail() {
  const rail = $("rail");
  rail.innerHTML = "";
  CATEGORIES.forEach((cat) => {
    const has = level().parts.some((p) => PARTS[p].kind === cat.id);
    if (!has) return;
    const b = el("button", "rail-btn" + (S.category === cat.id ? " active" : ""));
    b.dataset.cat = cat.id;
    b.innerHTML = '<span class="rail-dot" style="background:' + cat.color + '">' + ICONS[cat.icon] + '</span><span class="rail-label">' + cat.label + "</span>";
    b.setAttribute("aria-label", cat.label + " parts");
    b.onclick = () => { S.category = cat.id; renderRail(); renderPalette(); checkTutorial(); };
    rail.appendChild(b);
  });
}

function renderPalette() {
  const pal = $("palette");
  pal.innerHTML = "";
  const cat = CATEGORIES.find((c) => c.id === S.category);
  pal.appendChild(el("div", "section-label", cat.label + " parts"));
  const parts = level().parts.filter((p) => PARTS[p].kind === S.category && !S.nodes[p]);
  if (parts.length === 0) { pal.appendChild(el("div", "palette-empty", "All placed!")); return; }
  parts.forEach((pid) => {
    const p = PARTS[pid];
    const st = KIND_STYLE[p.kind];
    const chip = el("button", "part-chip" + (S.selectedPart === pid ? " selected" : ""));
    chip.dataset.part = pid;
    chip.style.borderColor = st.color;
    chip.style.background = st.bg;
    chip.draggable = true;
    chip.title = p.blurb;
    chip.setAttribute("aria-label", p.label + " — drag onto the canvas");
    chip.innerHTML = ICONS[pid] + "<span>" + p.label + "</span>" + (p.warn ? '<span class="warn">' + ICONS.alert + "</span>" : "");
    chip.addEventListener("dragstart", (e) => { e.dataTransfer.setData("text/plain", pid); S.selectedPart = null; });
    chip.onclick = () => { S.selectedPart = S.selectedPart === pid ? null : pid; renderPalette(); };
    pal.appendChild(chip);
  });
  if (S.selectedPart) pal.appendChild(el("div", "palette-hint", "Now tap the canvas to place it."));
  applyTutHighlights();
}

const TABS = [
  { id: "build", label: "Build", icon: null },
  { id: "rules", label: "Rules", icon: null },
  { id: "brain", label: "Brain", icon: "brain" },
];
function renderTabs() {
  const tabs = $("tabs");
  tabs.innerHTML = "";
  TABS.forEach((t) => {
    const b = el("button", "tab-btn" + (S.tab === t.id ? " active" : ""));
    b.dataset.tab = t.id;
    b.setAttribute("role", "tab");
    const label = t.id === "rules" ? "Rules (" + compiledRules().length + ")" : t.label;
    b.innerHTML = (t.icon ? ICONS[t.icon] : "") + "<span>" + label + "</span>";
    b.onclick = () => setTab(t.id);
    tabs.appendChild(b);
  });
  $("build-pane").hidden = S.tab !== "build";
  $("rules-pane").hidden = S.tab !== "rules";
  $("brain-pane").hidden = S.tab !== "brain";
  applyTutHighlights();
}
function setTab(t) {
  S.tab = t;
  if (t === "brain") S.brainTabSeen = true;
  renderTabs();
  if (t === "rules") renderRules();
  if (t === "brain") renderBrain();
  checkTutorial();
}

/* ============================================================
   CANVAS
   ============================================================ */
let pending = null;        // {part, side, downX, downY}
let dragNode = null;       // {part, offX, offY, moved, downX, downY}
let panState = null;
let suppressClick = false;

function canvasCoords(e) {
  const rect = $("canvas").getBoundingClientRect();
  return { x: (e.clientX - rect.left) / S.zoom, y: (e.clientY - rect.top) / S.zoom };
}

function renderCanvas() {
  const c = $("canvas");
  c.style.width = CANVAS_W + "px";
  c.style.height = CANVAS_H + "px";
  c.style.transform = "scale(" + S.zoom + ")";
  $("canvas-scaler").style.width = CANVAS_W * S.zoom + "px";
  $("canvas-scaler").style.height = CANVAS_H * S.zoom + "px";
  $("zoom-label").textContent = Math.round(S.zoom * 100) + "%";
  $("canvas-hint").style.display = Object.keys(S.nodes).length ? "none" : "block";
  renderNodes();
  renderWires();
}

function renderNodes() {
  const layer = $("node-layer");
  layer.innerHTML = "";
  const W = wiring();
  for (const pid in S.nodes) {
    const pos = S.nodes[pid];
    const p = PARTS[pid];
    const st = KIND_STYLE[p.kind];
    const isBrain = pid === "brain";
    const node = el("div", "node" + (isBrain ? " brain" : "") + (S.activeTool === pid ? " active-node" : ""));
    node.dataset.part = pid;
    node.style.left = pos.x + "px";
    node.style.top = pos.y + "px";
    node.style.minHeight = nodeHeight(pid) + "px";
    if (!isBrain) { node.style.borderColor = st.color; node.style.background = st.bg; }
    else node.style.borderColor = "#2FBE96";
    node.title = isBrain ? "Tap to edit the Brain's rules — drag to move" : p.blurb + " — drag to move";

    let inner = '<div class="node-head">' + ICONS[pid] + "<span>" + p.label + "</span>" + (p.warn ? ICONS.alert : "") + "</div>";
    if (isBrain) {
      const n = compiledRules().length;
      inner += '<div class="node-sub">' + (n ? n + " rule" + (n === 1 ? "" : "s") + " — tap to edit" : "no rules yet — tap to add!") + "</div>";
    }
    inner += nodeBody(pid);
    node.innerHTML = inner;

    if (!S.running) {
      const rm = el("button", "node-remove", ICONS.x);
      rm.title = "Remove";
      rm.setAttribute("aria-label", "Remove " + p.label);
      rm.onclick = (e) => { e.stopPropagation(); removeNode(pid); };
      rm.onpointerdown = (e) => e.stopPropagation();
      node.appendChild(rm);
    }
    node.addEventListener("pointerdown", (e) => startNodeDrag(pid, e));
    layer.appendChild(node);

    nodePorts(pid).forEach((side) => {
      const pp = portPos(pid, side);
      const dot = el("button", "port" + (pending && pending.part === pid && pending.side === side ? " pending" : pending ? " target" : ""));
      dot.style.left = pp.x - 7 + "px";
      dot.style.top = pp.y - 7 + "px";
      dot.title = pending ? "Connect here" : "Pull a wire from here";
      dot.setAttribute("aria-label", (pending ? "Connect wire to " : "Start wire from ") + p.label);
      dot.addEventListener("pointerdown", (e) => startWire(pid, side, e));
      dot.onclick = (e) => e.stopPropagation();
      layer.appendChild(dot);
    });
  }
  applyTutHighlights();
}

function nodeBody(pid) {
  const sv = S.shopView;
  if (pid === "menu_table") return '<div class="node-body">' + MENU.map((m) => "· " + m).join("<br>") + "</div>";
  if (pid === "freezer_table") {
    const fz = sv ? sv.freezer : makeFreezer(level().freezer);
    return '<div class="node-body">' + MENU.map((m) => (fz[m] === 0 ? '<span class="out">· ' + m + ": OUT</span>" : "· " + m + ": " + fz[m])).join("<br>") + "</div>";
  }
  if (pid === "register") {
    const orders = sv ? sv.orders : [];
    return '<div class="node-body">' + (orders.length ? orders.map((o) => "· " + o).join("<br>") : '<span style="opacity:.6">no orders yet</span>') + "</div>";
  }
  if (pid === "sams_phone") {
    const texts = sv ? sv.samTexts : [];
    return '<div class="node-body">' + (texts.length ? texts.map((t) => "“" + t + "”").join("<br>") : '<span style="opacity:.6">no texts</span>') + "</div>";
  }
  return "";
}

function edgePath(a, b) {
  const na = S.nodes[a], nb = S.nodes[b];
  if (!na || !nb) return "";
  const dx = nb.x + NW / 2 - (na.x + NW / 2);
  const dy = nb.y + nodeHeight(b) / 2 - (na.y + nodeHeight(a) / 2);
  let p1, p2;
  if (Math.abs(dx) > Math.abs(dy)) {
    const [L, R] = dx > 0 ? [a, b] : [b, a];
    p1 = portPos(L, "right"); p2 = portPos(R, "left");
    const midX = (p1.x + p2.x) / 2;
    return "M " + p1.x + " " + p1.y + " L " + midX + " " + p1.y + " L " + midX + " " + p2.y + " L " + p2.x + " " + p2.y;
  }
  const [T, B] = dy > 0 ? [a, b] : [b, a];
  p1 = T === "brain" ? portPos("brain", brainBottomPort(S.nodes[B].x + NW / 2)) : portPos(T, "bottom");
  p2 = portPos(B, "top");
  const midY = (p1.y + p2.y) / 2;
  return "M " + p1.x + " " + p1.y + " L " + p1.x + " " + midY + " L " + p2.x + " " + midY + " L " + p2.x + " " + p2.y;
}
function edgeActive(a, b) {
  if (!S.activeTool) return false;
  const pair = [a, b];
  if (pair.includes(S.activeTool) && pair.includes("brain")) return true;
  if (pair.includes(S.activeTool) && pair.some((x) => PARTS[x] && PARTS[x].kind === "data")) return true;
  return false;
}

function renderWires() {
  const svgEl = $("wire-layer");
  svgEl.setAttribute("width", CANVAS_W);
  svgEl.setAttribute("height", CANVAS_H);
  let html = "";
  S.edges.forEach(([a, b]) => {
    if (!S.nodes[a] || !S.nodes[b]) return;
    const d = edgePath(a, b);
    const active = edgeActive(a, b);
    html += '<path d="' + d + '" stroke="' + (active ? "#FFB300" : "#43302B") + '" stroke-width="' + (active ? 5 : 3) + '" fill="none" stroke-linecap="round"/>';
    html += '<path class="hitpath" data-edge="' + edgeKey(a, b) + '" d="' + d + '" stroke="transparent" stroke-width="14" fill="none"><title>Click to disconnect</title></path>';
  });
  if (pending && pending.pointer) {
    const pp = portPos(pending.part, pending.side);
    html += '<path d="M ' + pp.x + " " + pp.y + " L " + pending.pointer.x + " " + pending.pointer.y + '" stroke="#2FBE96" stroke-width="3" stroke-dasharray="6 5" fill="none" stroke-linecap="round"/>';
  }
  svgEl.innerHTML = html;
  svgEl.querySelectorAll(".hitpath").forEach((hp) => {
    hp.addEventListener("click", (e) => {
      e.stopPropagation();
      if (S.running) return;
      const key = hp.dataset.edge;
      S.edges = S.edges.filter((ed) => edgeKey(ed[0], ed[1]) !== key);
      renderCanvas(); renderTabs(); checkTutorial();
    });
  });
}

/* ----- node placement / movement ----- */
function placeNode(pid, x, y) {
  if (S.running) return;
  S.nodes[pid] = { x: Math.min(CANVAS_W - NW, Math.max(0, x)), y: Math.min(CANVAS_H - 60, Math.max(0, y)) };
  S.selectedPart = null;
  renderPalette(); renderCanvas(); checkTutorial();
}
function removeNode(pid) {
  delete S.nodes[pid];
  S.edges = S.edges.filter(([a, b]) => a !== pid && b !== pid);
  pending = null;
  renderPalette(); renderCanvas(); renderTabs(); checkTutorial();
}
function startNodeDrag(pid, e) {
  if (S.running) return;
  e.stopPropagation();
  const { x, y } = canvasCoords(e);
  dragNode = { part: pid, offX: x - S.nodes[pid].x, offY: y - S.nodes[pid].y, moved: false, downX: e.clientX, downY: e.clientY };
}

/* ----- wires ----- */
function startWire(pid, side, e) {
  e.stopPropagation();
  e.preventDefault();
  if (S.running) return;
  if (pending && pending.part !== pid) { finishWire(pid); return; }
  pending = { part: pid, side: side, downX: e.clientX, downY: e.clientY, pointer: portPos(pid, side) };
  $("wire-hint").hidden = false;
  $("canvas").classList.add("wiring");
  renderNodes(); renderWires();
}
function finishWire(target) {
  if (!pending || pending.part === target) { clearPending(); return; }
  const key = edgeKey(pending.part, target);
  if (!S.edges.some((ed) => edgeKey(ed[0], ed[1]) === key)) S.edges.push([pending.part, target]);
  clearPending();
  renderCanvas(); renderTabs(); checkTutorial();
}
function clearPending() {
  pending = null;
  $("wire-hint").hidden = true;
  $("canvas").classList.remove("wiring");
  renderNodes(); renderWires();
}
function portAt(cx, cy) {
  const R = 16;
  for (const pid in S.nodes) {
    for (const side of nodePorts(pid)) {
      const pos = portPos(pid, side);
      if ((pos.x - cx) ** 2 + (pos.y - cy) ** 2 <= R * R) return { pid, side };
    }
  }
  return null;
}

/* ----- global pointer handling ----- */
document.addEventListener("pointermove", (e) => {
  if (pending) {
    pending.pointer = canvasCoords(e);
    renderWires();
    return;
  }
  if (dragNode) {
    const dist = Math.abs(e.clientX - dragNode.downX) + Math.abs(e.clientY - dragNode.downY);
    if (dist > 4) dragNode.moved = true;
    if (!dragNode.moved) return;
    const { x, y } = canvasCoords(e);
    S.nodes[dragNode.part] = {
      x: Math.min(CANVAS_W - NW, Math.max(0, x - dragNode.offX)),
      y: Math.min(CANVAS_H - 60, Math.max(0, y - dragNode.offY)),
    };
    renderNodes(); renderWires();
  }
  if (panState) {
    const dx = e.clientX - panState.startX, dy = e.clientY - panState.startY;
    if (Math.abs(dx) + Math.abs(dy) > 4) panState.moved = true;
    const vp = $("canvas-viewport");
    vp.scrollLeft = panState.scrollLeft - dx;
    vp.scrollTop = panState.scrollTop - dy;
  }
});
document.addEventListener("pointerup", (e) => {
  if (pending) {
    const { x, y } = canvasCoords(e);
    const hit = portAt(x, y);
    const dragDist = Math.abs(e.clientX - pending.downX) + Math.abs(e.clientY - pending.downY);
    if (hit && hit.pid !== pending.part) finishWire(hit.pid);
    else if (dragDist >= 6 && !hit) clearPending();
    /* small movement: stay pending (tap-tap mode) */
  }
  if (dragNode) {
    const d = dragNode;
    dragNode = null;
    if (!d.moved && d.part === "brain") setTab("rules");
  }
  if (panState) {
    if (panState.moved) suppressClick = true;
    panState = null;
  }
});

function initCanvasEvents() {
  const c = $("canvas");
  c.addEventListener("dragover", (e) => e.preventDefault());
  c.addEventListener("drop", (e) => {
    e.preventDefault();
    const pid = e.dataTransfer.getData("text/plain");
    if (!pid || S.running || !PARTS[pid]) return;
    const { x, y } = canvasCoords(e);
    placeNode(pid, x - NW / 2, y - 24);
  });
  c.addEventListener("pointerdown", (e) => {
    if (pending || S.running || dragNode) return;
    if (e.button !== 0) return;
    const vp = $("canvas-viewport");
    panState = { startX: e.clientX, startY: e.clientY, scrollLeft: vp.scrollLeft, scrollTop: vp.scrollTop, moved: false };
  });
  c.addEventListener("click", (e) => {
    if (suppressClick) { suppressClick = false; return; }
    if (S.running) return;
    if (pending) { clearPending(); return; }
    if (!S.selectedPart) return;
    const { x, y } = canvasCoords(e);
    placeNode(S.selectedPart, x - NW / 2, y - 24);
  });
  $("zoom-in").onclick = () => { S.zoom = Math.min(1.6, Math.round((S.zoom + 0.1) * 10) / 10); renderCanvas(); };
  $("zoom-out").onclick = () => { S.zoom = Math.max(0.5, Math.round((S.zoom - 0.1) * 10) / 10); renderCanvas(); };
  $("zoom-fit").onclick = () => { S.zoom = 0.8; renderCanvas(); };
}

/* ============================================================
   RULES PANE
   ============================================================ */
function renderRules() {
  const pane = $("rules-pane");
  pane.innerHTML = "";
  pane.appendChild(el("div", "section-label", "Rule blocks — tap to add"));
  const shelf = el("div", "block-shelf");
  level().blocks.forEach((bid) => {
    const def = BLOCK_DEFS[bid];
    const preview = def.custom ? "＋ Write your own rule" : def.multi ? "＋ " + def.label + " [pick things to remember]" : "＋ " + def.parts.map((p) => (p.t !== undefined ? p.t : "[" + p.dd[0] + "]")).join("");
    const b = el("button", "block-add", preview);
    b.onclick = () => {
      S.workspace.push({ uid: Date.now() + Math.random(), blockId: bid, choices: {}, customText: "", multi: [] });
      renderRules(); renderTabs(); renderNodes(); checkTutorial();
    };
    shelf.appendChild(b);
  });
  pane.appendChild(shelf);
  pane.appendChild(el("div", "section-label", "The Brain's rules (" + S.workspace.length + ")"));
  if (S.workspace.length === 0) pane.appendChild(el("div", "palette-empty", "No rules yet — the Brain is running on its overconfident default!"));
  S.workspace.forEach((item, idx) => pane.appendChild(ruleRow(item, idx)));
}

function ruleRow(item, idx) {
  const def = BLOCK_DEFS[item.blockId];
  const row = el("div", "rule-row");
  const icon = el("span", null, def.custom ? ICONS.pencil : def.multi ? ICONS.memory : ICONS.clipboard);
  row.appendChild(icon);

  if (def.multi) {
    const wrap = el("span", null);
    wrap.style.cssText = "display:flex;align-items:center;gap:6px;flex-wrap:wrap;flex:1;";
    wrap.appendChild(el("b", null, def.label));
    (item.multi || []).forEach((opt) => {
      const chip = el("span", "mem-chip", opt + " ");
      const x = el("button", null, "×");
      x.setAttribute("aria-label", "Remove " + opt);
      x.onclick = () => { item.multi = item.multi.filter((o) => o !== opt); renderRules(); renderTabs(); renderNodes(); };
      chip.appendChild(x);
      wrap.appendChild(chip);
    });
    const remaining = def.options.filter((o) => !(item.multi || []).includes(o));
    if (remaining.length) {
      const sel = el("select", "mem-add");
      sel.setAttribute("aria-label", "Add something to remember");
      sel.innerHTML = '<option value="">＋ add</option>' + remaining.map((o) => "<option>" + o + "</option>").join("");
      sel.onchange = () => { if (sel.value) { item.multi.push(sel.value); renderRules(); renderTabs(); renderNodes(); } };
      wrap.appendChild(sel);
    }
    if ((item.multi || []).length === 0) wrap.appendChild(el("span", "mem-note", "(pick at least one or this rule does nothing!)"));
    else wrap.appendChild(el("span", null, def.suffix));
    row.appendChild(wrap);
  } else if (def.custom) {
    const input = el("input");
    input.type = "text";
    input.placeholder = "Write your own rule for the Brain...";
    input.value = item.customText || "";
    input.setAttribute("aria-label", "Custom rule");
    input.oninput = () => { item.customText = input.value; renderTabs(); renderNodes(); };
    row.appendChild(input);
  } else {
    let ddIdx = 0;
    def.parts.forEach((p) => {
      if (p.t !== undefined) row.appendChild(el("span", null, p.t));
      else {
        const myIdx = ddIdx++;
        const sel = el("select");
        sel.setAttribute("aria-label", "Rule choice");
        sel.innerHTML = p.dd.map((o, i) => '<option value="' + i + '"' + ((item.choices[myIdx] || 0) === i ? " selected" : "") + ">" + o + "</option>").join("");
        sel.onchange = () => { item.choices[myIdx] = +sel.value; renderTabs(); renderNodes(); };
        row.appendChild(sel);
      }
    });
  }

  const actions = el("div", "rule-actions");
  const up = el("button", "mini-btn", "↑");
  up.disabled = idx === 0;
  up.setAttribute("aria-label", "Move rule up");
  up.onclick = () => { const w = S.workspace; [w[idx - 1], w[idx]] = [w[idx], w[idx - 1]]; renderRules(); };
  const down = el("button", "mini-btn", "↓");
  down.disabled = idx === S.workspace.length - 1;
  down.setAttribute("aria-label", "Move rule down");
  down.onclick = () => { const w = S.workspace; [w[idx + 1], w[idx]] = [w[idx], w[idx + 1]]; renderRules(); };
  const del = el("button", "mini-btn del", ICONS.x);
  del.setAttribute("aria-label", "Delete rule");
  del.onclick = () => { S.workspace.splice(idx, 1); renderRules(); renderTabs(); renderNodes(); checkTutorial(); };
  actions.appendChild(up); actions.appendChild(down); actions.appendChild(del);
  row.appendChild(actions);
  return row;
}

/* ============================================================
   BRAIN PANE
   ============================================================ */
function renderBrain() {
  const pane = $("brain-pane");
  const W = wiring();
  const rules = compiledRules();
  const hasMem = levelHasMem(level());
  let code = '<span class="dim">You are the AI agent at The Scoop ice cream shop.</span>\n';
  code += '<span class="dim">Tools: ' + (W.connectedTools.length ? W.connectedTools.map((t) => PARTS[t].label).join(", ") : "none connected") + (hasMem ? " · Memory: " + (W.memoryWired ? "ON" : "OFF") : "") + "</span>\n\n";
  code += '<span class="' + (rules.length ? "dim" : "rules-head") + '">DEFAULT: answer instantly from memory — no tools, no doubts' + (rules.length ? " (unless a rule says otherwise)" : "!") + "</span>\n";
  if (rules.length) {
    code += '\n<span class="rules-head">YOUR RULES (override the default where they apply):</span>\n';
    code += rules.map((r) => '<span class="rule">- ' + r.replace(/</g, "&lt;") + "</span>").join("\n");
  }
  pane.innerHTML = '<div class="brain-panel"><h3>' + ICONS.brain + " Inside the Brain</h3><div class=\"brain-label\">THE FULL INSTRUCTIONS YOUR AGENT IS GIVEN</div><div class=\"brain-code\">" + code + "</div></div>";
}

/* ============================================================
   FEED
   ============================================================ */
function renderFeedEmpty() {
  $("feed").innerHTML = '<div class="feed-empty">The window is closed.<br>Build your agent, then press ▶ !</div>';
}
let lastThinkEl = null;
function appendStep(step) {
  const feed = $("feed");
  if (step.type === "customer") {
    const b = el("div", "bubble customer");
    b.innerHTML = '<span role="img" aria-label="customer">' + step.customer.emoji + "</span> <b>" + step.customer.name + ':</b> "' + step.line + '"';
    feed.appendChild(b);
    settleThink();
  } else if (step.type === "think") {
    settleThink();
    const row = el("div", "think-row");
    row.innerHTML = '<span class="pulse-icon">' + ICONS.sparkles + "</span>";
    const t = el("span", "think-text fresh", step.text);
    row.appendChild(t);
    feed.appendChild(row);
    lastThinkEl = t;
  } else if (step.type === "tool") {
    const row = el("div", "chip-row");
    const chip = el("button", "tool-chip" + (S.activeTool === step.name ? " active-node" : ""));
    const inputStr = step.input && Object.keys(step.input).length ? " " + Object.values(step.input).join(", ") : "";
    chip.innerHTML = (ICONS[STEP_TOOL_ICON[step.name]] || "") + "<span>" + (PARTS[step.name] ? PARTS[step.name].label : step.name) + inputStr + '</span><span class="caret">▸</span>';
    chip.dataset.tool = step.name;
    row.appendChild(chip);
    feed.appendChild(row);
    step._chipEl = chip;
    step._rowEl = row;
  } else if (step.type === "result") {
    /* attach to the last tool chip */
    const rows = $("feed").querySelectorAll(".chip-row");
    const row = rows[rows.length - 1];
    if (row) {
      const chip = row.querySelector(".tool-chip");
      if (step.text.indexOf("ERROR") === 0) chip.classList.add("err");
      const detail = el("div", "tool-result", step.text);
      detail.hidden = true;
      row.appendChild(detail);
      chip.onclick = () => {
        detail.hidden = !detail.hidden;
        chip.querySelector(".caret").textContent = detail.hidden ? "▸" : "▾";
        checkTutorialChipOpened();
      };
    }
    settleThink();
  } else if (step.type === "memory") {
    const row = el("div", "chip-row");
    row.innerHTML = '<span class="mem-write">' + ICONS.memory + " Saved to Memory: " + step.text + "</span>";
    feed.appendChild(row);
  } else if (step.type === "say") {
    settleThink();
    const b = el("div", "bubble say" + (step.broken ? " broken" : ""));
    b.innerHTML = ICONS.chat_output + " " + step.text;
    b.title = "Tap to hear";
    b.onclick = () => speak(step.text, "agent");
    feed.appendChild(b);
  } else if (step.type === "grading") {
    feed.appendChild(el("div", "grading-row", "— Sam is checking how it went... —"));
  } else if (step.type === "divider") {
    feed.appendChild(el("div", "grading-row", "· · ·"));
  }
  feed.scrollTo({ top: feed.scrollHeight, behavior: "smooth" });
}
function settleThink() {
  if (lastThinkEl) { lastThinkEl.classList.remove("fresh"); lastThinkEl = null; }
}
let chipOpened = false;
function checkTutorialChipOpened() { chipOpened = true; checkTutorial(); }

/* ============================================================
   RUN
   ============================================================ */
async function emitStep(step) {
  if (S.abort) throw new Error("aborted");
  if (step.type === "shop") { S.shopView = step.shop; renderNodes(); renderWires(); return; }
  S.feed.push(step);
  if (step.type === "tool") { S.activeTool = step.name; renderNodes(); renderWires(); }
  if (step.type === "memory") { S.activeTool = "memory"; renderNodes(); renderWires(); }
  if (step.type === "say" || step.type === "customer") { S.activeTool = null; renderNodes(); renderWires(); }
  if (S.soundOn) {
    if (step.type === "customer") speak(step.customer.name + " says: " + step.line, "customer");
    if (step.type === "say") speak(step.text, "agent");
  }
  appendStep(step);
  const factor = 2.4 - (S.speed / 100) * 2.0;
  await sleep((STEP_DELAY[step.type] || 400) * factor);
}

async function runLevel() {
  if (S.running) return;
  const W = wiring();
  const lv = level();

  S.feed = [];
  chipOpened = false;
  $("feed").innerHTML = "";
  $("verdict-bar").hidden = true;
  S.shopView = null;
  S.ranOnce = true;
  S.abort = false;
  setTab("build");
  S.running = true;
  S.phase = "running";
  updateRunButtons();
  renderNodes();
  checkTutorial();

  /* core gate */
  const placed = new Set(Object.keys(S.nodes));
  const coreProblem = !placed.has("chat_input")
    ? { text: "...nothing hears the customer. There's no Chat Input on the canvas!", hint: "The customer's words need a way IN. Find the part that listens." }
    : !placed.has("brain")
    ? { text: "...the message arrives, but nobody's home. There's no Brain!", hint: "Something has to THINK. Find the part that decides." }
    : !placed.has("chat_output")
    ? { text: "...the Brain has a reply — but no way to say it!", hint: "The reply needs a way OUT. Find the part that speaks." }
    : !W.inputWired
    ? { text: "...the Chat Input hears the customer, but it isn't wired to anything!", hint: "Pull a wire from the Chat Input to the Brain." }
    : !W.outputWired
    ? { text: "...the Brain decided what to say, but the reply can't reach the window!", hint: "Pull a wire from the Brain to the Chat Output." }
    : null;

  try {
    if (coreProblem) {
      const c = lv.customers[0];
      await emitStep({ type: "customer", customer: c, line: c.lines[0] });
      await emitStep({ type: "say", text: coreProblem.text, broken: true });
      S.failSeen = true;
      showVerdict({ pass: false, feedback: coreProblem.hint });
      return;
    }

    const shop = { freezer: makeFreezer(lv.freezer), orders: [], samTexts: [] };
    S.shopView = snapshotShop(shop);
    renderNodes();
    const toolsUsed = new Set();
    const trackEmit = async (step) => {
      if (step.type === "tool") toolsUsed.add(step.name);
      await emitStep(step);
    };

    let mode = S.aiMode;
    const F = ruleFlags(S.workspace, W);
    /* The bare-agent run (zero rules) MUST fail predictably — it's the core
       teaching moment. The live model sometimes chooses honesty over its
       yes-man default, so rule-less runs always use the deterministic sim. */
    const noRules = compiledRules().length === 0;
    const useLive = (mode === "live" || mode === "auto") && !noRules;

    if (useLive) {
      try {
        const hasMemLayout = levelHasMem(lv);
        const showMemory = hasMemLayout && W.memoryWired;
        const systemPrompt = buildSystemPrompt(S.workspace, W.connectedTools, showMemory);
        const history = [];
        for (const customer of lv.customers) {
          await runCustomerLive(lv, customer, systemPrompt, history, shop, W, W.connectedTools, trackEmit);
          await emitStep({ type: "divider" });
        }
        S.aiMode = "live";
        renderTopbar();
        await emitStep({ type: "grading" });
        const transcript = S.feed.map(stepToText).filter(Boolean).join("\n");
        const v = await judgeLive(lv, transcript, toolsUsed);
        if (!v.pass) S.failSeen = true;
        S.activeTool = null; renderNodes(); renderWires();
        showVerdict(v);
        return;
      } catch (err) {
        if (String(err.message) === "aborted") throw err;
        if (mode === "live") { showVerdict({ pass: false, feedback: "The AI connection hiccuped — try again!" }); return; }
        /* auto mode: fall back to simulation with a CLEAN slate */
        S.aiMode = "sim";
        renderTopbar();
        S.feed = [];
        $("feed").innerHTML = "";
        shop.freezer = makeFreezer(lv.freezer);
        shop.orders = [];
        shop.samTexts = [];
        S.shopView = snapshotShop(shop);
        toolsUsed.clear();
        renderNodes();
      }
    }

    /* --- simulated run --- */
    for (let ci = 0; ci < lv.customers.length; ci++) {
      await runCustomerSim(lv, ci, lv.customers[ci], F, shop, W, trackEmit);
      await emitStep({ type: "divider" });
    }
    await emitStep({ type: "grading" });
    await sleep(600);
    const v = judgeSim(lv, F, toolsUsed);
    if (!v.pass) S.failSeen = true;
    S.activeTool = null; renderNodes(); renderWires();
    showVerdict(v);
  } catch (err) {
    if (String(err.message) !== "aborted") console.error(err);
    S.activeTool = null;
    renderNodes(); renderWires();
  } finally {
    S.running = false;
    S.phase = "done";
    updateRunButtons();
    renderNodes();
    checkTutorial();
  }
}

function stepToText(s) {
  if (s.type === "customer") return "CUSTOMER " + s.customer.name + ': "' + s.line + '"';
  if (s.type === "think") return "AGENT (thinking): " + s.text;
  if (s.type === "memory") return "AGENT saved to memory: " + s.text;
  if (s.type === "tool") return "AGENT used tool: " + s.name + " " + JSON.stringify(s.input || {});
  if (s.type === "result") return "TOOL RESULT: " + s.text;
  if (s.type === "say") return "AGENT replied: " + s.text;
  return "";
}

function stopRun() { S.abort = true; }

function updateRunButtons() {
  $("run-btn").disabled = S.running;
  $("stop-btn").disabled = !S.running;
}

/* ---------- VERDICT ---------- */
function showVerdict(v) {
  S.verdict = v;
  const bar = $("verdict-bar");
  bar.hidden = false;
  bar.className = "verdict-bar " + (v.pass ? "pass" : "fail");
  bar.textContent = v.pass ? "⭐ Sam approved this run! Tap to see." : "Sam has feedback — tap to see.";
  bar.onclick = openVerdictModal;
  openVerdictModal();
  checkTutorial();
}
function openVerdictModal() {
  const v = S.verdict;
  if (!v) return;
  const modal = $("verdict-modal");
  modal.hidden = false;
  modal.querySelector(".modal").classList.toggle("fail", !v.pass);
  $("verdict-avatar").textContent = v.pass ? "🌟" : "🧑🏽‍🍳";
  $("verdict-title").textContent = v.pass ? "LEVEL CLEAR!" : "Not yet...";
  $("verdict-text").textContent = v.feedback;
  const next = $("verdict-next");
  const hasNext = S.levelIdx < LEVELS.length - 1;
  next.hidden = !(v.pass && hasNext);
  if (v.pass) S.maxUnlocked = Math.max(S.maxUnlocked, Math.min(S.levelIdx + 1, LEVELS.length - 1));
  renderTopbar();
}
$("verdict-close") && null; /* wired in init */

/* ---------- LEVELS ---------- */
function gotoLevel(i) {
  if (i > S.maxUnlocked) return;
  S.levelIdx = i;
  S.feed = [];
  S.verdict = null;
  S.shopView = null;
  S.phase = "build";
  S.tab = "build";
  S.selectedPart = null;
  /* prune parts/blocks not in this level (keep placements across levels otherwise) */
  for (const pid in S.nodes) if (!level().parts.includes(pid)) removeNodeSilent(pid);
  S.workspace = S.workspace.filter((w) => level().blocks.includes(w.blockId));
  if (level().tutorial) { S.tutStep = 0; S.brainTabSeen = false; S.ranOnce = false; S.failSeen = false; chipOpened = false; }
  renderAll();
  renderFeedEmpty();
  $("verdict-bar").hidden = true;
}
function removeNodeSilent(pid) {
  delete S.nodes[pid];
  S.edges = S.edges.filter(([a, b]) => a !== pid && b !== pid);
}

/* ============================================================
   TUTORIAL (Level 1)
   ============================================================ */
function TUT() {
  const W = wiring();
  const placed = new Set(Object.keys(S.nodes));
  return [
    { text: "Welcome to The Scoop! On the far left are part CATEGORIES. Drag the Chat Input onto the canvas.", done: () => placed.has("chat_input"), target: "chip-chat_input" },
    { text: "Now drag out The Brain — the part that thinks and decides.", done: () => placed.has("brain"), target: "chip-brain" },
    { text: "And the Chat Output, so replies can reach the window.", done: () => placed.has("chat_output"), target: "chip-chat_output" },
    { text: "See the little circles on each part? PRESS one on the Chat Input and DRAG a wire to a circle on the Brain.", done: () => W.inputWired, target: "ports" },
    { text: "Wire the Brain to the Chat Output the same way.", done: () => W.outputWired, target: "ports" },
    { text: "Ears, brain, mouth — that's a whole agent! Press the green ▶ and meet your first customers. (The 🐢→🐰 slider controls speed.)", done: () => S.ranOnce, target: "run" },
    { text: "...wait for it...", done: () => S.failSeen, quiet: true },
    { text: "IT SOLD PIZZA?! Its factory setting says 'make customers happy' — and it has NO WAY to check the facts. Click the blue Tools dot and drag out Check Menu.", done: () => placed.has("check_menu"), target: "chip-check_menu" },
    { text: "Tools need data! Grab the Menu from the orange Data category.", done: () => placed.has("menu_table"), target: "chip-menu_table" },
    { text: "Wire the Brain to Check Menu, and Check Menu to the Menu table.", done: () => W.connectedTools.includes("check_menu") && W.dataUnder["check_menu"] === "menu_table", target: "ports" },
    { text: "One more thing — a tool it's never told to USE is just decoration. Tap the Brain and add the 'Always use your Check Menu tool' rule.", done: () => compiledRules().length > 0, target: "brainNode" },
    { text: "Peek at the Brain tab up top — that's EVERYTHING your agent is told. See how your rule overrides its default?", done: () => S.brainTabSeen, target: "tab-brain" },
    { text: "Now press ▶ again!", done: () => S.ranOnce && S.verdict && S.verdict.pass, target: "run" },
    { text: "THAT'S training an agent: build it, watch it fail, give it tools and rules. Tap any gray chip in the chat to peek at what a tool found. Level 2 is unlocked!", done: () => false, final: true, target: "chips", skippable: true },
  ];
}
function checkTutorial() {
  if (!level().tutorial) { $("coach").hidden = true; applyTutHighlights(); return; }
  const steps = TUT();
  let idx = S.tutStep;
  while (idx < steps.length - 1 && steps[idx].done()) idx++;
  S.tutStep = idx;
  const st = steps[idx];
  $("coach").hidden = false;
  $("coach-step").textContent = st.final || st.quiet ? "Sam: " : "Step " + (idx + 1) + ": ";
  $("coach-body").textContent = st.text;
  $("coach-skip").hidden = !st.skippable;
  applyTutHighlights();
}
function applyTutHighlights() {
  document.querySelectorAll(".tut-blink, .tut-blink-sm").forEach((n) => n.classList.remove("tut-blink", "tut-blink-sm"));
  if (!level().tutorial) return;
  const steps = TUT();
  const st = steps[S.tutStep];
  if (!st || !st.target) return;
  const t = st.target;
  if (t.startsWith("chip-")) {
    const pid = t.slice(5);
    const chip = document.querySelector('.part-chip[data-part="' + pid + '"]');
    if (chip) chip.classList.add("tut-blink-sm");
    else {
      /* wrong category open — blink that category's rail dot */
      const cat = PARTS[pid] && PARTS[pid].kind;
      const rb = document.querySelector('.rail-btn[data-cat="' + cat + '"]');
      if (rb && S.category !== cat) rb.classList.add("tut-blink-sm");
    }
  }
  if (t === "ports") document.querySelectorAll(".port").forEach((p) => p.classList.add("tut-blink-sm"));
  if (t === "run" && !S.running) $("run-btn").classList.add("tut-blink");
  if (t === "brainNode") { const n = document.querySelector('.node[data-part="brain"]'); if (n) n.classList.add("tut-blink"); }
  if (t.startsWith("tab-")) { const b = document.querySelector('.tab-btn[data-tab="' + t.slice(4) + '"]'); if (b) b.classList.add("tut-blink-sm"); }
  if (t === "chips") document.querySelectorAll(".tool-chip").forEach((c) => c.classList.add("tut-blink-sm"));
}

/* ============================================================
   PANEL RESIZE
   ============================================================ */
function initResizers() {
  let resize = null;
  function startResize(which, e) {
    const grid = $("main-grid");
    const cur = which === "palette"
      ? parseInt(getComputedStyle(grid).getPropertyValue("--palette-w")) || 172
      : parseInt(getComputedStyle(grid).getPropertyValue("--stage-w")) || 430;
    resize = { which, startX: e.clientX, startW: cur };
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
  }
  $("divider-palette").addEventListener("pointerdown", (e) => startResize("palette", e));
  $("divider-stage").addEventListener("pointerdown", (e) => startResize("stage", e));
  document.addEventListener("pointermove", (e) => {
    if (!resize) return;
    const dx = e.clientX - resize.startX;
    const grid = $("main-grid");
    if (resize.which === "palette") grid.style.setProperty("--palette-w", Math.min(300, Math.max(120, resize.startW + dx)) + "px");
    else grid.style.setProperty("--stage-w", Math.min(680, Math.max(300, resize.startW - dx)) + "px");
  });
  document.addEventListener("pointerup", () => {
    if (resize) { resize = null; document.body.style.cursor = ""; document.body.style.userSelect = ""; }
  });
}

/* ============================================================
   INIT
   ============================================================ */
function renderAll() {
  renderTopbar();
  renderRail();
  renderPalette();
  renderTabs();
  renderCanvas();
  renderRules();
  renderBrain();
  checkTutorial();
}

function init() {
  $("run-btn").innerHTML = ICONS.play;
  $("stop-btn").innerHTML = ICONS.stop;
  $("run-btn").onclick = runLevel;
  $("stop-btn").onclick = stopRun;
  $("speed").oninput = (e) => { S.speed = +e.target.value; };
  $("sound-btn").onclick = () => { S.soundOn = !S.soundOn; if (!S.soundOn && window.speechSynthesis) speechSynthesis.cancel(); renderTopbar(); };
  $("verdict-close").onclick = () => { $("verdict-modal").hidden = true; };
  $("verdict-next").onclick = () => { $("verdict-modal").hidden = true; gotoLevel(S.levelIdx + 1); };
  $("verdict-modal").addEventListener("click", (e) => { if (e.target === $("verdict-modal")) $("verdict-modal").hidden = true; });
  $("coach-skip").onclick = () => { S.tutStep = Math.min(S.tutStep + 1, TUT().length - 1); checkTutorial(); };
  initCanvasEvents();
  initResizers();
  renderAll();
  renderFeedEmpty();
}
document.addEventListener("DOMContentLoaded", init);
