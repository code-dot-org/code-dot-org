import csv from 'csv-parser';
import {createReadStream} from 'fs';
import fs from 'fs/promises';
import {JSDOM} from 'jsdom';
import path from 'path';

import type {MazeData} from '@code-dot-org/maze';

/** Describes a single level hint. */
export interface HintData {
  class: string;
  id: string;
  type: string;
  markdown: string;
  video?: string;
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

export type PanelLayout =
  | 'text-top-left'
  | 'text-top-center'
  | 'text-top-right'
  | 'text-bottom-left'
  | 'text-bottom-center'
  | 'text-bottom-right';

export interface PanelData {
  imageUrl: string;
  text: string;
  key: string;
  nextUrl?: string;
  layout?: PanelLayout;
  dark?: boolean;
  typing?: boolean;
  fadeInOverPrevious?: boolean;
}

/** Data for artist levels. */
export interface ArtistData {
  skinId?: string;
  initialX?: number;
  initialY?: number;
  startDirection?: number;
  predrawBlocks?: string;
  images: {
    filename: string;
    position: [number, number];
    scale?: number;
  }[];
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
  /** Whether or not this is a concept level */
  isConcept: boolean;
  /** Potentially long description of what to do in the level or what the goal is. */
  longInstructions?: string;
  /** Shorter description of what to do or what the level covers. */
  shortInstructions?: string;
  /** Whether or not we should highlight the instructions before the student can continue */
  instructionsImportant?: boolean;
  /** Hints to help folks progress within levels. */
  hints?: HintData[];
  /** The path to the level data, if it is locally sourced. */
  path?: string;
  /** An optional video that is associated with the level. */
  videoKey?: string;
  /** The metadata about the associated video. */
  videoData?: VideoData;
  /** The metadata about the associated panels. */
  panels?: PanelData[];
  /** Other embedded levels, such as multiple choice or bubble levels */
  containedLevelNames?: string[];
  /** Maze level data. */
  mazeData?: MazeData;
  /** Artist level data. */
  artistData?: ArtistData;
  /** Blockly level data. */
  blocklyData?: BlocklyData;
  /** Multiple choice question data. */
  multipleChoice?: MultipleChoiceData;
}

export interface LevelConfiguration {
  properties?: {
    long_instructions?: string;
    short_instructions?: string;
    contained_level_names?: string[];
    video_key?: string;
    instructions_important?: boolean | string;
    authored_hints?: string;
    serialized_maze?: string;
    maze?: string;
    skin?: string;
    panels?: PanelData[];
    start_direction?: string;
    x?: string;
    y?: string;
    images?: string;
  };
}

interface AuthoredHintConfiguration {
  hint_class: string;
  hint_id: string;
  hint_type: string;
  hint_markdown: string;
  hint_path?: string;
  hint_video?: string;
}

/** The information reported when loading raw level data */
export interface LevelLoadInfo {
  /** The local file path for the level */
  path: string;
  /** XML level data */
  data: string;
}

/** Loads a level file. */
export const loadLevelDefinition: (
  key: string,
  extension?: string,
) => Promise<LevelLoadInfo> = async (key: string, extension?: string) => {
  // We sometimes replace certain characters in keys when building paths
  const normalizedKey = key.replaceAll('-', '_');

  // The possible extensions to look out for
  const extensions = extension
    ? [extension]
    : ['level', 'multi', 'bubble_choice'];

  // File the .level file within the ./data path
  for (const k of [key, normalizedKey]) {
    for (const extension of extensions) {
      const filePath = path.join(
        process.cwd(),
        'data',
        'levels',
        `${k}.${extension}`,
      );

      try {
        return {
          path: filePath,
          data: await fs.readFile(filePath, 'utf8'),
        };
      } catch (_) {
        // Could not find the level data in the ./data path
        // Keep looking
      }
    }
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

  for (const k of [key, normalizedKey]) {
    for (const levelType of levelTypes) {
      for (const extension of extensions) {
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
            `${k}.${extension}`,
          );

          try {
            return {
              path: fallbackPath,
              data: await fs.readFile(fallbackPath, 'utf8'),
            };
          } catch (_) {
            // Attempt the lowercase version of the level key
            return {
              path: fallbackPath.toLowerCase(),
              data: await fs.readFile(fallbackPath.toLowerCase(), 'utf8'),
            };
          }
        } catch (_) {
          // Keep trying
        }
      }
    }
  }

