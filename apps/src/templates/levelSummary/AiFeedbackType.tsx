import color from '@cdo/apps/util/color';
import i18n from '@cdo/locale';

const makeObjectType = (title: string, icon: string, color: string) => ({
  label: title,
  icon,
  color,
});

export const FEEDBACK_TYPE = Object.freeze({
  PROFICIENT: makeObjectType(
    i18n.proficient(),
    'circle-check',
    color.neutral_dark
  ),
  NEEDS_REVIEW: makeObjectType(
    i18n.needsReview(),
    'circle-exclamation',
    color.neutral_dark60
  ),
  NO_ATTEMPT: makeObjectType(
    i18n.noAttempt(),
    'circle-exclamation',
    color.neutral_dark
  ),
  FLAGGED: makeObjectType(i18n.flagged(), 'circle-minus', color.neutral_dark),
});

export type FEEDBACK_TYPE_SHAPE = keyof typeof FEEDBACK_TYPE;
export type FeedbackTypeValue = (typeof FEEDBACK_TYPE)[FEEDBACK_TYPE_SHAPE];
