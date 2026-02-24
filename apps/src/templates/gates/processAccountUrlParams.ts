import {queryParams} from '@cdo/apps/code-studio/utils';

/**
 * Processes the `source_page` and `return_to` URL params for the LinkAccountPage
 * and TeacherAccountRequiredPage.
 * */
export function processAccountUrlParams() {
  const sourcePage = (queryParams('source_page') || '') as string;
  const returnTo = (queryParams('return_to') || '') as string;
  const returnToUrlParam = returnTo
    ? `?user_return_to=${encodeURIComponent(returnTo)}`
    : '';

  return {sourcePage, returnToUrlParam};
}
