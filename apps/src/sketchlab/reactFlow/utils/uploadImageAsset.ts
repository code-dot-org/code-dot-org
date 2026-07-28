import {extension as mimeToExtension} from 'mime-types';

import {
  getAppOptionsEditingExemplar,
  getIsStartMode,
} from '@cdo/apps/lab2/projects/utils';
import HttpClient from '@cdo/apps/util/HttpClient';
import {createUuid} from '@cdo/apps/utils';

import {ASSET_PATH_PREFIX} from '../constants';

// Pull a file extension from the name, falling back to the MIME type or png so
// clipboard blobs (which usually have no filename) still upload sensibly.
function extensionFor(file: File): string {
  const fromName = file.name.includes('.')
    ? file.name.split('.').pop()
    : undefined;
  return fromName || mimeToExtension(file.type) || 'png';
}

export function isStarterAssetOrExemplarUpload(): boolean {
  return !!(getIsStartMode() || getAppOptionsEditingExemplar());
}

interface UploadImageAssetOptions {
  levelName: string;
  channelId: string;
  // Use this URL instead of generating a fresh one. Lets callers compute the
  // destination before moderation and upload to that same URL afterward.
  precomputedUploadUrl?: string;
}

/**
 * Computes the URL an image file would upload to, without uploading. Starter
 * assets and exemplars target the level's starter-asset path; everything else
 * targets the project's channel.
 */
export function generateImageAssetUploadUrl(
  file: File,
  {levelName, channelId}: {levelName: string; channelId: string}
): string {
  const filename = `${createUuid()}.${extensionFor(file)}`;
  return isStarterAssetOrExemplarUpload()
    ? `/level_starter_assets/${encodeURIComponent(levelName)}/uuid/${filename}`
    : `${ASSET_PATH_PREFIX}/${channelId}/${filename}`;
}

/**
 * Uploads an image file as a project asset and returns its URL, or null when
 * the upload can't proceed (no channel for a user project). Starter assets and
 * exemplars upload to the level's starter-asset path; everything else uploads
 * to the project's channel.
 */
export async function uploadImageAsset(
  file: File,
  {levelName, channelId, precomputedUploadUrl}: UploadImageAssetOptions
): Promise<string | null> {
  const isStarterAssetOrExemplar = isStarterAssetOrExemplarUpload();
  if (!isStarterAssetOrExemplar && !channelId) {
    return null;
  }

  const uploadUrl =
    precomputedUploadUrl ??
    generateImageAssetUploadUrl(file, {levelName, channelId});

  if (isStarterAssetOrExemplar) {
    const bodyData = new FormData();
    bodyData.append('files[]', file);
    await HttpClient.post(uploadUrl, bodyData, true);
  } else {
    await HttpClient.put(uploadUrl, file);
  }

  return uploadUrl;
}
