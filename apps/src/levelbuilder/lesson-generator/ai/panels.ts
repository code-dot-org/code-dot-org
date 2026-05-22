import {Output} from 'ai';
import z from 'zod/v3';

import {generateText} from '@cdo/apps/aiGateway';
import {Panel, PanelLayout} from '@cdo/apps/panels/types';
import {createUuid} from '@cdo/apps/utils';
import {SafeAndSupportedImageTypes} from '@cdo/generated-scripts/sharedConstants';

import {uploadLevelAsset} from '../levelApi';

import {LevelContext} from './context';
import {
  getImageModel,
  getTextModel,
  logPrompt,
  logResponse,
  PROMPT_TAGS,
} from './shared';

const PANEL_LAYOUTS = [
  'text-top-left',
  'text-top-center',
  'text-top-right',
  'text-bottom-left',
  'text-bottom-center',
  'text-bottom-right',
] as const satisfies readonly PanelLayout[];

const panelsPlanSchema = Output.object({
  schema: z.object({
    panels: z
      .array(
        z.object({
          text: z
            .string()
            .describe(
              'Markdown text shown over the panel image. May be empty.'
            ),
          imagePrompt: z
            .string()
            .describe(
              'Prompt for generating the panel illustration. MUST describe ' +
                'a single 16:9 widescreen image that contains NO text, ' +
                'letters, numbers, captions, signs, labels, watermarks, or ' +
                'written language of any kind. The narrative text shows up ' +
                'as a separate UI overlay on top of the panel — it is NOT ' +
                'part of the picture. If the level subject involves text ' +
                '(a poster, sign, screen, book, code listing, message), ' +
                'describe the scene with those surfaces left blank, abstract, ' +
                'or only suggested by shapes — never spell out any words.'
            ),
          layout: z
            .enum(PANEL_LAYOUTS)
            .describe('Where the text overlay sits on the panel.'),
        })
      )
      .min(1)
      .max(12),
  }),
});

interface PanelPlan {
  text: string;
  imagePrompt: string;
  layout: PanelLayout;
}

// Returns the per-panel plan for a Panels-type level. We split planning from
// image generation so the levelbuilder gets per-panel progress and so a single
// failed image doesn't waste the whole panel set. Panels are narrative,
// so the target project (when set) mostly informs what to introduce or
// motivate; the actual code appears only in adjacent weblab2 levels.
async function planPanels(ctx: LevelContext): Promise<PanelPlan[]> {
  const prompt = [
    'You are helping a curriculum author build a "Panels" level: a short,',
    'comic-strip-style sequence of full-width panels with overlay text.',
    'The level description follows. Plan a sequence of panels (3 to 6 by',
    'default; if the description names a specific count or range, honor',
    'that) that, in order, conveys the intent of the description for a',
    'middle-school classroom. Each panel needs short overlay text (1-3',
    'sentences, markdown allowed) and an image prompt for a single 16:9',
    'illustration with no embedded text.',
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
    ...(ctx.targetProject
      ? [
          '',
          'Target project — the final app the lesson builds toward.',
          'Adjacent Web Lab 2 levels work toward this code, so these panels',
          'should motivate, foreshadow, or recap concepts that show up in',
          'it. The student never sees the code itself; use it as background',
          'so your story lands on relevant ideas. Do not paste code into',
          'panel text.',
          ctx.targetProject,
        ]
      : []),
    '',
    `Description: ${ctx.levelDescription}`,
  ].join('\n');

  const planContext = {level: ctx.levelName, subtask: 'plan'};
  logPrompt(PROMPT_TAGS.PANELS_PLAN, prompt, planContext);
  const response = await generateText({
    model: getTextModel(),
    prompt,
    output: panelsPlanSchema,
  });
  logResponse(PROMPT_TAGS.PANELS_PLAN, response.output, planContext);
  const plan = (response.output as {panels: PanelPlan[]}).panels;
  if (!plan?.length) {
    throw new Error('Model returned no panels');
  }
  // Defensively normalize layout to a known value so a model hallucination
  // doesn't render a broken panel.
  return plan.map(p => ({
    ...p,
    layout: PANEL_LAYOUTS.includes(p.layout) ? p.layout : 'text-bottom-center',
  }));
}

// Generates a single panel image, uploads it as a level asset, and returns
// the public asset URL. We feed the image prompt to gemini-2.5-flash-image
// and grab the first image file the model emits.
async function generateAndUploadPanelImage(
  imagePrompt: string,
  levelName: string,
  panelIndex: number
): Promise<string> {
  // Image models frequently bake captions, labels, signs, and watermarks
  // into output unless the constraint is loud and concrete. State the
  // no-text rule first, list the categories that count, and explicitly
  // tell it what to do when the subject contains something that would
  // normally have text on it.
  const fullPrompt = [
    'CRITICAL CONSTRAINT — the output image MUST contain NO text of any',
    'kind. Zero letters, words, numbers, captions, labels, signs,',
    'watermarks, speech bubbles, code, or written language anywhere in the',
    'picture. Any narrative text for this panel is rendered separately as a',
    'UI overlay; it is NOT part of the artwork. If you generate ANY readable',
    'characters in the image, the panel is unusable.',
    '',
    'When the subject involves things that would normally have text —',
    'signs, posters, screens, books, papers, code listings, t-shirts,',
    'storefronts, presentations — draw those surfaces blank, with abstract',
    'shapes, or only suggested by shading. Never spell anything out.',
    '',
    'Generate a single 16:9 widescreen illustration suitable for a',
    'middle-school classroom.',
    '',
    'Subject:',
    imagePrompt,
  ].join('\n');
  const imageContext = {
    level: levelName,
    subtask: `panel-${panelIndex + 1}`,
  };
  logPrompt(PROMPT_TAGS.PANELS_IMAGE, fullPrompt, imageContext);
  const response = await generateText({
    model: getImageModel(),
    prompt: fullPrompt,
  });
  // Log file metadata only — the binary payload would flood the console.
  logResponse(
    PROMPT_TAGS.PANELS_IMAGE,
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
  const filename = `${levelName}-panel-${
    panelIndex + 1
  }-${createUuid()}.${ext}`;
  return await uploadLevelAsset(
    imageFile.uint8Array,
    filename,
    imageFile.mediaType
  );
}

export interface PanelGenerationCallbacks {
  onPlanned?: (panelCount: number) => void;
  onPanelStart?: (panelIndex: number, panelCount: number) => void;
}

// End-to-end: plan the panels, then generate + upload each image. Returns
// a fully-populated panels array ready to PATCH onto the level.
export async function generatePanelsForLevel(
  ctx: LevelContext,
  callbacks: PanelGenerationCallbacks = {}
): Promise<Panel[]> {
  const plan = await planPanels(ctx);
  callbacks.onPlanned?.(plan.length);

  const panels: Panel[] = [];
  for (let i = 0; i < plan.length; i++) {
    callbacks.onPanelStart?.(i, plan.length);
    const imageUrl = await generateAndUploadPanelImage(
      plan[i].imagePrompt,
      ctx.levelName,
      i
    );
    panels.push({
      key: `${ctx.levelName}-${createUuid()}`,
      text: plan[i].text,
      imageUrl,
      layout: plan[i].layout,
    });
  }
  return panels;
}
