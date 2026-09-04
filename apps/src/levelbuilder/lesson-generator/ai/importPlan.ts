import {Output} from 'ai';
import z from 'zod/v3';

import {generateText} from '@cdo/apps/aiGateway';
import {
  getTextModel,
  logPrompt,
  logResponse,
  PROMPT_TAGS,
} from '@cdo/apps/levelbuilder/curriculum-generator/ai/shared';

import {PlannedLevel} from '../helpers/specsFromPlan';
import {
  BUBBLE_CHOICE_SUBLEVEL_LAB_TYPES,
  formatLabTypeList,
  SUPPORTED_LAB_TYPES,
} from '../types';

import {
  aichatPresetEnum,
  sublevelLabTypeEnum,
  supportedLabTypeEnum,
} from './outline';

// Interpret mode: the document's level list is canonical, so the course
// drafting rules (which govern planning) deliberately do not apply here.

const importedSublevelSchema = z.object({
  id: z
    .string()
    .describe(
      'Short kebab-case identifier from the lettered option, e.g. "a" or "rpg-game". No prefix.'
    ),
  labType: sublevelLabTypeEnum,
  description: z
    .string()
    .describe(
      "The option's scenario and task from the document, restated faithfully and compactly."
    ),
  aichatPreset: aichatPresetEnum.optional(),
});

const importPlanSchema = Output.object({
  schema: z.object({
    lessonOutline: z
      .string()
      .describe(
        "The document's lesson-level prose (title, question of the day, " +
          'objectives, lesson outline) reflowed as plain text — verbatim in ' +
          'substance, no invented content. Empty string when the document ' +
          'has none.'
      ),
    levels: z
      .array(
        z.object({
          id: z
            .string()
            .describe(
              'Short kebab-case identifier derived from the level number and ' +
                'title, e.g. "1-booleans" or "4-ai-chat". No prefix.'
            ),
          labType: supportedLabTypeEnum,
          description: z
            .string()
            .describe(
              "The level's scenario and task from the document, restated " +
                'faithfully and compactly. Do not embellish.'
            ),
          suppliedCode: z
            .string()
            .optional()
            .describe(
              'Code the document attaches to this weblab2 or pythonlab ' +
                'level, copied VERBATIM — no reformatting. Omit when the ' +
                'document has none for this level.'
            ),
          aichatPreset: aichatPresetEnum.optional(),
          sublevels: z
            .array(importedSublevelSchema)
            .min(2)
            .max(6)
            .optional()
            .describe(
              'For bubbleChoice cards built from lettered level groups: one ' +
                'entry per lettered option, in document order. Omit otherwise.'
            ),
        })
      )
      .min(1)
      .max(20),
  }),
});

export interface ImportedPlan {
  lessonOutline: string;
  levels: PlannedLevel[];
}

export async function parsePlanningDoc(
  lessonName: string,
  docText: string
): Promise<ImportedPlan> {
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
    '    Map document type names accordingly ("Panel" is panels, "Web Lab"',
    '    is weblab2, "Python Lab" is pythonlab, "Free Response" is',
    '    freeResponse, "Multiple Choice" is multi, "Matching" is match).',
    '    When a type has no supported equivalent, pick the closest',
    '    supported type and open the description with the original type',
    '    name in brackets.',
    '  - Lettered level groups (5a, 5b, 5c, …) are choice groups: emit ONE',
    '    bubbleChoice card for the group, with one sublevel per lettered',
    '    option and a parent description stating the choice offered.',
    `    Sublevel labType is one of ${formatLabTypeList(
      BUBBLE_CHOICE_SUBLEVEL_LAB_TYPES
    )}.`,
    '  - Code the document attaches to a weblab2 or pythonlab level goes',
    "    in that level's suppliedCode, VERBATIM. Code attached to any",
    '    other lab type goes in its description as a fenced block.',
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
    output: importPlanSchema,
  });
  const plan = response.output as ImportedPlan;
  logResponse(PROMPT_TAGS.LESSON_IMPORT, plan, logContext);
  if (!plan.levels?.length) {
    throw new Error('No levels found in the document');
  }
  return {
    lessonOutline: plan.lessonOutline?.trim() ?? '',
    levels: plan.levels,
  };
}
