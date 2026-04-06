import {z} from 'zod';
import {
  convertBlocklyXmlToJson,
  convertBlocklyXmlToToolbox,
} from '@code-dot-org/blockly-workspace/xml';

/**
 *  * Clean up JSON and allow whitespace and JavaScript comments.
 *   */
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
 * The zod schema for the level properties of the lab.
 */
export const LevelKindSchema = z
  .object({
    maze: z.string(),
    serialized_maze: z.string().optional(),
    startBlocks: z.string(),
    solutionBlocks: z.string(),
    startDirection: z.string(),
    toolboxBlocks: z.string(),
    recommendedBlocks: z.string(),
    authoredHints: z.string(),
    skin: z.string(),
    ideal: z.string().optional(),
  })
  .transform(data => ({
    maze: data.maze,
    map: data.maze ? JSON.parse(sanitizeJSON(data.maze)) : undefined,
    serializedMaze: data.serialized_maze
      ? JSON.parse(sanitizeJSON(data.serialized_maze))
      : undefined,
    startBlocks: convertBlocklyXmlToJson(new DOMParser(), data.startBlocks),
    solutionBlocks: data.solutionBlocks,
    startDirection: parseInt(data.startDirection),
    toolboxBlocks: convertBlocklyXmlToToolbox(
      new DOMParser(),
      data.toolboxBlocks,
    ),
    recommendedBlocks: data.recommendedBlocks,
    authoredHints: data.authoredHints,
    skin: data.skin,
    ideal: typeof data.ideal === 'string' ? parseInt(data.ideal) : undefined,
  }));
