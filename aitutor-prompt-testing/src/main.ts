import {pythonLabLevelData} from './pythonLabLevelData';
import {pythonLabStudioData} from './pythonLabStudioData';
import {pythonLabStudentMessages} from './pythonLabStudentMessages';
import {pythonLabEvalData} from './pythonLabEvalData';
import {
  STUDIO_STATE_LABELS,
  VIDEO_OPTIONS,
  PythonLabStudioStateData,
  PythonLabEvalEntry,
  StudioStateEnum,
} from './aiTutorTestTypes';

// ─────────────────────────────────────────────────────────────────────────────
// LEVEL DATA
// Deduplicate to one entry per canonical level stem (strip version suffix).
// This keeps the dropdown manageable — pick the first variant encountered
// (typically _2025-launch_2025 or standalone _2025).
// ─────────────────────────────────────────────────────────────────────────────

function levelStem(id: string): string {
  return id
    .replace(/_pilot-\d{4}$/, '')
    .replace(/_v2-\d{4}$/, '')
    .replace(/_\d{4}.*$/, '');
}

function levelLabel(id: string): string {
  const stem = levelStem(id);
  // shorten "programming-fundamentals-" prefix for display
  return stem.replace('programming-fundamentals-', '');
}

const seenStems = new Set<string>();
const LEVEL_DATA: Record<string, typeof pythonLabLevelData[string] & {label: string}> = {};
for (const [id, entry] of Object.entries(pythonLabLevelData)) {
  const stem = levelStem(id);
  if (!seenStems.has(stem)) {
    seenStems.add(stem);
    LEVEL_DATA[id] = {...entry, label: levelLabel(id)};
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// STATE DATA
// ─────────────────────────────────────────────────────────────────────────────

const STATES: Array<{key: StudioStateEnum; label: string}> = (
  Object.keys(STUDIO_STATE_LABELS) as StudioStateEnum[]
).map(key => ({key, label: `${key} — ${STUDIO_STATE_LABELS[key]}`}));

// Longer prompt-facing descriptions (used as {{stateDescription}} in templates)
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

// ─────────────────────────────────────────────────────────────────────────────
// DEFAULT TEMPLATES
// Variables: {{levelInstructions}}, {{studentCode}}, {{consoleOutput}},
//            {{hasRunStatement}}, {{hasEditedStatement}}, {{validationResults}},
//            {{stateLabel}}, {{stateDescription}}
// ─────────────────────────────────────────────────────────────────────────────

const DEFAULT_TEMPLATES = {
  system: `You are an AI Computer Science Tutor that supports students through scaffolded learning, metacognitive reflection, and problem-solving strategies. Target the reading age of an American 7th grader. By default, when a student asks a question, you should respond with a clarifying question, a small hint, or a reflective nudge—to help them take the next step without solving the task for them. Do not give them the whole answer directly. If the student appears frustrated, you may include syntax or pseudocode. If the student explicitly asks for a HINT, provide a tip that nudges them forward to take the next step. If they ask for an EXAMPLE, give a short (1–3 line) conceptual code snippet from a different context that illustrates the relevant idea without solving the actual task. If they request DOCUMENTATION, share 1–3 concise and relevant references formatted with a clear keyword, short explanation and example code. Always work within the provided instructions, student code, and question, and tailor your support to encourage confidence, independence, and thoughtful programming.`,

  instructions: `Here are the instructions for this level:

{{levelInstructions}}`,

  code: `Here is the student's current code:
\`\`\`
{{studentCode}}
\`\`\`
{{hasRunStatement}}
{{hasEditedStatement}}
{{consoleSection}}
{{validationSection}}`,

  state: `Student state: {{stateLabel}}
{{stateDescription}}`,
};

const TEMPLATE_HINTS: Record<string, string> = {
  system: 'No variables — edit the tutor persona and behavior.',
  instructions: 'Variables: <code>{{levelInstructions}}</code>',
  code: 'Variables: <code>{{studentCode}}</code> <code>{{consoleSection}}</code> <code>{{hasRunStatement}}</code> <code>{{hasEditedStatement}}</code> <code>{{validationSection}}</code>',
  state: 'Variables: <code>{{stateLabel}}</code> <code>{{stateDescription}}</code>',
};

// ─────────────────────────────────────────────────────────────────────────────
// PERSISTENCE
// ─────────────────────────────────────────────────────────────────────────────

const STORAGE_KEY_TPL = 'aiTutorTool_templates_v1';
const STORAGE_KEY_DATA = 'aiTutorTool_studioData_v1';
const STORAGE_KEY_EVAL = 'aiTutorTool_evalData_v1';

// Keys saved to localStorage as overrides on top of pythonLabStudioData
const localOverrides: Record<string, PythonLabStudioStateData> = loadLocalOverrides();

// Merge student messages into studio data entries
const studioDataWithMessages: Record<string, PythonLabStudioStateData> = {};
for (const [key, entry] of Object.entries(pythonLabStudioData)) {
  const msgs = pythonLabStudentMessages[key];
  studioDataWithMessages[key] = msgs ? {...entry, ...msgs} : entry;
}

// Working copy: start from pythonLabStudioData + messages, merge in localStorage overrides
const studioData: Record<string, PythonLabStudioStateData> = {
  ...studioDataWithMessages,
  ...localOverrides,
};

// Eval overrides on top of pythonLabEvalData
const localEvalOverrides: Record<string, PythonLabEvalEntry> = loadLocalEvalOverrides();
const evalData: Record<string, PythonLabEvalEntry> = {
  ...pythonLabEvalData,
  ...localEvalOverrides,
};

function loadLocalOverrides(): Record<string, PythonLabStudioStateData> {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_DATA);
    return saved ? JSON.parse(saved) : {};
  } catch {
    return {};
  }
}

