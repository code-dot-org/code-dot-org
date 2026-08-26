// AI Tutor brain for the AI Lessons student page.
//
// The tutor takes the full lesson plan, the current checkpoint index, the
// running chat transcript, and an optional "student work snapshot" provided
// by the student (or scraped live from Redux) and produces:
//   - a chat reply to show the student
//   - a decision: stay on the current checkpoint, or advance to the next
//
// We constrain the model output with `Output.object` + a zod schema so we
// get a structured object back from the gateway directly — no homemade
// JSON-from-prose parsing.

import {Output} from 'ai';
import z from 'zod/v3';

import {getModel} from '@cdo/apps/aichat/api/client/helpers/modelHelpers';
import {AiChatModelIds} from '@cdo/generated-scripts/sharedConstants';

import {initAiLessonsGatewayContext} from './aiGatewaySetup';
import {loggedGenerateText} from './aiLog';
import {getCapabilitiesMarkdownFor, StepSurface} from './labCapabilities';
import {deterministicNextStep} from './navigation';
import {StudentInputs} from './studentInputs';
import {PathMastery, StepObservation} from './studentProgress';
import {
  hubOwning,
  isSandboxStep,
  LessonPlan,
  Question,
  Step,
  stepShowsChecklist,
} from './types';

const MODEL_ID = AiChatModelIds.GEMINI_2_5_FLASH;

// Everything the tutor knows about this student's session, shared by
// openings, replies, and answer judging.
export interface TutorContext {
  lesson: LessonPlan;
  currentIndex: number;
  studentInputs?: StudentInputs;
  checklistState?: {[itemId: string]: boolean};
  observations?: {[stepId: string]: StepObservation};
  // Per-path mastery verdicts, so the tutor can narrate skill-hub
  // progress and frame added practice steps as growth.
  mastery?: {[pathId: string]: PathMastery};
}

export type TutorRole = 'tutor' | 'student';

export interface TutorMessage {
  role: TutorRole;
  text: string;
}

export type TutorAction = 'stay' | 'advance' | 'celebrate';

export interface ChecklistVerdict {
  id: string;
  done: boolean;
}

export interface TutorReply {
  message: string;
  action: TutorAction;
  reasoning?: string;
  // Per-item verdicts against the lesson checklist; present only when
  // the prompt carried a PROJECT CHECKLIST section and the tutor
  // evaluated work.
  checklist?: ChecklistVerdict[];
}

const tutorReplySchema = Output.object({
  schema: z.object({
    message: z.string().describe('Your reply to the student. Plain text.'),
    action: z
      .enum(['stay', 'advance', 'celebrate'])
      .describe(
        'Set to "advance" only if the success criteria are clearly met and there is a next checkpoint; "celebrate" if this is the final checkpoint and the criteria are met; otherwise "stay".'
      ),
    reasoning: z
      .string()
      .optional()
      .describe('One sentence on why you chose that action.'),
    checklist: z
      .array(
        z.object({
          id: z
            .string()
            .describe('Checklist item id, exactly as listed in the prompt.'),
          done: z
            .boolean()
            .describe("Whether the student's work satisfies this item."),
        })
      )
      .optional()
      .describe(
        'ONLY when a PROJECT CHECKLIST section appears in your instructions and you are looking at a student work snapshot: a verdict for EVERY listed item. Omit otherwise.'
      ),
  }),
});

// Openings are split into two discrete pieces so the UI can style them
// differently (small welcome line, larger call-to-action). Markdown is
// still allowed within each (e.g. inline `code`), but the welcome and
// instruction live in separate fields.
export interface TutorOpening {
  welcome: string;
  instruction: string;
}

const tutorOpeningSchema = Output.object({
  schema: z.object({
    welcome: z
      .string()
      .describe(
        'One friendly sentence framing what the student is about to do. ≤12 words. No "Do this:" prefix.'
      ),
    instruction: z
      .string()
      .describe(
        'ONE concrete sentence describing the single action the student should take right now. ≤15 words. Plain text — no "Do this:" prefix, no bullet, no preamble.'
      ),
  }),
});

// The surface the student is looking at during a step, for capability
// docs and prompt labels.
function surfaceFor(step: Step): StepSurface {
  return step.kind === 'lab' ? step.labType : step.kind;
}

// One line per step for the lesson overview in the system prompt.
function overviewLine(step: Step, index: number, currentIndex: number) {
  const marker =
    index < currentIndex ? '✓' : index === currentIndex ? '→' : ' ';
  const segment = step.segment ? ` [${step.segment.title}]` : '';
  const description =
    step.kind !== 'panels' && step.description ? ` — ${step.description}` : '';
  return `  ${marker} ${index + 1}. ${step.title} (${surfaceFor(
    step
  )})${segment}${description}`;
}

