import {type FilePart} from 'ai';

import {AssetSource, ChatAsset} from '@cdo/apps/aichat/types';
import HttpClient from '@cdo/apps/util/HttpClient';

const extensionMap: Record<string, string> = {
  // Images
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  gif: 'image/gif',
  webp: 'image/webp',
  svg: 'image/svg+xml',
  bmp: 'image/bmp',
  // PDF
  pdf: 'application/pdf',
};

/**
 * Converts a ChatAsset to a FilePart by downloading the asset binary data.
 */
export async function assetToFilePart(
  asset: ChatAsset,
  buildAssetUrl: (asset: ChatAsset) => string
): Promise<FilePart> {
  const assetUrl = buildAssetUrl(asset);
  const response = await fetch(assetUrl);
  const arrayBuffer = await response.arrayBuffer();
  const base64 = Buffer.from(arrayBuffer).toString('base64');
  const extension = asset.filename.toLowerCase().split('.').pop() || '';

  const mediaType =
    response.headers.get('content-type') ||
    extensionMap[extension] ||
    'application/octet-stream';

  return {
    type: 'file',
    data: base64,
    filename: asset.filename,
    mediaType,
  };
}

/**
 * Converts a model generated file to a ChatAsset by uploading the file's contents to the user's project.
 */
export async function fileToAsset(
  filename: string,
  fileBuffer: ArrayBuffer,
  mediaType: string,
  buildAssetUrl: (asset: ChatAsset) => string
): Promise<ChatAsset> {
  const asset: ChatAsset = {
    filename,
    source: AssetSource.PROJECT,
  };
  const assetUrl = buildAssetUrl(asset);

  // Upload file contents to assetUrl
  await HttpClient.put(assetUrl, fileBuffer, true, {
    'Content-Type': mediaType,
  });

  return asset;
}

export function fileToImage(
  filename: string,
  fileBuffer: ArrayBuffer,
  mediaType: string
): File {
  const blob = new Blob([fileBuffer], {type: mediaType});
  return new File([blob], filename, {type: mediaType});
}
