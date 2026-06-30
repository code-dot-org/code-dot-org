import {Output} from 'ai';
import z from 'zod/v3';

import {generateText} from '@cdo/apps/aiGateway';

import {LevelContext} from '../../curriculum-generator/ai/context';
import {
  getTextModel,
  logPrompt,
  logResponse,
  PROMPT_TAGS,
} from '../../curriculum-generator/ai/shared';

// Multi and Match levels are DSLDefined: their canonical source is a
// `.multi` or `.match` text file under dashboard/config/scripts, parsed
// by the Multi/Match DSL parser. The Rails create path REQUIRES the
// dsl_text on POST; the parser extracts the level name from a `name '...'`
// line in the text.
//
// Both generators run the same stub policy as Web Lab 2 — questions,
// answers, and prompts are deliberately terse placeholders the
// curriculum author will rewrite into real assessment prose later. We
// still produce structurally complete records (a `right` answer marked
// correct, distinct distractors, paired Q/A entries) so the level is
// runnable from the day the generator finishes.

// ─── Multi (multiple-choice) ─────────────────────────────────────────

const multiPlanSchema = Output.object({
  schema: z.object({
    question: z
      .string()
      .describe(
        'STUB question text (1-2 sentences). Placeholder prose; the curriculum author will rewrite.'
      ),
    answers: z
      .array(
        z.object({
          text: z.string().describe('STUB answer text — one short phrase.'),
          correct: z.boolean(),
        })
      )
      .min(3)
      .max(5)
      .describe(
        'Three to five answer choices, with exactly one marked correct. ' +
          'Distractors should be plausibly wrong, not nonsense.'
      ),
    longInstructions: z
      .string()
      .describe(
        'STUB only. Optional markdown bullet list of 1-4 `- TODO:` items ' +
          'giving the curriculum author hints (context to add, source ' +
          'material to cite, etc.). May be the empty string.'
      ),
  }),
});

export interface MultiGeneration {
  dslText: string;
  // Plain-text rendering of the question + right answer, used by the
  // preceding-levels formatter so downstream levels can reference what
  // was just asked without re-parsing the DSL.
  summary: string;
  // Bullet stub for the long_instructions property. Saved separately
  // because the DSL stores the question prose in `markdown`, but the
  // levelbuilder's existing pattern also writes generate_outline +
  // long_instructions for parity with the other lab types.
  longInstructions: string;
}

export async function generateMultiLevel(
  ctx: LevelContext
): Promise<MultiGeneration> {
  const prompt = [
    'You are helping a curriculum author build a multiple-choice assessment',
    'level. Output STUB content the author will rewrite — terse, generic',
    'placeholders that get the structure right so the level is runnable as',
    'soon as it lands, not polished prose.',
    '',
    'Produce:',
    '  - question: 1-2 sentence question text. Placeholder prose.',
    '  - answers: 3-5 short answer choices, exactly one marked correct.',
    '    Distractors should be plausibly wrong (related to the topic), not',
    '    nonsense.',
    '  - longInstructions: optional `- TODO:` bullet list of hints for the',
    '    author. May be empty.',
    ...(ctx.lessonOutline
      ? [
          '',
          'Lesson context (keep continuity, but only build this assessment):',
          ctx.lessonOutline,
        ]
      : []),
    ...(ctx.precedingLevels
      ? [
          '',
          'Preceding levels in this lesson. Reference what the student just',
          'did when writing the question:',
          ctx.precedingLevels,
        ]
      : []),
    '',
    `Description: ${ctx.levelDescription}`,
  ].join('\n');

  const logContext = {level: ctx.levelName, subtask: 'plan'};
  logPrompt(PROMPT_TAGS.MULTI_PLAN, prompt, logContext);
  const response = await generateText({
    model: getTextModel(),
    prompt,
    output: multiPlanSchema,
  });
  const plan = response.output as {
    question: string;
    answers: {text: string; correct: boolean}[];
    longInstructions: string;
  };
  logResponse(PROMPT_TAGS.MULTI_PLAN, plan, logContext);
  if (!plan.question?.trim()) throw new Error('Model returned no question');
  if (!plan.answers?.length) throw new Error('Model returned no answers');
  if (!plan.answers.some(a => a.correct)) {
    throw new Error('Model returned no correct answer');
  }

  const right = plan.answers.find(a => a.correct)!.text.trim();
  return {
    dslText: renderMultiDsl(ctx.levelName, plan.question.trim(), plan.answers),
    summary: `Q: ${plan.question.trim()}; A: ${right}`,
    longInstructions: plan.longInstructions?.trim() ?? '',
  };
}

// ─── Match (matching) ────────────────────────────────────────────────

