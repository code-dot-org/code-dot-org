import PropTypes from 'prop-types';

import color from '@cdo/apps/util/color';

export const ITEM_TYPE = Object.freeze({
  VIEWED: 1,
  NEEDS_FEEDBACK: 2,
  FEEDBACK_GIVEN: 3,
  ASSESSMENT_LEVEL: ['star', color.neutral_dark],
  CHOICE_LEVEL: ['split', color.neutral_dark60],
  KEEP_WORKING: ['rotate-left', color.neutral_dark],
  NO_ONLINE_WORK: ['dash', color.neutral_dark],
  IN_PROGRESS: ['circle-o', color.product_affirmative_default],
  SUBMITTED: ['circle', color.product_affirmative_default],
  VALIDATED: ['circle-check', color.product_affirmative_default],
});

export const ITEM_TYPE_SHAPE = PropTypes.oneOf(Object.values(ITEM_TYPE));
