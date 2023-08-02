import {RubricUnderstandingLevels} from '@cdo/apps/util/sharedConstants';
import i18n from '@cdo/locale';

export const UNDERSTAND_LEVEL_STRINGS = {
  [RubricUnderstandingLevels.EXTENSIVE]: i18n.extensiveEvidence(),
  [RubricUnderstandingLevels.CONVINCING]: i18n.convincingEvidence(),
  [RubricUnderstandingLevels.LIMITED]: i18n.limitedEvidence(),
  [RubricUnderstandingLevels.NONE]: i18n.noEvidence(),
};
