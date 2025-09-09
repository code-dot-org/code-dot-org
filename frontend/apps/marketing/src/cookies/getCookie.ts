import {Stage} from '@/config/stage';

/**
 * JS port of lib/cdo/cookie_helpers.rb
 * @param cookieName The cookie to retrieve
 * @param stage The stage to retrieve the cookie for
 */
export function getCookieNameByStage(cookieName: string, stage: Stage) {
  if (stage === 'production') {
    return cookieName;
  }

  return `${cookieName}_${stage}`;
}
