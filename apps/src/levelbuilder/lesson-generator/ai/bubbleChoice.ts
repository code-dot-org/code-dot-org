import {Output} from 'ai';
import z from 'zod/v3';

import {generateText} from '@cdo/apps/aiGateway';
import {createUuid} from '@cdo/apps/utils';
import {SafeAndSupportedImageTypes} from '@cdo/generated-scripts/sharedConstants';

import {LessonContext} from '../../curriculum-generator/ai/context';
import {
  getImageModel,
  getTextModel,
  logPrompt,
  logResponse,
  PROMPT_TAGS,
} from '../../curriculum-generator/ai/shared';
import {uploadLevelAsset} from '../levelApi';

// Bubble Choice is a DSLDefined picker page whose sublevels are full
// Level records generated separately via the standard per-lab path.
// This file handles the parent's own copy plus per-sublevel thumbnails
// and teasers.

export interface BubbleChoiceMember {
  name: string;
  description: string;
}

// displayName is what the picker UI shows on each bubble. Without it,
// BubbleChoice#summarize_sublevels falls back to the raw kebab-case
// level name.
const sublevelPlanSchema = z.object({
  displayName: z
    .string()
    .describe(
      'Human-readable title shown on the bubble in the picker UI. Real ' +
        'student-facing copy (not a stub), 2-5 words, Title Case. Do NOT ' +
        'echo the internal level name.'
    ),
  bubbleChoiceDescription: z
    .string()
    .describe(
      'A one-sentence teaser shown next to the bubble on the picker page. ' +
        'Real student-facing copy (not a stub), roughly 8-16 words.'
    ),
  thumbnailPrompt: z
    .string()
    .describe(
      "Prompt for generating this bubble's thumbnail image. MUST describe " +
        'a single square illustration that contains NO text, letters, numbers, ' +
        "captions, or signs. The bubble's label is rendered separately as a " +
        'UI element. Describe subject + setting + style; keep it under 40 words.'
    ),
});

const bubbleChoicePlanSchema = Output.object({
  schema: z.object({
    displayName: z
      .string()
      .describe(
        'Short title shown at the top of the picker page. Real student- ' +
          'facing copy (not a stub), 2-6 words.'
      ),
    description: z
      .string()
      .describe(
        'Markdown blurb shown beneath the title, framing the choice for ' +
          'the student. Real copy (not a stub); 1-3 short paragraphs.'
      ),
    sublevels: z
      .array(sublevelPlanSchema)
      .describe(
        'One entry per sublevel, in the SAME order as the input members. ' +
          'MUST have exactly the same length as the input members list.'
      ),
  }),
});

export interface BubbleChoiceSublevelPlan {
  displayName: string;
  bubbleChoiceDescription: string;
  thumbnailPrompt: string;
}

export interface BubbleChoiceGeneration {
  displayName: string;
  description: string;
  // Same length + order as the members array passed in.
  sublevels: BubbleChoiceSublevelPlan[];
  summary: string;
}

export async function generateBubbleChoiceLevel(
  ctx: LessonContext & {
    parentLevelName: string;
    parentDescription: string;
    members: BubbleChoiceMember[];
    precedingLevels?: string;
  }
): Promise<BubbleChoiceGeneration> {
  const memberListing = ctx.members
    .map((m, i) => `  ${i + 1}. ${m.name}: ${m.description}`)
    .join('\n');
  const prompt = [
    'You are helping a curriculum author build a "Bubble Choice" level: a',
    'picker page where the student sees a set of bubbles (each a thumbnail',
    'image + one-line teaser) and chooses one to open. You are writing the',
    "PARENT's own copy plus per-bubble teasers and image prompts. The",
    'actual content behind each bubble will be generated separately as its',
    'own level.',
    '',
    'Produce:',
    '  - displayName: 2-6 word title shown at the top of the picker.',
    '  - description: 1-3 short markdown paragraphs framing the choice',
    '    for the student. Real student-facing prose (not a stub).',
    '  - sublevels: EXACTLY one entry per input member below, in the same',
    '    order. Each entry has displayName (2-5 word Title Case title shown',
    '    on the bubble; do not echo the internal level name),',
    '    bubbleChoiceDescription (a one-sentence teaser, real copy, ~8-16',
    '    words), and thumbnailPrompt (an image subject description for the',
    "    bubble's thumbnail, no embedded text).",
    '',
    'Sublevel members (in order):',
    memberListing,
    ...(ctx.unitOutline
      ? [
          '',
          `Unit context — this level sits inside the unit "${
            ctx.unitName ?? ''
          }". Use it for broad continuity but only produce the parent picker:`,
          ctx.unitOutline,
        ]
      : []),
    ...(ctx.lessonOutline
      ? [
          '',
          'Lesson context — the lesson outline the curriculum author wrote:',
          ctx.lessonOutline,
        ]
      : []),
    ...(ctx.precedingLevels
      ? [
          '',
          'Preceding levels in this lesson. Use them for continuity but do',
          'NOT restate them:',
          ctx.precedingLevels,
        ]
      : []),
    '',
    `Parent description: ${ctx.parentDescription}`,
  ].join('\n');

  const logContext = {level: ctx.parentLevelName, subtask: 'plan'};
  logPrompt(PROMPT_TAGS.BUBBLE_CHOICE_PLAN, prompt, logContext);
  const response = await generateText({
    model: getTextModel(),
    prompt,
    output: bubbleChoicePlanSchema,
  });
  const plan = response.output as {
    displayName: string;
    description: string;
    sublevels: BubbleChoiceSublevelPlan[];
  };
  logResponse(PROMPT_TAGS.BUBBLE_CHOICE_PLAN, plan, logContext);

  if (!plan.displayName?.trim()) {
    throw new Error('Model returned no displayName');
  }
  if (!plan.description?.trim()) {
    throw new Error('Model returned no description');
  }
  if (
    !Array.isArray(plan.sublevels) ||
    plan.sublevels.length !== ctx.members.length
  ) {
    throw new Error(
      `Model returned ${plan.sublevels?.length ?? 0} sublevels but ` +
        `${ctx.members.length} were requested`
    );
  }

  return {
    displayName: plan.displayName.trim(),
    description: plan.description.trim(),
    sublevels: plan.sublevels.map(s => ({
      displayName: s.displayName.trim(),
      bubbleChoiceDescription: s.bubbleChoiceDescription.trim(),
      thumbnailPrompt: s.thumbnailPrompt.trim(),
    })),
    summary: `bubble choice "${plan.displayName.trim()}" with ${
      ctx.members.length
    } option(s): ${ctx.members.map(m => m.name).join(', ')}`,
  };
}

