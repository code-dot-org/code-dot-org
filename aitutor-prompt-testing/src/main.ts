import {
  STUDIO_STATE_LABELS,
  VIDEO_OPTIONS,
  PythonLabStudioStateData,
  PythonLabEvalEntry,
  PythonLabLevelEntry,
  StudioStateEnum,
} from './aiTutorTestTypes';

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

interface Templates {
  system: string;
  instructions: string;
  code: string;
  state: string;
}

interface VideoFileEntry {
  filename: string;
  hash: string;
  description: string;
}

type LevelData = Record<string, PythonLabLevelEntry & {label: string}>;

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
  system:
    'Auto-injected: <code>{{#videoFiles}}{{url}}::{{description}}{{/videoFiles}}</code> (the 7 available videos)',
  instructions: 'Variables: <code>{{levelInstructions}}</code>',
  code: 'Variables: <code>{{studentCode}}</code> <code>{{consoleSection}}</code> <code>{{hasRunStatement}}</code> <code>{{hasEditedStatement}}</code> <code>{{validationSection}}</code>',
  state: 'Variables: <code>{{stateLabel}}</code> <code>{{stateDescription}}</code>',
};

// ─────────────────────────────────────────────────────────────────────────────
// APP DATA — populated on init via fetch
// ─────────────────────────────────────────────────────────────────────────────

let LEVEL_DATA: LevelData = {};
let studioData: Record<string, PythonLabStudioStateData> = {};
let evalData: Record<string, PythonLabEvalEntry> = {};
let templates: Templates = {system: '', instructions: '', code: '', state: ''};
let defaultTemplates: Templates = {system: '', instructions: '', code: '', state: ''};
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
// TEMPLATE RENDERING
// ─────────────────────────────────────────────────────────────────────────────

type TemplateVarValue = string | boolean | Array<Record<string, string>>;
type TemplateVars = Record<string, TemplateVarValue>;

function renderTemplate(tpl: string, vars: TemplateVars): string {
  // 1. Process {{#key}}...{{/key}} sections (boolean guards and array iteration)
  let result = tpl.replace(
    /\{\{#(\w+)\}\}([\s\S]*?)\{\{\/\1\}\}/g,
    (_, key: string, inner: string) => {
      const val = vars[key];
      if (!val || (Array.isArray(val) && val.length === 0)) return '';
      if (Array.isArray(val)) {
        return val
          .map(item =>
            inner.replace(/\{\{(\w+)\}\}/g, (__, field: string) =>
              item[field] !== undefined ? item[field] : `{{${field}}}`
            )
          )
          .join('');
      }
      return inner;
    }
  );
  // 2. Simple {{varName}} substitution
  return result.replace(/\{\{(\w+)\}\}/g, (_, key: string) => {
    const val = vars[key];
    return typeof val === 'string' ? val : `{{${key}}}`;
  });
}

function buildVars(levelId: string, stateKey: string): TemplateVars | null {
  const level = LEVEL_DATA[levelId];
  if (!level) return null;

  const data = getOrInitStudioEntry(levelId, stateKey);
  const hasRunStatement = data.hasRun ? '' : 'The student has not run the code yet.';
  const hasEditedStatement = data.hasEdited ? '' : 'The student has not edited the code yet.';
  const consoleSection = data.consoleOutput
    ? `Here is the output from the student's debug console:\n\`\`\`\n${data.consoleOutput}\n\`\`\``
    : '';
  const validationSection = data.validationResults
    ? `Here are the validation test results (JSON):\n${data.validationResults}`
    : '';
  const studentMessage = currentVideoRequested
    ? (data.studentMessageVideoRequested ?? '')
    : (data.studentMessage ?? '');

  const videoFiles = videoFileData.map(v => ({
    url: `/assets/js/json/${v.filename.replace('.json', '')}${v.hash}.json`,
    description: v.description,
  }));

  return {
    levelInstructions: level.longInstructions ?? '',
    studentCode: data.studentCode ?? '',
    consoleSection,
    hasRunStatement,
    hasEditedStatement,
    validationSection,
    stateLabel: stateKey,
    stateDescription: STATE_DESCRIPTIONS[stateKey as StudioStateEnum] ?? '',
    studentMessage,
    videoFiles,
  };
}

function assembleOutput(
  levelId: string,
  stateKey: string
): Array<{label: string; text: string}> | null {
  const vars = buildVars(levelId, stateKey);
  if (!vars) return null;

  const sections: Array<{label: string; text: string}> = [
    {label: '1. System Prompt', text: renderTemplate(templates.system, vars)},
    {label: '2. Instructions Context', text: renderTemplate(templates.instructions, vars)},
    {label: '3. Code Context', text: renderTemplate(templates.code, vars)},
    {label: '4. State Context', text: renderTemplate(templates.state, vars)},
  ];
  const msg = vars.studentMessage;
  if (msg && typeof msg === 'string') {
    sections.push({label: '5. Student Message', text: msg});
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

init();
