import {
  STUDIO_STATE_LABELS,
  VIDEO_OPTIONS,
  PythonLabStudioStateData,
  PythonLabEvalEntry,
  PythonLabLevelEntry,
  StudioStateEnum,
} from './aiTutorTestTypes';
import {
  renderTemplate,
  assemblePrompt,
  Templates,
  VideoFileEntry,
  LevelEntry,
  TemplateVars,
} from './promptAssembler';

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

type LevelData = Record<string, LevelEntry>;

// ─────────────────────────────────────────────────────────────────────────────
// STATE DATA
// ─────────────────────────────────────────────────────────────────────────────

const STATES: Array<{key: StudioStateEnum; label: string}> = (
  Object.keys(STUDIO_STATE_LABELS) as StudioStateEnum[]
).map(key => ({key, label: `${key} — ${STUDIO_STATE_LABELS[key]}`}));

const STATE_DESCRIPTIONS: Record<StudioStateEnum, string> = {
  START: 'The student has just opened the level and has not made any changes yet.',
  STRUGGLING:
    'The student is completely lost and attempting random things with no clear strategy.',
  SYNTAX_ERRORS: 'The student has written code that cannot run due to syntax errors.',
  RUNTIME_ERRORS: "The student's code runs but crashes with a runtime error.",
  GOOD_PROGRESS:
    'The student is making solid progress but the solution is not yet complete.',
  ALMOST_THERE:
    'The student is very close to the correct answer with only a minor issue remaining.',
};

const TEMPLATE_HINTS: Record<string, string> = {
  system: 'Variables: <code>{{persona}}</code> <code>{{videoPrompt}}</code> <code>{{editorContext}}</code>',
  persona: 'No variables — edit the tutor persona and behavior.',
  videoPrompt: 'Auto-injected: <code>{{#videoFiles}}{{url}}::{{description}}{{/videoFiles}}</code>',
  editorContext:
    'Variables: <code>{{levelInstructions}}</code> <code>{{studentCode}}</code> <code>{{consoleSection}}</code> <code>{{hasRunStatement}}</code> <code>{{hasEditedStatement}}</code> <code>{{validationSection}}</code> <code>{{stateLabel}}</code> <code>{{stateDescription}}</code>',
};

// ─────────────────────────────────────────────────────────────────────────────
// APP DATA — populated on init via fetch
// ─────────────────────────────────────────────────────────────────────────────

let LEVEL_DATA: LevelData = {};
let studioData: Record<string, PythonLabStudioStateData> = {};
let evalData: Record<string, PythonLabEvalEntry> = {};
let templates: Templates = {system: '', persona: '', videoPrompt: '', editorContext: ''};
let defaultTemplates: Templates = {system: '', persona: '', videoPrompt: '', editorContext: ''};
let videoFileData: VideoFileEntry[] = [];

// ─────────────────────────────────────────────────────────────────────────────
// LEVEL DEDUP
// Deduplicate to one entry per canonical level stem (strip version suffix).
// ─────────────────────────────────────────────────────────────────────────────

function levelStem(id: string): string {
  return id
    .replace(/_pilot-\d{4}$/, '')
    .replace(/_v2-\d{4}$/, '')
    .replace(/_\d{4}.*$/, '');
}

function levelLabel(id: string): string {
  return levelStem(id).replace('programming-fundamentals-', '');
}

function buildLevelData(raw: Record<string, PythonLabLevelEntry>): LevelData {
  const seen = new Set<string>();
  const out: LevelData = {};
  for (const [id, entry] of Object.entries(raw)) {
    const stem = levelStem(id);
    if (!seen.has(stem)) {
      seen.add(stem);
      out[id] = {...entry, label: levelLabel(id)};
    }
  }
  return out;
}

// ─────────────────────────────────────────────────────────────────────────────
// STUDIO DATA HELPERS
// ─────────────────────────────────────────────────────────────────────────────