// Square icon variant of the panels image-generation flow.
export async function generateBubbleChoiceThumbnail(
  thumbnailPrompt: string,
  sublevelName: string
): Promise<string> {
  const fullPrompt = [
    'CRITICAL CONSTRAINT — the output image MUST contain NO text of any',
    'kind. Zero letters, words, numbers, captions, labels, signs,',
    "watermarks, or written language anywhere in the picture. The bubble's",
    'title and teaser are rendered separately as UI elements; they are NOT',
    'part of the artwork. If you generate ANY readable characters, the',
    'thumbnail is unusable.',
    '',
    'When the subject involves things that would normally have text —',
    'signs, posters, screens, books, papers, code listings — draw those',
    'surfaces blank, with abstract shapes, or only suggested by shading.',
    '',
    'Generate a single square (1:1) icon-style illustration suitable for a',
    "bubble on a Code.org student's picker page. Keep the composition tight",
    'and readable at small sizes.',
    '',
    'Subject:',
    thumbnailPrompt,
  ].join('\n');
  const imageContext = {level: sublevelName, subtask: 'thumbnail'};
  logPrompt(PROMPT_TAGS.BUBBLE_CHOICE_THUMBNAIL, fullPrompt, imageContext);
  const response = await generateText({
    model: getImageModel(),
    prompt: fullPrompt,
  });
  logResponse(
    PROMPT_TAGS.BUBBLE_CHOICE_THUMBNAIL,
    (response.files || []).map(f => ({
      mediaType: f.mediaType,
      bytes: f.uint8Array.length,
    })),
    imageContext
  );
  const imageFile = (response.files || []).find(f =>
    f.mediaType.startsWith('image/')
  );
  if (!imageFile || imageFile.uint8Array.length === 0) {
    throw new Error('Model did not return an image');
  }
  if (
    !(SafeAndSupportedImageTypes as readonly string[]).includes(
      imageFile.mediaType
    )
  ) {
    throw new Error(`Unsupported image media type: ${imageFile.mediaType}`);
  }
  const ext = imageFile.mediaType.split('/')[1] || 'png';
  const filename = `${sublevelName}-thumb-${createUuid()}.${ext}`;
  return uploadLevelAsset(imageFile.uint8Array, filename, imageFile.mediaType);
}

function dslQuote(s: string): string {
  return `'${s.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;
}

// Picks a heredoc terminator absent from the body.
function dslHeredoc(body: string, defaultTag = 'MARKDOWN'): string {
  let tag = defaultTag;
  let suffix = 0;
  while (body.includes(tag)) {
    suffix += 1;
    tag = `${defaultTag}_${suffix}`;
  }
  return `<<${tag}\n${body}\n${tag}`;
}

// sublevelNames order becomes the picker order via
// ParentLevelsChildLevel.position.
export function renderBubbleChoiceDsl(
  name: string,
  displayName: string,
  description: string,
  sublevelNames: string[]
): string {
  const lines: string[] = [];
  lines.push(`name ${dslQuote(name)}`);
  lines.push(`display_name ${dslQuote(displayName)}`);
  lines.push(`description ${dslHeredoc(description.trim())}`);
  lines.push('');
  lines.push('sublevels');
  for (const sub of sublevelNames) {
    lines.push(`level ${dslQuote(sub)}`);
  }
  lines.push('');
  // Bare flag; routes the level through BubbleChoiceEntryPoint.
  lines.push('uses_lab2');
  return lines.join('\n') + '\n';
}