function currentStepDetails(
  lesson: LessonPlan,
  step: Step,
  mastery: {[pathId: string]: PathMastery} | undefined
): string {
  const lines: (string | false | undefined)[] = [
    `  Title: ${step.title}`,
    `  Surface: ${surfaceFor(step)}`,
  ];
  // Agent-generated steps: the tutor must frame them as made-for-you,
  // and knows exactly why they exist.  Two flavors: remediation (a
  // failed mastery verdict prescribed it) and personalized-arc content
  // (designed from the diagnostics — nobody failed anything).
  if (step.generated) {
    const owner = hubOwning(lesson, step.id);
    const verdict = owner ? mastery?.[owner.path.id] : undefined;
    if (verdict && !verdict.mastered) {
      lines.push(
        `  This step was GENERATED for this student as targeted practice: they
  completed the ${owner ? `"${owner.path.title}"` : 'skill'} path without
  yet demonstrating its objective${
    verdict.gaps?.length ? ` (gaps: ${verdict.gaps.join('; ')})` : ''
  }.  Frame it as a chance to level up — a new challenge because they're
  close — never as failure or punishment.  Do not mention judging,
  evaluation, or that an AI decided this.`
      );
    } else {
      lines.push(
        `  This step is part of a path GENERATED for this student from their
  diagnostic answers — designed around their interests and level.  Treat
  it exactly like an authored step; if it comes up, it was "made for
  you", never "an AI judged you".`
      );
    }
  }
  if (step.kind !== 'panels' && step.description) {
    lines.push(`  Description (what the student should do — turn this into your own
  natural-language guidance for the student; never paste it verbatim):
  ${step.description}`);
  }
  if (step.kind === 'lab') {
    if (step.aiPrompting === 'presets' || step.aiPrompting === 'free') {
      lines.push(
        `  On this step the student prompts an AI build partner in a separate
  panel (NOT this chat).  Prompts they've written appear in STUDENT
  CONTEXT as "AI build prompt" records.  Never ask them to paste or
  repeat a prompt here — read it from their records, and coach on it
  there if it needs work.`
      );
    }
    if (step.validation === 'tutor' && step.successCriteria) {
      lines.push(
        `  Success criteria (what you, the tutor, must verify before advancing): ${step.successCriteria}`
      );
    } else {
      lines.push(
        `  This step has NO completion check — the student moves on with a
  Continue button whenever they're ready.  Never set action="advance"
  or "celebrate" here; encourage and answer questions instead.`
      );
    }
  }
  if (step.kind === 'hub') {
    lines.push('  Skill paths on this hub:');
    step.paths.forEach(p => {
      const verdict = mastery?.[p.id];
      const hasGenerated = p.steps.some(id => {
        const pathStep = lesson.steps.find(s => s.id === id);
        return Boolean(pathStep?.generated);
      });
      const status = verdict
        ? verdict.mastered
          ? ' [status: mastered]'
          : ` [status: not yet mastered${
              hasGenerated ? '; a targeted practice step was added' : ''
            }]`
        : '';
      lines.push(
        `    - ${p.title}${p.objective ? ` — ${p.objective}` : ''}${
          p.standard ? ` (standard: ${p.standard})` : ''
        }${status}`
      );
    });
    lines.push(
      `  The student picks a path in the main area, plays through its steps,
  and returns here.  Help them choose if asked; never set
  action="advance" — the hub advances itself when its paths are done.
  If a practice step was added to a path, frame it warmly as a new
  challenge because they're close — never as failure, and never mention
  judging or that an AI decided it.`
    );
  }
  if (step.kind === 'questions') {
    lines.push('  Questions the student answers on this step:');
    step.questions.forEach(q => lines.push(`    - ${q.prompt}`));
    lines.push(
      `  The student answers in the main area, not in this chat.  Never set
  action="advance" — the questions surface advances itself.`
    );
  }
  return lines.filter(Boolean).join('\n');
}

