export interface FileMetadata {
  filename: string;
  category?: string;
  size: number;
  timestamp: string;
}

// Events that can a listener can subscribe to.
export enum BackpackEvent {
  FileAdded = 'fileAdded',
  FileDeleted = 'fileDeleted',
  UploadStarted = 'uploadStarted',
  UploadFailed = 'uploadFailed',
}

export type BackpackEventListener = (
  event: BackpackEvent,
  filename: string
) => void;

// All file sources in a project, e.g. {"Foo.java": {"text": "..."}}.
export interface FilesObject {
  [filename: string]: {
    text: string;
  };
}

export type ErrorCallback = (error?: Error, failedFiles?: string[]) => void;
