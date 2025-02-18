import {LevelProperties} from '@cdo/apps/lab2/types';
import {ValueOf} from '@cdo/apps/types/utils';
import {AiChatModelIds} from '@cdo/generated-scripts/sharedConstants';

import {AiCustomizations, Visibility} from './customizations';

export interface AichatLevelProperties extends LevelProperties {
  /**
   * Initial AI chat customizations set by the level.
   * For each field, levelbuilders may define the initial default value,
   * and visibility (hidden, readonly, or editable).
   * Visibility is not editable by the student; students can only change
   * the value if it is set to editable.
   */
  aichatSettings?: LevelAichatSettings;
}

/**
 * Level-defined AI customizations for student chat bots set by levelbuilders on the level's properties.
 * Levelbuilders can define initial default values for each field, as well as their visibilities.
 */
export interface LevelAichatSettings {
  initialCustomizations: AiCustomizations;
  visibilities: {[key in keyof AiCustomizations]: Visibility};
  // This system prompt is hidden from students and adds additional safety features or hidden guidelines to a level.
  levelSystemPrompt: string;
  /** If the presentation panel is hidden from the student. */
  hidePresentationPanel: boolean;
  /** list of ModelDescription.ids to limit the models available to choose from in the level */
  availableModelIds: ValueOf<typeof AiChatModelIds>[];
}
