import {Output} from 'ai';
import z from 'zod/v3';

import {generateText} from '@cdo/apps/aiGateway';
import {MultiFileSource} from '@cdo/apps/lab2/types';
import {
  authoringRulesLines,
  LevelContext,
} from '@cdo/apps/levelbuilder/curriculum-generator/ai/context';
import {
  getTextModel,
  logPrompt,
  logResponse,
  PROMPT_TAGS,
} from '@cdo/apps/levelbuilder/curriculum-generator/ai/shared';

import {
  CodebridgeGeneration,
  filesToMultiFileSource,
  generateCodebridgeExemplar,
  SourceFile,
  suppliedCodeLines,
} from './codebridge';

// Python Lab runs student code in pyodide: console output, blocking
// input(), and (patched) matplotlib work; the network and third-party
// packages don't. Mini-apps (neighborhood/theater) need hand-authored
// config, so the generator only produces plain console/matplotlib levels.
const PYTHON_RUNTIME_CONSTRAINTS = [
  'Python 3 standard library only — no third-party packages except',
  '  matplotlib, and no network access.',
  'Console I/O: print() output and blocking input() calls both work.',
];

const pythonlabPlanSchema = Output.object({
  schema: z.object({
    longInstructions: z
      .string()
      .describe(
        'STUB ONLY. A short, terse outline that the curriculum author will ' +
          'flesh out into real prose later. Format:\n\n' +
          '  TODOs:\n' +
          '  - name a file the student touches and the move they make\n' +
          '  - …\n\n' +
          'Exactly one literal `TODOs:` header, then 4-8 bullet items. Each ' +
          'bullet is bare content (no `TODO:` prefix on the bullets — the ' +
          'header sets the context once). Do NOT write polished student- ' +
          'facing copy; this is scaffolding. No other headings, no paragraphs.'
      ),
    files: z
      .array(
        z.object({
          name: z
            .string()
            .describe(
              'Filename including extension. MUST include a root-level ' +
                '"main.py" (the entry point). Allowed extensions: .py, ' +
                '.csv, .txt, .json. Use a flat layout by default.'
            ),
          contents: z.string().describe('Full file contents.'),
        })
      )
      .min(1)
      .max(20),
  }),
});

export type PythonlabGeneration = CodebridgeGeneration;

export async function generatePythonlabLevel(
  ctx: LevelContext
): Promise<PythonlabGeneration> {
  const prompt = [
    'You are helping a curriculum author build a "Python Lab" level: a',
    'small Python program that a student will edit and run in the browser.',
    'Assume a middle-school student unless the description below names a',
    'different grade band or audience, in which case follow it. Based on',
    'the description below, produce two things:',
    '  1. A STUB outline for the student-facing instructions. Format as a',
    '     single literal `TODOs:` line followed by 4-8 markdown bullets,',
    '     each bare content (no `TODO:` prefix on the bullet — the header',
    '     sets the context once). Name files the student touches and the',
    '     moves they make. Do NOT write polished student-facing copy — the',
    '     curriculum author writes that later. No other headings, no',
    '     paragraphs.',
    '  2. Starter files the student will edit. Always include main.py (the',
    '     entry point). Add extra .py modules or .csv/.txt/.json data files',
    '     only when the description calls for them. Keep total content',
    '     under a few kilobytes per file.',
    '',
    'Runtime constraints:',
    ...PYTHON_RUNTIME_CONSTRAINTS.map(line => `  - ${line}`),
    ...suppliedCodeLines(ctx),
    ...authoringRulesLines(ctx),
    ...(ctx.unitOutline
      ? [
          '',
          `Unit context — this level sits inside the unit "${
            ctx.unitName ?? ''
          }". Use it for broad continuity (audience/grade, recurring themes, tone, arc)`,
          'but build only the specific level described below:',
          ctx.unitOutline,
        ]
      : []),
    ...(ctx.lessonOutline
      ? [
          '',
          'Lesson context (this level is one piece of a larger lesson — keep',
          'continuity with prior steps, but only build the specific level',
          'described below):',
          ctx.lessonOutline,
        ]
      : []),
    ...(ctx.precedingLevels
      ? [
          '',
          'Preceding levels in this lesson, in order. Use them for continuity',
          '— building on the same code, reusing characters or examples — but',
          'do NOT restate them; only build the level described last:',
          ctx.precedingLevels,
        ]
      : []),
    '',
    `Description: ${ctx.levelDescription}`,
  ].join('\n');

  const planContext = {level: ctx.levelName, subtask: 'plan'};
  logPrompt(PROMPT_TAGS.PYTHONLAB_PLAN, prompt, planContext);
  const response = await generateText({
    model: getTextModel(),
    prompt,
    output: pythonlabPlanSchema,
  });
  const plan = response.output as {
    longInstructions: string;
    files: SourceFile[];
  };
  logResponse(PROMPT_TAGS.PYTHONLAB_PLAN, plan, planContext);
  if (!plan.files?.length) {
    throw new Error('Model returned no files');
  }
  if (!plan.files.some(f => f.name === 'main.py')) {
    throw new Error('Model returned no main.py');
  }
  if (!plan.longInstructions?.trim()) {
    throw new Error('Model returned no instructions');
  }

  return {
    // No STARTER tag: pythonlab levels store start files untyped
    // (matching what codebridge saves for hand-authored levels).
    startSources: filesToMultiFileSource(plan.files, undefined, /^main\.py$/),
    longInstructions: plan.longInstructions.trim(),
    files: plan.files,
  };
}

export async function generatePythonlabExemplar(
  ctx: LevelContext,
  starterFiles: SourceFile[]
): Promise<MultiFileSource> {
  return generateCodebridgeExemplar(ctx, starterFiles, {
    labLabel: 'Python Lab',
    constraints: PYTHON_RUNTIME_CONSTRAINTS,
    promptTag: PROMPT_TAGS.PYTHONLAB_EXEMPLAR,
  });
}
