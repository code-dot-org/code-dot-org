import HttpClient from '@cdo/apps/util/HttpClient';

/**
 * Uploads an image File to the channel's asset store and returns the asset URL.
 */
export async function uploadImageFile(
  file: File,
  channelId: string
): Promise<string> {
  const lastDot = file.name.lastIndexOf('.');
  const ext = lastDot !== -1 ? file.name.slice(lastDot + 1) : 'png';
  const uuid = crypto.randomUUID();
  const filename = `${uuid}.${ext}`;
  const uploadUrl = `/v3/assets/${channelId}/${filename}`;

  await HttpClient.put(uploadUrl, file);

  return uploadUrl;
}
