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
        'Markdown text shown over the slide image. 1-3 sentences, on-message and student-friendly.'
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
  }),
});

interface SlidePlan {
  text: string;
  imagePrompt: string;
  layout: PanelLayout;
}

// Generate a single slide-as-panel from a free-text description. The
// description is whatever the levelbuilder typed (or whatever the
// outline AI wrote earlier) for this slide card. We make ONE
// gemini-flash call to plan the panel (text + image prompt + layout),
// then a second image call to render the picture, and assemble a Panel.
export async function generateSlide(
  lessonName: string,
  slideIndex: number,
  description: string
): Promise<Panel> {
  const prompt = [
    'You are helping a curriculum author build a single intro slide',
    'shown to a middle-school CS student BEFORE the lesson begins. The',
    'slide is a Panels-app panel: one 16:9 illustration with a short',
    'markdown text overlay. The slide should set context, motivation,',
    'or framing — never walk through a solution.',
    '',
    'For the supplied slide description, return:',
    '  - text: 1-3 sentences of student-facing markdown to overlay.',
    '  - imagePrompt: a prompt for a single 16:9 illustration with NO',
    '    embedded text. The narrative text is the overlay; the image is',
    '    the picture.',
    '  - layout: where the text overlay sits.',
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
  };
}
