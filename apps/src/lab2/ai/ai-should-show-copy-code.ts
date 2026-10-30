import {queryParams} from '@cdo/apps/code-studio/utils';

export const shouldShowCopyCode =
  String(queryParams('ai-show-copy-code')).toLowerCase() === 'true';
