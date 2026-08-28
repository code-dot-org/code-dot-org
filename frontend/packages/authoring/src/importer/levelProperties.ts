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

// offer_browser_tts is a Rails serialized_attrs property, so it round-trips
// through .level XML/JSON as the string "true"/"false", not a boolean (see
// Level#summarize_for_lab2_properties, the production analogue). Production
// also falls back to script.tts when the level itself doesn't set it — that
// script-level signal isn't available at either call site here, so an
// absent property stays false rather than guessing a script's TTS setting.
function offerBrowserTtsFrom(properties: Record<string, unknown>): boolean {
  return (
    properties.offer_browser_tts === true ||
    properties.offer_browser_tts === 'true'
  );
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
    // The studio adapter (modules/labs/oceans/index.tsx) reads `mode` and
    // `guides` off level properties, not `appMode` — appMode is kept
    // alongside for whatever else expects it (see loadCourse.test.ts).
    appMode: properties.mode,
    mode: properties.mode,
    guides: properties.guides,
    isProjectLevel: false,
    usesProjects: false,
    hideShareAndRemix: true,
    offerBrowserTts: offerBrowserTtsFrom(properties),
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
    offerBrowserTts: offerBrowserTtsFrom(properties),
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
    // ProgressManager (apps/src/lab2/progress/ProgressContainer.tsx) reads
    // both off levelProperties together to drive the Check/Continue gate and
    // the exemplar-validation message; dropping either leaves music-lab
    // levels un-gated even though the .level file authored a check.
    validations: properties.validations,
    exemplarSettings: properties.exemplar_settings,
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
 * properties are spread first for anything with no engine reader at all
 * (harmless passthrough), but every field the engine actually reads
 * (`packages/labs/maze/src/{Bee,MazeController}.ts`) needs the camelCase
 * name explicitly set below — the engine never reads the snake_case wire
 * name, so leaving it to the spread serves a key nothing looks at.
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
    offerBrowserTts: offerBrowserTtsFrom(properties),
    showExemplarLink: false,
    parentLevelLink: null,
    exemplarSources: null,
    longInstructions: properties.long_instructions,
    shortInstructions: properties.short_instructions,
    skin: properties.skin,
    ideal: properties.ideal,
    startDirection: properties.start_direction,
    // Bee's flower-count visibility and the Karel-family goal-based win
    // condition (packages/labs/maze/src/{Bee,Farmer}.ts) — see this
    // function's doc comment; the raw spread above serves `flower_type` etc.
    // verbatim, but nothing reads that snake_case key.
    flowerType: properties.flower_type,
    nectarGoal: properties.nectar_goal,
    honeyGoal: properties.honey_goal,
    minCollected: properties.min_collected,
    startBlocksXml: parsed.startBlocksXml,
    toolboxBlocksXml: parsed.toolboxBlocksXml,
    solutionBlocksXml: parsed.solutionBlocksXml,
    recommendedBlocksXml: parsed.recommendedBlocksXml,
  };
}
