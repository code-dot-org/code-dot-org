// TODO: other channel properties mentioned in project.js:
// level, frozen, hidden, thumbnailUrl, migratedToS3, sharedWith, libraryName, libraryDescription,
// latestLibraryVersion, publishLibrary, libraryPublishedAt
//
// Do we still want/need these? Should they be on a separate type?
// If the ChannelsApi on the server doesn't care about these, they should
// live elsewhere.
// The library data should definitely live elsewhere.
export interface Channel {
  id: string;
  name: string;
  isOwner: boolean;
  projectType: ProjectType | null;
  publishedAt: string;
  createdAt: string;
  updatedAt: string;
}

export type DefaultChannel = Pick<Channel, 'name'>;

// Represents the structure of the full project sources object (i.e. the main.json file)
export interface ProjectSources {
  // Stringified source code. Some labs (ex. Javalab) store multiple files
  // as nested JSON which we'll need to support eventually.
  source: string;
  // Add other properties (animations, html, etc) as needed.
}

// We will eventually make this a union type to include other source types.
export type Source = BlocklySource;

export interface SourceUpdateOptions {
  currentVersion: string;
  replace: boolean;
  firstSaveTimestamp: string;
  tabId: string | null;
}

export interface Project {
  // When projects are loaded for the first time, sources may not be present
  sources?: ProjectSources;
  channel: Channel;
}

export interface BlocklySource {
  blocks: {
    languageVersion: number;
    blocks: BlocklyBlock[];
  };
  variables: BlocklyVariable[];
}

export interface BlocklyBlock {
  type: string;
  id: string;
  x: number;
  y: number;
  next: {
    block: BlocklyBlock;
  };
}

export interface BlocklyVariable {
  name: string;
  id: string;
}

// TODO: these are not all the properties of the level.
// Fill this in as we need them.
export interface Level {
  projectType: ProjectType;
  isK1: boolean;
  standaloneAppName: StandaloneAppName;
  useContractEditor: boolean;
  // Minecraft specific properties
  isAgentLevel: boolean;
  isEventLevel: boolean;
  isConnectionLevel: boolean;
  isAquaticLevel: boolean;
}

export interface LevelProperties {
  // Not a complete list; add properties as needed.
  isProjectLevel?: 'true' | 'false';
  hideShareAndRemix?: 'true' | 'false';
  levelData: LevelData;
}

// Generic level configuration data used by labs that don't require
// reloads between levels. Labs may define more specific fields.
export interface LevelData {
  text?: string;
  validations?: Validation[];
  startSources: Source;
}

// Validation in the level.
export interface Validation {
  conditions: string[];
  message: string;
  next: boolean;
}

// TODO: these are not all the properties of app options.
// Fill this in as we need them.
export interface AppOptions {
  app: AppName;
  level: Level;
  skinId: string;
  droplet: boolean;
  channel: string;
}

export type ProjectType =
  | AppName
  | StandaloneAppName
  | 'artist'
  | 'artist_k1'
  | 'frozen'
  | 'minecraft_adventurer'
  | 'minecraft_hero'
  | 'minecraft_designer'
  | 'minecraft_codebuilder'
  | 'minecraft_aquatic'
  | 'algebra_game'
  | 'starwars'
  | 'starwarsblocks_hour'
  | 'iceage'
  | 'infinity'
  | 'gumball'
  | 'playlab'
  | 'playlab_k1'
  | 'sports'
  | 'basketball';

export type AppName =
  | 'applab'
  | 'calc'
  | 'dance'
  | 'eval'
  | 'flappy'
  | 'gamelab'
  | 'javalab'
  | 'music'
  | 'thebadguys'
  | 'weblab'
  | 'turtle'
  | 'craft'
  | 'studio'
  | 'bounce'
  | 'poetry'
  | 'spritelab';

export type StandaloneAppName =
  | 'spritelab'
  | 'story'
  | 'science'
  | 'poetry_hoc'
  | 'poetry'
  | 'time_capsule'
  | 'dance';

export enum ProjectManagerStorageType {
  LOCAL = 'LOCAL',
  REMOTE = 'REMOTE',
}
