import {LevelProperties} from '@cdo/apps/lab2/types';

export interface AilabLevelProperties extends LevelProperties {
  /** Stringified JSON describing AI Lab configuration. */
  mode?: string;
}
