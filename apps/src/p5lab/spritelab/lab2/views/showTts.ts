import {queryParams} from '@cdo/apps/code-studio/utils';

/** Read-aloud of guide text, on the same level property the platform's
    instructions panel uses, or ?show-tts=true. */
export function showTtsFor(levelProperties: {
  offerBrowserTts?: boolean;
}): boolean {
  return (
    !!levelProperties.offerBrowserTts || queryParams('show-tts') === 'true'
  );
}
