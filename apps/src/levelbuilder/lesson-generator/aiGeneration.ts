import {Output} from 'ai';
import z from 'zod/v3';

import {getModel} from '@cdo/apps/aichat/api/client/helpers/modelHelpers';
import {generateText} from '@cdo/apps/aiGateway';
import {MultiFileSource, ProjectFileType} from '@cdo/apps/lab2/types';
import {Panel, PanelLayout} from '@cdo/apps/panels/types';
import {createUuid} from '@cdo/apps/utils';
import {
  AiChatModelIds,
  SafeAndSupportedImageTypes,
} from '@cdo/generated-scripts/sharedConstants';

import {uploadLevelAsset} from './levelApi';
import {LabType, SUPPORTED_LAB_TYPES} from './types';

const getTextModel = () => getModel(AiChatModelIds.GEMINI_2_5_FLASH);
const getImageModel = () => getModel(AiChatModelIds.GEMINI_2_5_FLASH_IMAGE);

// Stable identifiers for each prompt site, used as a console.log prefix so
// debugging conversations can refer to e.g. "the panels-plan prompt" without
// ambiguity. Add a new tag here if you add another generateText call site.
export const PROMPT_TAGS = {
  LESSON_OUTLINE: 'lesson-gen/lesson-outline',
  PANELS_PLAN: 'lesson-gen/panels-plan',
  PANELS_IMAGE: 'lesson-gen/panels-image',
  WEBLAB2_PLAN: 'lesson-gen/weblab2-plan',
} as const;

type PromptTag = (typeof PROMPT_TAGS)[keyof typeof PROMPT_TAGS];

// Logs the prompt and (when it returns) the model output to the browser
// console under a stable tag. We use console.groupCollapsed so the entries
// stay readable but don't dominate the console for users who aren't
// debugging.
function logPrompt(tag: PromptTag, prompt: string): void {
  console.groupCollapsed(`[${tag}] prompt sent`);
  console.log(prompt);
  console.groupEnd();
}

function logResponse(tag: PromptTag, response: unknown): void {
  console.groupCollapsed(`[${tag}] response received`);
  console.log(response);
  console.groupEnd();
}

const PANEL_LAYOUTS: PanelLayout[] = [
  'text-top-left',
  'text-top-center',
  'text-top-right',
  'text-bottom-left',
  'text-bottom-center',
  'text-bottom-right',
];

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
            .enum([
              'text-top-left',
              'text-top-center',
              'text-top-right',
              'text-bottom-left',
              'text-bottom-center',
              'text-bottom-right',
            ])
            .describe('Where the text overlay sits on the panel.'),
        })
      )
      .min(1)
      .max(8),
  }),
});

interface PanelPlan {
  text: string;
  imagePrompt: string;
  layout: PanelLayout;
}

// Returns the per-panel plan for a Panels-type level. We split planning from
// image generation so the levelbuilder gets per-panel progress and so a single
// failed image doesn't waste the whole panel set. Pass `lessonContext` to
// give the model the outline that frames the whole lesson, so the panels
// for this level stay coherent with the surrounding levels.
async function planPanels(
  description: string,
  lessonContext?: string,
  precedingLevels?: string
): Promise<PanelPlan[]> {
  const prompt = [
    'You are helping a curriculum author build a "Panels" level: a short,',
    'comic-strip-style sequence of full-width panels with overlay text.',
    'The level description follows. Plan a sequence of 3 to 6 panels that,',
    'in order, conveys the intent of the description for a middle-school',
    'classroom. Each panel needs short overlay text (1-3 sentences,',
    'markdown allowed) and an image prompt for a single 16:9 illustration',
    'with no embedded text.',
    ...(lessonContext
      ? [
          '',
          'Lesson context (this level is one piece of a larger lesson — keep',
          'tone, characters, and continuity consistent with this outline,',
          'but only produce content for the specific level description below):',
          lessonContext,
        ]
      : []),
    ...(precedingLevels
      ? [
          '',
          'Preceding levels in this lesson, in order. Use them for continuity',
          '— recurring characters, callbacks, building on earlier setups —',
          'but do NOT regenerate or summarize them; only build the level',
          'described last:',
          precedingLevels,
        ]
      : []),
    '',
    `Description: ${description}`,
  ].join('\n');

  logPrompt(PROMPT_TAGS.PANELS_PLAN, prompt);
  const response = await generateText({
    model: getTextModel(),
    prompt,
    output: panelsPlanSchema,
  });
  logResponse(PROMPT_TAGS.PANELS_PLAN, response.output);
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
  logPrompt(PROMPT_TAGS.PANELS_IMAGE, fullPrompt);
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
    }))
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
  levelName: string,
  description: string,
  callbacks: PanelGenerationCallbacks = {},
  lessonContext?: string,
  precedingLevels?: string
): Promise<Panel[]> {
  const plan = await planPanels(description, lessonContext, precedingLevels);
  callbacks.onPlanned?.(plan.length);

  const panels: Panel[] = [];
  for (let i = 0; i < plan.length; i++) {
    callbacks.onPanelStart?.(i, plan.length);
    const imageUrl = await generateAndUploadPanelImage(
      plan[i].imagePrompt,
      levelName,
      i
    );
    panels.push({
      key: `${levelName}-${createUuid()}`,
      text: plan[i].text,
      imageUrl,
      layout: plan[i].layout,
    });
  }
  return panels;
}

