// The AI build partner: turns a prompt into a complete set of Web Lab 2
// project files, personalized with the student's recorded answers.
//
// Two callers, one code path:
//   - System-invoked: a lab step's authored `starterPrompt`, run once per
//     student on first arrival (EmbeddedLab), generates their starting
//     site from their interview answers.
//   - Student-invoked: the student's own prompt (preset or free-form)
//     from BuildPartnerPanel, evolving their current project.
//
// The model returns the COMPLETE project — every file, whole contents —
// via a structured-output schema (the whole-file approach proven by the
// production Web Lab 2 AI Tutor; no diff formats to parse).  The result
// deliberately never touches lab2 redux: callers persist it through our
// own sources API and mount/remount the lab on it.
//
// Web Lab 2 only.  Music's Blockly workspace JSON is a different beast;
// generate support for it when a lesson actually needs it.

import {Output} from 'ai';
import z from 'zod/v3';

import {getModel} from '@cdo/apps/aichat/api/client/helpers/modelHelpers';
import {MultiFileSource, ProjectSources} from '@cdo/apps/lab2/types';
import {AiChatModelIds} from '@cdo/generated-scripts/sharedConstants';

import {initAiLessonsGatewayContext} from './aiGatewaySetup';
import {projectSourcesFromFiles} from './aiLessonsProjectManager';
import {loggedGenerateText} from './aiLog';
import {getCapabilitiesMarkdownFor} from './labCapabilities';
import {StudentInputs} from './studentInputs';
import {LabStep, LessonPlan} from './types';

// Flash keeps student-invoked builds snappy; flip to PRO if generation
// quality becomes the bottleneck.
const MODEL_ID = AiChatModelIds.GEMINI_2_5_FLASH;

const buildResultSchema = Output.object({
  schema: z.object({
    files: z
      .array(
        z.object({
          filename: z
            .string()
            .describe(
              'File name with extension, e.g. "index.html" or "style.css". No folders.'
            ),
          contents: z.string().describe('The complete contents of the file.'),
        })
      )
      .describe(
        'EVERY file the project should contain after this change — files you leave out are deleted. Whole contents, not fragments or diffs.'
      ),
    summary: z
      .string()
      .describe(
        'One short sentence, addressed to the student, saying what you built or changed.'
      ),
  }),
});

export interface BuildResult {
  sources: ProjectSources;
  changedFiles: string[];
  summary: string;
}

function formatInputs(inputs: StudentInputs): string {
  const records = Object.values(inputs).sort((a, b) =>
    a.at.localeCompare(b.at)
  );
  if (records.length === 0) return '(none yet)';
  return records.map(r => `  - "${r.prompt}" → ${r.answer}`).join('\n');
}

function formatCurrentFiles(source: MultiFileSource | undefined): string {
  if (!source) return '';
  const files = Object.values(source.files);
  if (files.length === 0) return '';
  const dump = files
    .map(f => `--- ${f.name} ---\n${f.contents.trimEnd()}`)
    .join('\n\n');
  return `\nCURRENT PROJECT FILES (evolve these — keep the student's own
work and content unless the request says otherwise):
${dump}\n`;
}

const SYSTEM_PROMPT = (
  lesson: LessonPlan,
  step: LabStep,
  inputs: StudentInputs,
  currentSource: MultiFileSource | undefined
) => `You are the AI build partner inside a K-12 web development lesson.
You write Web Lab 2 project files from a request, personalised with what
the student has shared about their project.

LESSON: ${lesson.title} — ${lesson.objective}
CURRENT STEP: ${step.title}${step.description ? ` — ${step.description}` : ''}

WHAT THE STUDENT HAS SHARED (use this as the project's content and vision):
${formatInputs(inputs)}
${formatCurrentFiles(currentSource)}
RULES
- Return the COMPLETE project: every file with its whole contents.
- Beginner-readable code: clear structure, small files, no frameworks,
  no build tools.  Comments only where they teach something.
- Use the student's real answers as content — their words, their
  favourites — never lorem ipsum or invented placeholders.
- Do not include <script> unless the request asks for behaviour.

${getCapabilitiesMarkdownFor('weblab2')}`;

// Files changed or added relative to what was there before, for the
// keep/undo affordance ("AI updated index.html, style.css").
function diffChangedFiles(
  before: MultiFileSource | undefined,
  after: ProjectSources
): string[] {
  const beforeByName: {[name: string]: string} = {};
  Object.values(before?.files || {}).forEach(f => {
    beforeByName[f.name] = f.contents;
  });
  return Object.values((after.source as MultiFileSource).files)
    .filter(f => beforeByName[f.name] !== f.contents)
    .map(f => f.name);
}

export async function generateProjectFiles(options: {
  lesson: LessonPlan;
  step: LabStep;
  prompt: string;
  inputs: StudentInputs;
  currentSource?: MultiFileSource;
}): Promise<BuildResult> {
  initAiLessonsGatewayContext();
  const {lesson, step, prompt, inputs, currentSource} = options;

  const response = await loggedGenerateText('build partner', {
    model: getModel(MODEL_ID),
    system: SYSTEM_PROMPT(lesson, step, inputs, currentSource),
    prompt: prompt.trim(),
    temperature: 0.4,
    output: buildResultSchema,
  });

  const raw = response.output as {
    files?: {filename?: string; contents?: string}[];
    summary?: string;
  };
  const files: {[filename: string]: string} = {};
  (raw.files || []).forEach(f => {
    const name = String(f.filename || '').trim();
    if (name) files[name] = String(f.contents ?? '');
  });
  if (Object.keys(files).length === 0) {
    throw new Error('The AI did not return any project files.');
  }

  const sources = projectSourcesFromFiles(files);
  return {
    sources,
    changedFiles: diffChangedFiles(currentSource, sources),
    summary: String(raw.summary || '').trim(),
  };
}
