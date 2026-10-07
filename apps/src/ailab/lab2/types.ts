import {LevelProperties, ProjectSources} from '@cdo/apps/lab2/types';

/** `source` is the student's work as a JSON string, or empty before any is saved. */
export interface AilabProjectSources extends ProjectSources {
  source: string;
}

export interface AilabLevelProperties extends LevelProperties {
  /** Stringified JSON describing AI Lab configuration. */
  mode?: string;
  /** Stringified mapping of dynamic instructions key to text. */
  dynamicInstructions?: string;
}
