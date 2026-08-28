// Full-adaptivity arc generation: at the lesson's generation boundary
// (arcSpec.generateAfter), one Gemini Pro call designs the rest of the
// lesson — hubs, paths, exercises — for THIS student, from the
// curriculum expert's contract (arcSpec) and the student's diagnostics.
//
// The authored span between generateAfter and rejoinAt is handed to the
// model as its exemplar: produce an arc of this caliber, serving the
// same standards, tailored to this student.  The arc lands in the
// per-student overlay; the authored span stays untouched as the
// fallback.  Everything downstream (rings, navigation, tutor, mastery
// evaluation, remediation inside generated hubs) runs on the merged
// lesson and never distinguishes authored from generated.
//
// Generated output is treated as hostile until coerced: ids are
// sanitized and arc- namespaced, references are remapped, standards
// must come from the contract list, dangling path steps and empty hubs
// are dropped, and routing is forced to terminate at rejoinAt/'end'.

import {Output} from 'ai';
import z from 'zod/v3';

import {getModel} from '@cdo/apps/aichat/api/client/helpers/modelHelpers';
import {AiChatModelIds} from '@cdo/generated-scripts/sharedConstants';

import {initAiLessonsGatewayContext} from './aiGatewaySetup';
import {loggedGenerateText} from './aiLog';
import {
  coerceGeneratedLevelProperties,
  generatedLevelPropertyFields,
} from './labLevelProperties';
import {StudentInputs} from './studentInputs';
import {ArcSpec, LessonPlan, Step} from './types';

const MODEL_ID = AiChatModelIds.GEMINI_2_5_PRO;
const MAX_ARC_STEPS = 14;
// The lab every generated arc step targets.  The step schema and the
// levelProperties coercion both key off this; multi-lab arcs would make
// it a parameter.
const ARC_LAB_TYPE = 'weblab2' as const;

// One flat step shape instead of a discriminated union — structured
// output handles optional fields far more reliably than unions.  The
// coercion pass sorts out what belongs to which kind.
const arcSchema = Output.object({
  schema: z.object({
    steps: z
      .array(
        z.object({
          kind: z.enum(['panels', 'lab', 'questions', 'hub']),
          id: z
            .string()
            .describe('Unique kebab-case id, e.g. "arc-css-basics".'),
          title: z.string().describe('Short student-facing title.'),
          description: z
            .string()
            .optional()
            .describe(
              "The AI tutor's brief: what the student should do and why. Required for lab and hub steps. 2-3 sentences, never more."
            ),
          next: z
            .string()
            .optional()
            .describe(
              'Where this step routes on completion: another arc step id, the rejoin step id, or "end". Hubs MUST set this (where the lesson continues once every path is done). Steps inside a hub path leave it unset — path order routes them.'
            ),
          panels: z
            .array(z.object({caption: z.string()}))
            .optional()
            .describe('panels steps only: 1-3 short slides.'),
          successCriteria: z
            .string()
            .optional()
            .describe(
              'lab steps: what must verifiably be true of the work to pass, in at most 2 sentences. Omit for free-explore steps.'
            ),
          sourceMode: z
            .enum(['project', 'sandbox'])
            .optional()
            .describe(
              'lab steps: "sandbox" for isolated skill practice (the default choice), "project" to work on the student\'s own site.'
            ),
          aiPrompting: z
            .enum(['off', 'presets', 'free'])
            .optional()
            .describe(
              'lab steps: whether the student can prompt the AI to build.'
            ),
          starterPrompt: z
            .string()
            .optional()
            .describe(
              'lab steps: instruction for generating a personalized starting page on first arrival.'
            ),
          starterFiles: z
            .array(z.object({filename: z.string(), contents: z.string()}))
            .optional()
            .describe(
              'lab steps: ONLY for planted-content exercises (bugs to find, broken code to fix) where successCriteria must reference exact planted content. At most 2 short files, ~30 lines total. Every other step describes its starting point in starterPrompt instead — that code is generated later, so do not write it here. Wins over starterPrompt.'
            ),
          // Per-lab level-config fields (flat, coerced into
          // LabStep.levelProperties).  Keyed by the lab the arc builds
          // for — weblab2 today.
          ...generatedLevelPropertyFields(ARC_LAB_TYPE),
          questions: z
            .array(
              z.object({
                id: z.string(),
                type: z.enum(['freeResponse', 'multipleChoice', 'scale']),
                prompt: z.string(),
                options: z
                  .array(
                    z.object({
                      id: z.string(),
                      label: z.string(),
                      correct: z.boolean().optional(),
                    })
                  )
                  .optional(),
              })
            )
            .optional()
            .describe('questions steps only.'),
          paths: z
            .array(
              z.object({
                id: z.string(),
                title: z.string(),
                objective: z
                  .string()
                  .describe('What mastery of this path means, one sentence.'),
                standardId: z
                  .string()
                  .describe(
                    'MUST be one of the standard ids from the curriculum contract.'
                  ),
                steps: z
                  .array(z.string())
                  .describe('Ordered arc step ids making up this path.'),
              })
            )
            .optional()
            .describe('hub steps only: 2-3 skill paths.'),
        })
      )
      .min(1)
      .max(MAX_ARC_STEPS),
  }),
});

