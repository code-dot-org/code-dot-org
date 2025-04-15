import i18n from '@cdo/locale';

const makeObjectType = (title: string, icon: string) => ({
  label: title,
  icon,
});

export const FEEDBACK_TYPE = Object.freeze({
  PROFICIENT: makeObjectType(i18n.proficient(), 'circle-check'),
  NEEDS_REVIEW: makeObjectType(i18n.needsReview(), 'circle-exclamation'),
  NO_ATTEMPT: makeObjectType(i18n.noAttempt(), 'circle-minus'),
  FLAGGED: makeObjectType(i18n.flagged(), 'flag-pennant'),
});

export type FEEDBACK_TYPE_SHAPE = keyof typeof FEEDBACK_TYPE;
export type FeedbackTypeValue = (typeof FEEDBACK_TYPE)[FEEDBACK_TYPE_SHAPE];
