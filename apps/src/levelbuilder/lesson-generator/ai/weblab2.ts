import {Output} from 'ai';
import z from 'zod/v3';

import {generateText} from '@cdo/apps/aiGateway';
import {MultiFileSource, ProjectFileType} from '@cdo/apps/lab2/types';
import {createUuid} from '@cdo/apps/utils';

import {LevelContext} from './context';
import {getTextModel, logPrompt, logResponse, PROMPT_TAGS} from './shared';

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
              'Filename including extension. May contain forward-slash ' +
                'separators to place the file in a subfolder, e.g. ' +
                '"index.html", "css/style.css", "js/lib/util.js". Use a ' +
                'flat layout by default; only nest folders if the level ' +
                'description asks for them or the project genuinely needs ' +
                'organisation.'
            ),
          contents: z.string().describe('Full file contents.'),
        })
      )
      .min(1)
      .max(20),
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
// editor. Alongside the starter files we ask the model for student-facing
// instructions (the level's `long_instructions` markdown field). The full
// LevelContext is passed in so the prompt can fold in every outer scope
// (lesson outline, preceding levels, and — once those branches land —
// unit outline + target project) without growing more positional args.
export async function generateWeblab2Level(
  ctx: LevelContext
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
    '     everything should be local. Use a flat layout (one root folder)',
    '     by default; introduce subfolders only if the description asks',
    '     for them. Express subfolders as a `/` in the file name (e.g.',
    '     "css/style.css"). Honor any explicit file count or layout the',
    '     description specifies.',
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
    ...(ctx.targetProject
      ? [
          '',
          'Target project — the final state the lesson is building toward.',
          'The student will reach something like this by the last weblab2',
          'level. Use it as a destination: pick file structure, library',
          'choices, naming, and idiom from it so the lesson reads as one',
          'coherent build. But DO NOT just emit this verbatim — this level',
          'should be a step along the way, partial relative to the final',
          'goal. Where the description and target disagree, the description',
          'wins (it scopes this specific level).',
          ctx.targetProject,
        ]
      : []),
    '',
    `Description: ${ctx.levelDescription}`,
  ].join('\n');

  const planContext = {level: ctx.levelName, subtask: 'plan'};
  logPrompt(PROMPT_TAGS.WEBLAB2_PLAN, prompt, planContext);
  const response = await generateText({
    model: getTextModel(),
    prompt,
    output: weblabPlanSchema,
  });
  const plan = response.output as {
    longInstructions: string;
    files: {name: string; contents: string}[];
  };
  logResponse(PROMPT_TAGS.WEBLAB2_PLAN, plan, planContext);
  if (!plan.files?.length) {
    throw new Error('Model returned no files');
  }
  if (!plan.longInstructions?.trim()) {
    throw new Error('Model returned no instructions');
  }

  // The implicit root folder has id "0". Subfolders sit under it via
  // `parentId: "0"`; their own ids are uuids referenced by files in them.
  // See dashboard/config/levels/custom/weblab2 for the canonical shape.
  const folders: MultiFileSource['folders'] = {};
  const folderIdByPath = new Map<string, string>();
  folderIdByPath.set('', '0');

  const files: MultiFileSource['files'] = {};
  const fileIds: string[] = [];
  let activeFileId: string | null = null;

  for (const f of plan.files) {
    const segments = f.name.split('/').filter(Boolean);
    const baseName = segments.pop() || f.name;
    // Walk the folder path, creating any missing folder entries.
    let parentId = '0';
    let pathSoFar = '';
    for (const segment of segments) {
      pathSoFar = pathSoFar ? `${pathSoFar}/${segment}` : segment;
      const cached = folderIdByPath.get(pathSoFar);
      if (cached !== undefined) {
        parentId = cached;
        continue;
      }
      const folderId = createUuid();
      folders[folderId] = {
        id: folderId,
        name: segment,
        parentId,
        open: true,
      };
      folderIdByPath.set(pathSoFar, folderId);
      parentId = folderId;
    }

    const id = createUuid();
    fileIds.push(id);
    // Prefer top-level index.html for the active file, else the first file.
    if (
      !activeFileId ||
      (segments.length === 0 && /^index\.html?$/i.test(baseName))
    ) {
      activeFileId = id;
    }
    files[id] = {
      id,
      name: baseName,
      contents: f.contents,
      folderId: parentId,
      type: ProjectFileType.STARTER,
      active: false, // overwritten below for activeFileId
    };
  }
  if (activeFileId) {
    files[activeFileId] = {...files[activeFileId], active: true};
  }

  return {
    startSources: {
      folders,
      files,
      openFiles: fileIds,
    },
    longInstructions: plan.longInstructions.trim(),
    files: plan.files,
  };
}
