import {Output} from 'ai';
import z from 'zod/v3';

import {generateText} from '@cdo/apps/aiGateway';
import {MultiFileSource, ProjectFileType} from '@cdo/apps/lab2/types';
import {createUuid} from '@cdo/apps/utils';

import {LevelContext} from '../../curriculum-generator/ai/context';
import {
  getTextModel,
  logPrompt,
  logResponse,
  PROMPT_TAGS,
} from '../../curriculum-generator/ai/shared';

const weblabPlanSchema = Output.object({
  schema: z.object({
    longInstructions: z
      .string()
      .describe(
        'STUB ONLY. A short, terse outline that the curriculum author will ' +
          'flesh out into real prose later. Render as a markdown bullet ' +
          'list of 4-8 items (use `- TODO:` prefixes), naming the files the ' +
          'student will touch and the moves they need to make — what to ' +
          'open, what to change, what to add, what success looks like. Do ' +
          'NOT write polished student-facing copy; this is scaffolding. No ' +
          'headings, no paragraphs.'
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
// editor. Alongside the starter files we produce a bullet-stub outline of
// the level's `long_instructions` — the curriculum author writes the final
// student-facing prose by hand later.
export async function generateWeblab2Level(
  ctx: LevelContext
): Promise<Weblab2Generation> {
  const prompt = [
    'You are helping a curriculum author build a "Web Lab 2" level: a',
    'small, self-contained website that a student will edit. Assume a',
    'middle-school student unless the description below names a different',
    'grade band or audience, in which case follow it. Based on the',
    'description below, produce two things:',
    '  1. A STUB outline for the student-facing instructions. Render as a',
    '     terse markdown bullet list of 4-8 items prefixed `- TODO:`. Name',
    '     the files the student will touch and the moves they need to',
    '     make. Do NOT write polished student-facing copy — the curriculum',
    '     author will write that by hand later. No headings, no paragraphs.',
    '  2. Starter files (HTML / CSS / JS) the student will edit. Always',
    '     include an index.html. Keep total content under a few kilobytes',
    '     per file. Do not include external script or stylesheet links —',
    '     everything should be local. Use a flat layout (one root folder)',
    '     by default; introduce subfolders only if the description asks',
    '     for them. Express subfolders as a `/` in the file name (e.g.',
    '     "css/style.css"). Honor any explicit file count or layout the',
    '     description specifies.',
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

  return {
    startSources: filesToMultiFileSource(plan.files, ProjectFileType.STARTER),
    longInstructions: plan.longInstructions.trim(),
    files: plan.files,
  };
}

// Wrap a flat list of {name, contents} into the MultiFileSource shape
// the lab2 weblab2 view expects. Same logic the codebridge editor uses
// when it saves: subfolders are expressed as forward-slash segments in
// the file name, each segment becomes a folder record with a fresh
// uuid, and exactly one file is marked active (top-level index.html
// when present, else the first file).
//
// Shared between the starter pass and the exemplar pass. The starter
// pass tags every file as STARTER so the lab knows they were given to
// the student; the exemplar pass leaves type undefined so its files
// read as plain solution source (matching what the codebridge editor
// stores when a teacher saves an exemplar by hand).
export function filesToMultiFileSource(
  plan: {name: string; contents: string}[],
  fileType: ProjectFileType | undefined
): MultiFileSource {
  const folders: MultiFileSource['folders'] = {};
  const folderIdByPath = new Map<string, string>();
  folderIdByPath.set('', '0');

  const files: MultiFileSource['files'] = {};
  const fileIds: string[] = [];
  let activeFileId: string | null = null;

  for (const f of plan) {
    const segments = f.name.split('/').filter(Boolean);
    const baseName = segments.pop() || f.name;
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
      ...(fileType ? {type: fileType} : {}),
      active: false,
    };
  }
  if (activeFileId) {
    files[activeFileId] = {...files[activeFileId], active: true};
  }
  return {folders, files, openFiles: fileIds};
}

// Schema for the exemplar pass. Same shape as the starter file list,
// without instructions — those belong to the student-facing pass and
// are written once. The exemplar is teacher-only content.
const weblabExemplarSchema = Output.object({
  schema: z.object({
    files: z
      .array(
        z.object({
          name: z.string(),
          contents: z.string().describe('Full file contents.'),
        })
      )
      .min(1)
      .max(20),
  }),
});

// Second AI pass: given the starter files we just wrote, produce a
// working solution with the same file names. This is the exemplar the
// teacher sees (gated by verified_instructor in summarize_for_lab2_properties);
// students never see it. Failures must be non-fatal at the caller — the
// student-facing level is already saved by the time we get here.
export async function generateWeblab2Exemplar(
  ctx: LevelContext,
  starterFiles: {name: string; contents: string}[]
): Promise<MultiFileSource> {
  const starterListing = starterFiles
    .map(f => `=== ${f.name} ===\n${f.contents}`)
    .join('\n\n');
  const prompt = [
    'You are writing the teacher-facing EXEMPLAR solution for a Web Lab 2',
    'level. The student sees the starter files below; their task is the',
    'level description below. Produce a complete, working solution that',
    'satisfies the description. Use the SAME file names as the starter',
    '(do not add new files unless the description requires them); keep',
    'the same languages, libraries, and structure.',
    '',
    'Constraints:',
    '  - Output must run in Web Lab 2 (HTML/CSS/JS only, no external',
    '    script or stylesheet links).',
    '  - Replace placeholder content with a real, working implementation.',
    '  - Keep it minimal — a model solution, not a portfolio piece. The',
    '    teacher uses this to check their own work or demo to students.',
    '',
    'Starter files:',
    starterListing,
    '',
    `Level description: ${ctx.levelDescription}`,
  ].join('\n');

  const logContext = {level: ctx.levelName, subtask: 'exemplar'};
  logPrompt(PROMPT_TAGS.WEBLAB2_EXEMPLAR, prompt, logContext);
  const response = await generateText({
    model: getTextModel(),
    prompt,
    output: weblabExemplarSchema,
  });
  const plan = response.output as {files: {name: string; contents: string}[]};
  logResponse(PROMPT_TAGS.WEBLAB2_EXEMPLAR, plan, logContext);
  if (!plan.files?.length) {
    throw new Error('Model returned no exemplar files');
  }
  return filesToMultiFileSource(plan.files, undefined);
}
