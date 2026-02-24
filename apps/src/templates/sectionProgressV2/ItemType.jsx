import PropTypes from 'prop-types';

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
  ASSESSMENT_LEVEL: makeObjectType(i18n.assessmentLevel(), 'star', 'black'),
  CHOICE_LEVEL: makeObjectType(i18n.choiceLevel(), 'split', 'gray'),
  KEEP_WORKING: makeObjectType(
    i18n.markedAsKeepWorking(),
    'rotate-left',
    'black'
  ),
  NO_ONLINE_WORK: makeObjectType(i18n.noOnlineWork(), 'dash', 'black'),
  IN_PROGRESS: makeObjectType(i18n.inProgress(), 'circle-o', 'green'),
  SUBMITTED: makeObjectType(i18n.submitted(), 'circle', 'green'),
  VALIDATED: makeObjectType(i18n.validated(), 'circle-check', 'green'),
});

export const ITEM_TYPE_SHAPE = PropTypes.oneOf(Object.values(ITEM_TYPE));
