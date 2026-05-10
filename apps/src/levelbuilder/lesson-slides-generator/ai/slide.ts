import {Output} from 'ai';
import z from 'zod/v3';

import {generateText} from '@cdo/apps/aiGateway';
import {Panel, PanelLayout} from '@cdo/apps/panels/types';
import {createUuid} from '@cdo/apps/utils';

import {generateAndUploadPanelImage} from '../../lesson-generator/ai/panels';
import {
  getTextModel,
  logPrompt,
  logResponse,
  PROMPT_TAGS,
} from '../../lesson-generator/ai/shared';

const PANEL_LAYOUTS: PanelLayout[] = [
  'text-top-left',
  'text-top-center',
  'text-top-right',
  'text-bottom-left',
  'text-bottom-center',
  'text-bottom-right',
];

const slidePlanSchema = Output.object({
  schema: z.object({
    text: z
      .string()
      .describe(
        'Markdown text shown over the slide image. Length and tone follow the outline above: a casual elementary intro might be one sentence, a high-school technical lesson might be a few sentences naming specific syntax. Keep it short enough to fit comfortably as an overlay on a single 16:9 panel; if you need more space than that suggests, the description is asking for too much in one slide.'
      ),
    imagePrompt: z
      .string()
      .describe(
        'Prompt for generating the slide illustration. MUST describe a single 16:9 widescreen image that contains NO text, letters, numbers, captions, signs, labels, watermarks, or written language of any kind. The narrative text shows up as a separate UI overlay on top of the image — it is NOT part of the picture. If the slide subject involves text (a poster, sign, screen, book, code listing, message), describe the scene with those surfaces left blank, abstract, or only suggested by shapes — never spell out any words.'
      ),
    layout: z
      .enum([
        'text-top-left',
        'text-top-center',
        'text-top-right',
        'text-bottom-left',
        'text-bottom-center',
        'text-bottom-right',
      ])
      .describe('Where the text overlay sits on the image.'),
    teacherNote: z
      .string()
      .describe(
        'Short note for the teacher only — shown below the slide in the viewer when the active user is a teacher, never to students. Use it for prep tips: callouts to make before showing the slide, common student misconceptions, suggested classroom prompts, or links to think about. 1-3 sentences. Keep it concrete; do not repeat the slide text.'
      ),
  }),
});

interface SlidePlan {
  text: string;
  imagePrompt: string;
  layout: PanelLayout;
  teacherNote: string;
}

// Generate a single slide-as-panel from a free-text description. The
// description is whatever the levelbuilder typed (or whatever the
// outline AI wrote earlier) for this slide card. The optional outline
// is the page-level prompt the levelbuilder provided when planning the
// deck — we pass it through so the model can match its requested
// audience, depth, and tone instead of defaulting to a friendly
// elementary register.
//
// We make ONE gemini-flash call to plan the panel (text + image prompt
// + layout), then a second image call to render the picture, and
// assemble a Panel.
export async function generateSlide(
  lessonName: string,
  slideIndex: number,
  description: string,
  outline?: string
): Promise<Panel> {
  const prompt = [
    'You are helping a curriculum author build a single intro slide',
    'shown to students BEFORE a CS lesson begins. The slide is a',
    'Panels-app panel: one 16:9 illustration with a markdown text',
    'overlay. The slide should set context, motivation, or framing —',
    'never walk through a solution.',
    '',
    ...(outline?.trim()
      ? [
          'Outline (the levelbuilder typed this when planning the whole',
          'slide deck — match the audience, depth, vocabulary, and tone',
          'it implies; do not soften technical content if the outline',
          'asks for it):',
          outline.trim(),
          '',
        ]
      : [
          'No outline was provided. Default to a tone appropriate for the',
          'description below; do not assume any specific grade level.',
          '',
        ]),
    'For the supplied slide description, return:',
    '  - text: markdown to overlay. Match the audience and depth from',
    '    the outline above. If the description names specific syntax,',
    '    tags, or terminology, name them in the text too rather than',
    '    paraphrasing them away.',
    '  - imagePrompt: a prompt for a single 16:9 illustration with NO',
    '    embedded text. The narrative text is the overlay; the image is',
    '    the picture.',
    '  - layout: where the text overlay sits.',
    '  - teacherNote: a short note for the teacher only — prep tips,',
    '    misconceptions to anticipate, classroom prompts, or what to',
    '    emphasise before showing this slide. Never shown to students.',
    '',
    `Slide description: ${description}`,
  ].join('\n');

  const context = {level: lessonName, subtask: `slide-${slideIndex + 1}-plan`};
  logPrompt(PROMPT_TAGS.PANELS_PLAN, prompt, context);
  const response = await generateText({
    model: getTextModel(),
    prompt,
    output: slidePlanSchema,
  });
  logResponse(PROMPT_TAGS.PANELS_PLAN, response.output, context);
  const plan = response.output as SlidePlan;

  // Defensively normalise layout in case the model emits a bogus value.
  const layout: PanelLayout = PANEL_LAYOUTS.includes(plan.layout)
    ? plan.layout
    : 'text-bottom-center';

  const imageUrl = await generateAndUploadPanelImage(
    plan.imagePrompt,
    `${lessonName}-slide`,
    slideIndex
  );

  return {
    key: createUuid(),
    text: plan.text,
    imageUrl,
    layout,
    teacherNote: plan.teacherNote,
  };
}
