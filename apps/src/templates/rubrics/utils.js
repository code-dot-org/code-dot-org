import {RubricUnderstandingLevels} from '@cdo/apps/util/sharedConstants';
import i18n from '@cdo/locale';

export function understandingLevelName(understandingLevel) {
  switch (understandingLevel) {
    case RubricUnderstandingLevels.EXTENSIVE:
      return i18n.extensiveEvidence();
    case RubricUnderstandingLevels.CONVINCING:
      return i18n.convincingEvidence();
    case RubricUnderstandingLevels.LIMITED:
      return i18n.limitedEvidence();
    case RubricUnderstandingLevels.NONE:
      return i18n.noEvidence();
    default:
      throw new Error('Unknown understanding level: ' + understandingLevel);
  }
}