const matchPlanSchema = Output.object({
  schema: z.object({
    markdown: z
      .string()
      .describe(
        'STUB instruction markdown shown above the matching grid. 1-3 ' +
          'lines. Placeholder prose.'
      ),
    pairs: z
      .array(
        z.object({
          question: z.string().describe('STUB question prompt (short).'),
          answer: z.string().describe('STUB matching answer (short).'),
        })
      )
      .min(3)
      .max(6)
      .describe(
        'Three to six question/answer pairs. The student matches each ' +
          'question on the left to its answer on the right.'
      ),
    longInstructions: z
      .string()
      .describe(
        'STUB only. Optional `- TODO:` bullet list of hints for the author. ' +
          'May be the empty string.'
      ),
  }),
});

export interface MatchGeneration {
  dslText: string;
  summary: string;
  longInstructions: string;
}

export async function generateMatchLevel(
  ctx: LevelContext
): Promise<MatchGeneration> {
  const prompt = [
    'You are helping a curriculum author build a matching assessment level.',
    'Output STUB content the author will rewrite — terse, generic',
    'placeholders that get the structure right so the level is runnable as',
    'soon as it lands, not polished prose.',
    '',
    'Produce:',
    '  - markdown: 1-3 short lines of instruction text shown above the',
    '    matching grid. Placeholder prose.',
    '  - pairs: 3-6 question/answer pairs. The student drags each answer',
    '    to its matching question; the order is randomized for them.',
    '  - longInstructions: optional `- TODO:` bullet list of hints for the',
    '    author. May be empty.',
    ...(ctx.lessonOutline
      ? [
          '',
          'Lesson context (keep continuity, but only build this assessment):',
          ctx.lessonOutline,
        ]
      : []),
    ...(ctx.precedingLevels
      ? [
          '',
          'Preceding levels in this lesson. Reference what the student just',
          'did when writing the pairs:',
          ctx.precedingLevels,
        ]
      : []),
    '',
    `Description: ${ctx.levelDescription}`,
  ].join('\n');

  const logContext = {level: ctx.levelName, subtask: 'plan'};
  logPrompt(PROMPT_TAGS.MATCH_PLAN, prompt, logContext);
  const response = await generateText({
    model: getTextModel(),
    prompt,
    output: matchPlanSchema,
  });
  const plan = response.output as {
    markdown: string;
    pairs: {question: string; answer: string}[];
    longInstructions: string;
  };
  logResponse(PROMPT_TAGS.MATCH_PLAN, plan, logContext);
  if (!plan.pairs?.length) throw new Error('Model returned no pairs');

  return {
    dslText: renderMatchDsl(ctx.levelName, plan.markdown, plan.pairs),
    summary: `Match (${plan.pairs.length} pairs): ${plan.pairs
      .slice(0, 3)
      .map(p => `${p.question} → ${p.answer}`)
      .join('; ')}`,
    longInstructions: plan.longInstructions?.trim() ?? '',
  };
}

// ─── DSL rendering ───────────────────────────────────────────────────

// Escape a string for inclusion inside a single-quoted DSL literal. The
// DSL parser is Ruby's `instance_eval` on a hand-written DSL class, so
// backslashes and single quotes are the only characters that need to
// be neutralized.
function dslQuote(s: string): string {
  return `'${s.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;
}

// Pick a heredoc terminator that doesn't appear anywhere in the body.
// Default 'MARKDOWN' covers every shipped multi/match file in source
// control; the fallback keeps us safe against pathological AI output.
function dslHeredoc(body: string, defaultTag = 'MARKDOWN'): string {
  let tag = defaultTag;
  let suffix = 0;
  while (body.includes(tag)) {
    suffix += 1;
    tag = `${defaultTag}_${suffix}`;
  }
  return `<<${tag}\n${body}\n${tag}`;
}

export function renderMultiDsl(
  name: string,
  question: string,
  answers: {text: string; correct: boolean}[]
): string {
  const lines: string[] = [];
  lines.push(`name ${dslQuote(name)}`);
  lines.push(`title ${dslQuote('TODO: title')}`);
  lines.push(`description ${dslQuote('')}`);
  lines.push(`question ${dslQuote(question)}`);
  for (const a of answers) {
    lines.push(`${a.correct ? 'right' : 'wrong'} ${dslQuote(a.text)}`);
  }
  lines.push('');
  lines.push(`markdown ${dslHeredoc(question)}`);
  lines.push('');
  lines.push('allow_multiple_attempts true');
  return lines.join('\n') + '\n';
}

export function renderMatchDsl(
  name: string,
  markdown: string,
  pairs: {question: string; answer: string}[]
): string {
  const lines: string[] = [];
  lines.push(`name ${dslQuote(name)}`);
  lines.push(`display_name ${dslQuote('TODO: title')}`);
  lines.push('');
  for (const p of pairs) {
    lines.push(`question ${dslQuote(p.question)}`);
    lines.push(`answer ${dslQuote(p.answer)}`);
  }
  lines.push('');
  if (markdown.trim()) {
    lines.push(`markdown ${dslHeredoc(markdown.trim())}`);
    lines.push('');
  }
  lines.push('allow_multiple_attempts true');
  return lines.join('\n') + '\n';
}
