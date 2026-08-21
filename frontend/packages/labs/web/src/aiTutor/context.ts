// What Web Lab tells the tutor about the project.
//
// Ported from `apps/src/weblab2/helpers/aiTutorContextHelper.ts`. Web Lab is
// the classic tutor lab: its project is HTML, CSS and JavaScript, which is text
// a model can read, and its answers are file rewrites the lab can apply.
//
// EVERY text file, not just the open one. A question about a stylesheet is
// usually a question about the markup it selects, and a tutor shown one file at
// a time answers about the file rather than about the page. What is left out is
// what the model cannot use or should not see:
//
//   - VALIDATION and SYSTEM_SUPPORT files, which are the lesson's machinery.
//   - `txt`, `csv` and `md`, which are data and prose, not the program.
//   - Binary files, which have no `contents` at all — they are named as images
//     so the model knows the page has them without being shown their bytes.

import type {AiTutorContext} from '@code-dot-org/aitutor';
import {getFileExtension, getFilePath} from '@code-dot-org/codebridge';
import {ProjectFileTypes, type MultiFileSource} from '@code-dot-org/core/api';

/** Prose and data, which are not the program. */
const NOT_CODE = ['txt', 'csv', 'md'];

/** The lesson's machinery, which is not the student's work. */
const NOT_THE_STUDENTS = [
  ProjectFileTypes.VALIDATION,
  ProjectFileTypes.SYSTEM_SUPPORT,
] as readonly string[];

const fence = (contents: string) => `\`\`\`\n${contents}\n\`\`\``;

/** The project's readable files, each labelled with where it lives. */
export const projectSourceCode = (
  source: MultiFileSource | undefined,
): string | undefined => {
  if (!source) {
    return undefined;
  }

  const described = Object.values(source.files)
    .filter(
      file =>
        !NOT_THE_STUDENTS.includes(file.type ?? '') &&
        !NOT_CODE.includes(getFileExtension(file.name)),
    )
    .map(file => {
      const path = getFilePath(file, source.folders);
      // An uploaded image lives in the assets backend and has no text; naming
      // it tells the model the page has one without showing it bytes.
      return file.url
        ? `image: ${path}`
        : `filename: ${path}\n${fence(file.contents)}`;
    });

  return described.length ? described.join('\n\n') : undefined;
};

export interface WebLabContextFacts {
  source: MultiFileSource | undefined;
  longInstructions?: string;
  /** Whether the student has previewed it, and whether they have changed it. */
  hasRun?: boolean;
  hasEdited?: boolean;
}

export const webLabContext = ({
  source,
  longInstructions,
  hasRun,
  hasEdited,
}: WebLabContextFacts): AiTutorContext => ({
  sourceCode: projectSourceCode(source),
  longInstructions,
  hasRun,
  hasEdited,
});