function getOrInitStudioEntry(levelId: string, stateKey: string): PythonLabStudioStateData {
  const dataKey = `${levelId}_${stateKey}`;
  if (!studioData[dataKey]) {
    studioData[dataKey] = {
      studentCode: LEVEL_DATA[levelId]?.startingCode ?? '',
      hasRun: false,
      hasEdited: false,
    };
  }
  return studioData[dataKey];
}

function isPreAuthored(levelId: string, stateKey: string): boolean {
  return `${levelId}_${stateKey}` in studioData;
}

// ─────────────────────────────────────────────────────────────────────────────
// TEMPLATE RENDERING / PROMPT ASSEMBLY (delegates to promptAssembler.ts)
// ─────────────────────────────────────────────────────────────────────────────

function buildVars(levelId: string, stateKey: string): TemplateVars | null {
  // Build vars for the template editor preview (exposes sub-template vars for each tab)
  const level = LEVEL_DATA[levelId];
  if (!level) return null;

  const data = getOrInitStudioEntry(levelId, stateKey);
  const videoFiles = videoFileData.map(v => ({
    url: `/assets/js/json/${v.filename.replace('.json', '')}${v.hash}.json`,
    description: v.description,
  }));
  const editorVars: TemplateVars = {
    levelInstructions: level.longInstructions ?? '',
    studentCode: data.studentCode ?? '',
    hasRunStatement: data.hasRun ? '' : 'The student has not run the code yet.',
    hasEditedStatement: data.hasEdited ? '' : 'The student has not edited the code yet.',
    consoleSection: data.consoleOutput
      ? `Here is the output from the student's debug console:\n\`\`\`\n${data.consoleOutput}\n\`\`\``
      : '',
    validationSection: data.validationResults
      ? `Here are the validation test results (JSON):\n${data.validationResults}`
      : '',
    stateLabel: stateKey,
    stateDescription: STATE_DESCRIPTIONS[stateKey as StudioStateEnum] ?? '',
  };
  const persona = templates.persona;
  const videoPrompt = renderTemplate(templates.videoPrompt, {videoFiles});
  const editorContext = renderTemplate(templates.editorContext, editorVars);
  const studentMessage = currentVideoRequested
    ? (data.studentMessageVideoRequested ?? '')
    : (data.studentMessage ?? '');
  return {persona, videoPrompt, editorContext, studentMessage, ...editorVars, videoFiles};
}

function assembleOutput(
  levelId: string,
  stateKey: string
): Array<{label: string; text: string}> | null {
  const assembled = assemblePrompt({
    levelId,
    stateKey,
    videoRequested: currentVideoRequested,
    levels: LEVEL_DATA,
    studioData,
    templates,
    videoFileData,
  });
  if (!assembled) return null;

  const sections: Array<{label: string; text: string}> = [
    {label: 'System Prompt', text: assembled.systemPrompt},
  ];
  if (assembled.studentMessage) {
    sections.push({label: 'Student Message', text: assembled.studentMessage});
  }
  return sections;
}

// ─────────────────────────────────────────────────────────────────────────────
// DOM STATE
// ─────────────────────────────────────────────────────────────────────────────

let currentTab = 'system';
let currentLevel = '';
let currentState = STATES[0].key;
let currentVideoRequested = false;

// ─────────────────────────────────────────────────────────────────────────────
// DOM RENDERING
// ─────────────────────────────────────────────────────────────────────────────

function renderOutput(): void {
  const sections = assembleOutput(currentLevel, currentState);
  const container = document.getElementById('output-content')!;
  const charCountEl = document.getElementById('charCount')!;

  if (!sections) {
    container.innerHTML =
      '<span style="color:#475569;font-size:12px;">No level data found.</span>';
    charCountEl.textContent = '';
    return;
  }

  let totalChars = 0;
  container.innerHTML = sections
    .map(({label, text}) => {
      const trimmed = text.replace(/\n(\s*\n){2,}/g, '\n\n').trim();
      totalChars += trimmed.length;
      return `<div class="output-section">
      <div class="output-section-label">${label}</div>
      <div class="output-section-text">${escHtml(trimmed)}</div>
    </div>`;
    })
    .join('<hr class="separator">');

  charCountEl.textContent = `${totalChars.toLocaleString()} chars`;
}

