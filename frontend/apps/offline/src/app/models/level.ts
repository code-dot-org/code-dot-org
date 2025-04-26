import fs from 'fs/promises';
import {JSDOM} from 'jsdom';
import path from 'path';

/** Describes a single level hint. */
export interface HintData {
  class: string;
  id: string;
  type: string;
  markdown: string;
  path?: [number, number][];
}

/** Describes a multiple-choice question. */
export interface MultipleChoiceData {
  question: string;
  choices: {
    text: string;
    feedback: string;
    correct: boolean;
  }[];
}

/** Describes a video. */
export interface VideoData {
  download: string;
  youTubeId: string;
  locale: string;
}

/** Describes maze level initial data. */
export interface MazeData {
  maze?: number[][];
  skin?: string;
  startDirection?: number;
}

/** Generic description for Blockly data. */
export interface BlocklyData {
  startBlocks?: string;
  toolboxBlocks?: string;
  solutionBlocks?: string;
}

/** Describes a level */
export interface LevelData {
  /** Unique key for this level */
  key: string;
  /** The type of level (Maze, etc) */
  type: string;
  /** Potentially long description of what to do in the level or what the goal is. */
  longInstructions: string;
  /** Shorter description of what to do or what the level covers. */
  shortInstructions: string;
  /** Hints to help folks progress within levels. */
  hints: HintData[];
  /** An optional video that is associated with the level. */
  videoKey?: string;
  /** The metadata about the associated video. */
  videoData?: VideoData;
  /** Other embedded levels, such as multiple choice or bubble levels */
  containedLevelNames?: string[];
  /** Maze level data. */
  mazeData?: MazeData;
  /** Multiple choice question data. */
  multipleChoice?: MultipleChoiceData;
}

/** Loads a level file. */
export const loadLevel: (key: string) => Promise<string> = async (
  key: string,
  extension: string = 'level',
) => {
  // File the .level file within the ./data path
  const filePath = path.join(
    process.cwd(),
    'data',
    'levels',
    `${key}.${extension}`,
  );
  return await fs.readFile(filePath, 'utf8');
};

export const loadVideo: (key: string) => Promise<object> = async (
  key: string,
) => {
  // File the .json file within the ./data/videos path
  const filePath = path.join(process.cwd(), 'data', 'videos', `${key}.json`);
  const fileContents = await fs.readFile(filePath, 'utf8');
  return JSON.parse(fileContents);
};

/**
 * Parses a Code.org level file.
 */
export const parseLevelData = async (key: string, xmlString: string) => {
  const parser = new new JSDOM().window.DOMParser();
  const xml = parser.parseFromString(xmlString, 'application/xml');
  const config = JSON.parse(
    xml.querySelector('config')?.textContent || '{}',
  ) as LevelConfiguration;
  console.log('LEVEL DATA', config);

  // Gather the general data from the level file
  const ret: LevelData = {
    key: key,
    type: xml.querySelector(':root')?.tagName || 'Maze',
    longInstructions: config.properties.long_instructions,
    shortInstructions: config.properties.short_instructions,
    containedLevelNames: config.properties.contained_level_names,
    videoKey: config.properties.video_key,
  };

  // Parse hint data
  ret.hints = JSON.parse(config.properties.authored_hints || '[]').map(hint => {
    const ret = {};
    ret.class = hint.hint_class;
    ret.id = hint.hint_id;
    ret.path = hint.hint_path ? JSON.parse(hint.hint_path) : undefined;
    ret.type = hint.hint_type;
    ret.video = hint.hint_video ? hint.hint_video : undefined;
    ret.markdown = hint.hint_markdown;
    return ret;
  });

  // Parse maze data
  let isBlockly = false;
  if (ret.type === 'Maze') {
    isBlockly = true;
    ret.mazeData = {
      skin: config.properties.skin,
      maze: config.properties.maze
        ? JSON.parse(config.properties.maze)
        : undefined,
      startDirection: config.properties.start_direction
        ? parseInt(config.properties.start_direction)
        : undefined,
    };
  }

  if (isBlockly) {
    ret.blocklyData = {
      startBlocks: xml
        .querySelector('blocks > start_blocks > xml')
        ?.parentNode?.innerHTML?.trim(),
      toolboxBlocks: xml
        .querySelector('blocks > toolbox_blocks > xml')
        ?.parentNode?.innerHTML?.trim(),
      solutionBlocks: xml
        .querySelector('blocks > solution_blocks > xml')
        ?.parentNode?.innerHTML?.trim(),
    };
  }

  // Read video data
  if (ret.videoKey) {
    const videoData = await loadVideo(ret.videoKey);
    ret.videoData = {
      download: videoData.download,
      youTubeId: videoData.youtube,
      locale: videoData.locale,
    };
  }

  // Embed associated level data
  if (ret.containedLevelNames?.[0]) {
    // Get the contained level data, too
    const multiKey = ret.containedLevelNames[0];
    const multiData = (await loadLevel(multiKey, 'multi')).split('\n');

    // Parse the multiple choice question
    const multipleChoice = {
      question: (
        multiData.filter(line => line.startsWith('question '))[0] ||
        "question ''"
      )
        .substring(9)
        .replace(/^'|'$/g, ''),
      choices: multiData
        .filter(line => line.startsWith('wrong ') || line.startsWith('right '))
        .map(line => {
          const matches = line.match(
            /^(right|wrong)\s*'(.*)',\s*feedback:\s*'(.*)'\s*$/,
          );
          return {
            text: matches[2],
            feedback: matches[3],
            correct: line.startsWith('right'),
          };
        }),
    };
    console.log('MULTI', multiData, multipleChoice);
    ret.multipleChoice = multipleChoice;
  }

  return ret;
};
