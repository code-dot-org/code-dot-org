import loadBlocklyData from '@code-dot-org/lab-blockly/parser';

import type {CraftData} from '../types';

/**
 * Clean up JSON and allow whitespace and JavaScript comments.
 */
export const sanitizeJSON: (data: string) => string = data =>
  data
    // Remove Windows-style newlines for convenience
    .replaceAll('\r', '')
    // Strip out line comments
    .split('\n')
    .filter(line => !line.match(/^\s*\/\//))
    .join('\n')
    // Remove whitespace
    .trim();

/**
 * Parses a level config to produce the level data we need to supply to
 * the level component.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function load(config: {[key: string]: any}, xml?: Document, parser?: DOMParser): CraftData {
  console.log(config);
  return {
    ...loadBlocklyData(config, xml, parser),
    groundPlane: [],
  };
}

export default load;
