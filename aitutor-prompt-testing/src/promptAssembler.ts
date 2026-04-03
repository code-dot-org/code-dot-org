/**
 * Shared prompt assembly logic — used by both the browser UI and the server
 * experiment runner. Pure functions only, no module-level state.
 */

import {PythonLabStudioStateData, PythonLabLevelEntry, StudioStateEnum} from './aiTutorTestTypes';

export type TemplateVarValue = string | boolean | Array<Record<string, string>>;
export type TemplateVars = Record<string, TemplateVarValue>;

export interface Templates {
  system: string;       // master: {{persona}}\n{{videoPrompt}}\n{{editorContext}}
  persona: string;      // tutor behavior text
  videoPrompt: string;  // video list section (uses {{#videoFiles}})
  editorContext: string; // level instructions + student code + state
}

export interface VideoFileEntry {
  filename: string;
  hash: string;
  description: string;
}

export type LevelEntry = PythonLabLevelEntry & {label: string};

// ─── State descriptions ───────────────────────────────────────────────────────

const STATE_DESCRIPTIONS: Record<StudioStateEnum, string> = {
  START: 'The student has just opened the level and has not made any changes yet.',
  STRUGGLING: 'The student is completely lost and attempting random things with no clear strategy.',
  SYNTAX_ERRORS: 'The student has written code that cannot run due to syntax errors.',
  RUNTIME_ERRORS: "The student's code runs but crashes with a runtime error.",
  GOOD_PROGRESS: 'The student is making solid progress but the solution is not yet complete.',
  ALMOST_THERE: 'The student is very close to the correct answer with only a minor issue remaining.',
};

// ─── Template rendering ───────────────────────────────────────────────────────

export function renderTemplate(tpl: string, vars: TemplateVars): string {
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

// ─── Prompt assembly ──────────────────────────────────────────────────────────

export interface AssembledPrompt {
  systemPrompt: string;
  studentMessage: string;
}

export function assemblePrompt(params: {
  levelId: string;
  stateKey: string;
  videoRequested: boolean;
  levels: Record<string, LevelEntry>;
  studioData: Record<string, PythonLabStudioStateData>;
  templates: Templates;
  videoFileData: VideoFileEntry[];
}): AssembledPrompt | null {
  const {levelId, stateKey, videoRequested, levels, studioData, templates, videoFileData} = params;

  const level = levels[levelId];
  if (!level) return null;

  const dataKey = `${levelId}_${stateKey}`;
  const data: PythonLabStudioStateData = studioData[dataKey] ?? {
    studentCode: level.startingCode ?? '',
    hasRun: false,
    hasEdited: false,
  };

  const hasRunStatement = data.hasRun ? '' : 'The student has not run the code yet.';
  const hasEditedStatement = data.hasEdited ? '' : 'The student has not edited the code yet.';
  const consoleSection = data.consoleOutput
    ? `Here is the output from the student's debug console:\n\`\`\`\n${data.consoleOutput}\n\`\`\``
    : '';
  const validationSection = data.validationResults
    ? `Here are the validation test results (JSON):\n${data.validationResults}`
    : '';
  const studentMessage = videoRequested
    ? (data.studentMessageVideoRequested ?? '')
    : (data.studentMessage ?? '');

  const videoFiles = videoFileData.map(v => ({
    url: `/assets/js/json/${v.filename.replace('.json', '')}${v.hash}.json`,
    description: v.description,
  }));

  const editorVars: TemplateVars = {
    levelInstructions: level.longInstructions ?? '',
    studentCode: data.studentCode ?? '',
    consoleSection,
    hasRunStatement,
    hasEditedStatement,
    validationSection,
    stateLabel: stateKey,
    stateDescription: STATE_DESCRIPTIONS[stateKey as StudioStateEnum] ?? '',
  };

  const persona = templates.persona;
  const videoPrompt = renderTemplate(templates.videoPrompt, {videoFiles});
  const editorContext = renderTemplate(templates.editorContext, editorVars);

  const systemPrompt = renderTemplate(templates.system, {persona, videoPrompt, editorContext});

  return {systemPrompt, studentMessage};
}
