import {z} from 'zod';
import {
  convertBlocklyXmlToJson,
  convertBlocklyXmlToToolbox,
} from '@code-dot-org/blockly-workspace/xml';

/**
 * Level config for datasci. Wire shape carries XML strings for the workspace
 * starter and toolbox; the transform parses them into the JSON shapes that
 * `BlocklyWorkspace` actually consumes (same pattern as the maze lab).
 */
export const LevelKindSchema = z
  .object({
    startBlocks: z.string().optional(),
    toolboxBlocks: z.string().optional(),
  })
  .transform(data => ({
    startBlocks: data.startBlocks
      ? convertBlocklyXmlToJson(new DOMParser(), data.startBlocks)
      : undefined,
    toolboxBlocks: data.toolboxBlocks
      ? convertBlocklyXmlToToolbox(new DOMParser(), data.toolboxBlocks)
      : undefined,
  }));
