// Skill-path mastery evaluation: when a student completes the last step
// of a hub path, one LLM call judges whether their recorded work
// demonstrates the path's learning objective (and official standard,
// when authored).  The verdict is stored on the progress snapshot and
// shown to the teacher; a later phase uses a failed verdict's `gaps` to
// generate remediation steps appended to the path.
//
// Runs in the background after the student has already returned to the
// hub — never blocks navigation.  Callers treat an LLM failure as
// mastered (fail-open: an outage must not flag students).

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
import {PathMastery, StepObservation} from './studentProgress';
import {
  isSandboxStep,
  LabStep,
  LessonPlan,
  pathStepsFor,
  SkillPath,
} from './types';

const MODEL_ID = AiChatModelIds.GEMINI_2_5_FLASH;
// Remediation content is authored off the critical path (the student is
// already back at the hub) — spend the bigger model on it.
// Flash, matching the arc generator: Pro reliably repetition-looped in
// structured output on low-mastery inputs, and remediation is only ever
// invoked for low-mastery students.
const REMEDIATION_MODEL_ID = AiChatModelIds.GEMINI_2_5_FLASH;
// The generation loop must terminate: at the cap the honest verdict
// stands and no more steps are added.
export const MAX_REMEDIATION_ROUNDS = 2;

// `reasoning` and `gaps` precede the verdict so the model commits to
// its reading of the evidence before deciding.
const masterySchema = Output.object({
  schema: z.object({
    reasoning: z
      .string()
      .describe(
        '2-3 teacher-facing sentences citing the specific evidence for or against mastery. Third person ("the student").'
      ),
    gaps: z
      .array(z.string())
      .describe(
        'When not mastered: what specifically is missing or weak, one gap per entry, concrete enough to design a practice exercise from. Empty when mastered.'
      ),
    mastered: z
      .boolean()
      .describe(
        'true only if the evidence shows the student demonstrated the objective. Thin or contradictory evidence means false.'
      ),
  }),
});

// One prompt block per path step: what the step asked, then everything
// the student did there — answers, AI prompts, outcomes, observations.
function formatEvidence(
  lesson: LessonPlan,
  stepIds: string[],
  inputs: StudentInputs,
  observations: {[stepId: string]: StepObservation} | undefined
): string {
  const blocks = stepIds.map(stepId => {
    const step = lesson.steps.find(s => s.id === stepId);
    const lines: string[] = [`Step "${step?.title || stepId}"`];
    if (step && step.kind !== 'panels' && step.description) {
      lines.push(`  Task: ${step.description}`);
    }
    const records = Object.values(inputs)
      .filter(r => r.stepId === stepId)
      .sort((a, b) => a.at.localeCompare(b.at));
    records.forEach(r => {
      const note =
        r.outcome && r.outcome !== 'accepted' ? ` [${r.outcome}]` : '';
      lines.push(`  - "${r.prompt}" → ${r.answer}${note}`);
    });
    if (records.length === 0) lines.push('  (nothing recorded)');
    const obs = observations?.[stepId];
    if (obs) {
      lines.push(
        `  Observation${obs.score !== undefined ? ` (${obs.score}/4)` : ''}: ${
          obs.summary
        }`
      );
    }
    return lines.join('\n');
  });
  return blocks.join('\n\n');
}

export async function evaluatePathMastery(options: {
  lesson: LessonPlan;
  path: SkillPath;
  inputs: StudentInputs;
  observations?: {[stepId: string]: StepObservation};
  // The student's work at path completion, when a lab step ended it.
  work?: string;
}): Promise<PathMastery> {
  initAiLessonsGatewayContext();
  const {lesson, path, inputs, observations, work} = options;
  const stepIds = pathStepsFor(lesson, path);

  const response = await loggedGenerateText('mastery evaluation', {
    model: getModel(MODEL_ID),
    system: `You evaluate whether a K-12 student has demonstrated mastery of
one skill path in a computer-science lesson, for their teacher.  Judge
ONLY against the objective${path.standard ? ' and standard' : ''} below,
using the recorded evidence — not effort, not completion.  Completing
steps is not mastery; the evidence must show the objective demonstrated.

LESSON: ${lesson.title}
SKILL PATH: ${path.title}
OBJECTIVE: ${path.objective || '(none authored — judge holistically)'}${
      path.standard ? `\nSTANDARD: ${path.standard}` : ''
    }`,
    prompt: `EVIDENCE, per step of the path (oldest first):

${formatEvidence(lesson, stepIds, inputs, observations)}${
      work ? `\n\nFINAL WORK AT PATH COMPLETION:\n${work}` : ''
    }`,
    temperature: 0.2,
    output: masterySchema,
  });

  const raw = response.output as {
    reasoning?: string;
    gaps?: string[];
    mastered?: boolean;
  };
  return {
    mastered: Boolean(raw.mastered),
    reasoning: String(raw.reasoning || '').trim(),
    gaps: (raw.gaps || []).map(g => String(g)).filter(Boolean),
    at: new Date().toISOString(),
  };
}

// --- Remediation generation ---

