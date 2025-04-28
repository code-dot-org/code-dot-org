import csv from 'csv-parser';
import {createReadStream} from 'fs';
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

/** Internal video metadata */
export interface VideoDefinition {
  youtube: string;
  download: string;
  locale: string;
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
  /** Whether or not we should highlight the instructions before the student can continue */
  instructionsImportant: boolean;
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
export const loadLevel: (
  key: string,
  extension?: string,
) => Promise<string> = async (key: string, extension: string = 'level') => {
  // File the .level file within the ./data path
  const filePath = path.join(
    process.cwd(),
    'data',
    'levels',
    `${key}.${extension}`,
  );

  try {
    return await fs.readFile(filePath, 'utf8');
  } catch (_) {
    // Could not find the level data in the ./data path
  }

  const levelTypes = [
    'aichat',
    'ailab',
    'applab',
    'bounce',
    'calc',
    'craft',
    'curriculum_reference',
    'dance',
    'eval',
    'external_link',
    'fish',
    'flappy',
    'free_response',
    'frequency_analysis',
    'gamelab',
    'javalab',
    'maze',
    'music',
    'netsim',
    'odometer',
    'panels',
    'pixelation',
    'poetry',
    'public_key_cryptography',
    'pythonlab',
    'spritelab',
    'standalone_video',
    'studio',
    'text_compression',
    'turtle',
    'unplug',
    'vigenere',
    'weblab',
    'weblab2',
    '../../scripts',
  ];

  for (const levelType of levelTypes) {
    try {
      const fallbackPath = path.join(
        process.cwd(),
        '..',
        '..',
        '..',
        'dashboard',
        'config',
        'levels',
        'custom',
        levelType,
        `${key}.${extension}`,
      );

      try {
        return await fs.readFile(fallbackPath, 'utf8');
      } catch (_) {
        return await fs.readFile(fallbackPath.toLowerCase(), 'utf8');
      }
    } catch (_) {
      // Keep trying
    }
  }

  throw new Error(`Cannot find the ${extension} file for key ${key}`);
};

/**
 * Loads video metadata for the given video key.
 *
 * It will look in `./data/videos/{key}.json` for data unique to this application
 * and otherwise will parse `videos.csv` for the video information.
 *
 * @param key - The video key.
 */
export const loadVideo: (key: string) => Promise<VideoDefinition> = async (
  key: string,
) => {
  // File the .json file within the ./data/videos path
  const filePath = path.join(process.cwd(), 'data', 'videos', `${key}.json`);

  try {
    const fileContents = await fs.readFile(filePath, 'utf8');
    return JSON.parse(fileContents);
  } catch (_) {
    // Use the fallback
  }

  // Load the videos.csv and look for the details within that
  const fallbackPath = path.join(
    process.cwd(),
    '..',
    '..',
    '..',
    'dashboard',
    'config',
    'videos.csv',
  );
  const promise = new Promise((resolve, reject) => {
    createReadStream(fallbackPath)
      .pipe(csv())
      .on('data', data => {
        if (data.Key === key) {
          resolve({
            download: data.Download,
            youtube: data.YoutubeCode,
            locale: data.Locale,
          });
        }
      })
      .on('end', () => reject());
  });

  const record = await promise;

  return record;
};

/**
 * Parses a Code.org level file.
 */
export const parseLevelData: (
  key: string,
  xmlString: string,
) => Promise<LevelData> = async (key: string, xmlString: string) => {
  const parser = new new JSDOM().window.DOMParser();
  const xml = parser.parseFromString(xmlString, 'application/xml');
  const config = JSON.parse(
    xml.querySelector('config')?.textContent || '{}',
  ) as LevelConfiguration;

  // Gather the general data from the level file
  const ret: LevelData = {
    key: key,
    type: xml.querySelector(':root')?.tagName || 'Maze',
    longInstructions:
      config.properties.long_instructions ||
      config.properties.short_instructions ||
      '',
    shortInstructions: config.properties.short_instructions || '',
    containedLevelNames: config.properties.contained_level_names,
    videoKey: config.properties.video_key,
    instructionsImportant: !!(
      config.properties.instructions_important === 'true' ||
      config.properties.instructions_important === true
    ),
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

  // Parse maze data for such levels
  let isBlockly = false;
  if (
    ret.type === 'Maze' ||
    ret.type === 'Karel' ||
    ret.type === 'StarWarsGrid'
  ) {
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
    ret.multipleChoice = multipleChoice;
  }

  console.log('LEVEL DATA', config, ret);
  return ret;
};
