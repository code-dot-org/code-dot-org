import {Output} from 'ai';
import z from 'zod/v3';

import {generateText} from '@cdo/apps/aiGateway';
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

import {dslHeredoc, dslQuote} from './dsl';

// The page IS the content, so this writes a real first draft, not a TODO stub.

const externalPlanSchema = Output.object({
  schema: z.object({
    title: z
      .string()
      .describe('Student-facing page title. 2-6 words, Title Case.'),
    markdown: z
      .string()
      .describe(
        'The page body as markdown — a real first draft the curriculum ' +
          'author edits, not a stub. Match the scope of the description: ' +
          'usually one short page (a heading or two, short paragraphs, ' +
          'lists where they help). Do not invent URLs, embeds, or image ' +
          'references; where the description calls for media, leave a ' +
          'bracketed placeholder like [video: how sensors collect data].'
      ),
    teacherMarkdown: z
      .string()
      .describe(
        'Teacher-only markdown shown alongside the page — prep tips, ' +
          'misconceptions to anticipate, or discussion prompts. 1-3 ' +
          'sentences. May be the empty string when nothing is worth saying.'
      ),
  }),
});

export interface ExternalGeneration {
  dslText: string;
  title: string;
  markdown: string;
  teacherMarkdown: string;
}

export async function generateExternalLevel(
  ctx: LevelContext
): Promise<ExternalGeneration> {
  const prompt = [
    'You are helping a curriculum author build an "External" level: a',
    'standalone page of markdown the student reads — narrative, framing,',
    'reference material, or a wrap-up. There is no interaction beyond',
    'reading. Assume a middle-school student unless the description below',
    'names a different grade band or audience, in which case follow it.',
    '',
    'Unlike most level types, the page IS the content: write a real first',
    'draft the curriculum author will edit down, not a TODO stub. Produce:',
    '  - title: a 2-6 word student-facing page title.',
    '  - markdown: the page body. Match the scope of the description —',
    '    usually one short page. Do not invent URLs, video embeds, or',
    '    image references; where the description calls for media, leave a',
    '    bracketed placeholder like [video: how sensors collect data].',
    '  - teacherMarkdown: 1-3 sentences of teacher-only notes (prep tips,',
    '    misconceptions, discussion prompts). Empty string when nothing is',
    '    worth saying.',
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
          'tone, characters, and continuity consistent with this outline,',
          'but only produce content for the specific level description below):',
          ctx.lessonOutline,
        ]
      : []),
    ...(ctx.precedingLevels
      ? [
          '',
          'Preceding levels in this lesson, in order. Use them for continuity',
          '— recurring characters, callbacks, building on earlier setups —',
          'but do NOT regenerate or summarize them; only build the level',
          'described last:',
          ctx.precedingLevels,
        ]
      : []),
    '',
    `Description: ${ctx.levelDescription}`,
  ].join('\n');

  const logContext = {level: ctx.levelName, subtask: 'plan'};
  logPrompt(PROMPT_TAGS.EXTERNAL_PLAN, prompt, logContext);
  const response = await generateText({
    model: getTextModel(),
    prompt,
    output: externalPlanSchema,
  });
  const plan = response.output as {
    title: string;
    markdown: string;
    teacherMarkdown: string;
  };
  logResponse(PROMPT_TAGS.EXTERNAL_PLAN, plan, logContext);
  if (!plan.markdown?.trim()) throw new Error('Model returned no markdown');
  if (!plan.title?.trim()) throw new Error('Model returned no title');

  const title = plan.title.trim();
  const markdown = plan.markdown.trim();
  const teacherMarkdown = plan.teacherMarkdown?.trim() ?? '';
  return {
    dslText: renderExternalDsl(ctx.levelName, title, markdown, teacherMarkdown),
    title,
    markdown,
    teacherMarkdown,
  };
}

export function renderExternalDsl(
  name: string,
  title: string,
  markdown: string,
  teacherMarkdown: string
): string {
  const lines: string[] = [];
  lines.push(`name ${dslQuote(name)}`);
  lines.push(`title ${dslQuote(title)}`);
  lines.push('');
  lines.push(`markdown ${dslHeredoc(markdown)}`);
  if (teacherMarkdown) {
    lines.push('');
    lines.push(`teacher_markdown ${dslHeredoc(teacherMarkdown)}`);
  }
  return lines.join('\n') + '\n';
}
