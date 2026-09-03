import {Output} from 'ai';
import z from 'zod/v3';

import {generateText} from '@cdo/apps/aiGateway';
import {MultiFileSource, ProjectFileType} from '@cdo/apps/lab2/types';
import {
  authoringRulesLines,
  LevelContext,
} from '@cdo/apps/levelbuilder/curriculum-generator/ai/context';
import {
  getTextModel,
  logPrompt,
  logResponse,
  PromptTag,
} from '@cdo/apps/levelbuilder/curriculum-generator/ai/shared';
import {createUuid} from '@cdo/apps/utils';

// Shared ground for the Codebridge-based labs (Web Lab 2, Python Lab):
// both store a MultiFileSource in start_sources, an encrypted exemplar in
// exemplar_sources, and generate as "plan files + stub instructions, then
// a separate exemplar pass".

export interface SourceFile {
  name: string;
  contents: string;
}

export interface CodebridgeGeneration {
  startSources: MultiFileSource;
  longInstructions: string;
  // Exposed for continuity-context reuse without re-parsing the MultiFileSource.
  files: SourceFile[];
}

export const codebridgeFilesSchema = z
  .array(
    z.object({
      name: z.string(),
      contents: z.string().describe('Full file contents.'),
    })
  )
  .min(1)
  .max(20);

// fileType is STARTER for weblab2 starter passes and undefined for
// exemplar passes and pythonlab (matching what codebridge stores when a
// teacher saves by hand). preferredActive names the file to open first
// in the editor when present at the root.
export function filesToMultiFileSource(
  plan: SourceFile[],
  fileType: ProjectFileType | undefined,
  preferredActive: RegExp = /^index\.html?$/i
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
      (segments.length === 0 && preferredActive.test(baseName))
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

const exemplarSchema = Output.object({
  schema: z.object({files: codebridgeFilesSchema}),
});

export interface ExemplarOptions {
  // Display name used in the prompt, e.g. 'Web Lab 2' or 'Python Lab'.
  labLabel: string;
  // Lab-specific constraint lines, rendered as bullets under 'Constraints:'.
  constraints: string[];
  promptTag: PromptTag;
}

// Teacher-facing exemplar pass shared by the Codebridge labs. Failure
// is survivable by design: the student-facing level is already saved
// before this runs.
export async function generateCodebridgeExemplar(
  ctx: LevelContext,
  starterFiles: SourceFile[],
  opts: ExemplarOptions
): Promise<MultiFileSource> {
  const starterListing = starterFiles
    .map(f => `=== ${f.name} ===\n${f.contents}`)
    .join('\n\n');
  const prompt = [
    `You are writing the teacher-facing EXEMPLAR solution for a ${opts.labLabel}`,
    'level. The student sees the starter files below; their task is the',
    'level description below. Produce a complete, working solution that',
    'satisfies the description. Use the SAME file names as the starter',
    '(do not add new files unless the description requires them); keep',
    'the same languages, libraries, and structure.',
    '',
    'Constraints:',
    ...opts.constraints.map(line => `  - ${line}`),
    '  - Replace placeholder content with a real, working implementation.',
    '  - Keep it minimal — a model solution, not a portfolio piece. The',
    '    teacher uses this to check their own work or demo to students.',
    ...authoringRulesLines(ctx),
    '',
    'Starter files:',
    starterListing,
    '',
    `Level description: ${ctx.levelDescription}`,
  ].join('\n');

  const logContext = {level: ctx.levelName, subtask: 'exemplar'};
  logPrompt(opts.promptTag, prompt, logContext);
  const response = await generateText({
    model: getTextModel(),
    prompt,
    output: exemplarSchema,
  });
  const plan = response.output as {files: SourceFile[]};
  logResponse(opts.promptTag, plan, logContext);
  if (!plan.files?.length) {
    throw new Error('Model returned no exemplar files');
  }
  return filesToMultiFileSource(plan.files, undefined);
}
