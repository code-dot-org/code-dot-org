import {query} from '@anthropic-ai/claude-agent-sdk';

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

// The model's choice is validated against the authored world; anything outside
// it degrades to a hint/none rather than being trusted.
function validateAction(
  raw: Record<string, unknown> | undefined,
  lesson: Lesson,
): TutorAction {
  if (!raw) {
    return {type: 'none'};
  }
  const text = typeof raw.text === 'string' ? raw.text : undefined;
  if (raw.action === 'hint' && text) {
    return {type: 'hint', text};
  }
  if (raw.action === 'select_experience') {
    const experienceId = String(raw.experienceId ?? '');
    if (lesson.experiences.some(e => e.id === experienceId)) {
      return {
        type: 'select_experience',
        experienceId,
        ...(raw.input && typeof raw.input === 'object'
          ? {input: raw.input as Record<string, unknown>}
          : {}),
      };
    }
    return text ? {type: 'hint', text} : {type: 'none'};
  }
  return {type: 'none', ...(text ? {text} : {})};
}
