import {Output} from 'ai';
import z from 'zod/v3';

import {generateText} from '@cdo/apps/aiGateway';
import {
  getTextModel,
  logPrompt,
  logResponse,
  PROMPT_TAGS,
} from '@cdo/apps/levelbuilder/curriculum-generator/ai/shared';

import {
  BUBBLE_CHOICE_SUBLEVEL_LAB_TYPES,
  CODEBRIDGE_LAB_TYPES,
  formatLabTypeList,
  LAB_LABELS,
  SUPPORTED_LAB_TYPES,
} from '../types';

import {
  OutlineLevel,
  outlineLevelSchema,
  outlineSublevelSchema,
  SUBLEVEL_COUNT,
} from './outline';

// Beyond these the document is not one lesson.
export const IMPORT_DOC_MAX_CHARS = 60_000;
export const IMPORT_LEVEL_LIMIT = 20;

const suppliedCodeField = z
  .string()
  .optional()
  .describe(
    'Code the document attaches to this item, copied verbatim; see the prompt.'
  );

const importedDescription = z
  .string()
  .describe(
    "The item's scenario and task from the document, restated faithfully and compactly. Do not embellish."
  );

const importedSublevelSchema = outlineSublevelSchema.extend({
  id: z
    .string()
    .describe(
      'Short kebab-case identifier from the lettered option, e.g. "a" or "rpg-game". No prefix.'
    ),
  description: importedDescription,
  suppliedCode: suppliedCodeField,
});

const importedPlanShape = z.object({
  lessonOutline: z
    .string()
    .describe(
      "The document's lesson-level prose (title, question of the day, objectives, lesson outline) reflowed as plain text — verbatim in substance, no invented content. Empty string when the document has none."
    ),
  levels: z
    .array(
      outlineLevelSchema.extend({
        id: z
          .string()
          .describe(
            'Short kebab-case identifier derived from the level number and title, e.g. "1-booleans" or "4-ai-chat". No prefix.'
          ),
        description: importedDescription,
        suppliedCode: suppliedCodeField,
        sublevels: z
          .array(importedSublevelSchema)
          .min(SUBLEVEL_COUNT.min)
          .optional()
          .describe(
            'For bubbleChoice cards built from lettered level groups: one entry per lettered option, in document order. Omit otherwise.'
          ),
      })
    )
    .min(1),
  unsupported: z
    .array(z.string())
    .describe(
      'Headings of levels whose type has no supported equivalent; these are left out of `levels`.'
    ),
});

export interface ImportedPlan {
  lessonOutline: string;
  levels: OutlineLevel[];
  unsupported: string[];
}

export async function parsePlanningDoc(
  lessonName: string,
  docText: string
): Promise<ImportedPlan> {
  const labNames = SUPPORTED_LAB_TYPES.map(
    labType => `"${LAB_LABELS[labType]}" is ${labType}`
  ).join(', ');
  const prompt = [
    "You are converting a curriculum team's lesson planning document into",
    'level cards for the code.org lesson generator. The document defines',
    'the levels; your job is to interpret it, not to redesign it.',
    '',
    "The document's level list is CANONICAL: emit exactly one card per",
    'level, in document order. Do not add, remove, merge, or reorder',
    'levels, and do not invent panels, assessments, or vocabulary',
    'treatments the document does not contain.',
    '',
    'Rules:',
    `  - labType is one of ${formatLabTypeList(SUPPORTED_LAB_TYPES)}.`,
    `    Document type names map as: ${labNames}. When a type has no`,
    '    supported equivalent, leave the level out and list its heading in',
    '    `unsupported`.',
    '  - Lettered level groups (5a, 5b, 5c, …) are choice groups: emit ONE',
    '    bubbleChoice card for the group, with one sublevel per lettered',
    '    option and a parent description stating the choice offered. A lone',
    '    lettered level is a regular level.',
    `    Sublevel labType is one of ${formatLabTypeList(
      BUBBLE_CHOICE_SUBLEVEL_LAB_TYPES
    )}.`,
    `  - Code the document attaches to a ${formatLabTypeList(
      CODEBRIDGE_LAB_TYPES
    )} level or option goes in that item's suppliedCode, VERBATIM. Code`,
    '    attached to any other lab type goes in its description as a fenced',
    '    block.',
    '  - weblab2 levels that build one app across several steps share a',
    '    templateGroup; independent projects get none.',
    '  - Screenshot placeholders and images cannot be imported; where one',
    '    clearly carries content, note what it showed in the description.',
    '',
    `Lesson: ${lessonName}`,
    '',
    'Document:',
    docText,
  ].join('\n');

  const logContext = {level: lessonName, subtask: 'import'};
  logPrompt(PROMPT_TAGS.LESSON_IMPORT, prompt, logContext);
  const response = await generateText({
    model: getTextModel(),
    prompt,
    output: Output.object({schema: importedPlanShape}),
  });
  const parsed = importedPlanShape.safeParse(response.output);
  if (!parsed.success) {
    throw new Error(
      'The import came back in an unexpected shape. Try again, or trim the document to one lesson.'
    );
  }
  const plan = parsed.data;
  logResponse(PROMPT_TAGS.LESSON_IMPORT, plan, logContext);
  if (plan.levels.length > IMPORT_LEVEL_LIMIT) {
    throw new Error(
      `The document has ${plan.levels.length} levels; a lesson has at most ${IMPORT_LEVEL_LIMIT}.`
    );
  }
  const crowded = plan.levels.find(
    level => (level.sublevels?.length ?? 0) > SUBLEVEL_COUNT.max
  );
  if (crowded) {
    throw new Error(
      `Level "${crowded.id}" has ${crowded.sublevels?.length} options; a choice offers at most ${SUBLEVEL_COUNT.max}.`
    );
  }
  return {
    lessonOutline: plan.lessonOutline.trim(),
    levels: plan.levels,
    unsupported: plan.unsupported,
  };
}
