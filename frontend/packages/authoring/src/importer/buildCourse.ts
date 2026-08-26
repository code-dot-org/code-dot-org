import type {
  CourseModel,
  Experience,
  GenericLevelData,
  Lesson,
  Unit,
} from '../model/types';

import {type DslExt, type ParsedDslLevel, parseDslLevel} from './dslLevel';
import {type ParsedLevelXml, parseLevelXml} from './levelXml';
import {type ParsedScriptLevel, parseScriptJson} from './scriptJson';

export interface LevelSource {
  kind: 'xml' | 'dsl';
  ext?: DslExt;
  content: string;
}

export interface BuildCourseInputs {
  courseJson: string;
  offeringJson: string;
  scriptJson: string;
  levelSources: Map<string, LevelSource>;
  videoCsv?: string;
}

export interface BuildCourseResult {
  course: CourseModel;
  levelProperties: Record<string, Record<string, unknown>>;
  warnings: string[];
}

interface RawCourse {
  name: string;
}

interface RawOffering {
  key: string;
  display_name: string;
  grade_levels?: string;
}

interface BuildContext {
  levelSources: Map<string, LevelSource>;
  warnings: string[];
  levelProperties: Record<string, Record<string, unknown>>;
  nextNumericId: () => number;
  lookupYoutubeCode: (videoKey: string) => string | undefined;
}

const FIRST_SYNTHETIC_LEVEL_ID = 9000000;

export function buildCourse(inputs: BuildCourseInputs): BuildCourseResult {
  const courseRaw = JSON.parse(inputs.courseJson) as RawCourse;
  const offeringRaw = JSON.parse(inputs.offeringJson) as RawOffering;
  const parsedScript = parseScriptJson(inputs.scriptJson);
  const videoIndex = inputs.videoCsv
    ? parseVideosCsv(inputs.videoCsv)
    : new Map<string, string>();

  const warnings: string[] = [];
  let numericId = FIRST_SYNTHETIC_LEVEL_ID;
  const levelProperties: Record<string, Record<string, unknown>> = {};

  const ctx: BuildContext = {
    levelSources: inputs.levelSources,
    warnings,
    levelProperties,
    nextNumericId: () => ++numericId,
    lookupYoutubeCode: videoKey => videoIndex.get(videoKey),
  };

  const scriptLevelsByLesson = new Map<string, ParsedScriptLevel[]>();
  for (const scriptLevel of parsedScript.scriptLevels) {
    const list = scriptLevelsByLesson.get(scriptLevel.lessonKey) ?? [];
    list.push(scriptLevel);
    scriptLevelsByLesson.set(scriptLevel.lessonKey, list);
  }

  const lessons: Lesson[] = [...parsedScript.lessons]
    .sort((a, b) => a.position - b.position)
    .map(lesson => {
      const scriptLevels = (scriptLevelsByLesson.get(lesson.key) ?? [])
        .slice()
        .sort((a, b) => a.position - b.position);
      const experiences: Experience[] = [];
      for (const scriptLevel of scriptLevels) {
        for (const levelKey of scriptLevel.levelKeys) {
          experiences.push(
            buildExperience(levelKey, scriptLevel.progression, ctx),
          );
        }
      }
      return {
        id: `lb:${parsedScript.script.name}:${lesson.key}`,
        lessonKey: lesson.key,
        displayName: lesson.name,
        origin: 'levelbuilder',
        overview: lesson.overview,
        experiences,
      } satisfies Lesson;
    });

  // The importer builds one Unit from the one scriptJson given to it, even
  // though a .course file's script_names can list more than one script — a
  // multi-unit course loader is out of scope here (see loadCourse, which
  // resolves script_names[0]).
  const unit: Unit = {
    id: parsedScript.script.name,
    // Neither the .course file nor .script_json carries a dedicated unit
    // display name in this serialization; the offering's display name is
    // the closest available signal for the (here, single) unit.
    displayName: offeringRaw.display_name,
    origin: 'levelbuilder',
    lessons,
  };

  const course: CourseModel = {
    id: courseRaw.name,
    offeringKey: offeringRaw.key,
    displayName: offeringRaw.display_name,
    gradeLevels: offeringRaw.grade_levels,
    origin: 'levelbuilder',
    units: [unit],
  };

  return {course, levelProperties, warnings};
}