function formatStepOutline(lesson: LessonPlan, ids: string[]): string {
  return ids
    .map(id => lesson.steps.find(s => s.id === id))
    .filter((s): s is Step => Boolean(s))
    .map(s => {
      const detail =
        s.kind !== 'panels' && s.description ? ` — ${s.description}` : '';
      return `  - [${s.kind}] ${s.title}${detail}`;
    })
    .join('\n');
}

// The authored steps between generateAfter and rejoinAt: what the arc
// replaces, and the model's quality bar.
function exemplarSpan(lesson: LessonPlan, spec: ArcSpec): string[] {
  const ids = lesson.steps.map(s => s.id);
  const from = ids.indexOf(spec.generateAfter);
  const to = spec.rejoinAt ? ids.indexOf(spec.rejoinAt) : ids.length;
  if (from < 0) return [];
  return ids.slice(from + 1, to < 0 ? ids.length : to);
}

function formatInputs(inputs: StudentInputs): string {
  const records = Object.values(inputs).sort((a, b) =>
    a.at.localeCompare(b.at)
  );
  if (records.length === 0) return '(nothing recorded)';
  return records
    .map(r => {
      let note = '';
      if (r.outcome === 'correct' || r.outcome === 'incorrect') {
        note = ` (${r.outcome}${
          r.attempts && r.attempts > 1
            ? ` after ${r.attempts} tries`
            : ' on the first try'
        })`;
      }
      return `  - "${r.prompt}" → ${r.answer}${note}`;
    })
    .join('\n');
}

interface RawArcStep {
  kind?: string;
  id?: string;
  title?: string;
  description?: string;
  next?: string;
  panels?: {caption?: string}[];
  successCriteria?: string;
  sourceMode?: string;
  aiPrompting?: string;
  starterPrompt?: string;
  starterFiles?: {filename?: string; contents?: string}[];
  initialViewMode?: string;
  questions?: unknown[];
  paths?: {
    id?: string;
    title?: string;
    objective?: string;
    standardId?: string;
    steps?: string[];
  }[];
}

function sanitizeId(raw: string | undefined, index: number): string {
  const cleaned = String(raw || '')
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/^-+|-+$/g, '');
  const base = cleaned || `step-${index}`;
  return base.startsWith('arc-') ? base : `arc-${base}`;
}

// Turns raw model output into overlay-ready steps.  Exported for tests.
export function coerceArc(
  lesson: LessonPlan,
  spec: ArcSpec,
  rawSteps: RawArcStep[]
): Step[] {
  const authoredIds = new Set(lesson.steps.map(s => s.id));
  const rejoin =
    spec.rejoinAt && authoredIds.has(spec.rejoinAt) ? spec.rejoinAt : 'end';
  const standardsById = new Map(spec.standards.map(s => [s.id, s.text]));

  // Pass 1: final ids (sanitized, arc- namespaced, deduped, never
  // colliding with authored ids), remembering the model's names so
  // references can be remapped.
  const idMap = new Map<string, string>();
  const used = new Set<string>(authoredIds);
  const withIds = rawSteps.slice(0, MAX_ARC_STEPS).map((raw, i) => {
    let id = sanitizeId(raw.id, i);
    while (used.has(id)) id = `${id}-${i}`;
    used.add(id);
    if (raw.id) idMap.set(String(raw.id), id);
    return {raw, id};
  });
  const arcIds = new Set(withIds.map(w => w.id));
  const ref = (name: string | undefined): string | undefined => {
    if (!name) return undefined;
    if (name === 'end' || name === rejoin) return name;
    const mapped = idMap.get(name) || name;
    return arcIds.has(mapped) ? mapped : undefined;
  };

  // Pass 2: build steps, remapping references and defending everything.
  const steps = withIds.map(({raw, id}, i): Step | undefined => {
    const base = {
      id,
      title: String(raw.title || `Step ${i + 1}`),
      description: raw.description ? String(raw.description) : undefined,
      generated: true as const,
      next: ref(raw.next),
    };
    if (raw.kind === 'hub') {
      const paths = (raw.paths || [])
        .map((p, pi) => ({
          id: sanitizeId(p.id, pi),
          title: String(p.title || `Path ${pi + 1}`),
          objective: p.objective ? String(p.objective) : undefined,
          standard: standardsById.get(String(p.standardId)),
          steps: (p.steps || [])
            .map(sid => ref(sid))
            .filter((sid): sid is string => Boolean(sid)),
        }))
        .filter(p => p.steps.length > 0);
      if (paths.length === 0) return undefined;
      // A hub must route somewhere once its paths finish.
      return {...base, kind: 'hub', paths, next: base.next || rejoin};
    }
    if (raw.kind === 'questions') {
      return {
        ...base,
        kind: 'questions',
        questions: Array.isArray(raw.questions) ? raw.questions : [],
      } as Step;
    }
    if (raw.kind === 'panels') {
      return {
        ...base,
        kind: 'panels',
        panels: (raw.panels || [])
          .map(p => ({caption: String(p.caption || '')}))
          .filter(p => p.caption),
      } as Step;
    }
    const starterFiles: {[filename: string]: string} = {};
    (raw.starterFiles || []).forEach(f => {
      const name = String(f.filename || '').trim();
      if (name) starterFiles[name] = String(f.contents ?? '');
    });
    const genProps = coerceGeneratedLevelProperties(
      ARC_LAB_TYPE,
      raw as {[key: string]: unknown}
    );
    return {
      ...base,
      kind: 'lab',
      labType: ARC_LAB_TYPE,
      role: 'skillBuilding',
      sourceMode: raw.sourceMode === 'project' ? 'project' : 'sandbox',
      validation: (raw.successCriteria || '').trim() ? 'tutor' : 'none',
      successCriteria: raw.successCriteria
        ? String(raw.successCriteria)
        : undefined,
      aiPrompting:
        raw.aiPrompting === 'off' || raw.aiPrompting === 'presets'
          ? raw.aiPrompting
          : 'free',
      starterPrompt: raw.starterPrompt ? String(raw.starterPrompt) : undefined,
      ...(Object.keys(starterFiles).length > 0 ? {starterFiles} : {}),
      ...(genProps ? {levelProperties: genProps} : {}),
    } as Step;
  });

  const kept = steps.filter((s): s is Step => Boolean(s));
  if (kept.length === 0) return [];
  // The arc must terminate: force the final step's exit when the model
  // left it to array order (which would run off the lesson's end).
  const last = kept[kept.length - 1];
  if (!last.next && last.kind !== 'hub') last.next = rejoin;
  return kept;
}