const weblabPlanSchema = Output.object({
  schema: z.object({
    longInstructions: z
      .string()
      .describe(
        'Student-facing instructions for the level, in markdown. Tell the student what to do — what they should change, add, or build on top of the starter code. 2-5 short paragraphs or a numbered list. No headings above ## level.'
      ),
    files: z
      .array(
        z.object({
          name: z
            .string()
            .describe(
              'Filename including extension (e.g. "index.html", "style.css", "script.js").'
            ),
          contents: z.string().describe('Full file contents.'),
        })
      )
      .min(1)
      .max(6),
  }),
});

export interface Weblab2Generation {
  startSources: MultiFileSource;
  longInstructions: string;
  // The raw file list as returned by the model, before it's wrapped into a
  // MultiFileSource. Exposed so callers can include it in continuity
  // context for later levels without re-parsing the wrapped form.
  files: {name: string; contents: string}[];
}

// Web Lab 2 stores its starter sources as a MultiFileSource, the same
// structure produced by prepareSourceForLevelbuilderSave in the codebridge
// editor. We synthesize a minimal one with a single root folder. Alongside
// the starter files we ask the model for student-facing instructions (the
// level's `long_instructions` markdown field). Pass `lessonContext` to
// give the model the lesson outline that frames this level, so the starter
// code and instructions stay coherent with surrounding panels.
export async function generateWeblab2Level(
  description: string,
  lessonContext?: string,
  precedingLevels?: string
): Promise<Weblab2Generation> {
  const prompt = [
    'You are helping a curriculum author build a "Web Lab 2" level: a',
    'small, self-contained website that a middle-school student will edit.',
    'Based on the description below, produce two things:',
    '  1. Student-facing instructions in markdown that tell the student',
    '     what to do in this level. Reference the file names you create',
    '     so the student knows where to look. Keep it tight.',
    '  2. Starter files (HTML / CSS / JS) the student will edit. Always',
    '     include an index.html. Keep total content under a few kilobytes',
    '     per file. Do not include external script or stylesheet links —',
    '     everything should be local.',
    ...(lessonContext
      ? [
          '',
          'Lesson context (this level is one piece of a larger lesson — keep',
          'continuity with prior steps, but only build the specific level',
          'described below):',
          lessonContext,
        ]
      : []),
    ...(precedingLevels
      ? [
          '',
          'Preceding levels in this lesson, in order. Use them for continuity',
          '— building on the same code, reusing characters or examples — but',
          'do NOT restate them; only build the level described last:',
          precedingLevels,
        ]
      : []),
    '',
    `Description: ${description}`,
  ].join('\n');

  logPrompt(PROMPT_TAGS.WEBLAB2_PLAN, prompt);
  const response = await generateText({
    model: getTextModel(),
    prompt,
    output: weblabPlanSchema,
  });
  const plan = response.output as {
    longInstructions: string;
    files: {name: string; contents: string}[];
  };
  logResponse(PROMPT_TAGS.WEBLAB2_PLAN, plan);
  if (!plan.files?.length) {
    throw new Error('Model returned no files');
  }
  if (!plan.longInstructions?.trim()) {
    throw new Error('Model returned no instructions');
  }

  // Weblab2 expects files to live directly in the implicit root folder "0"
  // — `folders` stays empty and every file's `folderId` is "0". A nested
  // folder with parentId "0" is technically valid, but the editor and
  // preview parent-by-id walks don't surface files that are one level
  // deeper than they expect, so they render as missing. See the
  // pre-existing weblab2 levels under dashboard/config/levels/custom/weblab2
  // for the canonical shape.
  const files: MultiFileSource['files'] = {};
  const fileIds: string[] = [];
  let activeFileId: string | null = null;
  for (const f of plan.files) {
    const id = createUuid();
    fileIds.push(id);
    // Activate index.html if present, otherwise the first file we saw.
    if (!activeFileId || /^index\.html?$/i.test(f.name)) {
      activeFileId = id;
    }
    files[id] = {
      id,
      name: f.name,
      contents: f.contents,
      folderId: '0',
      type: ProjectFileType.STARTER,
      active: false, // overwritten below for activeFileId
    };
  }
  if (activeFileId) {
    files[activeFileId] = {...files[activeFileId], active: true};
  }

  return {
    startSources: {
      folders: {},
      files,
      openFiles: fileIds,
    },
    longInstructions: plan.longInstructions.trim(),
    files: plan.files,
  };
}

