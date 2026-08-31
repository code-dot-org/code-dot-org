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