function loadLocalEvalOverrides(): Record<string, PythonLabEvalEntry> {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_EVAL);
    return saved ? JSON.parse(saved) : {};
  } catch {
    return {};
  }
}

function saveStudioData(): void {
  localStorage.setItem(STORAGE_KEY_DATA, JSON.stringify(localOverrides));
}

function saveEvalData(): void {
  localStorage.setItem(STORAGE_KEY_EVAL, JSON.stringify(localEvalOverrides));
}

let templates = loadTemplates();

function loadTemplates(): typeof DEFAULT_TEMPLATES {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_TPL);
    return saved ? {...DEFAULT_TEMPLATES, ...JSON.parse(saved)} : {...DEFAULT_TEMPLATES};
  } catch {
    return {...DEFAULT_TEMPLATES};
  }
}

function saveTemplates(): void {
  localStorage.setItem(STORAGE_KEY_TPL, JSON.stringify(templates));
}

// ─────────────────────────────────────────────────────────────────────────────
// STUDIO DATA HELPERS
// ─────────────────────────────────────────────────────────────────────────────

// Returns the studio entry for a level+state, auto-creating a blank one if
// none exists in pythonLabStudioData. New entries are "draft" until saved.
function getOrInitStudioEntry(
  levelId: string,
  stateKey: string
): PythonLabStudioStateData {
  const dataKey = `${levelId}_${stateKey}`;
  if (!studioData[dataKey]) {
    const level = LEVEL_DATA[levelId];
    studioData[dataKey] = {
      studentCode: level?.startingCode ?? '',
      hasRun: false,
      hasEdited: false,
    };
  }
  return studioData[dataKey];
}

function isPreAuthored(levelId: string, stateKey: string): boolean {
  return `${levelId}_${stateKey}` in pythonLabStudioData;
}

// ─────────────────────────────────────────────────────────────────────────────
// TEMPLATE RENDERING
// ─────────────────────────────────────────────────────────────────────────────

function renderTemplate(tpl: string, vars: Record<string, string>): string {
  return tpl.replace(/\{\{(\w+)\}\}/g, (_, key: string) =>
    vars[key] !== undefined ? vars[key] : `{{${key}}}`
  );
}

function buildVars(levelId: string, stateKey: string): Record<string, string> | null {
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
  };
}

function assembleOutput(
  levelId: string,
  stateKey: string
): Array<{label: string; text: string}> | null {
  const vars = buildVars(levelId, stateKey);
  if (!vars) return null;

  const sections: Array<{label: string; text: string}> = [
    {label: '1. System Prompt', text: templates.system},
    {label: '2. Instructions Context', text: renderTemplate(templates.instructions, vars)},
    {label: '3. Code Context', text: renderTemplate(templates.code, vars)},
    {label: '4. State Context', text: renderTemplate(templates.state, vars)},
  ];
  if (vars.studentMessage) {
    sections.push({label: '5. Student Message', text: vars.studentMessage});
  }
  return sections;
}

// ─────────────────────────────────────────────────────────────────────────────
// DOM STATE
// ─────────────────────────────────────────────────────────────────────────────

