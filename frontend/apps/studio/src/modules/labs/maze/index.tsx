import {
  convertBlocklyXmlToJson,
  convertBlocklyXmlToToolbox,
} from '@code-dot-org/blockly/xml';
import {useLevelProperties} from '@code-dot-org/lab/contexts';
import type {LevelPropertiesMap} from '@code-dot-org/lab/contexts';
import MazeLabApp from '@code-dot-org/maze-lab';

import LabProviders from '@/modules/labs/LabProviders';
import type {LabEntrypointProps} from '@/modules/labs/router/getLabEntrypointByAppName';

type LevelProperties = NonNullable<ReturnType<typeof useLevelProperties>>;

const EMPTY_BLOCKS_XML = '<xml></xml>';

function parseIntOr<T>(value: unknown, fallback: T): number | T {
  if (typeof value !== 'string' || value.trim() === '') {
    return fallback;
  }
  const parsed = parseInt(value, 10);
  return Number.isNaN(parsed) ? fallback : parsed;
}

// Best-effort JSON.parse for a raw properties string (the level's `maze`
// grid, `serialized_maze`, or `authored_hints`) — malformed or absent
// content degrades to undefined rather than crashing the mount.
function parseJsonOr<T>(value: unknown): T | undefined {
  if (typeof value !== 'string' || value.trim() === '') {
    return undefined;
  }
  try {
    return JSON.parse(value) as T;
  } catch {
    return undefined;
  }
}

/**
 * Converts the .level file's legacy Blockly XML (startBlocksXml/
 * toolboxBlocksXml, extracted verbatim by the importer's parseLevelXml) into
 * the modern JSON block state Blockly's BlocklyWorkspace requires. Mirrors
 * maze-lab's own LevelKindSchema.transform (src/schema.ts) — the real
 * Levelbuilder pipeline does this same conversion, but via a zod schema
 * DashboardApiClient's fetch path applies; the /author host bypasses that
 * fetch entirely (LevelPropertiesProvider does no zod parsing), so this
 * adapter does the conversion itself with the same browser DOMParser.
 *
 * Many Karel-family .level files (courseD_bee_conditionals2_2024, for one)
 * have no `<start_blocks>` element at all — in production, Rails fills that
 * gap by handing the client a "when run" hat by default. The importer reads
 * the .level file directly and skips Rails, so `startBlocksXml` is simply
 * absent here; leave `startBlocks` undefined in that case so MazeLab's own
 * `DefaultStartBlocks` fallback (a lone "when run" block) applies, rather
 * than handing it a parsed-but-empty block list that fallback can't see
 * through.
 */
function toMazeLevelProperties(properties: LevelProperties): LevelProperties {
  const parser = new DOMParser();
  const startBlocksXml = properties.startBlocksXml as string | undefined;
  return {
    ...properties,
    startBlocks: startBlocksXml
      ? convertBlocklyXmlToJson(parser, startBlocksXml)
      : undefined,
    toolboxBlocks: convertBlocklyXmlToToolbox(
      parser,
      (properties.toolboxBlocksXml as string | undefined) ?? EMPTY_BLOCKS_XML,
    ),
    solutionBlocks: properties.solutionBlocksXml,
    recommendedBlocks: properties.recommendedBlocksXml,
    startDirection: parseIntOr(properties.startDirection, 1),
    ideal: parseIntOr(properties.ideal, undefined),
    authoredHints: parseJsonOr(properties.authored_hints),
    map: parseJsonOr(properties.maze),
    serializedMaze: parseJsonOr(properties.serialized_maze),
  };
}

/**
 * Studio entry point for the Maze/Karel family (Maze, Bee, Farmer,
 * Harvester, Collector — one game engine dispatching on `skin`). Bridges the
 * host's level-properties contract to maze-lab's fat-lab
 * {levelId, levelPropertiesMap} shape, same as modules/labs/music/index.tsx,
 * plus the XML->JSON block conversion above.
 */
export default function MazeContainer({
  onLevelResult,
  editing,
}: LabEntrypointProps) {
  const properties = useLevelProperties();
  if (!properties) {
    return null;
  }
  const levelId = String(properties.id);
  return (
    <LabProviders>
      <MazeLabApp
        isLoading={false}
        levelId={levelId}
        levelPropertiesMap={
          {[levelId]: toMazeLevelProperties(properties)} as LevelPropertiesMap
        }
        onLevelResult={onLevelResult}
        editing={editing}
      />
    </LabProviders>
  );
}
