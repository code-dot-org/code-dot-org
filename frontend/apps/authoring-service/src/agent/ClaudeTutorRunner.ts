import {query} from '@anthropic-ai/claude-agent-sdk';
import {z} from 'zod';

import type {Lesson} from '../authoring/model.js';

import type {
  TutorAction,
  TutorRunner,
  TutorTurnInput,
} from './TutorRunner.js';

/**
 * Learner-time tutor: one constrained model call per learner event. The tutor
 * is the mirror of the authoring agent — no tools, no file access, no
 * curriculum mutation. It may only pick among the lesson's already-authored
 * experiences (validated here, not trusted from the model) or offer a hint.
 * Online-only by construction; the deterministic path never calls this.
 */
export class ClaudeTutorRunner implements TutorRunner {
  async runTurn(input: TutorTurnInput): Promise<TutorAction> {
    const lesson = findLesson(input);
    if (!lesson) {
      return {type: 'none', text: `Unknown lesson ${input.lessonId}.`};
    }

    const stream = query({
      prompt: buildPrompt(lesson, input),
      options: {
        model: 'sonnet',
        systemPrompt: TUTOR_SYSTEM_PROMPT,
        allowedTools: [],
        disallowedTools: ['Bash', 'Read', 'Write', 'Edit', 'Glob', 'Grep',
          'WebFetch', 'WebSearch', 'Task', 'NotebookEdit', 'TodoWrite'],
        settingSources: [],
        maxTurns: 1,
      },
    });

    let text = '';
    for await (const message of stream) {
      if (
        message.type === 'result' &&
        'result' in message &&
        typeof message.result === 'string'
      ) {
        text = message.result;
      }
    }
    return validateAction(parseAction(text), lesson);
  }
}

const TUTOR_SYSTEM_PROMPT = `You are a friendly AI tutor for a grades 3-5 computer science lesson. You react to what the learner just did. You reply with EXACTLY ONE JSON object and nothing else, in one of these shapes:
{"action": "hint", "text": "<one or two encouraging, concrete sentences for a 9-year-old>"}
{"action": "select_experience", "experienceId": "<id from the lesson>", "input": {<optional configuration for a widget>}, "text": "<one sentence telling the learner why>"}
{"action": "none", "text": "<optional short reply>"}

Rules: you may only select experienceIds that appear in the lesson. Prefer a hint over switching activities. Switch (or repeat with different input) when the learner is struggling or asks for more practice, respecting the author's adaptive policy if present. Keep language warm, simple, and brief.`;

function findLesson(input: TutorTurnInput): Lesson | undefined {
  for (const course of input.state.getSnapshot().courses) {
    for (const unit of course.units) {
      const lesson = unit.lessons.find(l => l.id === input.lessonId);
      if (lesson) {
        return lesson;
      }
    }
  }
  return undefined;
}

function buildPrompt(lesson: Lesson, input: TutorTurnInput): string {
  const experiences = lesson.experiences.map((experience, index) => ({
    position: index,
    experienceId: experience.id,
    kind: experience.kind,
    title: experience.title,
    ...(experience.kind === 'widget'
      ? {defaultInput: experience.defaultInput}
      : {}),
  }));
  return [
    `Lesson: ${lesson.displayName}`,
    lesson.goal ? `Goal: ${lesson.goal}` : '',
    `Experiences: ${JSON.stringify(experiences)}`,
    lesson.adaptivePolicy
      ? `Author's adaptive policy: ${JSON.stringify(lesson.adaptivePolicy)}`
      : '',
    `Recent learner events (oldest first): ${JSON.stringify(input.transcript.slice(-12))}`,
    'Respond with the single JSON action object now.',
  ]
    .filter(Boolean)
    .join('\n');
}

function parseAction(text: string): Record<string, unknown> | undefined {
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) {
    return undefined;
  }
  try {
    return JSON.parse(match[0]) as Record<string, unknown>;
  } catch {
    return undefined;
  }
}

const TEXT_MAX_LENGTH = 500;

// `text` may arrive as anything the model put in the JSON blob; keep it only
// if it is actually a string, and cap its length so a runaway completion
// can't push an unbounded string into the learner UI.
const CappedText = z
  .unknown()
  .optional()
  .transform(value =>
    typeof value === 'string' ? value.slice(0, TEXT_MAX_LENGTH) : undefined,
  );

// `input` configures a widget experience; only a plain object is a sane
// config bag. `typeof x === 'object'` alone also passes for arrays and for
// `null`, so both are rejected explicitly rather than forwarded as-is.
const PlainObjectInput = z
  .unknown()
  .optional()
  .transform(value =>
    value !== null && typeof value === 'object' && !Array.isArray(value)
      ? (value as Record<string, unknown>)
      : undefined,
  );

const CoercedExperienceId = z
  .unknown()
  .transform(value => (value == null ? '' : String(value)));

// The three action shapes from TUTOR_SYSTEM_PROMPT. Anything else — wrong
// `action` value, `action` missing entirely — fails to parse and degrades to
// `{type: 'none'}` below, same as an action this validation doesn't trust.
const RawTutorActionSchema = z.discriminatedUnion('action', [
  z.object({action: z.literal('hint'), text: CappedText}),
  z.object({
    action: z.literal('select_experience'),
    experienceId: CoercedExperienceId,
    input: PlainObjectInput,
    text: CappedText,
  }),
  z.object({action: z.literal('none'), text: CappedText}),
]);

// The model's choice is validated against the authored world; anything outside
// it degrades to a hint/none rather than being trusted.
function validateAction(
  raw: Record<string, unknown> | undefined,
  lesson: Lesson,
): TutorAction {
  if (!raw) {
    return {type: 'none'};
  }
  const parsed = RawTutorActionSchema.safeParse(raw);
  if (!parsed.success) {
    return {type: 'none'};
  }
  const action = parsed.data;

  if (action.action === 'hint') {
    return action.text ? {type: 'hint', text: action.text} : {type: 'none'};
  }
  if (action.action === 'select_experience') {
    if (lesson.experiences.some(e => e.id === action.experienceId)) {
      return {
        type: 'select_experience',
        experienceId: action.experienceId,
        ...(action.input ? {input: action.input} : {}),
      };
    }
    return action.text ? {type: 'hint', text: action.text} : {type: 'none'};
  }
  return {type: 'none', ...(action.text ? {text: action.text} : {})};
}
