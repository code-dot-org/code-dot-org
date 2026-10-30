import {MultiFileSource, ProjectFileType} from '@cdo/apps/lab2/types';
import {getFileExtension} from '@cdo/apps/lab2/utils/multiFileSourceUtils';

import {codeBlock} from './codeBlock';
import {getFilePath} from './getFilePath';

export interface DescribeSourceFilesOptions {
  /** File extensions left out, without the dot. */
  excludeExtensions?: string[];
  /** Characters kept per file; the rest is dropped. */
  maxFileChars?: number;
  /** Characters kept in all; later files are dropped once reached. */
  maxTotalChars?: number;
}

/**
 * Describes a student's files as text for a model: each file's path and
 * fenced contents, images as file path alone.
 */
export function describeSourceFiles(
  source: MultiFileSource,
  {
    excludeExtensions = [],
    maxFileChars = Infinity,
    maxTotalChars = Infinity,
  }: DescribeSourceFilesOptions = {}
): string {
  const parts = Object.values(source.files)
    .filter(
      file =>
        file.type !== ProjectFileType.VALIDATION &&
        file.type !== ProjectFileType.SYSTEM_SUPPORT &&
        !excludeExtensions.includes(getFileExtension(file.name))
    )
    .map(file => {
      const filePath = getFilePath(file, source.folders);
      // Image/binary files are stored as asset URLs with no text contents.
      if (file.url) {
        return `image: ${filePath}`;
      }
      return `filename: ${filePath}\n${codeBlock(
        file.contents?.slice(0, maxFileChars)
      )}`;
    });
  return withinBudget(parts, maxTotalChars).join('\n\n');
}

// The leading parts whose combined length fits.
function withinBudget(parts: string[], maxTotalChars: number): string[] {
  const kept: string[] = [];
  let total = 0;
  for (const part of parts) {
    if (total + part.length > maxTotalChars) break;
    kept.push(part);
    total += part.length;
  }
  return kept;
}