function renderStudioEditor(): void {
  const dataKey = `${currentLevel}_${currentState}`;
  const data = getOrInitStudioEntry(currentLevel, currentState);
  const badge = document.getElementById('studioKeyBadge')!;
  const draftBadge = document.getElementById('studioDraftBadge')!;
  const area = document.getElementById('studioEditorArea')!;

  badge.textContent = dataKey;
  draftBadge.innerHTML = isPreAuthored(currentLevel, currentState)
    ? ''
    : '<span class="studio-draft-badge">draft</span>';

  const msgField = currentVideoRequested ? 'studentMessageVideoRequested' : 'studentMessage';
  const msgLabel = currentVideoRequested ? 'Student Message (video requested)' : 'Student Message';
  const msgValue = (data[msgField] as string | undefined) ?? '';

  area.innerHTML = `
    <div class="studio-fields">
      <label class="field-label">
        Student Code
        <textarea id="f-studentCode" class="code-area" spellcheck="false">${escHtml(data.studentCode ?? '')}</textarea>
      </label>
      <label class="field-label">
        Console Output
        <textarea id="f-consoleOutput" spellcheck="false">${escHtml(data.consoleOutput ?? '')}</textarea>
      </label>
      <div class="checkboxes">
        <label class="checkbox-label">
          <input type="checkbox" id="f-hasRun" ${data.hasRun ? 'checked' : ''}> Has Run
        </label>
        <label class="checkbox-label">
          <input type="checkbox" id="f-hasEdited" ${data.hasEdited ? 'checked' : ''}> Has Edited
        </label>
      </div>
      <label class="field-label">
        Validation Results (JSON)
        <textarea id="f-validationResults" spellcheck="false">${escHtml(data.validationResults ?? '')}</textarea>
      </label>
      <label class="field-label">
        ${escHtml(msgLabel)}
        <textarea id="f-studentMessage" spellcheck="false">${escHtml(msgValue)}</textarea>
      </label>
    </div>`;

  (['studentCode', 'consoleOutput', 'validationResults'] as const).forEach(field => {
    document.getElementById(`f-${field}`)!.addEventListener('input', e => {
      studioData[dataKey][field] = (e.target as HTMLTextAreaElement).value;
      renderOutput();
    });
  });
  (['hasRun', 'hasEdited'] as const).forEach(field => {
    document.getElementById(`f-${field}`)!.addEventListener('change', e => {
      studioData[dataKey][field] = (e.target as HTMLInputElement).checked;
      renderOutput();
    });
  });
  document.getElementById('f-studentMessage')!.addEventListener('input', e => {
    studioData[dataKey][msgField] = (e.target as HTMLTextAreaElement).value;
    renderOutput();
  });
}

function renderEvalEditor(): void {
  const evalKey = `${currentLevel}_${currentState}_${currentVideoRequested ? 'VIDEO' : 'NOVIDEO'}`;
  const entry: PythonLabEvalEntry = evalData[evalKey] ?? {expectedVideos: []};
  const area = document.getElementById('evalEditorArea')!;

  area.innerHTML = `<div class="video-checkboxes">${VIDEO_OPTIONS.map(
    v => `
      <label class="video-checkbox-label">
        <input type="checkbox" data-video="${escHtml(v)}"
          ${entry.expectedVideos.includes(v) ? 'checked' : ''}>
        ${escHtml(v)}
      </label>`
  ).join('')}</div>`;

  area.querySelectorAll<HTMLInputElement>('input[data-video]').forEach(cb => {
    cb.addEventListener('change', () => {
      const checked = Array.from(
        area.querySelectorAll<HTMLInputElement>('input[data-video]:checked')
      ).map(el => el.dataset.video as (typeof VIDEO_OPTIONS)[number]);
      evalData[evalKey] = {expectedVideos: checked};
    });
  });
}

