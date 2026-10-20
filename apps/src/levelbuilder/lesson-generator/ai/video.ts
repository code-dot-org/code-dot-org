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

// A video level is created around a stand-in video; what the AI writes is
// the brief for the video that will replace it.

const videoPlanSchema = Output.object({
  schema: z.object({
    longInstructions: z
      .string()
      .describe(
        'Markdown shown on the level, opening with a "Video placeholder" ' +
          'heading and a one-line note that the video is still to be made, ' +
          'then a brief for it: what it must cover, in what order, roughly ' +
          'how long, and how it connects to the levels around it. 4-8 ' +
          'bullets. Real content for the video team, not a stub.'
      ),
    teacherMarkdown: z
      .string()
      .describe(
        'Teacher-only markdown: how to use the video in class — a question ' +
          'to pose before it, what to pause on, a follow-up. 1-3 sentences. ' +
          'May be the empty string.'
      ),
  }),
});

export interface VideoGeneration {
  longInstructions: string;
  teacherMarkdown: string;
}

export async function generateVideoLevel(
  ctx: LevelContext
): Promise<VideoGeneration> {
  const prompt = [
    'You are helping a curriculum author build a "Video" level: a page',
    'where the student watches a short video. The video itself does not',
    'exist yet — a stand-in plays in its place — so your job is to write the',
    'BRIEF the video team will produce it from, shown on the level until the',
    'real video replaces it. Assume a middle-school student unless the',
    'description below names a different grade band or audience.',
    '',
    'Produce:',
    '  - longInstructions: markdown opening with a "Video placeholder"',
    '    heading and one line saying the video is still to be made, then',
    '    the brief: what the video must cover, in what order, roughly how',
    '    long it runs, and how it connects to the surrounding levels. 4-8',
    '    bullets, concrete enough to storyboard from.',
    '  - teacherMarkdown: 1-3 sentences of teacher-only notes on using the',
    '    video in class (a question to pose first, what to pause on, a',
    '    follow-up). Empty string when nothing is worth saying.',
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
          '— the video can call back to what the student just did — but do',
          'NOT restate them; only build the level described last:',
          ctx.precedingLevels,
        ]
      : []),
    '',
    `Description: ${ctx.levelDescription}`,
  ].join('\n');

  const logContext = {level: ctx.levelName, subtask: 'plan'};
  logPrompt(PROMPT_TAGS.VIDEO_PLAN, prompt, logContext);
  const response = await generateText({
    model: getTextModel(),
    prompt,
    output: videoPlanSchema,
  });
  const plan = response.output as {
    longInstructions: string;
    teacherMarkdown: string;
  };
  logResponse(PROMPT_TAGS.VIDEO_PLAN, plan, logContext);
  if (!plan.longInstructions?.trim()) {
    throw new Error('Model returned no instructions');
  }
  return {
    longInstructions: plan.longInstructions.trim(),
    teacherMarkdown: plan.teacherMarkdown?.trim() ?? '',
  };
}
