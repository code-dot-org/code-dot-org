export type Channel = {
  id: string;
  name: string;
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