function renderTemplateEditor(): void {
  const textarea = document.getElementById('tpl-textarea') as HTMLTextAreaElement;
  const hint = document.getElementById('tpl-hint')!;
  textarea.value = templates[currentTab as keyof Templates];
  hint.innerHTML = TEMPLATE_HINTS[currentTab];
}

function escHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ─────────────────────────────────────────────────────────────────────────────
// INIT
// ─────────────────────────────────────────────────────────────────────────────

async function loadAllData(): Promise<void> {
  const [levelsRaw, studioRaw, evalRaw, tplRaw, videosRaw] = await Promise.all([
    fetch('/api/data/levels').then(r => r.json()),
    fetch('/api/data/studioData').then(r => r.json()),
    fetch('/api/data/evalData').then(r => r.json()),
    fetch('/api/data/templates').then(r => r.json()),
    fetch('/api/data/videoFiles').then(r => r.json()),
  ]);

  LEVEL_DATA = buildLevelData(levelsRaw as Record<string, PythonLabLevelEntry>);
  studioData = studioRaw as Record<string, PythonLabStudioStateData>;
  evalData = evalRaw as Record<string, PythonLabEvalEntry>;
  templates = tplRaw as Templates;
  defaultTemplates = {...(tplRaw as Templates)};
  videoFileData = videosRaw as VideoFileEntry[];
  currentLevel = Object.keys(LEVEL_DATA)[0] ?? '';
}

function wireUI(): void {
  const levelSel = document.getElementById('levelSelect') as HTMLSelectElement;
  Object.entries(LEVEL_DATA).forEach(([id, lvl]) => {
    const opt = document.createElement('option');
    opt.value = id;
    opt.textContent = lvl.label;
    levelSel.appendChild(opt);
  });

  const stateSel = document.getElementById('stateSelect') as HTMLSelectElement;
  STATES.forEach(({key, label}) => {
    const opt = document.createElement('option');
    opt.value = key;
    opt.textContent = label;
    stateSel.appendChild(opt);
  });

  levelSel.addEventListener('change', e => {
    currentLevel = (e.target as HTMLSelectElement).value;
    renderStudioEditor();
    renderEvalEditor();
    renderOutput();
  });
  stateSel.addEventListener('change', e => {
    currentState = (e.target as HTMLSelectElement).value as StudioStateEnum;
    renderStudioEditor();
    renderEvalEditor();
    renderOutput();
  });
  document.getElementById('videoRequestedCheck')!.addEventListener('change', e => {
    currentVideoRequested = (e.target as HTMLInputElement).checked;
    renderStudioEditor();
    renderEvalEditor();
    renderOutput();
  });

  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      templates[currentTab as keyof Templates] = (
        document.getElementById('tpl-textarea') as HTMLTextAreaElement
      ).value;
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentTab = (btn as HTMLElement).dataset.tab!;
      renderTemplateEditor();
    });
  });

  document.getElementById('tpl-textarea')!.addEventListener('input', e => {
    templates[currentTab as keyof Templates] = (e.target as HTMLTextAreaElement).value;
    renderOutput();
  });

  document.getElementById('copyBtn')!.addEventListener('click', () => {
    const sections = assembleOutput(currentLevel, currentState);
    if (!sections) return;
    const full = sections
      .map(s => s.text.replace(/\n(\s*\n){2,}/g, '\n\n').trim())
      .join('\n\n---\n\n');
    navigator.clipboard.writeText(full).then(() => showToast('Copied to clipboard!'));
  });

  document.getElementById('resetTemplatesBtn')!.addEventListener('click', () => {
    if (!confirm('Reset all 4 templates to defaults?')) return;
    Object.assign(templates, defaultTemplates);
    renderTemplateEditor();
    renderOutput();
  });
}

