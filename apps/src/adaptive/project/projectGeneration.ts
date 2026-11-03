// What a generated project is built over, the template's editable files, and
// how the generated files land on them. The generation itself is
// generateProject; the student's plan it builds from is in plan.ts.

import {
  Channel,
  ProjectFile,
  ProjectFileType,
  ProjectSources,
} from '@cdo/apps/lab2/types';

import {isMultiFile} from './summarizeProjectFiles';

/** A file as the model returns it: a name and its full contents. */
export interface GeneratedFile {
  name: string;
  contents: string;
}

/** The channel key holding the trace a project was generated under. */
export const GENERATION_TRACE_KEY = 'generationTraceId';

// A file the student can edit: a starter file, locked or not, which an
// untyped file counts as. Assets have a url and no text; the other types are
// the level's and hidden from the student.
const isEditableFile = (file: ProjectFile): boolean =>
  !file.url &&
  (!file.type ||
    file.type === ProjectFileType.STARTER ||
    file.type === ProjectFileType.LOCKED_STARTER);

/** The files generation may rewrite: the ones the student can edit. */
export function editableFiles(
  sources: ProjectSources | undefined
): ProjectFile[] {
  const source = sources?.source;
  if (!isMultiFile(source)) return [];
  return Object.values(source.files).filter(isEditableFile);
}

/**
 * The sources with each generated file's contents in place of the editable
 * file of the same name. Files generation did not name keep their contents,
 * and names the project lacks are dropped. Undefined when nothing matched.
 */
export function applyGeneratedFiles(
  sources: ProjectSources,
  files: GeneratedFile[]
): ProjectSources | undefined {
  const source = sources.source;
  if (!isMultiFile(source)) return undefined;
  const contentsByName = new Map(files.map(file => [file.name, file.contents]));
  let matched = 0;
  const updated = Object.fromEntries(
    Object.entries(source.files).map(([id, file]) => {
      const contents = contentsByName.get(file.name);
      if (contents === undefined || !isEditableFile(file)) return [id, file];
      matched++;
      return [id, {...file, contents}];
    })
  );
  if (matched === 0) return undefined;
  return {...sources, source: {...source, files: updated}};
}

/** The trace the project was generated under; absent until it has been. */
export function generationTraceId(
  channel: Channel | undefined
): string | undefined {
  return channel?.labConfig?.adaptive?.[GENERATION_TRACE_KEY];
}
