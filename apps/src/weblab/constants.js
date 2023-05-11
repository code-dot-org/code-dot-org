import {makeEnum} from '../utils';

export const SUPPORT_ARTICLE_URL =
  'https://support.code.org/hc/en-us/articles/360016804871';

export const FatalErrorType = makeEnum(
  'Default',
  'LoadFailure',
  'ResetFailure'
);

export const FILE_SYSTEM_ERROR = 'EFILESYSTEMERROR';
export const BRAMBLE_READY_STATE = 'bramble:readyToMount';