// Everything the student has answered so far, oldest first, formatted
// for the system prompt.  This is the personalization substrate: the
// tutor should reference the student's own project, adjust its tone to
// their confidence, and never re-ask what's already been answered.
function formatStudentContext(
  lesson: LessonPlan,
  currentStepId: string | undefined,
  inputs: StudentInputs | undefined
): string {
  const records = Object.values(inputs || {}).sort((a, b) =>
    a.at.localeCompare(b.at)
  );
  if (records.length === 0) return '';
  const lines = records.map(r => {
    let note = '';
    if (r.outcome === 'correct' || r.outcome === 'incorrect') {
      note = ` (answered ${r.outcome}${
        r.attempts && r.attempts > 1 ? ` after ${r.attempts} tries` : ''
      })`;
    } else if (r.outcome === 'kept' || r.outcome === 'undone') {
      note = ` (AI build ${r.outcome})`;
    }
    // Practice-exercise records show skill, not project vision — without
    // this the tutor conflates a fictional exercise brand with the
    // student's own site.  The current step's own records stay unlabeled:
    // on a practice step they ARE the work under discussion.
    if (r.stepId !== currentStepId && isSandboxStep(lesson, r.stepId)) {
      note += ' [from a practice exercise — NOT their project]';
    }
    return `  - "${r.prompt}" → ${r.answer}${note}`;
  });
  return `
STUDENT CONTEXT (their own answers so far — use these to personalize:
reference their project and interests naturally, match your support to
their confidence, and never re-ask them)
${lines.join('\n')}
`;
}

// Rubric-scored observations from earlier steps: how the student worked,
// not what they built.  Gives the tutor a sense of working style.
function formatObservations(
  lesson: LessonPlan,
  observations: {[stepId: string]: StepObservation} | undefined
): string {
  const entries = Object.entries(observations || {});
  if (entries.length === 0) return '';
  const lines = entries.map(([stepId, obs]) => {
    const title = lesson.steps.find(s => s.id === stepId)?.title || stepId;
    const score = obs.score !== undefined ? ` (${obs.score}/4)` : '';
    return `  - ${title}${score}: ${obs.summary}`;
  });
  return `
OBSERVATIONS (how this student has worked on earlier steps)
${lines.join('\n')}
`;
}

// The lesson checklist with its current verdicts, plus the tutor's
// standing orders about it.  Only emitted on steps where the checklist
// applies (project-mode lab steps).
function formatChecklist(
  lesson: LessonPlan,
  step: Step,
  state: {[itemId: string]: boolean} | undefined
): string {
  if (!stepShowsChecklist(lesson, step)) return '';
  const items = (lesson.checklist || [])
    .map(
      item => `  [${state?.[item.id] ? 'x' : ' '}] ${item.id}: ${item.label}`
    )
    .join('\n');
  return `
PROJECT CHECKLIST (the student's map of what "done" looks like; shown to
them next to your chat)
${items}
- Every time you see a student work snapshot, judge EVERY item against
  it and return the full list in the "checklist" output field.
- When the student asks what to do next, point them at the first
  unchecked item.
`;
}

const SYSTEM_PROMPT_TEMPLATE = (ctx: TutorContext) => {
  const {lesson, currentIndex, studentInputs, checklistState, observations} =
    ctx;
  const totalSteps = lesson.steps.length;
  const current = lesson.steps[currentIndex];
  // Path-aware preview: for hub-path steps (agent-generated ones
  // included, which sit at the array's end) the next step is the next
  // path step or the hub — array order would wrongly call them LAST.
  const upcoming = current
    ? deterministicNextStep(lesson, current.id)
    : undefined;

  const overview = lesson.steps
    .map((s, i) => overviewLine(s, i, currentIndex))
    .join('\n');

  return `You are AI Tutor, a warm, encouraging teaching assistant guiding a
single student through an interactive computer-science lesson.  You are the
ONLY voice the student hears.  There is no separate level navigation — you
decide when the student is ready to move on.

LESSON
  Title: ${lesson.title}
  Objective: ${lesson.objective}
${formatStudentContext(lesson, current?.id, studentInputs)}${formatObservations(
    lesson,
    observations
  )}${formatChecklist(lesson, current, checklistState)}
STEPS
${overview}

CURRENT STEP (#${currentIndex + 1} of ${totalSteps})
${currentStepDetails(lesson, current, ctx.mastery)}

${
  upcoming
    ? `NEXT STEP (after this one)
  Title: ${upcoming.title}
  Surface: ${surfaceFor(upcoming)}`
    : 'This is the LAST step.  After it, congratulate the student.'
}

YOUR JOB
- Keep replies short (1-4 short paragraphs).  Markdown is rendered, so
  feel free to use **bold**, *italics*, bullet lists, and inline \`code\`
  to highlight what matters.  Don't overdo it.
- Stay focused on the current step.  If the student wanders, gently
  bring them back.
- When the student shares their work (code, a description, or by clicking
  "Check my work"), evaluate it against the success criteria.  The
  success criteria are the ONLY gate: judge them against the work
  snapshot alone.  The step description is coaching context — never
  treat it as extra criteria or demand artifacts it mentions.
- If the success criteria are clearly met, set action="advance" and write a
  brief celebratory transition that previews the next step.
- If this is the final step and the criteria are met, set
  action="celebrate".
- Otherwise set action="stay" and give targeted, actionable feedback —
  one or two specific suggestions.  Never advance prematurely.
- Do not invent UI controls.  The student has the lesson surface on screen
  and a chat with you; that's it.

${getCapabilitiesMarkdownFor(surfaceFor(current))}`;
};

