import csv from 'csv-parser';
import {createReadStream} from 'fs';
import fs from 'fs/promises';
import {JSDOM} from 'jsdom';
import path from 'path';
import URL from 'url';

import {levelRegistry2} from '@/levels/registry';

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

/** Describes a level */
export interface LevelData<T = object> {
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
  /** Other embedded levels, such as multiple choice or bubble levels */
  containedLevelNames?: string[];
  /** Multiple choice question data. */
  multipleChoice?: MultipleChoiceData;
  /** The shared level template defining a potential 'workspace' */
  template?: LevelData;
  /** Other level specific data */
  subData?: T;
}

export interface SpriteLabAnimationConfiguration {
  orderedKeys?: string[];
  propsByKey?: {
    [key: string]: {
      name: string;
      sourceUrl: string;
      frameSize: {
        x: number;
        y: number;
      };
      frameCount: number;
      frameDelay: number;
      looping: boolean;
      categories: string[];
      version: string;
    };
  };
}

/**
 * Represents the raw level configuration that is usually encoded as JSON embedded in
 * level XML data.
 */
export interface LevelConfiguration {
  created_at: string;
  game_id: number;
  published: boolean;
  properties?: {
    /** Markdown encoded level instructions that describe to the student what to do. */
    long_instructions?: string;
    /** The shortened instructions describing criteria to complete in the level. */
    short_instructions?: string;
    /** Any other levels that are related to or override data for this level. */
    contained_level_names?: string[];
    /** The level key for the associated video. */
    video_key?: string;
    /**
     * Whether or not instructions should be highlighted before the level can be interacted
     * with for the first time.
     */
    instructions_important?: boolean | string;
    /** Hint data encoded as JSON. */
    authored_hints?: string;
    /** Maze data encoded as JSON. */
    serialized_maze?: string;
    /** Whether or not this level's target audience are pre-readers. */
    is_k1?: boolean;
    /** The legacy maze data encoded as JSON. */
    maze?: string;
    /** The skin identifier that associates a level with a set of image assets. */
    skin?: string;
    /** The project template which defines the workspace shared across a set of levels. */
    project_template_level_name?: string;
    /** The starting direction for certain levels. */
    start_direction?: string;
    /** The starting X position for certain levels. */
    x?: string;
    /** The starting Y position for certain levels. */
    y?: string;
    /** A set of images associated with the level. */
    images?: string;
    /** The ideal number of blocks. This cause block count tracking to enable. */
    ideal?: string;
    /** A set of animations to load in a spritelab level */
    start_animations?: string;
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
    : ['level', 'multi', 'bubble_choice', 'level_group', 'external'];

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
            try {
              // Attempt the lowercase version of the level key
              return {
                path: fallbackPath.toLowerCase(),
                data: await fs.readFile(fallbackPath.toLowerCase(), 'utf8'),
              };
            } catch (_) {
              // Attempt the lowercase version of the level key with spaces removed
              return {
                path: fallbackPath.toLowerCase().replaceAll(' ', '_'),
                data: await fs.readFile(
                  fallbackPath.toLowerCase().replaceAll(' ', '_'),
                  'utf8',
                ),
              };
            }
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

export const urlToKey: (url: string) => string = url => {
  const parsed = URL.parse(url);
  return `${parsed.protocol?.replace(':', '') || 'relative'}-${parsed.host || 'unknown'}${parsed.pathname}`;
};

/**
 * Parses a Code.org level file.
 */
export const parseLevelData: (
  key: string,
  xmlString: string,
  levelPath?: string,
) => Promise<LevelData> = async (
  key: string,
  xmlString: string,
  levelPath?: string,
) => {
  const parser = new new JSDOM().window.DOMParser();
  const xml = parser.parseFromString(xmlString, 'application/xml');
  const config = JSON.parse(
    sanitizeJSON(xml.querySelector('config')?.textContent || '{}'),
  ) as LevelConfiguration;

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

  // Parse level data via type
  console.log('level registry', levelRegistry2);
  if (ret.type in levelRegistry2) {
    ret.subData = levelRegistry2[ret.type].load(config, xml, parser);
  }

  // Is this a concept level?
  if (conceptLevelTypes.includes(ret.type)) {
    ret.isConcept = true;
  }

  // Retain path, if it is given to us
  if (levelPath) {
    ret.path = levelPath;
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

  // Read video data
  if (ret.videoKey) {
    const videoData = await loadVideo(ret.videoKey);
    ret.videoData = {
      download: videoData.download,
      youTubeId: videoData.youtube,
      locale: videoData.locale,
    };
  }

  // Embed project template (if any)
  if (config.properties?.project_template_level_name) {
    // Get that template level
    const template = await loadLevel(
      config.properties.project_template_level_name,
    );
    ret.template = template;
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
  key: string,
  extension?: string,
) => Promise<LevelData> = async (key: string, extension?: string) => {
  // Look for a normalized file already there.
  const cachePath = path.join(process.cwd(), 'cache', 'levels', `${key}.json`);

  try {
    const fileContents = await fs.readFile(cachePath, 'utf8');
    return JSON.parse(fileContents);
  } catch (_) {
    // Could not find the file in the ./data path
  }

  // Try to load the unit from unit definitions
  const {path: levelPath, data: level} = await loadLevelDefinition(
    key,
    extension,
  );
  const ret: LevelData = await parseLevelData(key, level, levelPath);

  // Preserve the cached data
  await fs.writeFile(cachePath, JSON.stringify(ret), 'utf8');

  // Return the level data
  return ret;
};
