// Parses a dashboard/config/levels/custom/**/*.level file. The format is
// fixed and simple — one root tag naming the level type, one
// <config><![CDATA[...json...]]></config> block, and an optional trailing
// <blocks>...</blocks> (or self-closing <blocks/>) sibling — so a small
// regex parser is enough; pulling in an XML dependency would be overkill.

export interface ParsedLevelXml {
  levelType: string;
  properties: Record<string, unknown>;
  blocks?: string;
  // The `<xml>...</xml>` payload of each named child of <blocks>, verbatim —
  // Blockly-family levels (Maze, Karel/Bee/Farmer/Harvester/Collector) carry
  // their block state as legacy Blockly XML here, not in <config> JSON.
  startBlocksXml?: string;
  toolboxBlocksXml?: string;
  solutionBlocksXml?: string;
  recommendedBlocksXml?: string;
}

const ROOT_TAG_PATTERN = /^\s*<([A-Za-z][\w-]*)>/;
const CONFIG_PATTERN = /<config>\s*<!\[CDATA\[([\s\S]*?)\]\]>\s*<\/config>/;
const BLOCKS_PATTERN = /<blocks(?:\s[^>]*)?(?:\/>|>[\s\S]*?<\/blocks>)/;

function namedBlocksPattern(tagName: string): RegExp {
  return new RegExp(
    `<${tagName}>\\s*(<xml[\\s\\S]*?<\\/xml>|<xml[^>]*\\/>)\\s*<\\/${tagName}>`,
  );
}

function extractInnerXml(blocksXml: string | undefined, tagName: string) {
  if (!blocksXml) {
    return undefined;
  }
  return blocksXml.match(namedBlocksPattern(tagName))?.[1];
}

export function parseLevelXml(xml: string): ParsedLevelXml {
  const rootTagMatch = xml.match(ROOT_TAG_PATTERN);
  if (!rootTagMatch) {
    throw new Error('parseLevelXml: no root tag found');
  }
  const levelType = rootTagMatch[1];

  const configMatch = xml.match(CONFIG_PATTERN);
  if (!configMatch) {
    throw new Error(
      `parseLevelXml: no <config><![CDATA[...]]></config> block in a ${levelType} level`,
    );
  }
  const config = JSON.parse(configMatch[1]) as {
    properties?: Record<string, unknown>;
  };

  const blocksMatch = xml.match(BLOCKS_PATTERN);
  const blocks = blocksMatch?.[0];

  return {
    levelType,
    properties: config.properties ?? {},
    blocks,
    startBlocksXml: extractInnerXml(blocks, 'start_blocks'),
    toolboxBlocksXml: extractInnerXml(blocks, 'toolbox_blocks'),
    solutionBlocksXml: extractInnerXml(blocks, 'solution_blocks'),
    recommendedBlocksXml: extractInnerXml(blocks, 'recommended_blocks'),
  };
}