async function init(): Promise<void> {
  try {
    await loadAllData();
  } catch (e) {
    document.body.innerHTML = `<div style="padding:2rem;color:red;">
      Failed to load data from server.<br><code>${e}</code><br><br>
      Make sure the server is running: <code>npm start</code>
    </div>`;
    return;
  }
  wireUI();
  wireExperimentUI();
  await loadRuns();
  renderTemplateEditor();
  renderStudioEditor();
  renderEvalEditor();
  renderOutput();
}

function showToast(msg: string): void {
  const t = document.getElementById('toast')!;
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2000);
}

// ─────────────────────────────────────────────────────────────────────────────
// EXPERIMENT RUNNER UI
// ─────────────────────────────────────────────────────────────────────────────

interface ItemScore {
  itemIndex: number;
  levelId: string;
  state: string;
  videoRequested: boolean;
  expectedVideos: string[];
  validVideos: string[];
  hallucinated: string[];
  possibleVideos: (string | null)[];  // parallel to hallucinated
  missingExpected: string[];
  unexpectedPresent: string[];
  pass: boolean;
  error: string | null;
}

interface EvalResult {
  runId: string;
  totalItems: number;
  passed: number;
  failedMissingVideo: number;
  failedUnexpectedVideo: number;
  failedHallucinated: number;
  items: ItemScore[];
}

function shortLevel(levelId: string): string {
  return levelId.replace('programming-fundamentals-', '').replace(/_2025.*$/, '');
}

// Returns HTML for `str` with the common prefix shared with `other` softly highlighted.
function hlCommon(str: string, other: string): string {
  let i = 0;
  while (i < str.length && i < other.length && str[i] === other[i]) i++;
  if (i === 0) return escHtml(str);
  return `<span class="url-match">${escHtml(str.slice(0, i))}</span>${escHtml(str.slice(i))}`;
}

function renderResults(result: EvalResult, runId: string): void {
  const panel = document.getElementById('resultsPanel')!;
  const pct = (n: number) => `${Math.round((n / result.totalItems) * 100)}%`;

  document.getElementById('aggregateStats')!.innerHTML = `
    <div class="stat-card"><div class="stat-label">Total</div><div class="stat-value">${result.totalItems}</div></div>
    <div class="stat-card"><div class="stat-label">Passed</div><div class="stat-value good">${result.passed} <span style="font-size:13px;font-weight:400">(${pct(result.passed)})</span></div></div>
    <div class="stat-card"><div class="stat-label">Missing video</div><div class="stat-value bad">${result.failedMissingVideo}</div></div>
    <div class="stat-card"><div class="stat-label">Unexpected video</div><div class="stat-value bad">${result.failedUnexpectedVideo}</div></div>
    <div class="stat-card"><div class="stat-label">Hallucinated</div><div class="stat-value bad">${result.failedHallucinated}</div></div>
  `;

  const tbody = document.getElementById('resultsBody')!;
  tbody.innerHTML = result.items.map(s => `
    <tr>
      <td>${s.itemIndex}</td>
      <td style="max-width:180px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap" title="${escHtml(s.levelId)}">${escHtml(shortLevel(s.levelId))}</td>
      <td>${escHtml(s.state)}</td>
      <td>${s.videoRequested ? '✓' : ''}</td>
      <td class="${s.pass ? 'pass-yes' : 'pass-no'}">${s.pass ? '✓' : '✗'}</td>
      <td>${s.expectedVideos.map(v => v.replace('_V1.json', '')).join(', ') || '—'}</td>
      <td>${s.validVideos.map(v => v.replace('_V1.json', '')).join(', ') || '—'}</td>
      <td class="pass-no">${s.missingExpected.map(v => v.replace('_V1.json', '')).join(', ') || ''}</td>
      <td class="pass-no">${s.unexpectedPresent.map(v => v.replace('_V1.json', '')).join(', ') || ''}</td>
      <td class="pass-no">${s.hallucinated.map((h, i) => hlCommon(h, s.possibleVideos[i] ?? '')).join(', ') || ''}</td>
      <td style="color:#f59e0b">${s.possibleVideos.map((p, i) => p ? hlCommon(p, s.hallucinated[i]) : '').filter(Boolean).join(', ') || ''}</td>
      <td style="color:#ef4444">${escHtml(s.error ?? '')}</td>
    </tr>`).join('');

  document.getElementById('downloadRunBtn')!.style.display = '';
  document.getElementById('downloadRunBtn')!.onclick = () => {
    window.open(`/api/runs/${runId}/raw`, '_blank');
  };

  panel.style.display = '';
}

