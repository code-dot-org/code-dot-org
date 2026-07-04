import {DEFAULT_SECTIONS_SCENARIO} from './mocks/scenarios';

/** The `?scenario=<tag>` param, or the default tag when absent. */
export function getScenarioFromUrl(search: string): string {
  return (
    new URLSearchParams(search).get('scenario') ?? DEFAULT_SECTIONS_SCENARIO
  );
}

/** `?devChrome=off` hides the dev shell's scenario selector. */
export function isDevChromeOff(search: string): boolean {
  return new URLSearchParams(search).get('devChrome') === 'off';
}
