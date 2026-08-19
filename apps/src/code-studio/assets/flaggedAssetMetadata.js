import {AbuseConstants} from '@code-dot-org/shared-constants';

import MetricsReporter from '@cdo/apps/metrics/MetricsReporter';
import HttpClient, {NetworkError} from '@cdo/apps/util/HttpClient';

// Fixed bookkeeping resource under metadata/. The flagged *asset* name is in
// the JSON body ({"filename":"..."}), not in this path.
const FLAGGED_ASSET_METADATA = 'image_moderation_flagged';

const metadataUrl = channelId =>
  `/v3/assets/${channelId}/metadata/${FLAGGED_ASSET_METADATA}`;

/**
 * Filename of the AssetManager upload accepted after a flagged moderation
 * verdict, if any. At most one per project (uploads are disabled after flag).
 * Used for self-unblock on unversioned asset stores (e.g., App Lab, Java Lab).
 * Not used when AssetManager has useFilesApi (e.g., Web Lab) since files are versioned,
 * so delete-to-unblock is not offered.
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

/**
 * If `filename` is the accepted flagged asset for this channel, unflag the
 * project and clear bookkeeping metadata. Unflag runs before clear so a failed
 * unflag leaves metadata for a later retry.
 * @param {string} channelId
 * @param {string} filename
 * @returns {Promise<{didUnblock: boolean, abuseScore: number|null}>}
 */
export async function unblockIfFlaggedAssetDeleted(channelId, filename) {
  if (!channelId || !filename) {
    return {didUnblock: false, abuseScore: null};
  }

  try {
    const flaggedFilename = await getFlaggedFilename(channelId);
    if (flaggedFilename !== filename) {
      return {didUnblock: false, abuseScore: null};
    }

    const response = await HttpClient.post(
      `/v3/channels/${channelId}/abuse/image`,
      JSON.stringify({type: 'unflag'}),
      true,
      {'Content-Type': 'application/json; charset=UTF-8'}
    );
    const responseData = await response.json();
    await clearFlaggedFilename(channelId);
    if (
      typeof dashboard !== 'undefined' &&
      dashboard.project?.fetchAbuseScore
    ) {
      await dashboard.project.fetchAbuseScore();
    }
    const abuseScore =
      typeof responseData?.abuse_score === 'number'
        ? responseData.abuse_score
        : null;
    return {
      didUnblock:
        abuseScore !== null && abuseScore < AbuseConstants.ABUSE_THRESHOLD,
      abuseScore,
    };
  } catch (err) {
    MetricsReporter.logError(
      'Error unflagging project after deleting flagged asset: ' + err
    );
    return {didUnblock: false, abuseScore: null};
  }
}
