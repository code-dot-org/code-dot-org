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
  PROMPT_TAGS,
} from '@cdo/apps/levelbuilder/curriculum-generator/ai/shared';

import {
  CodebridgeGeneration,
  codebridgeFilesSchema,
  filesToMultiFileSource,
  generateCodebridgeExemplar,
  SourceFile,
} from './codebridge';

const weblabPlanSchema = Output.object({
  schema: z.object({
    longInstructions: z
      .string()
      .describe(
        'STUB ONLY. A short, terse outline that the curriculum author will ' +
          'flesh out into real prose later. Format:\n\n' +
          '  TODOs:\n' +
          '  - name a file the student touches and the move they make\n' +
          '  - …\n\n' +
          'Exactly one literal `TODOs:` header, then 4-8 bullet items. Each ' +
          'bullet is bare content (no `TODO:` prefix on the bullets — the ' +
          'header sets the context once). Do NOT write polished student- ' +
          'facing copy; this is scaffolding. No other headings, no paragraphs.'
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

export type Weblab2Generation = CodebridgeGeneration;

export async function generateWeblab2Level(
  ctx: LevelContext
): Promise<Weblab2Generation> {
  const prompt = [
    'You are helping a curriculum author build a "Web Lab 2" level: a',
    'small, self-contained website that a student will edit. Assume a',
    'middle-school student unless the description below names a different',
    'grade band or audience, in which case follow it. Based on the',
    'description below, produce two things:',
    '  1. A STUB outline for the student-facing instructions. Format as a',
    '     single literal `TODOs:` line followed by 4-8 markdown bullets,',
    '     each bare content (no `TODO:` prefix on the bullet — the header',
    '     sets the context once). Name files the student touches and the',
    '     moves they make. Do NOT write polished student-facing copy — the',
    '     curriculum author writes that later. No other headings, no',
    '     paragraphs.',
    '  2. Starter files (HTML / CSS / JS) the student will edit. Always',
    '     include an index.html. Keep total content under a few kilobytes',
    '     per file. Do not include external script or stylesheet links —',
    '     everything should be local. Use a flat layout (one root folder)',
    '     by default; introduce subfolders only if the description asks',
    '     for them. Express subfolders as a `/` in the file name (e.g.',
    '     "css/style.css"). Honor any explicit file count or layout the',
    '     description specifies.',
    ...authoringRulesLines(ctx),
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
    files: SourceFile[];
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

export async function generateWeblab2Exemplar(
  ctx: LevelContext,
  starterFiles: SourceFile[]
): Promise<MultiFileSource> {
  return generateCodebridgeExemplar(ctx, starterFiles, {
    labLabel: 'Web Lab 2',
    constraints: [
      'Output must run in Web Lab 2 (HTML/CSS/JS only, no external',
      '  script or stylesheet links).',
    ],
    promptTag: PROMPT_TAGS.WEBLAB2_EXEMPLAR,
  });
}

// Template groups: multiple weblab2 members share one starter-source
// level via project_template_level_name; the template sits outside the
// activity tree.

const weblabTemplateSchema = Output.object({
  schema: z.object({files: codebridgeFilesSchema}),
});

export interface TemplateMember {
  name: string;
  description: string;
}

// Sees every member's description; produces files that all members
// build on without solving any one member's task.
export async function generateWeblab2Template(
  ctx: Omit<
    LevelContext,
    'levelName' | 'levelDescription' | 'precedingLevels'
  > & {
    templateName: string;
    members: TemplateMember[];
  }
): Promise<{
  startSources: MultiFileSource;
  files: SourceFile[];
}> {
  const memberList = ctx.members
    .map((m, i) => `  ${i + 1}. ${m.name}: ${m.description}`)
    .join('\n');
  const prompt = [
    'You are writing the SHARED STARTER FILES for a group of Web Lab 2',
    'levels in a single lesson. Each member level adds on top of these',
    'files; the student opens the same project across multiple levels and',
    'extends it. Your job is to produce files that:',
    '  - support every member level (every member can begin its task',
    '    without first having to recreate scaffolding)',
    '  - do NOT solve any single member level (e.g. if member 3 says',
    '    "add a navbar", do not include a navbar)',
    '  - keep total content under a few kilobytes per file',
    '  - stay flat (one root folder) unless a member explicitly asks for',
    '    subfolders; subfolders go as forward-slash segments in the name',
    '    (e.g. "css/style.css")',
    '  - always include index.html; add style.css and/or script.js only',
    '    if the member tasks suggest the student will need them',
    '  - have no external script or stylesheet links',
    '',
    'Members in this group:',
    memberList,
    ...authoringRulesLines(ctx),
    ...(ctx.unitOutline
      ? [
          '',
          `Unit context — the lesson sits inside the unit "${
            ctx.unitName ?? ''
          }". Use it for broad continuity:`,
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
    ...(ctx.targetProject
      ? [
          '',
          'Target project — the final app the lesson is building toward.',
          'Use the file structure and idiom as a hint for how to scaffold',
          'the template:',
          ctx.targetProject,
        ]
      : []),
  ].join('\n');

  const logContext = {level: ctx.templateName, subtask: 'template'};
  logPrompt(PROMPT_TAGS.WEBLAB2_TEMPLATE, prompt, logContext);
  const response = await generateText({
    model: getTextModel(),
    prompt,
    output: weblabTemplateSchema,
  });
  const plan = response.output as {files: SourceFile[]};
  logResponse(PROMPT_TAGS.WEBLAB2_TEMPLATE, plan, logContext);
  if (!plan.files?.length) throw new Error('Model returned no template files');
  return {
    startSources: filesToMultiFileSource(plan.files, ProjectFileType.STARTER),
    files: plan.files,
  };
}

const weblabTemplateLevelSchema = Output.object({
  schema: z.object({
    longInstructions: z
      .string()
      .describe(
        'STUB ONLY. Format as a single literal `TODOs:` line followed by ' +
          '4-8 markdown bullets, each bare content (no `TODO:` prefix on the ' +
          'bullet). Name what the student does in THIS member level on top ' +
          'of the shared template. The curriculum author writes final prose ' +
          'later.'
      ),
  }),
});

// Emits only long_instructions; the starter files come from the
// template pass. Prompt shows both the template's files and this
// member's description.
export async function generateWeblab2TemplateBackedLevel(
  ctx: LevelContext,
  templateFiles: SourceFile[]
): Promise<{longInstructions: string}> {
  const templateListing = templateFiles
    .map(f => `=== ${f.name} ===\n${f.contents}`)
    .join('\n\n');
  const prompt = [
    'You are writing the STUB student-facing instructions for a Web Lab 2',
    'level that shares its starter files with other levels in the lesson.',
    'The student already has the template files below open; this level',
    'asks them to do one specific thing on top of those files. Format as a',
    'single literal `TODOs:` line followed by 4-8 markdown bullets, each',
    'bare content (no `TODO:` prefix on the bullet). Name the files the',
    'student touches and the moves they make. Do NOT write polished prose;',
    'the curriculum author writes that later. No other headings.',
    '',
    ...authoringRulesLines(ctx),
    "Shared template files (already open in the student's editor):",
    templateListing,
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
          'Preceding levels in this lesson. Reference what the student',
          'already did when listing the TODOs:',
          ctx.precedingLevels,
        ]
      : []),
    '',
    `Level description: ${ctx.levelDescription}`,
  ].join('\n');

  const logContext = {level: ctx.levelName, subtask: 'template-level'};
  logPrompt(PROMPT_TAGS.WEBLAB2_TEMPLATE_LEVEL, prompt, logContext);
  const response = await generateText({
    model: getTextModel(),
    prompt,
    output: weblabTemplateLevelSchema,
  });
  const plan = response.output as {longInstructions: string};
  logResponse(PROMPT_TAGS.WEBLAB2_TEMPLATE_LEVEL, plan, logContext);
  if (!plan.longInstructions?.trim()) {
    throw new Error('Model returned no instructions');
  }
  return {longInstructions: plan.longInstructions.trim()};
}