  throw new Error(
    `Cannot find the ${extension || 'level'} file for key ${key}`,
  );
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
 * Which level types are 'concept' levels?
 */
export const conceptLevelTypes: string[] = ['StandaloneVideo', 'Panels'];

/**
 * Clean up JSON and allow whitespace and JavaScript comments.
 */
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
 * Parses a Code.org level file.
 */
export const parseLevelData: (
  key: string,
  xmlString: string,
  path?: string,
) => Promise<LevelData> = async (
  key: string,
  xmlString: string,
  path?: string,
) => {
  const parser = new new JSDOM().window.DOMParser();
  const xml = parser.parseFromString(xmlString, 'application/xml');
  const config = JSON.parse(
    sanitizeJSON(xml.querySelector('config')?.textContent || '{}'),
  ) as LevelConfiguration;

  console.log(path);

  // Gather the general data from the level file
  const ret: LevelData = {
    key: key,
    type: xml.querySelector(':root')?.tagName || 'Maze',
    longInstructions:
      config.properties?.long_instructions ||
      config.properties?.short_instructions ||
      '',
    shortInstructions: config.properties?.short_instructions || '',
    containedLevelNames: config.properties?.contained_level_names,
    videoKey: config.properties?.video_key,
    isConcept: false,
    instructionsImportant: !!(
      config.properties?.instructions_important === 'true' ||
      config.properties?.instructions_important === true
    ),
  };

  // Is this a concept level?
  if (conceptLevelTypes.includes(ret.type)) {
    ret.isConcept = true;
  }

  // Retain path, if it is given to us
  if (path) {
    ret.path = path;
  }

  // Parse hint data
  ret.hints = (
    JSON.parse(
      sanitizeJSON(config.properties?.authored_hints || '[]'),
    ) as AuthoredHintConfiguration[]
  ).map(hint => {
    const hintData: HintData = {
      class: hint.hint_class,
      id: hint.hint_id,
      path: hint.hint_path ? JSON.parse(hint.hint_path) : undefined,
      type: hint.hint_type,
      video: hint.hint_video,
      markdown: hint.hint_markdown,
    };
    return hintData;
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
      skinId: config.properties?.skin || 'birds',
      map: config.properties?.maze
        ? JSON.parse(sanitizeJSON(config.properties?.maze))
        : undefined,
      serializedMaze: config.properties?.serialized_maze
        ? JSON.parse(sanitizeJSON(config.properties?.serialized_maze))
        : undefined,
      startDirection: config.properties?.start_direction
        ? parseInt(config.properties?.start_direction)
        : undefined,
    };
  }

  if (ret.type === 'Artist') {
    isBlockly = true;
    let x = 200;
    try {
      x = parseInt(config.properties?.x || '200');
    } catch (_) {
      // Just ignore failures to parse this value
    }

    let y = 200;
    try {
      y = parseInt(config.properties?.y || '200');
    } catch (_) {
      // Just ignore failures to parse this value
    }

    let startDirection = 0;
    try {
      startDirection = parseInt(config.properties?.start_direction || '0');
    } catch (_) {
      // Just ignore failures to parse this value
    }

    ret.artistData = {
      skinId: config.properties?.skin || 'artist',
      initialX: x,
      initialY: y,
      startDirection,
      predrawBlocks: (
        xml.querySelector('blocks > predraw_blocks > xml')?.parentNode as
          | HTMLElement
          | undefined
      )?.innerHTML?.trim(),
      images: JSON.parse(sanitizeJSON(config.properties?.images || '[]')),
    };
  }

  if (isBlockly) {
    ret.blocklyData = {
      startBlocks: (
        xml.querySelector('blocks > start_blocks > xml')?.parentNode as
          | HTMLElement
          | undefined
      )?.innerHTML?.trim(),
      toolboxBlocks: (
        xml.querySelector('blocks > toolbox_blocks > xml')?.parentNode as
          | HTMLElement
          | undefined
      )?.innerHTML?.trim(),
      solutionBlocks: (
        xml.querySelector('blocks > solution_blocks > xml')?.parentNode as
          | HTMLElement
          | undefined
      )?.innerHTML?.trim(),
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

  // Read panel data
  if (config.properties?.panels) {
    ret.panels = config.properties.panels as PanelData[];
  }

  // Embed associated level data
  if (ret.containedLevelNames?.[0]) {
    // Get the contained level data, too
    const multiKey = ret.containedLevelNames[0];
    const multiData = (await loadLevelDefinition(multiKey, 'multi')).data;
    const multiLines: string[] = multiData.split('\n');

    // Parse the multiple choice question
    const multipleChoice: MultipleChoiceData = {
      question: (
        multiLines.filter(line => line.startsWith('question '))[0] ||
        "question ''"
      )
        .substring(9)
        .replace(/^'|'$/g, ''),
      choices: multiLines
        .filter(line => line.startsWith('wrong ') || line.startsWith('right '))
        .map(line => {
          const matches = line.match(
            /^(right|wrong)\s*'(.*)',\s*feedback:\s*'(.*)'\s*$/,
          );
          return {
            text: matches?.[2] || '',
            feedback: matches?.[3] || '',
            correct: line.startsWith('right'),
          };
        }),
    };
    ret.multipleChoice = multipleChoice;
  }

  return ret;
};

export const loadLevel: (
  slug: string,
  extension?: string,
) => Promise<LevelData> = async (slug: string, extension?: string) => {
  // Look for a normalized file already there.
  const cachePath = path.join(process.cwd(), 'cache', 'levels', `${slug}.json`);

  try {
    const fileContents = await fs.readFile(cachePath, 'utf8');
    return JSON.parse(fileContents);
  } catch (_) {
    // Could not find the file in the ./data path
  }

  // Try to load the unit from unit definitions
  const {path: levelPath, data: level} = await loadLevelDefinition(
    slug,
    extension,
  );
  const ret: LevelData = await parseLevelData(slug, level, levelPath);

  // Preserve the cached data
  await fs.writeFile(cachePath, JSON.stringify(ret), 'utf8');

  // Return the level data
  return ret;
};
