import {LevelProperties, MazeCell} from '@cdo/apps/lab2/types';

import {CsaViewMode} from '../constants';

export type CsaViewModeValue = (typeof CsaViewMode)[keyof typeof CsaViewMode];

// A single file in a Java Lab project, as represented in the legacy
// editorRedux EditorFilesMap and on disk in main.json. Java Lab keeps this
// shape verbatim under lab2; see decision #3 in the migration plan.
export interface JavalabSourceFile {
  text: string;
  tabOrder: number;
  isVisible?: boolean;
  isValidation?: boolean;
}

// The full set of files in a Java Lab project, keyed by filename.
export type JavalabSource = Record<string, JavalabSourceFile>;

// Discriminator. Used by useJavalabSources to confirm that
// ProjectSources.source from lab2's initial-load path is actually a
// Java Lab source object before dispatching it into editorRedux.
export function isJavalabSource(source: unknown): source is JavalabSource {
  if (typeof source !== 'object' || source === null) return false;
  if ('files' in source || 'folders' in source) return false;
  return Object.values(source as object).every(
    entry =>
      entry &&
      typeof entry === 'object' &&
      typeof (entry as JavalabSourceFile).text === 'string'
  );
}

// Server-side validation map: filename -> code string. In the lab2 payload
// from Rails this arrives names-only (empty strings) outside of start mode;
// the actual code is sent to Javabuilder server-side.
export type JavalabValidationSources = Record<string, string>;

// Java Lab specific properties on a level, layered onto the generic
// LevelProperties contract. Mirrors the serialized_attrs declared on
// dashboard/app/models/levels/javalab.rb plus the camelCased extras
// summarize_for_lab2_properties emits.
//
// startSources / exemplarSources are intentionally not redeclared here:
// the parent LevelProperties already types them as a broader union, and
// Java Lab reads them through getJavalabStartSources (in useJavalabSources)
// which narrows to JavalabSource at the boundary.
export interface JavalabLevelProperties extends LevelProperties {
  csaViewMode?: CsaViewModeValue;
  startDirection?: number;
  serializedMaze?: MazeCell[][];
  starterAssets?: {[friendlyName: string]: string};
  containedLevelNames?: string[];
  validation?: JavalabValidationSources;
  recaptchaSiteKey?: string;
  encryptedExamples?: string[];
  isProjectTemplateLevel?: boolean;
}