function buildExperience(
  levelKey: string,
  titleHint: string | undefined,
  ctx: BuildContext,
): Experience {
  const id = `lb:${levelKey}`;
  const source = ctx.levelSources.get(levelKey);

  if (!source) {
    ctx.warnings.push(
      `No source found for level '${levelKey}'; recorded as an unsupported opaque experience.`,
    );
    return {
      id,
      origin: 'levelbuilder',
      title: titleHint,
      kind: 'existingLevel',
      levelKey,
      levelType: 'unknown',
      runtime: 'unsupported',
      data: {type: 'opaque', levelType: 'unknown', properties: {}},
    };
  }

  if (source.kind === 'xml') {
    const parsed = parseLevelXml(source.content);
    const fallbackTitle =
      (parsed.properties.display_name as string | undefined) ??
      (parsed.properties.name as string | undefined);
    const title = titleHint ?? fallbackTitle;

    // Karel (Bee/Farmer/Harvester/Collector/Planter) shares maze-lab's
    // engine with Maze, dispatching on `skin`. Each of these five skins'
    // action blocks (maze_nectar, maze_dig, harvester_corn,
    // collector_collect, planter_plant, ...) is now authored in blocks.ts;
    // any other Karel skin still falls through to dataFromParsedXml's opaque
    // case below. See levelCatalog.ts's projectRuntime for the fuller note.
    const SUPPORTED_KAREL_SKINS = new Set([
      'bee',
      'farmer',
      'harvester',
      'collector',
      'planter',
    ]);
    const isSupportedKarel =
      parsed.levelType === 'Karel' &&
      SUPPORTED_KAREL_SKINS.has(parsed.properties.skin as string);
    if (
      parsed.levelType === 'Fish' ||
      parsed.levelType === 'Music' ||
      parsed.levelType === 'Maze' ||
      isSupportedKarel
    ) {
      const numericId = ctx.nextNumericId();
      ctx.levelProperties[String(numericId)] =
        parsed.levelType === 'Fish'
          ? buildFishLevelProperties(numericId, levelKey, parsed.properties)
          : parsed.levelType === 'Music'
            ? buildMusicLevelProperties(numericId, levelKey, parsed.properties)
            : buildMazeLevelProperties(numericId, levelKey, parsed);
      return {
        id,
        origin: 'levelbuilder',
        title,
        kind: 'existingLevel',
        levelKey,
        levelType: parsed.levelType,
        runtime: 'labhost',
        labKey:
          parsed.levelType === 'Fish'
            ? 'oceans'
            : parsed.levelType === 'Music'
              ? 'music'
              : 'maze',
        levelNumericId: numericId,
      };
    }

    const data = dataFromParsedXml(parsed, ctx);
    return {
      id,
      origin: 'levelbuilder',
      title,
      kind: 'existingLevel',
      levelKey,
      levelType: parsed.levelType,
      runtime: data.type === 'opaque' ? 'unsupported' : 'generic',
      data,
    };
  }

  const parsed = parseDslLevel(source.content, source.ext as DslExt);
  const data = dataFromParsedDsl(parsed, ctx);
  return {
    id,
    origin: 'levelbuilder',
    title: titleHint ?? parsed.displayName,
    kind: 'existingLevel',
    levelKey,
    levelType: dslLevelType(parsed),
    runtime: data.type === 'opaque' ? 'unsupported' : 'generic',
    data,
  };
}

function dslLevelType(parsed: ParsedDslLevel): string {
  switch (parsed.kind) {
    case 'multi':
      return 'Multi';
    case 'match':
      return 'Match';
    case 'external':
      return 'External';
    case 'bubbleChoice':
      return 'BubbleChoice';
    case 'levelGroup':
      return 'LevelGroup';
    case 'opaque':
      return parsed.levelType;
  }
}

function dataFromParsedXml(
  parsed: ParsedLevelXml,
  ctx: BuildContext,
): GenericLevelData {
  if (parsed.levelType === 'StandaloneVideo') {
    const videoKey = parsed.properties.video_key as string | undefined;
    if (!videoKey) {
      ctx.warnings.push(
        'StandaloneVideo level is missing properties.video_key',
      );
    }
    const youtubeCode = videoKey ? ctx.lookupYoutubeCode(videoKey) : undefined;
    if (videoKey && youtubeCode === undefined) {
      ctx.warnings.push(`No YouTube code resolved for video key '${videoKey}'`);
    }
    return {
      type: 'video',
      videoKey: videoKey ?? '',
      youtubeCode,
      displayName: parsed.properties.display_name as string | undefined,
    };
  }
  return {
    type: 'opaque',
    levelType: parsed.levelType,
    properties: parsed.properties,
  };
}

