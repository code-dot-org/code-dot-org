import PropTypes from 'prop-types';

import color from '@cdo/apps/util/color';
import i18n from '@cdo/locale';

export const ITEM_TYPE = Object.freeze({
  VIEWED: [i18n.viewed(), 1, undefined],
  NEEDS_FEEDBACK: [i18n.needsFeedback(), 2, undefined],
  FEEDBACK_GIVEN: [i18n.feedbackGiven(), 3, undefined],
  ASSESSMENT_LEVEL: [i18n.assessmentLevel(), 'star', color.neutral_dark60],
  CHOICE_LEVEL: [i18n.choiceLevel(), 'split', color.neutral_dark60],
  KEEP_WORKING: [i18n.markedAsKeepWorking(), 'rotate-left', color.neutral_dark],
  NO_ONLINE_WORK: [i18n.noOnlineWork(), 'dash', color.neutral_dark],
  IN_PROGRESS: [
    i18n.inProgress(),
    'circle-o',
    color.product_affirmative_default,
  ],
  SUBMITTED: [i18n.submitted(), 'circle', color.product_affirmative_default],
  VALIDATED: [
    i18n.validated(),
    'circle-check',
    color.product_affirmative_default,
  ],
});

export const ITEM_TYPE_SHAPE = PropTypes.oneOf(Object.values(ITEM_TYPE));
