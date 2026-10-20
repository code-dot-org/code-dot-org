import {RubricUnderstandingLevels} from '@cdo/generated-scripts/sharedConstants';
import i18n from '@cdo/locale';

export const UNDERSTANDING_LEVEL_STRINGS = {
  [RubricUnderstandingLevels.EXTENSIVE]: i18n.extensiveEvidence(),
  [RubricUnderstandingLevels.CONVINCING]: i18n.convincingEvidence(),
  [RubricUnderstandingLevels.LIMITED]: i18n.limitedEvidence(),
  [RubricUnderstandingLevels.NONE]: i18n.noEvidence(),
};

export const UNDERSTANDING_LEVEL_STRINGS_V2 = {
  [RubricUnderstandingLevels.EXTENSIVE]: i18n.extensive(),
  [RubricUnderstandingLevels.CONVINCING]: i18n.convincing(),
  [RubricUnderstandingLevels.LIMITED]: i18n.limited(),
  [RubricUnderstandingLevels.NONE]: i18n.none(),
};

export const TAB_NAMES = {
  RUBRIC: 'rubric',
  SETTINGS: 'settings',
};