// Build the labType enum from SUPPORTED_LAB_TYPES so adding a new lab is
// a single-line change. zod's z.enum requires a non-empty tuple, so we
// cast through the canonical list.
const supportedLabTypeEnum = z.enum(
  SUPPORTED_LAB_TYPES as unknown as [LabType, ...LabType[]]
);

const lessonOutlineSchema = Output.object({
  schema: z.object({
    levels: z
      .array(
        z.object({
          id: z
            .string()
            .describe(
              'Short kebab-case identifier unique within the lesson, e.g. "intro-1" or "build-form". No prefix; that is added separately.'
            ),
          labType: supportedLabTypeEnum.describe(
            '"panels" for narrative / explanation panels with overlay text on illustrations. "weblab2" for hands-on HTML/CSS/JS coding levels.'
          ),
          description: z
            .string()
            .describe(
              'A 1-3 sentence description of what this level should teach or do. Used as the AI prompt that builds the level content.'
            ),
        })
      )
      .min(2)
      .max(8),
  }),
});

export interface OutlineLevel {
  id: string;
  labType: LabType;
  description: string;
}

// Given a free-form outline of a lesson's learning experience, ask the
// model to break it down into a sequence of 2-8 levels alternating between
// Panels (narrative) and Weblab2 (hands-on coding). Returns the level
// specs the caller can drop straight into the per-level form.
export async function generateLessonOutline(
  outline: string
): Promise<OutlineLevel[]> {
  const prompt = [
    'You are helping a curriculum author plan a single lesson for a',
    'middle-school CS class. Break the outline below into a sequence of',
    '2 to 8 levels that, in order, take the student through the learning',
    'experience. Each level is one of:',
    '  - Panels: a short comic-strip-like sequence used for narrative,',
    '    introduction, framing, or summarising. No coding.',
    '  - Weblab2: a hands-on HTML/CSS/JS exercise where the student edits',
    '    starter code.',
    '',
    'Choose Panels for explanation/narrative and Weblab2 for practice.',
    'A typical lesson alternates: Panels intro -> Weblab2 practice ->',
    'Panels reflection, etc., but you can deviate when the outline asks.',
    '',
    'For each level, return:',
    '  - id: a short kebab-case identifier (e.g. "intro-1", "build-form")',
    '  - labType: "Panels" or "Weblab2"',
    '  - description: a 1-3 sentence description of what the level should',
    '    teach or do. This becomes the AI prompt that builds the actual',
    '    level content, so be concrete.',
    '',
    `Outline: ${outline}`,
  ].join('\n');

  logPrompt(PROMPT_TAGS.LESSON_OUTLINE, prompt);
  const response = await generateText({
    model: getTextModel(),
    prompt,
    output: lessonOutlineSchema,
  });
  const levels = (response.output as {levels: OutlineLevel[]}).levels;
  logResponse(PROMPT_TAGS.LESSON_OUTLINE, levels);
  if (!levels?.length) {
    throw new Error('Model returned no levels');
  }
  return levels;
}
