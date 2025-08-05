import loadBlocklyData from '@code-dot-org/lab-blockly/parser';

import type {MazeData} from '../MazeController';

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
function load(config: {[key: string]: any}, xml?: Element, parser?: DOMParser): MazeData {
  return {
    ...loadBlocklyData(config, xml, parser),
    skinId: config.properties?.skin || 'birds',
    map: config.properties?.maze
      ? JSON.parse(sanitizeJSON(config.properties?.maze))
      : undefined,
    serializedMaze: config.properties?.serialized_maze
      ? JSON.parse(sanitizeJSON(config.properties?.serialized_maze))
      : undefined,
    startDirection: config.properties?.start_direction
      ? parseInt(config.properties?.start_direction)
      : undefined,
  };
}

export default load;
