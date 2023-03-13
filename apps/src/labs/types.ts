// TODO: other channel properties mentioned in project.js:
// level, frozen, hidden, thumbnailUrl, migratedToS3, sharedWith, libraryName, libraryDescription,
// latestLibraryVersion, publishLibrary, libraryPublishedAt
//
// Do we still want/need these? Should they be on a separate type?
// If the ChannelsApi on the server doesn't care about these, they should
// live elsewhere.
// The library data should definitely live elsewhere.
export type Channel = {
  id: string;
  name: string;
  isOwner: boolean;
  projectType: string; // TODO: Make this an actual type
  publishedAt: string; // TODO: Is this the correct type?
  createdAt: string; // TODO: Is this the correct type?
  updatedAt: string; // TODO: Is this the correct type?
};

export type NewChannel = Pick<Channel, 'name'>;

export type Source = {
  // TODO: Extend source to allow for Javalab, which uses an object.
  source: string;
};

export type SourceUpdateOptions = {
  currentVersion: string;
  replace: boolean;
  firstSaveTimestamp: string;
  tabId: string | null;
};
