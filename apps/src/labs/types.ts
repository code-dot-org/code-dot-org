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
  projectType: string; // TODO: Make this an actual type
  publishedAt: string; // TODO: Is this the correct type?
  createdAt: string; // TODO: Is this the correct type?
  updatedAt: string; // TODO: Is this the correct type?
}

export type DefaultChannel = Pick<Channel, 'name'>;

// We will eventually make this a union type to include other source types.
export type Source = BlocklySource;

export interface SourceUpdateOptions {
  currentVersion: string;
  replace: boolean;
  firstSaveTimestamp: string;
  tabId: string | null;
}

export interface Project {
  source: Source;
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
