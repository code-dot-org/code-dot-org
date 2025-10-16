import {SectionLoginType} from '@cdo/generated-scripts/sharedConstants';

export const NON_LMS_LOGIN_TYPES = [
  SectionLoginType.word,
  SectionLoginType.picture,
  SectionLoginType.email,
];
export const LOGIN_TYPES_WITH_PASSWORD_COLUMN = NON_LMS_LOGIN_TYPES;

export const LOGIN_TYPES_WITH_ACTIONS_COLUMN = [
  SectionLoginType.word,
  SectionLoginType.picture,
  SectionLoginType.email,
  SectionLoginType.google_classroom,
  SectionLoginType.clever,
  SectionLoginType.lti_v1,
];

export const PICTURE_OR_WORD_LOGIN_TYPES = [
  SectionLoginType.word,
  SectionLoginType.picture,
];
export const LOGIN_TYPES_WITH_GENDER_COLUMN = PICTURE_OR_WORD_LOGIN_TYPES;

export const LOGIN_TYPES_WITH_NO_SECTION_CODE = [
  SectionLoginType.google_classroom,
  SectionLoginType.clever,
];