function formatTranscript(
  history: TutorMessage[],
  studentWork: string | undefined
): string {
  const lines: string[] = [];
  history.forEach(m => {
    const speaker = m.role === 'tutor' ? 'Tutor' : 'Student';
    lines.push(`${speaker}: ${m.text}`);
  });
  if (studentWork && studentWork.trim()) {
    lines.push('');
    lines.push('STUDENT WORK SNAPSHOT (provided by the student):');
    lines.push(studentWork.trim());
  }
  return lines.join('\n');
}

async function callTutorModel(
  system: string,
  prompt: string,
  temperature: number
): Promise<TutorReply> {
  const response = await loggedGenerateText('tutor reply', {
    model: getModel(MODEL_ID),
    system,
    prompt,
    temperature,
    output: tutorReplySchema,
  });

  const raw = response.output;
  const action: TutorAction =
    raw.action === 'advance' || raw.action === 'celebrate'
      ? raw.action
      : 'stay';
  const checklist = Array.isArray(raw.checklist)
    ? raw.checklist
        .filter(
          (v: {id?: unknown; done?: unknown}) =>
            typeof v?.id === 'string' && typeof v?.done === 'boolean'
        )
        .map((v: {id: string; done: boolean}) => ({id: v.id, done: v.done}))
    : undefined;
  return {
    message: String(raw.message || '').trim(),
    action,
    reasoning: raw.reasoning ? String(raw.reasoning) : undefined,
    checklist: checklist && checklist.length > 0 ? checklist : undefined,
  };
}

export async function generateTutorOpening(
  ctx: TutorContext
): Promise<TutorOpening> {
  initAiLessonsGatewayContext();
  const isFirst = ctx.currentIndex === 0;
  const response = await loggedGenerateText('tutor opening', {
    model: getModel(MODEL_ID),
    system: SYSTEM_PROMPT_TEMPLATE(ctx),
    prompt: `The student has just arrived at this checkpoint.  Return:

welcome:  ONE friendly ${
      isFirst ? 'welcome' : 'transition'
    } sentence, ≤12 words.  ${
      isFirst
        ? `Examples: "Welcome! Today we're making a beat in Music Lab." / "Hey! Let's build a tiny webpage."`
        : `Examples: "Nice work! Next up: loops." / "Great — now let's add sound effects."`
    }

instruction:  ONE concrete sentence describing the single action the
student should take right now.  ≤15 words.  No "Do this:" prefix —
the UI renders that for you.  No preamble, no follow-up tips, no
bullets.

Do not greet the student by name.  This is NOT an evaluation.`,
    temperature: 0.5,
    output: tutorOpeningSchema,
  });
  const raw = response.output;
  return {
    welcome: String(raw.welcome || '').trim(),
    instruction: String(raw.instruction || '').trim(),
  };
}

export async function generateTutorReply(
  ctx: TutorContext,
  history: TutorMessage[],
  studentWork?: string
): Promise<TutorReply> {
  initAiLessonsGatewayContext();
  return callTutorModel(
    SYSTEM_PROMPT_TEMPLATE(ctx),
    formatTranscript(history, studentWork),
    0.4
  );
}

const judgeSchema = Output.object({
  schema: z.object({
    accepted: z
      .boolean()
      .describe("Whether the student's answer meets the success criteria."),
    feedback: z
      .string()
      .describe(
        'One or two warm sentences: if accepted, affirm what was right; if not, a nudge toward what the criteria want — without giving the answer away.'
      ),
  }),
});

// Judge a tutor-validated free-response answer against its authored
// success criteria.  Used by QuestionFlow to gate progression with
// retries, like a key-validated question but with an LLM as the key.
export async function judgeFreeResponse(
  ctx: TutorContext,
  question: Question,
  answer: string
): Promise<{accepted: boolean; feedback: string}> {
  initAiLessonsGatewayContext();
  const response = await loggedGenerateText('answer judge', {
    model: getModel(MODEL_ID),
    system: SYSTEM_PROMPT_TEMPLATE(ctx),
    prompt: `The student answered a check-for-understanding question.  Judge
the answer against the success criteria.  Be generous about wording —
this is a kid explaining an idea in their own words — but the idea in
the criteria must actually be there.

Question: ${question.prompt}
Success criteria: ${
      question.successCriteria || '(none authored — accept any sincere attempt)'
    }
Student answer: ${answer}`,
    temperature: 0.2,
    output: judgeSchema,
  });
  const raw = response.output;
  return {
    accepted: !!raw.accepted,
    feedback: String(raw.feedback || '').trim(),
  };
}