async function loadRuns(): Promise<void> {
  const runs: string[] = await fetch('/api/runs').then(r => r.json());
  const sel = document.getElementById('runSelect') as HTMLSelectElement;
  runs.forEach(id => {
    const opt = document.createElement('option');
    opt.value = id;
    opt.textContent = id;
    sel.appendChild(opt);
  });
}

function wireExperimentUI(): void {
  const btn = document.getElementById('runExperimentBtn')!;
  const progressDiv = document.getElementById('runProgress')!;
  const fill = document.getElementById('progressFill')!;
  const status = document.getElementById('runStatus')!;

  btn.addEventListener('click', async () => {
    if (!confirm('Start a full experiment run? This will call Gemini for all 348 items and may take ~90 minutes.')) return;
    btn.setAttribute('disabled', 'true');
    progressDiv.style.display = '';
    document.getElementById('resultsPanel')!.style.display = 'none';
    fill.style.width = '0%';
    status.textContent = 'Starting…';

    let lastRunId = '';
    const es = new EventSource('/api/runs/start');
    // EventSource only supports GET; use fetch with SSE for POST
    es.close();

    // Use fetch + ReadableStream for POST SSE
    const response = await fetch('/api/runs/start', {method: 'POST'});
    const reader = response.body!.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const {done, value} = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, {stream: true});
      const lines = buffer.split('\n');
      buffer = lines.pop() ?? '';
      for (const line of lines) {
        if (!line.startsWith('data: ')) continue;
        const data = JSON.parse(line.slice(6));
        lastRunId = data.runId || lastRunId;
        if (data.type === 'progress') {
          const pct = data.total ? (data.completed / data.total) * 100 : 0;
          fill.style.width = `${pct}%`;
          status.textContent = data.message ?? `${data.completed} / ${data.total}`;
        } else if (data.type === 'done') {
          fill.style.width = '100%';
          status.textContent = `Done — evaluating…`;
          const result = await fetch(`/api/runs/${lastRunId}/evaluate`).then(r => r.json());
          if (result.error) { status.textContent = `Eval error: ${result.error}`; return; }
          renderResults(result as EvalResult, lastRunId);
          // Add to run selector
          const sel = document.getElementById('runSelect') as HTMLSelectElement;
          const opt = document.createElement('option');
          opt.value = lastRunId;
          opt.textContent = lastRunId;
          sel.insertBefore(opt, sel.options[1]);
          status.textContent = `Complete — run ${lastRunId}`;
        } else if (data.type === 'error') {
          status.textContent = `Error: ${data.message}`;
        }
      }
    }

    btn.removeAttribute('disabled');
  });

  document.getElementById('loadRunBtn')!.addEventListener('click', async () => {
    const sel = document.getElementById('runSelect') as HTMLSelectElement;
    const runId = sel.value;
    if (!runId) return;
    const result = await fetch(`/api/runs/${runId}/evaluate`).then(r => r.json());
    if (result.error) { showToast(`Eval error: ${result.error}`); return; }
    renderResults(result as EvalResult, runId);
  });
}

init();
