import PropTypes from 'prop-types';

import color from '@cdo/apps/util/color';
import i18n from '@cdo/locale';

const makeObjectType = (title, icon, color) => ({
  title,
  icon,
  color,
});

export const ITEM_TYPE = Object.freeze({
  VIEWED: makeObjectType(i18n.viewed(), undefined, undefined),
  NEEDS_FEEDBACK: makeObjectType(i18n.needsFeedback(), undefined, undefined),
  FEEDBACK_GIVEN: makeObjectType(i18n.feedbackGiven(), undefined, undefined),
  NO_PROGRESS: makeObjectType(i18n.noProgress(), undefined, undefined),
  ASSESSMENT_LEVEL: makeObjectType(
    i18n.assessmentLevel(),
    'star',
    color.neutral_dark
  ),
  CHOICE_LEVEL: makeObjectType(
    i18n.choiceLevel(),
    'split',
    color.neutral_dark60
  ),
  KEEP_WORKING: makeObjectType(
    i18n.markedAsKeepWorking(),
    'rotate-left',
    color.neutral_dark
  ),
  NO_ONLINE_WORK: makeObjectType(
    i18n.noOnlineWork(),
    'dash',
    color.neutral_dark
  ),
  IN_PROGRESS: makeObjectType(
    i18n.inProgress(),
    'circle-o',
    color.product_affirmative_default
  ),
  SUBMITTED: makeObjectType(
    i18n.submitted(),
    'circle',
    color.product_affirmative_default
  ),
  VALIDATED: makeObjectType(
    i18n.validated(),
    'circle-check',
    color.product_affirmative_default
  ),
});

export const ITEM_TYPE_SHAPE = PropTypes.oneOf(Object.values(ITEM_TYPE));
