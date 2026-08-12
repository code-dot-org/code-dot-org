import HttpClient, {NetworkError} from '@cdo/apps/util/HttpClient';

// Fixed bookkeeping resource under metadata/. The flagged *asset* name is in
// the JSON body ({"filename":"..."}), not in this path.
const FLAGGED_ASSET_METADATA = 'image_moderation_flagged';

const metadataUrl = channelId =>
  `/v3/assets/${channelId}/metadata/${FLAGGED_ASSET_METADATA}`;

/**
 * Filename of the AssetManager upload accepted after a flagged moderation
 * verdict, if any. At most one per project (uploads are disabled after flag).
 * @param {string} channelId
 * @returns {Promise<string|null>}
 */
export async function getFlaggedFilename(channelId) {
  if (!channelId) {
    return null;
  }
  try {
    const response = await HttpClient.get(metadataUrl(channelId), true);
    const json = await response.json();
    return typeof json?.filename === 'string' ? json.filename : null;
  } catch (error) {
    if (error instanceof NetworkError && error.response?.status === 404) {
      return null;
    }
    throw error;
  }
}

/**
 * @param {string} channelId
 * @param {string} filename
 * @returns {Promise<void>}
 */
export async function setFlaggedFilename(channelId, filename) {
  if (!channelId || !filename) {
    return;
  }
  await HttpClient.put(
    metadataUrl(channelId),
    JSON.stringify({filename}),
    true,
    {'Content-Type': 'application/json; charset=UTF-8'}
  );
}

/**
 * @param {string} channelId
 * @returns {Promise<void>}
 */
export async function clearFlaggedFilename(channelId) {
  if (!channelId) {
    return;
  }
  try {
    await HttpClient.delete(metadataUrl(channelId), true);
  } catch (error) {
    if (error instanceof NetworkError && error.response?.status === 404) {
      return;
    }
    throw error;
  }
}
