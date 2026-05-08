import {LevelProperties} from '@cdo/apps/lab2/types';

// AI Lab Lab2-specific level properties. `mode` and `dynamicInstructions`
// arrive from the Rails side as JSON-serialized strings (see
// dashboard/app/models/levels/ailab.rb).
export interface AilabLevelProperties extends LevelProperties {
  mode?: string;
  dynamicInstructions?: string;
}
