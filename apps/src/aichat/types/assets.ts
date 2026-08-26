/** An asset file included with a chat message. */
export interface ChatAsset {
  filename: string;
  source: AssetSource;
  /** Unique storage key in the assets bucket. Defaults to filename if absent. */
  bucketKey?: string;
  /**
   * Project the asset was stored in, for `project` assets. Absent on assets
   * recorded before this field existed, which fall back to the open project.
   *
   * Chat history is replayed and rendered against whatever project is open at
   * the time, which is not necessarily the one an asset was written to -- so
   * an asset that does not say where it lives becomes unreachable as soon as
   * its message is read from anywhere else.
   */
  channelId?: string;
  /** Level the asset belongs to, for `level` and `level_uuid` assets. */
  levelName?: string;
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
