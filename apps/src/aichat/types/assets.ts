/** An asset file included with a chat message. */
export interface ChatAsset {
  filename: string;
  source: AssetSource;
  /** Unique storage key in the assets bucket. Defaults to filename if absent. */
  bucketKey?: string;
}

export enum AssetSource {
  PROJECT = 'project',
  LEVEL = 'level',
  LEVEL_UUID = 'level_uuid',
}

export type UploadStatus =
  | 'uploaded'
  | 'uploadFailed'
  | 'sizeLimitExceeded'
  | 'imageFileFlagged';
