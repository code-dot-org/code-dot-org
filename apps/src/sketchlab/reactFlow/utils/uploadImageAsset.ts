import {
  getAppOptionsEditingExemplar,
  getIsStartMode,
} from '@cdo/apps/lab2/projects/utils';
import HttpClient from '@cdo/apps/util/HttpClient';
import {createUuid} from '@cdo/apps/utils';

import {ASSET_PATH_PREFIX} from '../constants';

// Pull a file extension from the name, falling back to the MIME subtype or png so
// clipboard blobs (which usually have no filename) still upload sensibly.
function extensionFor(file: File): string {
  const fromName = file.name.includes('.')
    ? file.name.split('.').pop()
    : undefined;
  if (fromName) {
    return fromName;
  }
  const fromMime = file.type.split('/')[1];
  return fromMime || 'png';
}

interface UploadImageAssetOptions {
  levelName: string;
  channelId: string;
}

/**
 * Uploads an image file as a project asset and returns its URL, or null when
 * the upload can't proceed (no channel for a user project). Starter assets and
 * exemplars upload to the level's starter-asset path; everything else uploads
 * to the project's channel.
 */
export async function uploadImageAsset(
  file: File,
  {levelName, channelId}: UploadImageAssetOptions
): Promise<string | null> {
  const isStarterAssetOrExemplar = !!(
    getIsStartMode() || getAppOptionsEditingExemplar()
  );
  if (!isStarterAssetOrExemplar && !channelId) {
    return null;
  }

  const filename = `${createUuid()}.${extensionFor(file)}`;
  const uploadUrl = isStarterAssetOrExemplar
    ? `/level_starter_assets/${encodeURIComponent(levelName)}/uuid/${filename}`
    : `${ASSET_PATH_PREFIX}/${channelId}/${filename}`;

  if (isStarterAssetOrExemplar) {
    const bodyData = new FormData();
    bodyData.append('files[]', file);
    await HttpClient.post(uploadUrl, bodyData, true);
  } else {
    await HttpClient.put(uploadUrl, file);
  }

  return uploadUrl;
}
