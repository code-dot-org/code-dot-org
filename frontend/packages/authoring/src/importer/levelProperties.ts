// LevelProperties wire-shape builders for the three Levelbuilder types the
// Author Mode prototype mounts on a real lab host (Fish/Oceans, Music,
// Maze/Karel). Shared by buildCourse.ts (the eager, whole-course importer)
// and authoring-service's levelCatalog.ts (the lazy, one-level-at-a-time
// attach path) — both need byte-identical LevelProperties for the same
// on-disk .level file, or a level renders differently depending on which
// path attached it.

/** The subset of a parsed .level file buildMazeLevelProperties needs. */
export interface LevelPropertiesBlocksSource {
  properties: Record<string, unknown>;
  startBlocksXml?: string;
  toolboxBlocksXml?: string;
  solutionBlocksXml?: string;
  recommendedBlocksXml?: string;
}

export function buildFishLevelProperties(
  id: number,
  levelKey: string,
  properties: Record<string, unknown>,
): Record<string, unknown> {
  return {
    id,
    appName: 'fish',
    type: 'Oceans',
    name: levelKey,
    appMode: properties.mode,
    isProjectLevel: false,
    usesProjects: false,
    hideShareAndRemix: true,
    offerBrowserTts: false,
    showExemplarLink: false,
    parentLevelLink: null,
    exemplarSources: null,
    longInstructions: properties.long_instructions,
    shortInstructions: properties.short_instructions,
  };
}

// Music's long_instructions/short_instructions live in the same top-level
// properties as Maze's — dropped here until now because this whitelist never
// carried them through. The mounted music-lab self-renders longInstructions
// whenever it's set (an auto-opened ResourcePanel "Instructions" tab, or the
// GuideInstructions overlay when level_data sets guideMode: 'instructions') —
// the studio host (ExperienceStage/LevelInstructions) skips its own readonly
// preview accordingly, but still needs the raw values wired through here for
// the edit affordance to have something to pre-fill and patch.
export function buildMusicLevelProperties(
  id: number,
  levelKey: string,
  properties: Record<string, unknown>,
): Record<string, unknown> {
  return {
    id,
    appName: 'music',
    type: 'Music',
    name: levelKey,
    isProjectLevel: false,
    usesProjects: false,
    encrypted: false,
    levelData: properties.level_data ?? null,
    hideShareAndRemix: true,
    longInstructions: properties.long_instructions,
    shortInstructions: properties.short_instructions,
    instructionsImportant: false,
    offerBrowserTts: false,
    useSecondaryFinishButton: false,
    preloadAssetList: false,
    containedLevelNames: [],
    helpVideos: [],
    useRestrictedSongs: true,
    baseAssetUrl: '/blockly/',
    isAssessment: false,
    enableBlocklyKeyboardNavigation: false,
    showExemplarLink: false,
    parentLevelLink: null,
    exemplarSources: null,
    sharedBlocks: [],
  };
}

/**
 * LevelProperties for a Maze/Karel-family level (Maze, Bee, Farmer, Harvester,
 * Collector — one game engine dispatching on `skin`). Blocks are legacy
 * Blockly XML in the .level file (`startBlocksXml`/`toolboxBlocksXml`/
 * `solutionBlocksXml`/`recommendedBlocksXml`, extracted by `parseLevelXml`),
 * carried through raw — the maze-lab studio adapter converts them to the
 * modern JSON block-state Blockly needs at mount time (Blockly's XML->JSON
 * converter needs a browser `DOMParser`; the importer runs in Node). Raw
 * properties are spread first so game-specific config the engine reads
 * directly (`flower_type`, `start_direction`, …) survives untouched.
 */
export function buildMazeLevelProperties(
  id: number,
  levelKey: string,
  levelType: string,
  parsed: LevelPropertiesBlocksSource,
): Record<string, unknown> {
  const properties = parsed.properties;
  return {
    ...properties,
    id,
    appName: 'maze',
    type: levelType,
    name: levelKey,
    isProjectLevel: false,
    usesProjects: false,
    hideShareAndRemix: true,
    offerBrowserTts: false,
    showExemplarLink: false,
    parentLevelLink: null,
    exemplarSources: null,
    longInstructions: properties.long_instructions,
    shortInstructions: properties.short_instructions,
    skin: properties.skin,
    ideal: properties.ideal,
    startDirection: properties.start_direction,
    startBlocksXml: parsed.startBlocksXml,
    toolboxBlocksXml: parsed.toolboxBlocksXml,
    solutionBlocksXml: parsed.solutionBlocksXml,
    recommendedBlocksXml: parsed.recommendedBlocksXml,
  };
}
