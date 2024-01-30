import PropTypes from 'prop-types';
import color from '@cdo/apps/util/color';

export const ITEM_TYPE = Object.freeze({
  NOT_STARTED: 1,
  VIEWED: 2,
  NEEDS_FEEDBACK: 3,
  FEEDBACK_GIVEN: 4,
  ASSESSMENT_LEVEL: ['star', color.neutral_dark],
  CHOICE_LEVEL: ['split', color.neutral_dark],
  KEEP_WORKING: ['rotate-left', color.neutral_dark],
  NO_ONLINE_WORK: ['dash', color.neutral_dark],
  IN_PROGRESS: ['circle-o', color.neutral_dark],
  SUBMITTED: ['circle', color.product_affirmative_default],
  VALIDATED: ['circle-check', color.product_affirmative_default],
});

export const ITEM_TYPE_SHAPE = PropTypes.oneOf(Object.values(ITEM_TYPE));
