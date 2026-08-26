// Loads lesson JSON of any vintage into the current LessonPlan shape.
//
// v1 lessons had a flat `checkpoints` array where every entry was a lab
// surface (weblab2, music, or panels).  v2 lessons have typed `steps`.
// Everything that reads a lesson from the server goes through
// normalizeLessonPlan() so the rest of the codebase only ever sees v2.

import {
  HubStep,
  LabStep,
  LessonPlan,
  PanelSlide,
  PanelsStep,
  Question,
  QuestionsStep,
  Step,
} from './types';

// The v1 checkpoint shape, as found in old saved JSONs.
interface LegacyCheckpoint {
  id?: string;
  title?: string;
  description?: string;
  labType?: string;
  successCriteria?: string;
  panels?: PanelSlide[];
}

interface RawLessonPlan {
  formatVersion?: number;
  id?: string;
  title?: string;
  objective?: string;
  steps?: unknown[];
  checkpoints?: LegacyCheckpoint[];
  checklist?: LessonPlan['checklist'];
  arcSpec?: LessonPlan['arcSpec'];
  adaptivity?: LessonPlan['adaptivity'];
  authorInputs?: {prompt?: string};
  builtin?: boolean;
}

function legacyCheckpointToStep(cp: LegacyCheckpoint, index: number): Step {
  const base = {
    id: cp.id || `step-${index}`,
    title: cp.title || `Step ${index + 1}`,
  };
  if (cp.labType === 'panels') {
    const panels = (cp.panels || []).filter(p => (p.caption || '').trim());
    return {
      ...base,
      kind: 'panels',
      panels: panels.length > 0 ? panels : [{caption: base.title}],
    };
  }
  return {
    ...base,
    kind: 'lab',
    labType: cp.labType === 'music' ? 'music' : 'weblab2',
    description: cp.description || '',
    validation: (cp.successCriteria || '').trim() ? 'tutor' : 'none',
    successCriteria: cp.successCriteria || undefined,
  };
}

// Fill defaults on a v2 step so hand-edited JSON can stay terse.  Trusts
// the authored `kind`; unknown kinds fall back to a panels step showing
// the title, which keeps a lesson with a typo'd step loadable.
function normalizeStep(raw: unknown, index: number): Step {
  const step = (raw || {}) as Partial<Step> & {[key: string]: unknown};
  const id = typeof step.id === 'string' && step.id ? step.id : `step-${index}`;
  const title =
    typeof step.title === 'string' && step.title
      ? step.title
      : `Step ${index + 1}`;

  if (step.kind === 'lab') {
    const lab = step as Partial<LabStep>;
    return {
      ...(lab as LabStep),
      id,
      title,
      kind: 'lab',
      labType: lab.labType === 'music' ? 'music' : 'weblab2',
      description: lab.description || '',
      validation:
        lab.validation === 'tutor' || lab.validation === 'none'
          ? lab.validation
          : (lab.successCriteria || '').trim()
          ? 'tutor'
          : 'none',
    };
  }

  if (step.kind === 'hub') {
    const h = step as Partial<HubStep>;
    const paths = (Array.isArray(h.paths) ? h.paths : []).map((p, pIndex) => ({
      ...p,
      id: p.id || `${id}-path-${pIndex}`,
      title: p.title || `Path ${pIndex + 1}`,
      steps: (Array.isArray(p.steps) ? p.steps : []).filter(
        (s): s is string => typeof s === 'string'
      ),
    }));
    return {...(h as HubStep), id, title, kind: 'hub', paths};
  }

  if (step.kind === 'questions') {
    const q = step as Partial<QuestionsStep>;
    const questions = (Array.isArray(q.questions) ? q.questions : [])
      .map((question, qIndex) => normalizeQuestion(question, id, qIndex))
      .filter((question): question is Question => question !== undefined);
    return {...(q as QuestionsStep), id, title, kind: 'questions', questions};
  }

  const p = step as Partial<PanelsStep>;
  const panels = (Array.isArray(p.panels) ? p.panels : []).filter(panel =>
    (panel.caption || '').trim()
  );
  return {
    ...(p as PanelsStep),
    id,
    title,
    kind: 'panels',
    panels: panels.length > 0 ? panels : [{caption: title}],
  };
}

function normalizeQuestion(
  raw: unknown,
  stepId: string,
  index: number
): Question | undefined {
  const q = (raw || {}) as Partial<Question>;
  if (!q.prompt) return undefined;
  return {
    ...(q as Question),
    id: q.id || `${stepId}-q${index}`,
    type:
      q.type === 'multipleChoice' || q.type === 'scale'
        ? q.type
        : 'freeResponse',
  };
}

export function normalizeLessonPlan(raw: unknown): LessonPlan {
  const plan = (raw || {}) as RawLessonPlan;

  let steps: Step[];
  if (Array.isArray(plan.steps)) {
    steps = plan.steps.map(normalizeStep);
  } else if (Array.isArray(plan.checkpoints)) {
    steps = plan.checkpoints.map(legacyCheckpointToStep);
  } else {
    steps = [];
  }

  return {
    formatVersion: 2,
    id: plan.id,
    title: plan.title || 'Untitled Lesson',
    objective: plan.objective || '',
    steps,
    checklist: plan.checklist,
    arcSpec: plan.arcSpec,
    adaptivity: plan.adaptivity,
    authorInputs: {prompt: plan.authorInputs?.prompt || ''},
    builtin: plan.builtin,
  };
}