let currentTab = 'system';
let currentLevel = Object.keys(LEVEL_DATA)[0];
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
    : '<span class="studio-draft-badge">draft — not in TS source</span>';

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

  // Wire up studio field changes — save override to localStorage
  (['studentCode', 'consoleOutput', 'validationResults'] as const).forEach(field => {
    document.getElementById(`f-${field}`)!.addEventListener('input', e => {
      studioData[dataKey][field] = (e.target as HTMLTextAreaElement).value;
      localOverrides[dataKey] = {...studioData[dataKey]};
      saveStudioData();
      renderOutput();
    });
  });
  (['hasRun', 'hasEdited'] as const).forEach(field => {
    document.getElementById(`f-${field}`)!.addEventListener('change', e => {
      studioData[dataKey][field] = (e.target as HTMLInputElement).checked;
      localOverrides[dataKey] = {...studioData[dataKey]};
      saveStudioData();
      renderOutput();
    });
  });
  document.getElementById('f-studentMessage')!.addEventListener('input', e => {
    studioData[dataKey][msgField] = (e.target as HTMLTextAreaElement).value;
    localOverrides[dataKey] = {...studioData[dataKey]};
    saveStudioData();
    renderOutput();
  });
}

function renderEvalEditor(): void {
  const evalKey = `${currentLevel}_${currentState}_${currentVideoRequested ? 'VIDEO' : 'NOVIDEO'}`;
  const entry: PythonLabEvalEntry = evalData[evalKey] ?? {expectedVideos: []};
  const area = document.getElementById('evalEditorArea')!;

  area.innerHTML = `<div class="video-checkboxes">${
    VIDEO_OPTIONS.map(v => `
      <label class="video-checkbox-label">
        <input type="checkbox" data-video="${escHtml(v)}"
          ${entry.expectedVideos.includes(v) ? 'checked' : ''}>
        ${escHtml(v)}
      </label>`).join('')
  }</div>`;

  area.querySelectorAll<HTMLInputElement>('input[data-video]').forEach(cb => {
    cb.addEventListener('change', () => {
      const checked = Array.from(
        area.querySelectorAll<HTMLInputElement>('input[data-video]:checked')
      ).map(el => el.dataset.video as (typeof VIDEO_OPTIONS)[number]);
      evalData[evalKey] = {expectedVideos: checked};
      localEvalOverrides[evalKey] = {expectedVideos: checked};
      saveEvalData();
    });
  });
}

function renderTemplateEditor(): void {
  const textarea = document.getElementById('tpl-textarea') as HTMLTextAreaElement;
  const hint = document.getElementById('tpl-hint')!;
  textarea.value = templates[currentTab as keyof typeof templates];
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

function init(): void {
  // Populate level dropdown
  const levelSel = document.getElementById('levelSelect') as HTMLSelectElement;
  Object.entries(LEVEL_DATA).forEach(([id, lvl]) => {
    const opt = document.createElement('option');
    opt.value = id;
    opt.textContent = lvl.label;
    levelSel.appendChild(opt);
  });

  // Populate state dropdown
  const stateSel = document.getElementById('stateSelect') as HTMLSelectElement;
  STATES.forEach(({key, label}) => {
    const opt = document.createElement('option');
    opt.value = key;
    opt.textContent = label;
    stateSel.appendChild(opt);
  });

  // Level / State / Video Requested change
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

  // Template tabs
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      // Save current tab before switching
      templates[currentTab as keyof typeof templates] = (
        document.getElementById('tpl-textarea') as HTMLTextAreaElement
      ).value;
      saveTemplates();

      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentTab = (btn as HTMLElement).dataset.tab!;
      renderTemplateEditor();
    });
  });

  // Template textarea edits → live update
  document.getElementById('tpl-textarea')!.addEventListener('input', e => {
    templates[currentTab as keyof typeof templates] = (
      e.target as HTMLTextAreaElement
    ).value;
    saveTemplates();
    renderOutput();
  });

  // Copy output button
  document.getElementById('copyBtn')!.addEventListener('click', () => {
    const sections = assembleOutput(currentLevel, currentState);
    if (!sections) return;
    const full = sections
      .map(s => s.text.replace(/\n(\s*\n){2,}/g, '\n\n').trim())
      .join('\n\n---\n\n');
    navigator.clipboard.writeText(full).then(() => showToast('Copied to clipboard!'));
  });

  // Reset templates
  document.getElementById('resetTemplatesBtn')!.addEventListener('click', () => {
    if (!confirm('Reset all 4 templates to defaults? This cannot be undone.')) return;
    Object.assign(templates, DEFAULT_TEMPLATES);
    localStorage.removeItem(STORAGE_KEY_TPL);
    renderTemplateEditor();
    renderOutput();
  });

  // Initial render
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
