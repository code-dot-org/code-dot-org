import {z} from 'zod';

import {
  convertBlocklyXmlToJson,
  convertBlocklyXmlToToolbox,
} from '@code-dot-org/blockly-workspace/xml';

/**
 * Level config for ai-trainer. Same shape as datasci: just optional XML
 * strings for the workspace starter and toolbox.
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