function dataFromParsedDsl(
  parsed: ParsedDslLevel,
  ctx: BuildContext,
): GenericLevelData {
  switch (parsed.kind) {
    case 'multi':
      return {
        type: 'multi',
        question: parsed.question,
        answers: parsed.answers,
        allowMultipleAttempts: parsed.allowMultipleAttempts,
        markdown: parsed.markdown,
      };
    case 'match':
      return {type: 'match', pairs: parsed.pairs, markdown: parsed.markdown};
    case 'external':
      return {type: 'markdown', markdown: parsed.markdown};
    case 'bubbleChoice':
      return {
        type: 'bubbleChoice',
        displayName: parsed.displayName,
        choices: parsed.levelKeys.map(levelKey => ({
          levelKey,
          displayName: peekDisplayName(levelKey, ctx),
        })),
      };
    case 'levelGroup':
      return {
        type: 'levelGroup',
        title: parsed.displayName,
        pages: parsed.pages.map(levelKeys => ({
          levels: levelKeys.map(levelKey => ({
            levelKey,
            data: buildGenericData(levelKey, ctx),
          })),
        })),
      };
    case 'opaque':
      return {type: 'opaque', levelType: parsed.levelType, properties: {}};
  }
}

// Resolves one referenced level key to GenericLevelData without assigning a
// synthetic numeric id or recording LevelProperties — used for sub-levels
// inlined into a level group's pages, which carry no runtime info of their
// own. A labhost (Fish/Music) sub-level loses its labhost identity here and
// falls back to an honest opaque card; that combination doesn't occur in
// the imported curriculum today.
function buildGenericData(
  levelKey: string,
  ctx: BuildContext,
): GenericLevelData {
  const source = ctx.levelSources.get(levelKey);
  if (!source) {
    ctx.warnings.push(
      `No source found for level '${levelKey}' referenced inside a level group; recorded as unsupported opaque data.`,
    );
    return {type: 'opaque', levelType: 'unknown', properties: {}};
  }
  if (source.kind === 'xml') {
    return dataFromParsedXml(parseLevelXml(source.content), ctx);
  }
  return dataFromParsedDsl(
    parseDslLevel(source.content, source.ext as DslExt),
    ctx,
  );
}

function peekDisplayName(
  levelKey: string,
  ctx: BuildContext,
): string | undefined {
  const source = ctx.levelSources.get(levelKey);
  if (!source) {
    ctx.warnings.push(`No source found for choice level '${levelKey}'`);
    return undefined;
  }
  if (source.kind === 'xml') {
    const parsed = parseLevelXml(source.content);
    return (
      (parsed.properties.display_name as string | undefined) ??
      (parsed.properties.name as string | undefined)
    );
  }
  return parseDslLevel(source.content, source.ext as DslExt).displayName;
}

function buildFishLevelProperties(
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
  };
}

function buildMusicLevelProperties(
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
function buildMazeLevelProperties(
  id: number,
  levelKey: string,
  parsed: ParsedLevelXml,
): Record<string, unknown> {
  const properties = parsed.properties;
  return {
    ...properties,
    id,
    appName: 'maze',
    type: parsed.levelType,
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

// dashboard/config/videos.csv: Key,Name,Concepts,YoutubeCode,Download,Locale
// — a key can repeat across locale rows; prefer en-US.
function parseVideosCsv(csv: string): Map<string, string> {
  const lines = csv.split(/\r?\n/).filter(line => line.trim() !== '');
  const [header, ...rows] = lines;
  if (!header) return new Map();

  const columns = header.split(',');
  const keyIndex = columns.indexOf('Key');
  const codeIndex = columns.indexOf('YoutubeCode');
  const localeIndex = columns.indexOf('Locale');

  const byKey = new Map<string, string>();
  for (const row of rows) {
    const fields = row.split(',');
    const key = fields[keyIndex];
    const code = fields[codeIndex];
    if (!key || !code) continue;
    if (!byKey.has(key) || fields[localeIndex] === 'en-US') {
      byKey.set(key, code);
    }
  }
  return byKey;
}
