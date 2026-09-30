import {DashboardApiClient} from '@code-dot-org/core/api';

/** Stores bytes as one of the project's files; resolves to their URL. */
export type UploadImageFunction = (
  filename: string,
  data: Uint8Array,
  mediaType: string,
) => Promise<string>;

/** An UploadImageFunction for the project on `channelId`. */
export function projectImageUploader(channelId: string): UploadImageFunction {
  return async (filename, data, mediaType) => {
    const bytes = new Uint8Array(data).buffer as ArrayBuffer;
    const {url} = await DashboardApiClient.assets.upload({
      channelId,
      filename,
      data: new Blob([bytes], {type: mediaType}),
    });
    return url;
  };
}