// Generates the personalized arc.  Returns [] when the model produces
// nothing usable — callers fall through to the authored span.
export async function generateLessonArc(options: {
  lesson: LessonPlan;
  inputs: StudentInputs;
}): Promise<Step[]> {
  const {lesson, inputs} = options;
  const spec = lesson.arcSpec;
  if (!spec) return [];
  initAiLessonsGatewayContext();

  const exemplarIds = exemplarSpan(lesson, spec);
  const response = await loggedGenerateText('arc generator', {
    model: getModel(MODEL_ID),
    system: `You are a curriculum designer generating the rest of a K-12
web-development lesson for ONE specific student, from their diagnostic
results.  An AI tutor coaches every step from your descriptions; hub
steps present skill paths the student chooses between, and a separate
mastery system may later extend your paths with extra practice.

CURRICULUM CONTRACT (every path you create must serve exactly one of
these standards, referenced by id):
${spec.standards.map(s => `  - ${s.id}: ${s.text}`).join('\n')}

${spec.guidance ? `AUTHOR GUIDANCE\n${spec.guidance}\n` : ''}${
      spec.exampleProjects?.length
        ? `EXAMPLE PROJECT DIRECTIONS (personalize with the student's own idea first)\n${spec.exampleProjects
            .map(p => `  - ${p}`)
            .join('\n')}\n`
        : ''
    }
THE AUTHORED VERSION YOU ARE REPLACING (your quality bar — produce an
arc of this caliber, tailored to this student; do not copy it):
${formatStepOutline(lesson, exemplarIds) || '  (none)'}

STRUCTURE RULES
- 6 to ${MAX_ARC_STEPS} steps.  Open with a short panels step framing the
  personalized plan.
- Hubs: 1-2, each with 2-3 paths; every path's steps must be ids of
  steps you define; a path serves exactly one contract standard.
- Each hub MUST set "next": where the lesson continues once its paths
  are done — a later arc step id, or "${spec.rejoinAt || 'end'}" to finish.
- Steps inside a path: leave "next" unset (path order routes them).
- Lab steps: sandbox for skill practice, project for applying to the
  student's own site; write real successCriteria for anything gated.
- Meet the student where the diagnostics place them.
- Keep every text field tight — no field needs more than 2-3 sentences,
  and never repeat yourself.  Scaffolded starting code is GENERATED
  LATER from starterPrompt; do not write code here except tiny
  planted-bug files.`,
    prompt: `THE STUDENT (diagnostic answers, oldest first — first-try
correctness is the strongest signal):
${formatInputs(inputs)}`,
    temperature: 0.6,
    // A healthy arc is ~2k output tokens; a few small planted-bug files
    // stretch that, but nothing legitimate approaches this cap.  Bounds
    // the known failure mode — degenerate repetition inside a JSON
    // string field — to a fast failure that falls through to the
    // authored span, instead of minutes of streaming into the JWT
    // expiry.
    maxOutputTokens: 10_000,
    output: arcSchema,
  });

  const raw = response.output as {steps?: RawArcStep[]};
  return coerceArc(lesson, spec, raw.steps || []);
}
