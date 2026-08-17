import {MiniApps} from '@codebridge/constants';

const MINI_APP_TITLES: Record<MiniApps, string> = {
  [MiniApps.Neighborhood]: 'Neighborhood',
  [MiniApps.Theater]: 'Theater',
};

// Undefined for a lab without a mini app, or one we have no title for; the
// preview panel falls back to its generic header in that case.
export function getMiniAppTitle(miniApp: string | undefined) {
  return miniApp === undefined
    ? undefined
    : MINI_APP_TITLES[miniApp as MiniApps];
}
