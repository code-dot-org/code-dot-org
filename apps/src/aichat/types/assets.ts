/** An asset file included with a chat message. */
export interface ChatAsset {
  filename: string;
  source: AssetSource;
  uuid_filename?: boolean;
}

export enum AssetSource {
  PROJECT = 'project',
  LEVEL = 'level',
}