const remediationSchema = Output.object({
  schema: z.object({
    steps: z
      .array(
        z.object({
          title: z
            .string()
            .describe('Short, encouraging student-facing title.'),
          description: z
            .string()
            .describe(
              "The AI tutor's brief for this step: what the student should do, what the exercise plants (bugs, structure), and which gap it targets. 2-3 sentences. The tutor paraphrases this — never shown verbatim."
            ),
          successCriteria: z
            .string()
            .describe(
              'What must verifiably be true of the work to pass, in at most 2 sentences. Concrete and checkable from the code.'
            ),
          starterFiles: z
            .array(
              z.object({
                filename: z
                  .string()
                  .describe('e.g. "index.html", "style.css", "script.js"'),
                contents: z.string().describe('Complete file contents.'),
              })
            )
            .describe(
              'The starting files that ARE the exercise — plant the bug to find or the structure to extend here. Include index.html.'
            ),
          // Per-lab level-config fields (flat, coerced into
          // LabStep.levelProperties).  Remediation always builds
          // weblab2 exercises today.
          ...generatedLevelPropertyFields('weblab2'),
        })
      )
      .min(1)
      .max(2)
      .describe('One exercise per gap, at most two.'),
  }),
});

// The student's own question-step answers (interests, project idea) so
// the exercise can be about THEIR topic.  Practice-step records are
// evidence, not vision — the evaluator already weighed those.
function formatStudentBackground(
  lesson: LessonPlan,
  inputs: StudentInputs
): string {
  const records = Object.values(inputs)
    .filter(r => !isSandboxStep(lesson, r.stepId))
    .filter(r => !r.questionId.startsWith('ai-prompt-'))
    .sort((a, b) => a.at.localeCompare(b.at));
  if (records.length === 0) return '(nothing recorded)';
  return records.map(r => `  - "${r.prompt}" → ${r.answer}`).join('\n');
}

// Generates targeted practice steps for a failed mastery verdict.
// Returns fully-formed LabSteps ready for the overlay: sandboxed,
// tutor-gated, flagged `generated`, ids namespaced by path and round.
export async function generateRemediationSteps(options: {
  lesson: LessonPlan;
  path: SkillPath;
  verdict: PathMastery;
  inputs: StudentInputs;
  round: number;
}): Promise<LabStep[]> {
  initAiLessonsGatewayContext();
  const {lesson, path, verdict, inputs, round} = options;

  const existingSteps = pathStepsFor(lesson, path)
    .map(id => lesson.steps.find(s => s.id === id))
    .filter((s): s is NonNullable<typeof s> => Boolean(s))
    .map(
      s =>
        `  - ${s.title}${
          s.kind !== 'panels' && s.description ? `: ${s.description}` : ''
        }`
    )
    .join('\n');

  const response = await loggedGenerateText('remediation generator', {
    model: getModel(REMEDIATION_MODEL_ID),
    system: `You design one or two short remediation exercises for a K-12
student who completed a skill path without demonstrating mastery.  Each
exercise is a small Web Lab 2 sandbox: you write the starting files, the
AI tutor coaches from your description, and your success criteria decide
when the student passes.

SKILL PATH: ${path.title}
OBJECTIVE: ${path.objective || '(none authored)'}${
      path.standard ? `\nSTANDARD: ${path.standard}` : ''
    }

THE PATH'S EXISTING EXERCISES (do not repeat these — the student already
did them without demonstrating mastery; come at the gaps differently):
${existingSteps}

ABOUT THIS STUDENT (make the exercise about THEIR interests — a bug hunt
in a page about their topic beats a generic one):
${formatStudentBackground(lesson, inputs)}

RULES
- One exercise per gap below, at most two exercises.
- Beginner-readable code: small files, no frameworks, no build tools.
- The starting files ARE the exercise: plant exactly what the gap needs
  practiced (a bug to find, a structure to extend, a behavior to wire).
  Keep them minimal — roughly 40 lines across all files.
- Success criteria must be checkable from the code alone.
- Keep every text field to a sentence or two; never repeat yourself.`,
    prompt: `THE JUDGE'S VERDICT (why mastery wasn't demonstrated):
${verdict.reasoning}

GAPS TO TARGET:
${
  (verdict.gaps || []).map(g => `  - ${g}`).join('\n') ||
  '  - (none named — design one exercise for the weakest part of the objective)'
}`,
    temperature: 0.5,
    // Two small exercises with planted files fit in ~2-3k tokens; the
    // cap bounds degenerate repetition inside a JSON string to a fast
    // failure instead of minutes of streaming (same failure mode as the
    // arc generator).
    maxOutputTokens: 6_000,
    output: remediationSchema,
  });

  const raw = response.output as {
    steps?: {
      title?: string;
      description?: string;
      successCriteria?: string;
      starterFiles?: {filename?: string; contents?: string}[];
      initialViewMode?: string;
    }[];
  };

  return (raw.steps || []).slice(0, 2).map((s, i) => {
    const starterFiles: {[filename: string]: string} = {};
    (s.starterFiles || []).forEach(f => {
      const name = String(f.filename || '').trim();
      if (name) starterFiles[name] = String(f.contents ?? '');
    });
    const genProps = coerceGeneratedLevelProperties(
      'weblab2',
      s as {[key: string]: unknown}
    );
    return {
      id: `gen-${path.id}-${round}-${i + 1}`,
      kind: 'lab',
      labType: 'weblab2',
      title: String(s.title || `More ${path.title} practice`),
      role: 'skillBuilding',
      sourceMode: 'sandbox',
      validation: 'tutor',
      aiPrompting: 'free',
      generated: true,
      description: String(s.description || ''),
      successCriteria: String(s.successCriteria || ''),
      ...(Object.keys(starterFiles).length > 0 ? {starterFiles} : {}),
      ...(genProps ? {levelProperties: genProps} : {}),
    };
  });
}
