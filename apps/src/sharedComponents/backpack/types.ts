export interface FileMetadata {
  filename: string;
  category?: string;
  size: number;
  timestamp: string;
}

// Events that a listener can subscribe to.
export enum BackpackEvent {
  FileAdded = 'fileAdded',
  FileDeleted = 'fileDeleted',
  UploadStarted = 'uploadStarted',
  UploadFailed = 'uploadFailed',
}

// appType names the backpack the event came from. The unified backpack shows
// every backpack at once, where a filename alone does not identify a file.
export type BackpackEventListener = (
  event: BackpackEvent,
  filename: string,
  appType: string
) => void;

// All file sources in a project, e.g. {"Foo.java": {"text": "..."}}.
export interface FilesObject {
  [filename: string]: {
    text: string;
  };
}

// Filenames held by each of the user's backpacks, keyed by app type.
export type FilenamesByAppType = {[appType: string]: string[]};

export type ErrorCallback = (error?: Error, failedFiles?: string[]) => void;
