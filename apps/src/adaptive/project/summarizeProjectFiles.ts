import {describeSourceFiles} from '@codebridge/utils/describeSourceFiles';

import {MultiFileSource, ProjectSources} from '@cdo/apps/lab2/types';

const FILE_LIMIT = 1500;
const TOTAL_LIMIT = 8000;

const isMultiFile = (source: unknown): source is MultiFileSource =>
  typeof source === 'object' &&
  source !== null &&
  'files' in source &&
  'folders' in source;

/**
 * The student's project files as text a model can read: the tutor's rollup,
 * truncated to a budget. Empty when there is nothing yet.
 */
export function summarizeProjectFiles(
  sources: ProjectSources | undefined
): string {
  const source = sources?.source;
  if (isMultiFile(source)) {
    return describeSourceFiles(source, {
      maxFileChars: FILE_LIMIT,
      maxTotalChars: TOTAL_LIMIT,
    });
  }
  return typeof source === 'string' ? source.slice(0, TOTAL_LIMIT) : '';
}
